import { useEffect, useState } from "react";

const API = "http://localhost:5001/api";

const emptyForm = {
  title: "",
  description: "",
  priority: "Medium",
  status: "To Do",
  assigned_user_id: ""
};

export default function UserStories({ projectId, projectName }) {
  const [stories, setStories] = useState([]);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [detailsId, setDetailsId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const displayName = (user) => {
    if (!user) return "Unassigned";

    return (
      `${user.f_name || ""} ${user.l_name || ""}`.trim() ||
      user.username ||
      "Unknown user"
    );
  };

  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Request failed.");
    }

    return data;
  }

  async function loadStories() {
    const data = await request(`/projects/${projectId}/stories`);
    setStories(data);
  }

  async function loadMembers() {
    const data = await request(`/projects/${projectId}/members`);
    setMembers(data);
  }

  useEffect(() => {
    let active = true;

    setStories([]);
    setMembers([]);
    setForm({ ...emptyForm });
    setEditingId(null);
    setDetailsId(null);
    setMessage("");
    setLoading(true);

    async function load() {
      try {
        const [storyData, memberData] = await Promise.all([
          request(`/projects/${projectId}/stories`),
          request(`/projects/${projectId}/members`)
        ]);

        if (active) {
          setStories(storyData);
          setMembers(memberData);
        }
      } catch (error) {
        if (active) setMessage(error.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    if (projectId) load();

    return () => {
      active = false;
    };
  }, [projectId]);

  function startEditing(story) {
    setEditingId(story._id);
    setDetailsId(null);

    setForm({
      title: story.title,
      description: story.description,
      priority: story.priority,
      status: story.status,
      assigned_user_id: story.assigned_user_id?._id || ""
    });

    setMessage("");
  }

  function cancelEditing() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setMessage("");
  }

  async function saveStory(event) {
    event.preventDefault();
    setMessage("");

    if (!form.title.trim() || !form.description.trim()) {
      setMessage("Title and description are required.");
      return;
    }

    const path = editingId
      ? `/projects/${projectId}/stories/${editingId}`
      : `/projects/${projectId}/stories`;

    try {
      const result = await request(path, {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify({
          ...form,
          assigned_user_id: form.assigned_user_id || null
        })
      });

      await loadStories();

      setEditingId(null);
      setForm({ ...emptyForm });
      setMessage(result.message);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function deleteStory(story) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${story.title}"?`
    );

    if (!confirmed) return;

    try {
      const result = await request(
        `/projects/${projectId}/stories/${story._id}`,
        { method: "DELETE" }
      );

      await loadStories();

      if (editingId === story._id) cancelEditing();
      if (detailsId === story._id) setDetailsId(null);

      setMessage(result.message);
    } catch (error) {
      setMessage(error.message);
    }
  }

  const inputStyle = {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: 10,
    margin: "10px 0"
  };

  const buttonStyle = {
    padding: "10px 16px",
    margin: "6px 6px 6px 0",
    cursor: "pointer"
  };

  return (
    <section style={{
      border: "1px solid #ddd",
      borderRadius: 8,
      padding: 20,
      marginTop: 20
    }}>
      <h2>Project Backlog: {projectName}</h2>

      {message && (
        <p role="status" style={{
          padding: 12,
          background: "#eef3ff",
          borderRadius: 6
        }}>
          {message}
        </p>
      )}

      <h3>{editingId ? "Edit User Story" : "Create User Story"}</h3>

      <form onSubmit={saveStory}>
        <label>Story Title</label>
        <input
          style={inputStyle}
          required
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
          placeholder="Enter story title"
        />

        <label>Description</label>
        <textarea
          style={inputStyle}
          required
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
          placeholder="As a user, I want..., so that..."
        />

        <label>Priority</label>
        <select
          style={inputStyle}
          value={form.priority}
          onChange={(e) =>
            setForm({ ...form, priority: e.target.value })
          }
        >
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        {editingId && (
          <>
            <label>Status</label>
            <select
              style={inputStyle}
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value })
              }
            >
              <option>To Do</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>
          </>
        )}

        <label>Assigned Member</label>
        <select
          style={inputStyle}
          value={form.assigned_user_id}
          onChange={(e) =>
            setForm({
              ...form,
              assigned_user_id: e.target.value
            })
          }
        >
          <option value="">Unassigned</option>

          {members.map((membership) => {
            const user = membership.user_id;
            if (!user) return null;

            return (
              <option key={user._id} value={user._id}>
                {displayName(user)} ({user.username})
              </option>
            );
          })}
        </select>

        <button style={buttonStyle} type="submit">
          {editingId ? "Save Changes" : "Create Story"}
        </button>

        {editingId && (
          <button
            style={buttonStyle}
            type="button"
            onClick={cancelEditing}
          >
            Cancel
          </button>
        )}
      </form>

      <h3>All User Stories</h3>

      {loading ? (
        <p>Loading stories...</p>
      ) : stories.length === 0 ? (
        <p>No user stories found for this project.</p>
      ) : (
        stories.map((story) => (
          <div key={story._id} style={{
            border: "1px solid #ddd",
            borderRadius: 6,
            padding: 15,
            marginBottom: 12
          }}>
            <h4>{story.title}</h4>

            <p>Priority: {story.priority}</p>
            <p>Status: {story.status}</p>
            <p>
              Assigned: {displayName(story.assigned_user_id)}
            </p>

            <button
              style={buttonStyle}
              onClick={() =>
                setDetailsId(
                  detailsId === story._id ? null : story._id
                )
              }
            >
              {detailsId === story._id
                ? "Hide Details"
                : "View Details"}
            </button>

            <button
              style={buttonStyle}
              onClick={() => startEditing(story)}
            >
              Edit
            </button>

            <button
              style={buttonStyle}
              onClick={() => deleteStory(story)}
            >
              Delete
            </button>

            {detailsId === story._id && (
              <p>{story.description}</p>
            )}
          </div>
        ))
      )}
    </section>
  );
}

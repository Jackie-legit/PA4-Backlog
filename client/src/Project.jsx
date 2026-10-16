
import { useEffect, useState } from "react";

const API = "http://localhost:5001/api";

export default function Projects() {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [members, setMembers] = useState([]);
  const [newMember, setNewMember] = useState("");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "Planning",
    project_lead_id: ""
  });

  const selectedProject = projects.find(
    (p) => p._id === selectedId
  );

  const displayName = (user) => {
    if (!user) return "Unknown user";
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
      throw new Error(data.message || "Request failed");
    }

    return data;
  }

  async function loadUsers() {
    const data = await request("/users");
    setUsers(data);
  }

  async function loadProjects() {
    const data = await request("/projects");
    setProjects(data);
  }

  async function loadMembers(projectId) {
    if (!projectId) {
      setMembers([]);
      return;
    }

    const data = await request(
      `/projects/${projectId}/members`
    );
    setMembers(data);
  }

  useEffect(() => {
  async function initialize() {
    try {
      await loadUsers();
      console.log("Users loaded successfully");
    } catch (error) {
      console.error("Users error:", error);
      setMessage("Failed to load users.");
    }

    try {
      await loadProjects();
      console.log("Projects loaded successfully");
    } catch (error) {
      console.error("Projects error:", error);
      setMessage((previous) =>
        previous
          ? previous + " Failed to load projects."
          : "Failed to load projects."
      );
    }
  }

  initialize();
}, []);

  async function createProject(event) {
    event.preventDefault();
    setMessage("");

    try {
      const result = await request("/projects", {
        method: "POST",
        body: JSON.stringify(form)
      });

      await loadProjects();

      setForm({
        name: "",
        description: "",
        status: "Planning",
        project_lead_id: ""
      });

      setSelectedId(result.project._id);
      await loadMembers(result.project._id);

      setMessage("Project created successfully!");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function selectProject(projectId) {
    setSelectedId(projectId);
    setNewMember("");
    setMessage("");

    try {
      await loadMembers(projectId);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function addMember(event) {
    event.preventDefault();
    setMessage("");

    if (!selectedId || !newMember) {
      setMessage("Please select a project and user.");
      return;
    }

    try {
      const result = await request(
        `/projects/${selectedId}/members`,
        {
          method: "POST",
          body: JSON.stringify({
            user_id: newMember
          })
        }
      );

      await loadMembers(selectedId);
      setNewMember("");
      setMessage(result.message);
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function removeMember(userId) {
    setMessage("");

    try {
      const result = await request(
        `/projects/${selectedId}/members/${userId}`,
        { method: "DELETE" }
      );

      await loadMembers(selectedId);
      setMessage(result.message);
    } catch (error) {
      setMessage(error.message);
    }
  }

  const styles = {
    container: {
      maxWidth: 850,
      margin: "30px auto",
      padding: 20,
      fontFamily: "Arial, sans-serif"
    },
    section: {
      border: "1px solid #ddd",
      borderRadius: 8,
      padding: 20,
      marginBottom: 20
    },
    input: {
      display: "block",
      width: "100%",
      boxSizing: "border-box",
      padding: 10,
      margin: "10px 0"
    },
    button: {
      padding: "10px 16px",
      cursor: "pointer",
      marginTop: 8
    }
  };

  return (
    <div style={styles.container}>
      <h1>Project Management</h1>

      {message && (
        <p role="status" style={{
          background: "#eef3ff",
          padding: 12,
          borderRadius: 6
        }}>
          {message}
        </p>
      )}

      <section style={styles.section}>
        <h2>Create Project</h2>

        <form onSubmit={createProject}>
          <input
            style={styles.input}
            placeholder="Project Name"
            required
            value={form.name}
            onChange={(e) => setForm({
              ...form,
              name: e.target.value
            })}
          />

          <textarea
            style={styles.input}
            placeholder="Description"
            required
            value={form.description}
            onChange={(e) => setForm({
              ...form,
              description: e.target.value
            })}
          />

          <label>Project Status</label>
          <select
            style={styles.input}
            value={form.status}
            onChange={(e) => setForm({
              ...form,
              status: e.target.value
            })}
          >
            <option value="Planning">Planning</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
          </select>

          <label>Project Lead</label>
          <select
            style={styles.input}
            required
            value={form.project_lead_id}
            onChange={(e) => setForm({
              ...form,
              project_lead_id: e.target.value
            })}
          >
            <option value="">Select a user</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {displayName(user)} ({user.username})
              </option>
            ))}
          </select>

          <button style={styles.button} type="submit">
            Create Project
          </button>
        </form>
      </section>

      <section style={styles.section}>
        <h2>All Projects</h2>

        {projects.length === 0 && (
          <p>No projects created yet.</p>
        )}

        {projects.map((project) => (
          <div key={project._id} style={{
            borderBottom: "1px solid #ddd",
            padding: "12px 0"
          }}>
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <p>Status: {project.status}</p>
            <p>
              Lead: {displayName(project.project_lead_id)}
            </p>
            <button
              style={styles.button}
              onClick={() => selectProject(project._id)}
            >
              Manage Members
            </button>
          </div>
        ))}
      </section>

      {selectedProject && (
        <section style={styles.section}>
          <h2>
            Members: {selectedProject.name}
          </h2>

          {members.length === 0 && (
            <p>No members found.</p>
          )}

          {members.map((membership) => {
            const user = membership.user_id;

            if (!user) return null;

            const isLead =
              String(user._id) ===
              String(selectedProject.project_lead_id?._id);

            return (
              <div key={membership._id} style={{
                padding: 10,
                borderBottom: "1px solid #ddd"
              }}>
                <strong>{displayName(user)}</strong>
                {" "}({user.username})

                {isLead ? (
                  <span> - Project Lead</span>
                ) : (
                  <button
                    style={{ marginLeft: 12 }}
                    onClick={() => removeMember(user._id)}
                  >
                    Remove
                  </button>
                )}
              </div>
            );
          })}

          <h3>Add Member</h3>

          <form onSubmit={addMember}>
            <select
              style={styles.input}
              required
              value={newMember}
              onChange={(e) =>
                setNewMember(e.target.value)
              }
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {displayName(user)} ({user.username})
                </option>
              ))}
            </select>

            <button style={styles.button} type="submit">
              Add Member
            </button>
          </form>
        </section>
      )}
    </div>
  );
}

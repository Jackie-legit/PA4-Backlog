const express = require("express");
const mongoose = require("mongoose");

const Project = require("../models/Project");
const ProjectMembership = require("../models/ProjectMembership");
const User = require("../models/User");
const UserStory = require("../models/UserStory");

const router = express.Router();

const validId = (id) =>
  typeof id === "string" &&
  /^[a-fA-F0-9]{24}$/.test(id);

const priorities = ["High", "Medium", "Low"];
const statuses = ["To Do", "In Progress", "Done"];

const userFields = "f_name l_name username";

async function validateAssignment(projectId, userId) {
  if (userId === null) return null;

  if (!validId(userId)) {
    return "Invalid assigned user ID.";
  }

  const user = await User.findById(userId);

  if (!user) {
    return "Assigned user does not exist.";
  }

  const membership = await ProjectMembership.findOne({
    project_id: projectId,
    user_id: userId
  });

  const project = await Project.findById(projectId);

  const isLead =
    project &&
    String(project.project_lead_id) === String(userId);

  if (!membership && !isLead) {
    return "Assigned user must belong to this project.";
  }

  return null;
}

function validateStory(body, editing = false) {
  const { title, description, priority, status } = body;

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof description !== "string" ||
    !description.trim()
  ) {
    return "Title and description are required.";
  }

  if (!priorities.includes(priority)) {
    return "Priority must be High, Medium, or Low.";
  }

  if (editing && !statuses.includes(status)) {
    return "Invalid story status.";
  }

  if (!editing && status !== undefined && status !== "To Do") {
    return "New stories must start with To Do status.";
  }

  return null;
}

// GET stories for a project
router.get("/projects/:projectId/stories", async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!validId(projectId)) {
      return res.status(400).json({
        message: "Invalid project ID."
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found."
      });
    }

    const stories = await UserStory.find({
      project_id: projectId
    })
      .populate("assigned_user_id", userFields)
      .sort({ _id: -1 });

    res.json(stories);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load stories."
    });
  }
});

// CREATE story
router.post("/projects/:projectId/stories", async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!validId(projectId)) {
      return res.status(400).json({
        message: "Invalid project ID."
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found."
      });
    }

    const error = validateStory(req.body);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const assignedUser =
      req.body.assigned_user_id === undefined ||
      req.body.assigned_user_id === ""
        ? null
        : req.body.assigned_user_id;

    const assignmentError = await validateAssignment(
      projectId,
      assignedUser
    );

    if (assignmentError) {
      return res.status(400).json({
        message: assignmentError
      });
    }

    const story = await UserStory.create({
      project_id: projectId,
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      priority: req.body.priority,
      status: "To Do",
      assigned_user_id: assignedUser
    });

    res.status(201).json({
      message: "Story created successfully.",
      story
    });
  } catch (error) {
    console.error("Create story error:", error);
    res.status(500).json({
      message: "Failed to create story."
    });
  }
});

// UPDATE story
router.put("/projects/:projectId/stories/:storyId", async (req, res) => {
  try {
    const { projectId, storyId } = req.params;

    if (!validId(projectId) || !validId(storyId)) {
      return res.status(400).json({
        message: "Invalid project or story ID."
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found."
      });
    }

    const story = await UserStory.findOne({
      _id: storyId,
      project_id: projectId
    });

    if (!story) {
      return res.status(404).json({
        message: "Story not found in this project."
      });
    }

    const error = validateStory(req.body, true);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const assignedUser =
      req.body.assigned_user_id === undefined ||
      req.body.assigned_user_id === ""
        ? null
        : req.body.assigned_user_id;

    const assignmentError = await validateAssignment(
      projectId,
      assignedUser
    );

    if (assignmentError) {
      return res.status(400).json({
        message: assignmentError
      });
    }

    story.title = req.body.title.trim();
    story.description = req.body.description.trim();
    story.priority = req.body.priority;
    story.status = req.body.status;
    story.assigned_user_id = assignedUser;

    await story.save();

    res.json({
      message: "Story updated successfully.",
      story
    });
  } catch (error) {
    console.error("Update story error:", error);
    res.status(500).json({
      message: "Failed to update story."
    });
  }
});

// DELETE story
router.delete("/projects/:projectId/stories/:storyId", async (req, res) => {
  try {
    const { projectId, storyId } = req.params;

    if (!validId(projectId) || !validId(storyId)) {
      return res.status(400).json({
        message: "Invalid project or story ID."
      });
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found."
      });
    }

    const story = await UserStory.findOneAndDelete({
      _id: storyId,
      project_id: projectId
    });

    if (!story) {
      return res.status(404).json({
        message: "Story not found in this project."
      });
    }

    res.json({
      message: "Story deleted successfully."
    });
  } catch (error) {
    console.error("Delete story error:", error);
    res.status(500).json({
      message: "Failed to delete story."
    });
  }
});

module.exports = router;

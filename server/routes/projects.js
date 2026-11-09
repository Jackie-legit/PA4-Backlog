const express = require("express");
const mongoose = require("mongoose");

const User = require("../models/User");
const Project = require("../models/Project");
const ProjectMembership = require("../models/ProjectMembership");
const UserStory = require("../models/UserStory");

const router = express.Router();
router.get("/test", (req, res) => {
  res.json({ message: "Project routes are working!" });
});

const validId = (id) => mongoose.isValidObjectId(id);

const userFields = "f_name l_name username";

// GET all registered users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .select(userFields)
      .sort({ username: 1 });

    res.json(users);
} catch (error) {
  console.error("Users API error:", error);
  res.status(500).json({
    message: "Failed to load users."
  });
}
});

// CREATE a project
router.post("/projects", async (req, res) => {
  try {
    const { name, description, status, project_lead_id } = req.body;

    if (
      typeof name !== "string" || !name.trim() ||
      typeof description !== "string" || !description.trim() ||
      !["Planning", "Active", "Completed"].includes(status) ||
      !validId(project_lead_id)
    ) {
      return res.status(400).json({
        message: "Please provide valid project information."
      });
    }

    const lead = await User.findById(project_lead_id);

    if (!lead) {
      return res.status(404).json({
        message: "The selected project lead does not exist."
      });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description.trim(),
      status,
      project_lead_id: lead._id
    });

    try {
      await ProjectMembership.create({
        project_id: project._id,
        user_id: lead._id
      });
    } catch (membershipError) {
      // Undo project creation if lead membership fails.
      await Project.findByIdAndDelete(project._id);
      throw membershipError;
    }

    res.status(201).json({
      message: "Project created successfully.",
      project
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create project."
    });
  }
});

// GET all projects
router.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("project_lead_id", userFields)
      .sort({ _id: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load projects."
    });
  }
});

// GET project members
router.get("/projects/:id/members", async (req, res) => {
  try {
    const { id } = req.params;

    if (!validId(id)) {
      return res.status(400).json({
        message: "Invalid project ID."
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found."
      });
    }

    const memberships = await ProjectMembership.find({
      project_id: id
    }).populate("user_id", userFields);

    res.json(memberships);
  } catch (error) {
    res.status(500).json({
      message: "Failed to load project members."
    });
  }
});

// ADD a member
router.post("/projects/:id/members", async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!validId(id) || !validId(user_id)) {
      return res.status(400).json({
        message: "Invalid project or user ID."
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found."
      });
    }

    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    const existing = await ProjectMembership.findOne({
      project_id: id,
      user_id
    });

    if (existing) {
      return res.status(409).json({
        message: "This user is already a project member."
      });
    }

    const membership = await ProjectMembership.create({
      project_id: id,
      user_id
    });

    res.status(201).json({
      message: "Member added successfully.",
      membership
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This user is already a project member."
      });
    }

    res.status(500).json({
      message: "Failed to add member."
    });
  }
});

// REMOVE a non-lead member
router.delete("/projects/:id/members/:userId", async (req, res) => {
  try {
    const { id, userId } = req.params;

    if (!validId(id) || !validId(userId)) {
      return res.status(400).json({
        message: "Invalid project or user ID."
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found."
      });
    }

    if (project.project_lead_id.toString() === userId) {
      return res.status(403).json({
        message: "The project lead cannot be removed."
      });
    }

    // PA4: Prevent removal if the member has assigned stories
    const assignedStory = await UserStory.findOne({
      project_id: id,
      assigned_user_id: userId
    });

    if (assignedStory) {
      return res.status(409).json({
        message:
          "This member has assigned user stories. Reassign, unassign, or delete those stories before removing the member."
      });
    }

    const membership = await ProjectMembership.findOneAndDelete({
      project_id: id,
      user_id: userId
    });

    if (!membership) {
      return res.status(404).json({
        message: "Membership not found."
      });
    }

    res.json({
      message: "Member removed successfully."
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to remove member."
    });
  }
});

module.exports = router;
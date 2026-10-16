const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const User = require("./models/User");
const projectRoutes = require("./routes/projects");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", projectRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("PA2 Login and Signup server is running!");
});

// Sign Up route
app.post("/signup", async (req, res) => {
    try {
        const { f_name, l_name, username, password } = req.body;

        // Check for empty fields
        if (!f_name || !l_name || !username || !password) {
            return res.status(400).json({
                message: "Please fill in all fields."
            });
        }

        // Check if username already exists
        const existingUser = await User.findOne({ username });

        if (existingUser) {
            return res.status(400).json({
                message: "Username already exists."
            });
        }

        // Create new user
        const newUser = new User({
            f_name,
            l_name,
            username,
            password,
        });

        await newUser.save();

        res.status(201).json({
            message: "Account created successfully!"
        });

    } catch (error) {
        console.error("Signup error:", error);

        res.status(500).json({
            message: "Could not create account."
        });
    }
});

// Login route
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check for empty fields
        if (!username || !password) {
            return res.status(400).json({
                message: "Please enter username and password."
            });
        }

        // Find user in MongoDB
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({
                message: "Username does not exist."
            });
        }

        // Check password
        if (user.password !== password) {
            return res.status(400).json({
                message: "Incorrect password."
            });
        }

        res.status(200).json({
            message: "Login successful!"
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Server error. Please try again."
        });
    }
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

const PORT = 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
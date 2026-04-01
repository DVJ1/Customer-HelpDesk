require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Ticket = require("./models/Ticket");
const User = require("./models/User");


const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/customerHelpdesk")
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Customer Helpdesk API Running...");
});

// Create Ticket
app.post("/api/tickets", async (req, res) => {
  try {
    const { name, email, issue } = req.body;

    let priority = "Medium";
    let tags = [];
    const issueLower = issue.toLowerCase();

    // Smart Features: basic priority detection
    if (issueLower.includes("urgent") || issueLower.includes("crash") || issueLower.includes("broken") || issueLower.includes("asap")) {
      priority = "High";
    }

    // Smart Features: basic auto-tagging
    if (issueLower.includes("login") || issueLower.includes("password") || issueLower.includes("account")) {
      tags.push("Account");
    }
    if (issueLower.includes("pay") || issueLower.includes("billing") || issueLower.includes("invoice") || issueLower.includes("card")) {
      tags.push("Billing");
    }
    if (issueLower.includes("bug") || issueLower.includes("error") || issueLower.includes("glitch") || issueLower.includes("issue")) {
      tags.push("Bug");
    }

    const newTicket = new Ticket({
      name,
      email,
      issue,
      priority,
      tags,
      activities: [{ action: "Ticket Created", user: name }]
    });

    const savedTicket = await newTicket.save();
    res.status(201).json(savedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Tickets (with optional status or email filter)
app.get("/api/tickets", async (req, res) => {
  try {
    const { status, email } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (email) filter.email = email;

    const tickets = await Ticket.find(filter)
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Update Ticket Status
app.put("/api/tickets/:id", async (req, res) => {
  try {
    const { status, assignedTo, actionUser } = req.body;

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    let actionMsg = "";
    if (status && status !== ticket.status) {
       actionMsg = `Status changed from ${ticket.status} to ${status}`;
       ticket.status = status;
    }
    if (assignedTo !== undefined && String(assignedTo) !== String(ticket.assignedTo)) {
       actionMsg = assignedTo ? "Ticket assigned/reassigned" : "Ticket unassigned";
       ticket.assignedTo = assignedTo || null;
    }

    if (actionMsg) {
       ticket.activities.push({
          action: actionMsg,
          user: actionUser || "System"
       });
    }

    const updatedTicket = await ticket.save();
    await updatedTicket.populate("assignedTo", "name email");

    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a Comment
app.post("/api/tickets/:id/comments", async (req, res) => {
  try {
    const { text, user, role } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    
    ticket.comments.push({ text, user, role });
    ticket.activities.push({ action: "Added a comment", user });
    
    const updatedTicket = await ticket.save();
    await updatedTicket.populate("assignedTo", "name email");
    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Users (Admins for assigning tickets)
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({ role: "admin" }, "name email role");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Ticket
app.delete("/api/tickets/:id", async (req, res) => {
  try {
    const deletedTicket = await Ticket.findByIdAndDelete(req.params.id);

    if (!deletedTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json({ message: "Ticket deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Register User
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      name,
      email,
      password
    });

    const savedUser = await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login User (Standard)
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      name: user.name,
      email: user.email,
      role: user.role
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login Admin (Strict)
app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin portal only." });
    }

    res.json({
      message: "Admin login successful",
      name: user.name,
      email: user.email,
      role: user.role
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running"));
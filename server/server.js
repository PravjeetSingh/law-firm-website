const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


const Contact = require("./models/Contact");

dotenv.config();

const app = express();

/* Authentication Middleware */

const authenticateAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.admin = decoded;

    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

/* Middleware */

app.use(cors());
app.use(express.json());


/* Test Route */

app.get("/", (req, res) => {
  res.send("Lawyer Website Backend is Running");
});

/* Admin Login API */

app.post("/api/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    /* Check email */

    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    /* Check password */

    const passwordMatch = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    /* Create JWT */

    const token = jwt.sign(
      {
        email: process.env.ADMIN_EMAIL,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      message: "Login successful",
      token,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Login failed",
    });
  }
});


/* Get All Enquiries - Admin Only */

app.get("/api/contact", authenticateAdmin, async (req, res) => {
  try {

    const contacts = await Contact.find()
      .sort({ createdAt: -1 });

    res.json({
      contacts,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Unable to fetch enquiries",
    });

  }
});

/* Contact Form API */

app.post("/api/contact", async (req, res) => {
    /* Update Enquiry Status - Admin Only */

app.patch("/api/contact/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["New", "Contacted", "Closed"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        message: "Enquiry not found",
      });
    }

    res.json({
      message: "Status updated successfully",
      contact,
    });

  } catch (error) {
    console.error("Status update error:", error);

    res.status(500).json({
      message: "Unable to update status",
    });
  }
});

/* Delete Enquiry - Admin Only */

app.delete("/api/contact/:id", authenticateAdmin, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        message: "Enquiry not found",
      });
    }

    res.json({
      message: "Enquiry deleted successfully",
    });

  } catch (error) {
    console.error("Delete enquiry error:", error);

    res.status(500).json({
      message: "Unable to delete enquiry",
    });
  }
});



  try {
    const { name, phone, email, subject, message } = req.body;

    if (!name || !phone || !email || !subject || !message) {
      return res.status(400).json({
        message: "Please fill all fields",
      });
    }

    const newContact = new Contact({
      name,
      phone,
      email,
      subject,
      message,
      status: "New",
    });

    await newContact.save();

    res.status(201).json({
      message: "Enquiry sent successfully",
      contact: newContact,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Something went wrong",
    });
  }
});


/* MongoDB Connection */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(process.env.PORT || 5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((error) => {
    console.error("MongoDB Connection Error:", error);
  });
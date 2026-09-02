const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const Contact = require("./models/Contact");

dotenv.config();

const app = express();

/* =========================
   Middleware
========================= */

app.use(cors());
app.use(express.json());


/* =========================
   Authentication Middleware
========================= */

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


/* =========================
   Test Route
========================= */

app.get("/", (req, res) => {
  res.send("Lawyer Website Backend is Running");
});


/* =========================
   Admin Login API
========================= */

app.post("/api/admin/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }


    /* Check Email */

    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }


    /* Check Password */

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

    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed",
    });

  }
});


/* =========================
   Get All Enquiries
   Admin Only
========================= */

app.get(
  "/api/contact",
  authenticateAdmin,
  async (req, res) => {

    try {

      const contacts = await Contact.find()
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        contacts,
      });

    } catch (error) {

      console.error("Fetch enquiries error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to fetch enquiries",
      });

    }

  }
);


/* =========================
   Update Enquiry Status
   Admin Only
========================= */

app.patch(
  "/api/contact/:id/status",
  authenticateAdmin,
  async (req, res) => {

    try {

      const { status } = req.body;

      /* Validate Status */

      if (
        !["New", "Contacted", "Closed"].includes(status)
      ) {

        return res.status(400).json({
          message: "Invalid status",
        });

      }


      /* Update Contact */

      const contact =
        await Contact.findByIdAndUpdate(
          req.params.id,
          { status },
          { new: true }
        );


      if (!contact) {

        return res.status(404).json({
          message: "Enquiry not found",
        });

      }


      res.status(200).json({
        success: true,
        message: "Status updated successfully",
        contact,
      });

    } catch (error) {

      console.error(
        "Status update error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Unable to update status",
      });

    }

  }
);


/* =========================
   Delete Enquiry
   Admin Only
========================= */

app.delete(
  "/api/contact/:id",
  authenticateAdmin,
  async (req, res) => {

    try {

      const contact =
        await Contact.findByIdAndDelete(
          req.params.id
        );


      if (!contact) {

        return res.status(404).json({
          message: "Enquiry not found",
        });

      }


      res.status(200).json({
        success: true,
        message: "Enquiry deleted successfully",
      });

    } catch (error) {

      console.error(
        "Delete enquiry error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Unable to delete enquiry",
      });

    }

  }
);


/* =========================
   Contact Form API
   Public
========================= */

app.post("/api/contact", async (req, res) => {

  try {

    const {
      name,
      phone,
      email,
      subject,
      message
    } = req.body;


    /* Validate Fields */

    if (
      !name ||
      !phone ||
      !email ||
      !subject ||
      !message
    ) {

      return res.status(400).json({
        message: "Please fill all fields",
      });

    }


    /* Create New Enquiry */

    const newContact = new Contact({

      name,
      phone,
      email,
      subject,
      message,

      status: "New",

    });


    /* Save to MongoDB */

    await newContact.save();


    res.status(201).json({

      success: true,

      message: "Enquiry sent successfully",

      contact: newContact,

    });

  } catch (error) {

    console.error(
      "Contact form error:",
      error
    );

    res.status(500).json({

      success: false,

      message: "Something went wrong",

    });

  }

});


/* =========================
   MongoDB Connection
========================= */

mongoose
  .connect(process.env.MONGO_URI)

  .then(() => {

    console.log("MongoDB Connected");


    const PORT =
      process.env.PORT || 5000;


    app.listen(PORT, () => {

      console.log(
        `Server running on port ${PORT}`
      );

    });

  })

  .catch((error) => {

    console.error(
      "MongoDB Connection Error:",
      error
    );

  });
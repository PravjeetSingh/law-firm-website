const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const Contact = require("./models/Contact");
const Admin = require("./models/Admin");





dotenv.config();

const app = express();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("EMAIL CONFIGURATION ERROR:");
    console.error(error);
  } else {
    console.log("EMAIL SERVER READY");
  }
});

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

    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Find admin in MongoDB
    let admin = await Admin.findOne({ email });

    // Create admin automatically if it doesn't exist
    if (!admin) {
      admin = new Admin({
        email: process.env.ADMIN_EMAIL,
        passwordHash: process.env.ADMIN_PASSWORD_HASH,
      });

      await admin.save();
    }

    // Compare password with MongoDB password
    const passwordMatch = await bcrypt.compare(
      password,
      admin.passwordHash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        email: admin.email,
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
   Forgot Password API
========================= */

/* =========================
   Forgot Password API
========================= */

app.post("/api/admin/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // Don't reveal whether an email exists
    if (email !== process.env.ADMIN_EMAIL) {
      return res.status(200).json({
        message:
          "If this email is registered, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before storing it
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires after 15 minutes
    const resetTokenExpiry = new Date(
      Date.now() + 15 * 60 * 1000
    );

    // Find admin
    let admin = await Admin.findOne({ email });

    // Create admin if it doesn't exist
    if (!admin) {
      admin = new Admin({
        email: process.env.ADMIN_EMAIL,
        passwordHash: process.env.ADMIN_PASSWORD_HASH,
      });
    }

    admin.resetTokenHash = resetTokenHash;
    admin.resetTokenExpiry = resetTokenExpiry;

    await admin.save();

    // Create reset URL
    const resetUrl =
      `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Lawyer Website - Password Reset",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 30px;
          border: 1px solid #ddd;
          border-radius: 10px;
        ">

          <h2 style="color:#333;">
            Lawyer Admin Password Reset
          </h2>

          <p>
            You requested to reset your admin password.
          </p>

          <p>
            Click the button below to create a new password.
          </p>

          <a
            href="${resetUrl}"
            style="
              display:inline-block;
              padding:12px 22px;
              background:#8b6f47;
              color:white;
              text-decoration:none;
              border-radius:6px;
              margin-top:10px;
            "
          >
            Reset Password
          </a>

          <p style="margin-top:25px;">
            This link will expire in <strong>15 minutes</strong>.
          </p>

          <p>
            If you did not request this password reset,
            you can safely ignore this email.
          </p>

        </div>
      `,
    });

    res.status(200).json({
      message:
        "If this email is registered, a password reset link has been sent.",
    });

  } catch (error) {
    console.error("Forgot password error:", error);

    res.status(500).json({
      message: "Unable to send reset email",
    });
  }
});


/* =========================
   Reset Password API
========================= */

/* =========================
   Reset Password API
========================= */

app.post("/api/admin/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Token and password are required",
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // Hash received token
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find admin with valid token
    const admin = await Admin.findOne({
      resetTokenHash,
      resetTokenExpiry: {
        $gt: new Date(),
      },
    });

    if (!admin) {
      return res.status(400).json({
        message: "Reset link is invalid or has expired",
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(password, 12);

    // Save new password
    admin.passwordHash = newPasswordHash;

    // Remove reset token so it cannot be reused
    admin.resetTokenHash = null;
    admin.resetTokenExpiry = null;

    await admin.save();

    res.status(200).json({
      message: "Password reset successful",
    });

  } catch (error) {
    console.error("Reset password error:", error);

    res.status(500).json({
      message: "Unable to reset password",
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
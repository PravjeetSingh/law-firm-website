import { useState } from "react";
import "./App.css";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";


function App() {

  const path = window.location.pathname;

  /* Admin Login */

  if (path === "/admin/login") {

    const token = localStorage.getItem("adminToken");

    if (token) {
      window.location.href = "/admin/dashboard";
      return null;
    }

    return (
      <AdminLogin
        onLogin={() => {
          window.location.href = "/admin/dashboard";
        }}
      />
    );
  }


  /* Admin Dashboard */

  if (path === "/admin/dashboard") {

    const token = localStorage.getItem("adminToken");

    if (!token) {
      window.location.href = "/admin/login";
      return null;
    }

    return <AdminDashboard />;
  }


  /* Old /admin URL */

  if (path === "/admin") {
    window.location.href = "/admin/login";
    return null;
  }
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState("");


  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };


  const handleSubmit = async (event) => {
    event.preventDefault();

    setStatus("Sending enquiry...");

    try {
      const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatus("Enquiry sent successfully!");

        setFormData({
          name: "",
          phone: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        setStatus(data.message || "Failed to send enquiry");
      }

    } catch (error) {
      console.error(error);
      setStatus("Unable to connect to the server");
    }
  };


  return (
    <>
    


      {/* Navbar */}
<nav className="navbar">

  <div className="logo">
    ⚖️ <span>Advocate</span>
  </div>

  {/* Hamburger Button */}
  <button
    className="menu-toggle"
    onClick={() => setMenuOpen(!menuOpen)}
  >
    {menuOpen ? "✕" : "☰"}
  </button>

  {/* Navigation Links */}
  <div className={`nav-links ${menuOpen ? "active" : ""}`}>

    <a
      href="#home"
      onClick={() => setMenuOpen(false)}
    >
      Home
    </a>

    <a
      href="#about"
      onClick={() => setMenuOpen(false)}
    >
      About
    </a>

    <a
      href="#services"
      onClick={() => setMenuOpen(false)}
    >
      Services
    </a>

    <a
      href="#contact"
      onClick={() => setMenuOpen(false)}
    >
      Contact
    </a>

  </div>

</nav>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="hero-content">

          <h1>
            Advocate <span>Palak kharwar</span>
          </h1>

          <h2>Trusted Legal Advice & Professional Representation</h2>

          <p className="hero-description">
            Providing professional legal services with integrity,
            dedication, and commitment to justice.
          </p>

          <div className="hero-buttons">
            <a href="#contact" className="btn primary-btn">
              Contact Me
            </a>

            <a href="#about" className="btn secondary-btn">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
<section className="about" id="about">
  <div className="about-container">

    <div className="about-image">
      <div className="lawyer-placeholder">
        ⚖️
      </div>
    </div>

    <div className="about-content">
      <p className="section-tag">ABOUT THE ADVOCATE</p>

      <h2>Dedicated to Justice and Your Legal Rights</h2>

      <p>
        I am a dedicated legal professional committed to providing
        reliable legal advice and strong representation to my clients.
        My goal is to understand every client's situation and provide
        practical and effective legal solutions.
      </p>

      <p>
        With professional experience and a commitment to justice,
        I provide legal assistance with honesty, confidentiality,
        and dedication.
      </p>

      <div className="about-details">

        <div className="detail">
          <h3>Experience</h3>
          <p>5+ Years of Legal Practice</p>
        </div>

        <div className="detail">
          <h3>Education</h3>
          <p>B.Com LL.B. / Legal Professional</p>
        </div>

        <div className="detail">
          <h3>Practice Areas</h3>
          <p>Civil • Criminal • Consultation</p>
        </div>

      </div>

      <a href="#contact" className="btn primary-btn">
        Book a Consultation
      </a>

    </div>

  </div>
</section>

      {/* Services Section */}
      <section className="services" id="services">
        <h2>Legal Services</h2>
        <p>Jurisdiction - High Court Allahabad and Lucknow bench</p>

        <div className="service-container">
          <div className="service-card">
            <h3>⚖️ Legal Consultation</h3>
<p style={{ position: 'relative', bottom: '5px' }}>
  Professional legal advice for your legal concerns.
</p>
          </div>

          <div className="service-card">
            <h3>🏛️ Civil Law</h3>
            <p>Legal assistance and representation in civil matters.</p>
          </div>

          <div className="service-card">
            <h3>📜 Criminal Law</h3>
            <p>Professional support and representation in criminal cases.</p>
          </div>
        </div>
      </section>


      {/* Practice Areas Section */}
<section className="services" id="services">

  <div className="services-container">

    <p className="section-tag">PRACTICE AREAS</p>

    <h2>Legal Services & Expertise</h2>

    <p className="services-description">
      Professional legal assistance and representation for a wide
      range of legal matters with dedication, confidentiality,
      and commitment to justice.
    </p>


    <div className="services-grid">

      <div className="service-card">
        <div className="service-icon">⚖️</div>

        <h3>Civil Law</h3>

        <p>
          Legal assistance and representation in civil disputes,
          contracts, recovery matters, and other civil cases.
        </p>
      </div>


      <div className="service-card">
        <div className="service-icon">🛡️</div>

        <h3>Criminal Law</h3>

        <p>
          Legal representation and assistance in criminal matters
          with a strong commitment to protecting your legal rights.
        </p>
      </div>


      <div className="service-card">
        <div className="service-icon">👨‍👩‍👧</div>

        <h3>Family Law</h3>

        <p>
          Professional legal guidance for family disputes,
          matrimonial matters, and related legal issues.
        </p>
      </div>


      <div className="service-card">
        <div className="service-icon">🏠</div>

        <h3>Property Law</h3>

        <p>
          Legal assistance related to property disputes,
          ownership matters, and property documentation.
        </p>
      </div>


      <div className="service-card">
        <div className="service-icon">📄</div>

        <h3>Legal Consultation</h3>

        <p>
          Clear and practical legal advice to help you understand
          your rights and take the right legal steps.
        </p>
      </div>


      <div className="service-card">
        <div className="service-icon">✍️</div>

        <h3>Legal Documentation</h3>

        <p>
          Assistance with legal notices, affidavits,
          agreements, applications, and other legal documents.
        </p>
      </div>

    </div>

  </div>

</section>

{/* Contact Section */}
<section className="contact" id="contact">
  <div className="contact-container">

    {/* Contact Information */}
    <div className="contact-info-section">
      <p className="section-tag">GET IN TOUCH</p>

      <h2>Let's Discuss Your Legal Matter</h2>

      <p className="contact-description">
        If you need legal advice or professional representation,
        feel free to get in touch. Send a message or contact the
        office directly to schedule a consultation.
      </p>

      <div className="contact-details">

        <div className="contact-item">
          <div className="contact-icon">📞</div>
          <div>
            <h3>Phone</h3>
            <p>+91 70813 42221</p>
          </div>
        </div>

        <div className="contact-item">
          <div className="contact-icon">✉️</div>
          <div>
            <h3>Email</h3>
            <p>palakkharwar7985@gmail.com</p>
          </div>
        </div>

<div className="contact-item">
  <div className="contact-icon">📍</div>

  <div className="office-details">
    <h3>Our Offices</h3>

    {/* Prayagraj Office */}
    <div className="office-location">

      <h4>Prayagraj Office</h4>

      <p>
        Chamber No. 159, Near Affidavit Centre,
        Allahabad High Court, Jagdish Market,
        Prayagraj - 211008
      </p>

      <a
        href="https://www.google.com/maps/search/?api=1&query=Chamber+No+159+Near+Affidavit+Centre+Allahabad+High+Court+Jagdish+Market+Prayagraj+211008"
        target="_blank"
        rel="noreferrer"
        className="map-btn"
      >
        🗺️ Open in Google Maps
      </a>

    </div>


    {/* Lucknow Office  location */}
    <div className="office-location">

      <h4>Lucknow Office</h4>

      <p>
        Hno. 12, Adil Nagar,
        Near Satyarthi Dham Ashram,
        Kursi Road, Lucknow
      </p>

      <a
        href="https://www.google.com/maps/search/?api=1&query=Hno+12+Adil+Nagar+Near+Satyarthi+Dham+Ashram+Kursi+Road+Lucknow"
        target="_blank"
        rel="noreferrer"
        className="map-btn"
      >
        🗺️ Open in Google Maps
      </a>

    </div>

  </div>
</div>

        <div className="contact-item">
          <div className="contact-icon">🕐</div>
          <div>
            <h3>Office Hours</h3>
            <p>Monday – Saturday: 10:00 AM – 6:00 PM</p>
          </div>
        </div>

      </div>
    </div>


    {/* Contact Form */}

  <div className="contact-form-container">

  <h3>Send an Enquiry</h3>

  {/* onSubmit calls handleSubmit */}
  <form onSubmit={handleSubmit}>

    {/* Full Name */}
    <div className="form-group">
      <label>Full Name</label>

      <input
        type="text"
        name="name"
        placeholder="Enter your name"
        value={formData.name}
        onChange={handleChange}
      />
    </div>


    {/* Phone and Email */}
    <div className="form-row">

      {/* Phone */}
      <div className="form-group">
        <label>Phone Number</label>

        <input
          type="tel"
          name="phone"
          placeholder="+91 XXXXX XXXXX"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>


      {/* Email */}
      <div className="form-group">
        <label>Email Address</label>

        <input
          type="email"
          name="email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

    </div>


    {/* Subject */}
    <div className="form-group">
      <label>Subject</label>

      <select
        name="subject"
        value={formData.subject}
        onChange={handleChange}
      >
        <option value="">Select a legal matter</option>

        <option value="Civil Law">
          Civil Law
        </option>

        <option value="Criminal Law">
          Criminal Law
        </option>

        <option value="Family Law">
          Family Law
        </option>

        <option value="Property Law">
          Property Law
        </option>

        <option value="Legal Consultation">
          Legal Consultation
        </option>

        <option value="Other">
          Other
        </option>
      </select>
    </div>


    {/* Message */}
    <div className="form-group">
      <label>Message</label>

      <textarea
        name="message"
        rows="5"
        placeholder="Briefly describe your legal matter..."
        value={formData.message}
        onChange={handleChange}
      ></textarea>
    </div>


    {/* Submit Button */}
    <button type="submit" className="submit-btn">
      Send Enquiry →
    </button>


    {/* Status Message */}
    {status && (
      <p className="form-status">
        {status}
      </p>
    )}

  </form>

</div>

  </div>
</section>
{/* Footer */}

<footer className="footer">

  <div className="footer-container">

    {/* Lawyer Information */}
    <div className="footer-column">

      <h2>
        ⚖️ Advocate <span>Palak Kharwar</span>
      </h2>

      <p>
        Professional legal assistance and representation with
        integrity, dedication, confidentiality, and commitment
        to justice.
      </p>

    </div>


    {/* Quick Links */}
    <div className="footer-column">

      <h3>Quick Links</h3>

      <a href="#home">Home</a>
      <a href="#about">About</a>
      <a href="#services">Services</a>
      <a href="#contact">Contact</a>

    </div>


    {/* Practice Areas */}
    <div className="footer-column">

      <h3>Practice Areas</h3>

      <p>Civil Law</p>
      <p>Criminal Law</p>
      <p>Family Law</p>
      <p>Property Law</p>

    </div>


    {/* Contact */}
    <div className="footer-column">

      <h3>Contact</h3>

      <p>📞 +91 70813 42221</p>

      <p>✉️ palakkharwar7985@gmail.com</p>

      <p>
        📍 Prayagraj & Lucknow
      </p>

    </div>

  </div>


  {/* Footer Bottom */}

  <div className="footer-bottom">

    <p>
      © 2026 Pravjeet infotech. All Rights Reserved.
    </p>
    <p>

      For Support : singhpravjeet263@gmail.com
    </p>

  </div>

</footer>



      {/* Floating Contact Buttons */}

<div className="floating-contact">

  <a
    href="tel:+917081342221"
    className="floating-call"
    title="Call Advocate"
  >
    📞
  </a>

  <a
    href="https://wa.me/917081342221"
    target="_blank"
    rel="noreferrer"
    className="floating-whatsapp"
    title="WhatsApp Advocate"
  >
    💬
  </a>

</div>
    </>
  );
}

export default App;
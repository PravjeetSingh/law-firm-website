import { useEffect, useState } from "react";

function AdminDashboard() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");


  const fetchContacts = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("adminToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/contact`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );


      const data = await response.json();

      if (response.ok) {
        setContacts(data.contacts);
      } else {
        setError(data.message || "Unable to fetch enquiries");
      }
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

    const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `import.meta.env.VITE_API_URL/api/contact/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setContacts((previousContacts) =>
          previousContacts.map((contact) =>
            contact._id === id
              ? { ...contact, status: data.contact.status }
              : contact
          )
        );
      } else {
        alert(data.message || "Unable to update status");
      }

    } catch (error) {
      console.error(error);
      alert("Unable to connect to the server");
    }
  };


  const deleteEnquiry = async (id) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this enquiry?"
  );

  if (!confirmed) {
    return;
  }

  try {
    const token = localStorage.getItem("adminToken");

    const response = await fetch(
      `import.meta.env.VITE_API_URL/api/contact/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      setContacts((previousContacts) =>
        previousContacts.filter((contact) => contact._id !== id)
      );
    } else {
      alert(data.message || "Unable to delete enquiry");
    }

  } catch (error) {
    console.error(error);
    alert("Unable to connect to the server");
  }
};


    const filteredContacts = contacts.filter((contact) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      contact.name.toLowerCase().includes(search) ||
      contact.phone.includes(search) ||
      contact.email.toLowerCase().includes(search);

    const matchesStatus =
      filterStatus === "All" ||
      (contact.status || "New") === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalEnquiries = contacts.length;

  const newEnquiries = contacts.filter(
    (contact) => (contact.status || "New") === "New"
  ).length;

  const contactedEnquiries = contacts.filter(
    (contact) => contact.status === "Contacted"
  ).length;

  const closedEnquiries = contacts.filter(
    (contact) => contact.status === "Closed"
  ).length;



  return (
    <div className="admin-page">

      {/* Header */}
      <header className="admin-header">
        
        <div>
          <h1>Lawyer Admin Dashboard</h1>
          <p>Manage client enquiries</p>
        </div>



        <div className="admin-header-buttons">

  <button
    className="refresh-btn"
    onClick={fetchContacts}
  >
    ↻ Refresh
  </button>

  <button
    className="logout-btn"
    onClick={() => {
      localStorage.removeItem("adminToken");
      window.location.reload();
    }}
  >
    Logout
  </button>

</div>



      </header>


      {/* Statistics */}
<div className="admin-stats">

  <div className="stat-card">
    <span className="stat-icon">📩</span>
    <div>
      <h3>Total Enquiries</h3>
      <strong>{totalEnquiries}</strong>
    </div>
  </div>

  <div className="stat-card">
    <span className="stat-icon">🟡</span>
    <div>
      <h3>New</h3>
      <strong>{newEnquiries}</strong>
    </div>
  </div>

  <div className="stat-card">
    <span className="stat-icon">🔵</span>
    <div>
      <h3>Contacted</h3>
      <strong>{contactedEnquiries}</strong>
    </div>
  </div>

  <div className="stat-card">
    <span className="stat-icon">🟢</span>
    <div>
      <h3>Closed</h3>
      <strong>{closedEnquiries}</strong>
    </div>
  </div>

</div>


      {/* Enquiries */}
      <section className="enquiries-section">

        <div className="section-heading">
            <div className="enquiry-filters">

  <input
    type="text"
    placeholder="Search by name, phone or email..."
    value={searchTerm}
    onChange={(event) => setSearchTerm(event.target.value)}
  />

  <select
    value={filterStatus}
    onChange={(event) => setFilterStatus(event.target.value)}
  >
    <option value="All">All Enquiries</option>
    <option value="New">New</option>
    <option value="Contacted">Contacted</option>
    <option value="Closed">Closed</option>
  </select>

</div>
          <div>
            <h2>Client Enquiries</h2>
            <p>Recent enquiries submitted through your website</p>
          </div>

            <span className="enquiry-count">
             {filteredContacts.length} Enquiries
            </span>
        </div>


        {/* Loading */}
        {loading && (
          <div className="admin-message">
            Loading enquiries...
          </div>
        )}


        {/* Error */}
        {!loading && error && (
          <div className="admin-error">
            {error}
          </div>
        )}


        {/* No enquiries */}
        {!loading && !error && contacts.length === 0 && (
          <div className="admin-message">
            No enquiries received yet.
          </div>
        )}


        {/* Enquiry Cards */}
        {!loading && !error && contacts.length > 0 && (
          <div className="enquiries-list">

            {filteredContacts.map((contact) => (

              <div
                className="enquiry-card"
                key={contact._id}
              >

                <div className="enquiry-top">

                  <div>
                    <h3>{contact.name}</h3>

                    <span className="subject-badge">
                      {contact.subject}
                    </span>
                  </div>

                  <span className="enquiry-date">
                    {new Date(contact.createdAt).toLocaleString()}
                  </span>

                </div>


                <div className="enquiry-info">

                  <div>
                    <strong>📞 Phone</strong>
                    <p>{contact.phone}</p>
                  </div>

                  <div>
                    <strong>✉️ Email</strong>
                    <p>{contact.email}</p>
                  </div>

                </div>


                <div className="enquiry-message">

                  <strong>Message</strong>

                  <p>{contact.message}</p>

                </div>
                <div className="enquiry-status">
                    <strong>Status</strong>
                    <select
                    value={contact.status || "New"}
                    onChange={(event) =>
                        updateStatus(contact._id, event.target.value)
                    }
                    >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Closed">Closed</option>
                        </select>
                        </div>                

<div className="enquiry-actions">

  <a
    href={`tel:${contact.phone}`}
    className="call-btn"
  >
    📞 Call
  </a>

  <a
    href={`mailto:${contact.email}`}
    className="email-btn"
  >
    ✉️ Email
  </a>

  <button
    className="delete-btn"
    onClick={() => deleteEnquiry(contact._id)}
  >
    🗑 Delete
  </button>

</div>

              </div>

            ))}

          </div>
        )}

      </section>

    </div>
  );
}

export default AdminDashboard;
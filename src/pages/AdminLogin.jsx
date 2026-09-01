import { useState } from "react";

function AdminLogin({ onLogin }) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");
    setLoading(true);

    try {

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );


      const data = await response.json();


      if (!response.ok) {

        setError(
          data.message || "Invalid email or password"
        );

        setLoading(false);

        return;
      }


      /* Save JWT */

      localStorage.setItem(
        "adminToken",
        data.token
      );


      /* Open dashboard */

      onLogin();

    } catch (error) {

      console.error(error);

      setError(
        "Unable to connect to the server"
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="admin-login-page">

      <div className="login-card">

        <div className="login-icon">
          ⚖️
        </div>

        <h1>Lawyer Login</h1>

        <p className="login-subtitle">
          Admin access to client enquiries
        </p>


        <form onSubmit={handleLogin}>

          <div className="form-group">

            <label>Email Address</label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

          </div>


          <div className="form-group">

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

          </div>


          {error && (
            <div className="login-error">
              {error}
            </div>
          )}


          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >

            {loading
              ? "Logging in..."
              : "Login to Dashboard →"}

          </button>

        </form>

      </div>

    </div>

  );
}

export default AdminLogin;
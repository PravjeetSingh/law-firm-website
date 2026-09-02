import { useState } from "react";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const token = window.location.pathname.split("/").pop();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/reset-password`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            token,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to reset password");
        return;
      }

      setMessage(
        "Password reset successful. You can now login with your new password."
      );

      setPassword("");
      setConfirmPassword("");

    } catch (error) {
      console.error(error);

      setError("Unable to connect to the server");

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

        <h1>
          Reset Password
        </h1>

        <p className="login-subtitle">
          Create a new admin password
        </p>

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label>
              New Password
            </label>

            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

          </div>

          <div className="form-group">

            <label>
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              required
            />

          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {message && (
            <div className="login-success">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading
              ? "Resetting..."
              : "Reset Password →"}
          </button>

        </form>

        <div className="forgot-password">

          <button
            type="button"
            onClick={() => {
              window.location.href = "/admin";
            }}
          >
            ← Back to Login
          </button>

        </div>

      </div>

    </div>
  );
}

export default ResetPassword;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import "./styles/AuthModal.css";

export default function AuthModal({ onClose, role = "customer" }) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [step, setStep] = useState("details");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function switchMode(next) {
    setMode(next);
    setStep("details");
    setError("");
    setOtp("");
  }

  function resetToDetails() {
    setStep("details");
    setOtp("");
    setError("");
  }

  async function sendOtp(e) {
    e.preventDefault();

    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (mode === "signup") {
      if (!name.trim()) {
        setError("Please enter your name.");
        return;
      }

      if (!phone.trim()) {
        setError("Please enter your phone number.");
        return;
      }

      if (!address.trim()) {
        setError("Please enter your address.");
        return;
      }
    }

    setBusy(true);

    try {
      await api.requestOtp(cleanEmail, mode);

      setEmail(cleanEmail);
      setStep("otp");
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (mode === "login" && status === 404) {
        setError(
          message || "No account exists with this email. Please sign up first.",
        );
      } else if (mode === "signup" && status === 409) {
        setError(
          message ||
            "An account with this email already exists. Please log in instead.",
        );
      } else {
        setError(message || "Could not send the OTP email. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function confirmOtp(e) {
    e.preventDefault();

    setError("");

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    setBusy(true);

    try {
      const data = await api.verifyOtp(
        email,
        otp.trim(),
        mode === "signup" ? name.trim() : undefined,
        role,
        mode === "signup" ? phone.trim() : undefined,
        mode === "signup" ? address.trim() : undefined,
        mode,
      );

      login(data);
      onClose();
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Incorrect OTP. Please check the code and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <h2>{role === "owner" ? "Restaurant partner" : "MealDrop"}</h2>

        {step === "details" && (
          <>
            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab ${mode === "login" ? "active" : ""}`}
                onClick={() => switchMode("login")}
              >
                Log in
              </button>

              <button
                type="button"
                className={`auth-tab ${mode === "signup" ? "active" : ""}`}
                onClick={() => switchMode("signup")}
              >
                Sign up
              </button>
            </div>

            <form onSubmit={sendOtp}>
              {mode === "signup" && (
                <>
                  <label className="field-label">Full name</label>

                  <input
                    className="field-input"
                    type="text"
                    required
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />

                  <label className="field-label">Phone number</label>

                  <input
                    className="field-input"
                    type="tel"
                    required
                    placeholder="Your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                  />

                  <label className="field-label">Address</label>

                  <textarea
                    className="field-input field-textarea"
                    required
                    placeholder="Your delivery address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    autoComplete="street-address"
                  />
                </>
              )}

              <label className="field-label">Email address</label>

              <input
                className="field-input"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />

              {error && (
                <p className="field-error">
                  {error}

                  {mode === "login" &&
                    error.toLowerCase().includes("sign up") && (
                      <>
                        {" "}
                        <button
                          type="button"
                          className="field-error-link"
                          onClick={() => switchMode("signup")}
                        >
                          Sign up instead
                        </button>
                      </>
                    )}

                  {mode === "signup" &&
                    error.toLowerCase().includes("log in") && (
                      <>
                        {" "}
                        <button
                          type="button"
                          className="field-error-link"
                          onClick={() => switchMode("login")}
                        >
                          Log in instead
                        </button>
                      </>
                    )}
                </p>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={busy}
              >
                {busy
                  ? "Checking..."
                  : mode === "login"
                    ? "Send login code"
                    : "Send signup code"}
              </button>
            </form>
          </>
        )}

        {step === "otp" && (
          <form onSubmit={confirmOtp}>
            <p className="auth-otp-title">Verify your email</p>

            <p className="field-hint">
              We sent a 6-digit code to <strong>{email}</strong>. The code
              expires in 10 minutes.
            </p>

            {mode === "signup" && (
              <div className="signup-summary">
                <p>
                  <strong>Name:</strong> {name}
                </p>

                <p>
                  <strong>Phone:</strong> {phone}
                </p>

                <p>
                  <strong>Address:</strong> {address}
                </p>
              </div>
            )}

            <label className="field-label">Enter OTP</label>

            <input
              className="field-input otp-input"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              placeholder="6-digit code"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
            />

            {error && <p className="field-error">{error}</p>}

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={busy}
            >
              {busy
                ? "Verifying..."
                : mode === "login"
                  ? "Verify & Log in"
                  : "Verify & Create account"}
            </button>

            <button
              type="button"
              className="btn btn-outline btn-block"
              style={{ marginTop: 8 }}
              onClick={resetToDetails}
              disabled={busy}
            >
              Go back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

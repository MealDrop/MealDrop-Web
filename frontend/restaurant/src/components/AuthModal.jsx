import { useState } from "react";
import * as api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import "./styles/AuthModal.css";

export default function AuthModal({ onClose }) {
  const { login } = useAuth();

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

  async function sendOtp(e) {
    e.preventDefault();

    setError("");

    if (mode === "signup") {
      if (!name.trim()) {
        setError("Enter your full name.");
        return;
      }

      if (!phone.trim()) {
        setError("Enter your phone number.");
        return;
      }

      if (!address.trim()) {
        setError("Enter your address.");
        return;
      }
    }

    setBusy(true);

    try {
      await api.requestOtp(email, mode);
      setStep("otp");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not send the OTP email. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function confirmOtp(e) {
    e.preventDefault();

    setError("");
    setBusy(true);

    try {
      const data = await api.verifyOtp(
        email,
        {
          otp,
          name,
          phone,
          address,
        },
        "owner",
        mode,
      );

      login(data);
      onClose();
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
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <p className="eyebrow">MealDrop Partner</p>
        <h2>{mode === "login" ? "Welcome back" : "Create partner account"}</h2>

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
                  <label className="field-label">Owner name</label>
                  <input
                    className="field-input"
                    type="text"
                    required
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />

                  <label className="field-label">Phone number</label>
                  <input
                    className="field-input"
                    type="tel"
                    required
                    placeholder="10-digit phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />

                  <label className="field-label">Address</label>
                  <textarea
                    className="field-input"
                    rows={3}
                    required
                    placeholder="Your address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
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
              />

              {error && <p className="field-error">{error}</p>}

              <button
                className="btn btn-primary btn-block"
                disabled={busy}
                style={{ marginTop: 18 }}
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
            <p className="muted" style={{ marginBottom: 16 }}>
              We sent a 6-digit verification code to <strong>{email}</strong>.
            </p>

            <label className="field-label">Enter OTP</label>

            <input
              className="field-input"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              placeholder="6-digit code"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
            />

            <p className="field-hint">The code expires in 10 minutes.</p>

            {error && <p className="field-error">{error}</p>}

            <button
              className="btn btn-primary btn-block"
              disabled={busy}
              style={{ marginTop: 18 }}
            >
              {busy ? "Verifying..." : "Verify & continue"}
            </button>

            <button
              type="button"
              className="btn btn-outline btn-block"
              style={{ marginTop: 8 }}
              onClick={() => {
                setStep("details");
                setOtp("");
                setError("");
              }}
            >
              Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

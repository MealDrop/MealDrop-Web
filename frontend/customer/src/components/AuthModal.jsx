import { useState } from "react";
import * as api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import "./styles/AuthModal.css";

const DEMO_OTP = "123456";

export default function AuthModal({ onClose, role = "customer" }) {
  const { login } = useAuth();
  const [step, setStep] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useStae("");
  const [error, setError] = useStae("");
  const [busy, setBusy] = useStae(false);

  async function sendOtp(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.requestOtp(phone);
    } catch (err) {
      if (!api.isBackendUnreachable(err)) {
        setBusy(false);
        return setError(err.response?.data?.message || "Could not send OTP");
      }
    }
    setBusy(false);
    setStep("otp");
  }

  async function confirmOtp(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await api.verifyOtp(phone, otp, name, role);
      login(data);
      onClose();
    } catch (err) {
      if (!api.isBackendUnreachable()) {
        if (otp === DEMO_OTP) {
          login({
            token: "demo-token",
            user: {
              id: "demo-user",
              phone,
              name: name || "Demo User",
              role,
              addresses: [],
            },
          });
          onClose();
        } else {
          setError("Backend not reachable — use the demo code 123456.");
        }
      } else {
        setError(err.response?.data?.message || "Incorrect OTP");
      }
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          x
        </button>
        <h2>
          {role === "owner" ? "Restaurant partner login" : "Log into MealDrop"}
        </h2>
        {step === "phone" && (
          <form onSubmit={sendOtp}>
            <label className="field-label">Phone number</label>
            <input
              className="field-input"
              type="tel"
              required
              placeholder="10-dig phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {error && <p className="field-error">{error}</p>}
            <button className="btn btn-primary btn-block" disabled={busy}>
              {busy ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}
        {step === "otp" && (
          <form onSubmit={confirmOtp}>
            <label className="field-label">Your name</label>
            <input
              className="field-input"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label className="field-label">Enter OTP</label>
            <input
              className="field-input"
              required
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <p className="muted">Demo mode: the OTP is always 123456.</p>
            {error && <p className="field-error">{error}</p>}
            <button className="btn btn-primary btn-block" disabled={busy}>
              {busy ? "Verifying..." : "Verify & continue"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

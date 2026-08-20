import { useState } from "react";
import * as api from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

const DEMO_OTP = "123456";

export default function AuthModal({ onClose }) {
  const { login } = useAuth();
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
      const data = await api.verifyOtp(phone, otp, name, "owner");
      login(data);
      onClose();
    } catch (err) {
      if (api.isBackendUnreachable(err)) {
        if (otp === DEMO_OTP) {
          login({
            token: "demo-token",
            user: {
              id: "demo-owner",
              phone,
              name: name || "Demo Owner",
              role: "owner",
            },
            restaurant: null,
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
          ×
        </button>
        <h2>Restaurant partner login</h2>

        {step === "phone" && (
          <form onSubmit={sendOtp}>
            <label className="field-label">Phone number</label>
            <input
              className="field-input"
              type="tel"
              required
              placeholder="10-digit phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {error && <p className="field-error">{error}</p>}
            <button
              className="btn btn-primary btn-block"
              style={{ marginTop: 16 }}
              disabled={busy}
            >
              {busy ? "Sending..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={confirmOtp}>
            <label className="field-label">Owner name</label>
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
            <p className="field-hint">Demo mode: the OTP is always 123456.</p>
            {error && <p className="field-error">{error}</p>}
            <button
              className="btn btn-primary btn-block"
              style={{ marginTop: 16 }}
              disabled={busy}
            >
              {busy ? "Verifying..." : "Verify & continue"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

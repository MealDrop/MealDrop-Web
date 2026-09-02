import { useState } from "react";
import { Phone, Mail, MessageCircle } from "lucide-react";
import "./styles/SupportModal.css";

const SUPPORT_EMAIL = "help@mealdrop.app";

export default function SupportModal({ onClose }) {
  const [message, setMessage] = useState("");

  function send(e) {
    e.preventDefault();
    if (!message.trim()) return;
    const subject = encodeURIComponent("MealDrop support request");
    const body = encodeURIComponent(message);
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h2>Customer support</h2>

        <div className="support-contacts">
          <a href="tel:+911234567890" className="support-contact">
            <Phone size={16} /> +91 12345 67890
          </a>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="support-contact">
            <Mail size={16} /> {SUPPORT_EMAIL}
          </a>
        </div>

        <form onSubmit={send}>
          <label className="field-label">
            <MessageCircle size={13} /> Tell us what's wrong
          </label>
          <textarea
            className="field-input"
            rows={4}
            placeholder="Describe your issue..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <p className="field-hint">
            Opens your email app with this pre-filled — there's no in-app ticket
            system yet.
          </p>
          <button className="btn btn-primary btn-block">Send message</button>
        </form>
      </div>
    </div>
  );
}

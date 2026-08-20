import { useState } from "react";
import { Phone, Mail, MessageCircle } from "lucide-react";
import "./styles/SupportModal.css";

export default function SupportModal({ onClose }) {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function send(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setSent(true);
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
          <a href="mailto:help@mealdrop.app" className="support-contact">
            <Mail size={16} /> help@mealdrop.app
          </a>
        </div>

        {sent ? (
          <p className="banner" style={{ marginTop: 18 }}>
            Thanks — your message has been noted. We'll get back to you soon.
          </p>
        ) : (
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
            <button className="btn btn-primary btn-block">Send message</button>
          </form>
        )}
      </div>
    </div>
  );
}

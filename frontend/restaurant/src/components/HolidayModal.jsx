import { useState } from "react";

export default function HolidayModal({ current, onClose, onSave }) {
  const [date, setDate] = useState(current || "");
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!date) return;
    setSaving(true);
    await onSave(date);
    setSaving(false);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h2>Take a break</h2>
        <p className="muted" style={{ marginBottom: 16 }}>
          Close your restaurant until a date — customers will see "Closed till"
          instead of "Closed", and can't order until then.
        </p>
        <form onSubmit={submit}>
          <label className="field-label">Reopen on</label>
          <input
            className="field-input"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button
            className="btn btn-primary btn-block"
            style={{ marginTop: 18 }}
            disabled={saving}
          >
            {saving ? "Saving..." : "Close until this date"}
          </button>
        </form>
      </div>
    </div>
  );
}

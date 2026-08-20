import { useState } from "react";

const CATEGORIES = [
  "Starter",
  "Main",
  "Bread",
  "Rice",
  "Dessert",
  "Beverage",
  "Other",
];

export default function DishFormModal({ initial, onClose, onSave }) {
  const [form, setForm] = useState(
    initial || {
      name: "",
      description: "",
      price: "",
      category: "Main",
      isVeg: true,
      imageUrl: "",
      isAvailable: true,
    },
  );
  const [saving, setSaving] = useState(false);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.price) return;
    setSaving(true);
    await onSave({ ...form, price: Number(form.price) });
    setSaving(false);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <h2>{initial ? "Edit dish" : "Add a dish"}</h2>

        <form onSubmit={submit}>
          <label className="field-label">Dish name</label>
          <input
            className="field-input"
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
          />

          <label className="field-label">Description</label>
          <textarea
            className="field-input"
            rows={2}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />

          <div className="form-row">
            <div>
              <label className="field-label">Price (₹)</label>
              <input
                className="field-input"
                type="number"
                min="0"
                required
                value={form.price}
                onChange={(e) => set("price", e.target.value)}
              />
            </div>
            <div>
              <label className="field-label">Category</label>
              <select
                className="field-input"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="field-label">Image URL (optional)</label>
          <input
            className="field-input"
            placeholder="https://... — leave blank to show a placeholder"
            value={form.imageUrl}
            onChange={(e) => set("imageUrl", e.target.value)}
          />

          <div className="form-row" style={{ marginTop: 14 }}>
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={form.isVeg}
                onChange={(e) => set("isVeg", e.target.checked)}
              />
              Vegetarian
            </label>
            <label className="toggle-row">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(e) => set("isAvailable", e.target.checked)}
              />
              Available today
            </label>
          </div>

          <button
            className="btn btn-primary btn-block"
            style={{ marginTop: 18 }}
            disabled={saving}
          >
            {saving ? "Saving..." : initial ? "Save changes" : "Add dish"}
          </button>
        </form>
      </div>
    </div>
  );
}

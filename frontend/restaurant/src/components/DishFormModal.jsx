import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import * as api from "../api.js";

const CATEGORY_SUGGESTIONS = [
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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const url = await api.uploadImage(file);
      set("imageUrl", url);
    } catch (err) {
      setUploadError(
        err.response?.data?.message ||
          "Could not upload the photo — try again.",
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
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
          <label className="field-label">Photo (optional)</label>
          <div className="dish-photo-picker">
            {form.imageUrl ? (
              <div className="dish-photo-preview">
                <img src={form.imageUrl} alt="" />
                <button
                  type="button"
                  className="dish-photo-remove"
                  onClick={() => set("imageUrl", "")}
                >
                  <X size={13} />
                </button>
              </div>
            ) : (
              <label className="dish-photo-upload">
                {uploading ? (
                  "Uploading..."
                ) : (
                  <>
                    <ImagePlus size={18} /> Upload photo
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  hidden
                />
              </label>
            )}
          </div>
          {uploadError && <p className="field-error">{uploadError}</p>}

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
              <label className="field-label">Category / type</label>
              <input
                className="field-input"
                list="dish-category-suggestions"
                placeholder="e.g. Starter, Main, Combo..."
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              />
              <datalist id="dish-category-suggestions">
                {CATEGORY_SUGGESTIONS.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

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
            disabled={saving || uploading}
          >
            {saving ? "Saving..." : initial ? "Save changes" : "Add dish"}
          </button>
        </form>
      </div>
    </div>
  );
}

import { useState } from "react";

const EMPTY = { name: "", age: "", email: "", phone: "", course: "", marks: "" };
const EMAIL_RE = /^[\w.+-]+@[\w-]+\.[\w.-]+$/;

// Same rules as the backend, so users get instant feedback.
function validate(f) {
  const e = {};
  if (f.name.trim().length < 2 || !/^[A-Za-z\s]+$/.test(f.name.trim())) e.name = "Letters only, minimum 2 characters.";
  if (!(Number(f.age) >= 5 && Number(f.age) <= 100)) e.age = "Age must be between 5 and 100.";
  if (!EMAIL_RE.test(f.email.trim())) e.email = "Enter a valid email address.";
  if (f.phone && !/^\d{10}$/.test(f.phone)) e.phone = "Phone must be exactly 10 digits.";
  if (f.course.trim().length < 2) e.course = "Course is required.";
  if (f.marks === "" || !(Number(f.marks) >= 0 && Number(f.marks) <= 100)) e.marks = "Marks must be between 0 and 100.";
  return e;
}

export default function StudentModal({ student, onClose, onSave }) {
  const isEdit = Boolean(student);
  const [form, setForm] = useState(
    isEdit ? { ...EMPTY, ...student, phone: student.phone || "" } : EMPTY
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const set = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    setErrors({ ...errors, [field]: undefined });
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    setFormError("");
    try {
      await onSave({
        name: form.name, age: Number(form.age), email: form.email,
        phone: form.phone, course: form.course, marks: Number(form.marks),
      });
    } catch (err) {
      setErrors(err.details || {});          // show server-side field errors (e.g. duplicate email)
      if (!err.details || !Object.keys(err.details).length) setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const field = (label, name, props = {}) => (
    <label className="field">
      <span>{label}</span>
      <input className={`input ${errors[name] ? "invalid" : ""}`} value={form[name]}
             onChange={set(name)} {...props} />
      {errors[name] && <small className="error">{errors[name]}</small>}
    </label>
  );

  return (
    <div className="overlay" onMouseDown={onClose}>
      <form className="modal card" onMouseDown={(e) => e.stopPropagation()} onSubmit={submit} noValidate>
        <h2>{isEdit ? `Edit Student #${student.id}` : "Add New Student"}</h2>
        {formError && <div className="alert">{formError}</div>}

        <div className="grid">
          {field("Full name", "name", { placeholder: "e.g. Arun Kumar", autoFocus: true })}
          {field("Email", "email", { type: "email", placeholder: "name@mail.com" })}
          {field("Age", "age", { type: "number", placeholder: "20" })}
          {field("Phone (optional)", "phone", { placeholder: "10 digit number", maxLength: 10 })}
          {field("Course", "course", { placeholder: "CSE, IT, ECE..." })}
          {field("Marks (0–100)", "marks", { type: "number", step: "0.01", placeholder: "85" })}
        </div>

        <div className="actions">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? "Saving..." : isEdit ? "Update Student" : "Add Student"}
          </button>
        </div>
      </form>
    </div>
  );
}

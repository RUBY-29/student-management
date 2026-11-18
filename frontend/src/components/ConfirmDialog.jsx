export default function ConfirmDialog({ student, busy, onCancel, onConfirm }) {
  return (
    <div className="overlay" onMouseDown={onCancel}>
      <div className="modal card small-modal" onMouseDown={(e) => e.stopPropagation()}>
        <h2>Delete student?</h2>
        <p>
          You are about to permanently delete <strong>{student.name}</strong> ({student.email}).
          This action cannot be undone.
        </p>
        <div className="actions">
          <button className="btn ghost" onClick={onCancel}>Cancel</button>
          <button className="btn danger-solid" onClick={onConfirm} disabled={busy}>
            {busy ? "Deleting..." : "Yes, delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

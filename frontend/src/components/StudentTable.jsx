function initials(name) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default function StudentTable({ students, loading, onEdit, onDelete }) {
  if (!loading && students.length === 0) {
    return <div className="empty card">No students found. Try a different search or add a new student.</div>;
  }

  return (
    <div className={`card table-wrap ${loading ? "is-loading" : ""}`}>
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Student</th><th>Course</th><th>Age</th>
            <th>Phone</th><th>Marks</th><th>Grade</th><th className="right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td className="muted">#{s.id}</td>
              <td>
                <div className="person">
                  <span className="avatar">{initials(s.name)}</span>
                  <div>
                    <div className="name">{s.name}</div>
                    <div className="muted">{s.email}</div>
                  </div>
                </div>
              </td>
              <td><span className="chip">{s.course}</span></td>
              <td>{s.age}</td>
              <td className="muted">{s.phone || "—"}</td>
              <td><strong>{s.marks}</strong></td>
              <td><span className={`badge grade-${s.grade.replace("+", "plus")}`}>{s.grade}</span></td>
              <td className="right">
                <button className="btn small" onClick={() => onEdit(s)}>Edit</button>
                <button className="btn small danger" onClick={() => onDelete(s)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { exportUrl } from "../api";

const SORT_OPTIONS = [
  { value: "id:desc", label: "Newest first" },
  { value: "id:asc", label: "Oldest first" },
  { value: "name:asc", label: "Name (A–Z)" },
  { value: "name:desc", label: "Name (Z–A)" },
  { value: "marks:desc", label: "Marks (high → low)" },
  { value: "marks:asc", label: "Marks (low → high)" },
  { value: "age:asc", label: "Age (low → high)" },
];

export default function Toolbar({ query, courses, onChange, onAdd }) {
  return (
    <div className="toolbar">
      <input
        className="input search"
        type="search"
        placeholder="Search by name, email or course..."
        value={query.search}
        onChange={(e) => onChange({ search: e.target.value, page: 1 })}
      />

      <select className="input" value={query.course}
              onChange={(e) => onChange({ course: e.target.value, page: 1 })}>
        <option value="">All courses</option>
        {courses.map((c) => (
          <option key={c.course} value={c.course}>{c.course} ({c.count})</option>
        ))}
      </select>

      <select className="input" value={`${query.sort}:${query.order}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split(":");
                onChange({ sort, order, page: 1 });
              }}>
        {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      <a className="btn ghost" href={exportUrl}>⬇ Export CSV</a>
      <button className="btn primary" onClick={onAdd}>＋ Add Student</button>
    </div>
  );
}

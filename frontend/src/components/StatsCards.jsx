const GRADE_ORDER = ["A+", "A", "B", "C", "D", "F"];

export default function StatsCards({ stats }) {
  if (!stats) return null;
  const grades = [...stats.grades].sort(
    (a, b) => GRADE_ORDER.indexOf(a.grade) - GRADE_ORDER.indexOf(b.grade)
  );
  const maxGrade = Math.max(...grades.map((g) => g.count), 1);

  return (
    <section className="stats">
      <div className="card stat">
        <span className="label">Total Students</span>
        <strong>{stats.total}</strong>
      </div>
      <div className="card stat">
        <span className="label">Average Marks</span>
        <strong>{stats.average}</strong>
      </div>
      <div className="card stat">
        <span className="label">Top Performer</span>
        <strong className="small">{stats.topper || "—"}</strong>
        <span className="muted">{stats.highest ? `${stats.highest} marks` : ""}</span>
      </div>
      <div className="card stat grades">
        <span className="label">Grade Distribution</span>
        <div className="bars">
          {grades.map((g) => (
            <div className="bar-col" key={g.grade} title={`${g.grade}: ${g.count}`}>
              <div className={`bar grade-${g.grade.replace("+", "plus")}`}
                   style={{ height: `${(g.count / maxGrade) * 100}%` }} />
              <span>{g.grade}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

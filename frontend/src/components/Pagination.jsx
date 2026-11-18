export default function Pagination({ page, pages, total, limit, onPage }) {
  if (total === 0) return null;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="pagination">
      <span className="muted">Showing {from}–{to} of {total}</span>
      <div>
        <button className="btn small" disabled={page <= 1} onClick={() => onPage(page - 1)}>← Prev</button>
        <span className="page-num">Page {page} / {pages}</span>
        <button className="btn small" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next →</button>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import { createStudent, deleteStudent, getStats, getStudents, updateStudent } from "./api";
import useDebounce from "./hooks/useDebounce";
import StatsCards from "./components/StatsCards";
import Toolbar from "./components/Toolbar";
import StudentTable from "./components/StudentTable";
import Pagination from "./components/Pagination";
import StudentModal from "./components/StudentModal";
import ConfirmDialog from "./components/ConfirmDialog";
import Toast from "./components/Toast";

const INITIAL_QUERY = { search: "", course: "", sort: "id", order: "desc", page: 1, limit: 8 };

export default function App() {
  const [query, setQuery] = useState(INITIAL_QUERY);
  const [result, setResult] = useState({ data: [], total: 0, pages: 1 });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ open: false, student: null });
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const debouncedSearch = useDebounce(query.search, 400);
  const { course, sort, order, page, limit } = query;

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setResult(await getStudents({ search: debouncedSearch, course, sort, order, page, limit }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, course, sort, order, page, limit]);

  const loadStats = useCallback(async () => {
    try {
      setStats(await getStats());
    } catch {
      /* the list already shows a connection error */
    }
  }, []);

  useEffect(() => { loadStudents(); }, [loadStudents]);
  useEffect(() => { loadStats(); }, [loadStats]);

  const updateQuery = (changes) => setQuery((q) => ({ ...q, ...changes }));
  const notify = (message, type = "success") => setToast({ message, type });

  // ---- CREATE / UPDATE
  const handleSave = async (data) => {
    if (modal.student) {
      await updateStudent(modal.student.id, data);
      notify("Student updated successfully");
    } else {
      await createStudent(data);
      notify("Student added successfully");
    }
    setModal({ open: false, student: null });
    loadStudents();
    loadStats();
  };

  // ---- DELETE
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteStudent(toDelete.id);
      notify("Student deleted");
      setToDelete(null);
      if (result.data.length === 1 && page > 1) updateQuery({ page: page - 1 });
      else loadStudents();
      loadStats();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1>🎓 Student Management System</h1>
          <p className="muted">React.js · Flask REST API · MySQL</p>
        </div>
      </header>

      <StatsCards stats={stats} />

      <Toolbar
        query={query}
        courses={stats?.courses || []}
        onChange={updateQuery}
        onAdd={() => setModal({ open: true, student: null })}
      />

      {error ? (
        <div className="alert big">
          {error}
          <button className="btn small" onClick={loadStudents}>Retry</button>
        </div>
      ) : (
        <>
          <StudentTable
            students={result.data}
            loading={loading}
            onEdit={(s) => setModal({ open: true, student: s })}
            onDelete={setToDelete}
          />
          <Pagination page={page} pages={result.pages} total={result.total}
                      limit={limit} onPage={(p) => updateQuery({ page: p })} />
        </>
      )}

      {modal.open && (
        <StudentModal student={modal.student} onSave={handleSave}
                      onClose={() => setModal({ open: false, student: null })} />
      )}
      {toDelete && (
        <ConfirmDialog student={toDelete} busy={deleting}
                       onCancel={() => setToDelete(null)} onConfirm={handleDelete} />
      )}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

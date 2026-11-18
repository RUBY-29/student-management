// All communication with the Flask REST API lives in this one file.
export const BASE_URL = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(body.error || "Request failed");
    err.details = body.details || {}; // field-level errors from the backend
    err.status = response.status;
    throw err;
  }
  return body;
}

export const getStudents = (params) => {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v != null))
  );
  return request(`/students?${query}`);
};

export const getStats = () => request("/stats");

export const createStudent = (data) =>
  request("/students", { method: "POST", body: JSON.stringify(data) });

export const updateStudent = (id, data) =>
  request(`/students/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteStudent = (id) => request(`/students/${id}`, { method: "DELETE" });

export const exportUrl = `${BASE_URL}/students/export`;

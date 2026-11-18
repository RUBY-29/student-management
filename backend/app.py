"""Student Management System - Flask REST API
Run:  python app.py      (server starts at http://localhost:5000)
"""
import csv
import io

from flask import Flask, Response, jsonify, request
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from mysql.connector import Error as MySQLError

from config import Config
from db import get_cursor, init_pool
from validators import calculate_grade, validate_student

app = Flask(__name__)
CORS(app, origins=[Config.FRONTEND_ORIGIN, "http://127.0.0.1:5173"])

SORTABLE = {"id", "name", "age", "marks", "course", "created_at"}


def serialize(row):
    """Convert a DB row into JSON-friendly dict and add the grade."""
    row["marks"] = float(row["marks"])
    row["grade"] = calculate_grade(row["marks"])
    for key in ("created_at", "updated_at"):
        if row.get(key):
            row[key] = row[key].isoformat()
    return row


def error(message, status, **extra):
    return jsonify({"error": message, **extra}), status


def find_student(cur, student_id):
    cur.execute("SELECT * FROM students WHERE id = %s", (student_id,))
    return cur.fetchone()


# ------------------------------------------------------------------ health
@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


# -------------------------------------------------------------------- READ
@app.get("/api/students")
def list_students():
    search = request.args.get("search", "").strip()
    course = request.args.get("course", "").strip()
    sort = request.args.get("sort", "id")
    order = "ASC" if request.args.get("order", "desc").lower() == "asc" else "DESC"
    page = max(int(request.args.get("page", 1) or 1), 1)
    limit = min(max(int(request.args.get("limit", 8) or 8), 1), 100)

    if sort not in SORTABLE:          # whitelist prevents SQL injection in ORDER BY
        sort = "id"

    where, params = [], []
    if search:
        where.append("(name LIKE %s OR email LIKE %s OR course LIKE %s)")
        params += [f"%{search}%"] * 3
    if course:
        where.append("course = %s")
        params.append(course)
    where_sql = "WHERE " + " AND ".join(where) if where else ""

    with get_cursor() as cur:
        cur.execute(f"SELECT COUNT(*) AS total FROM students {where_sql}", params)
        total = cur.fetchone()["total"]
        cur.execute(
            f"SELECT * FROM students {where_sql} ORDER BY {sort} {order} LIMIT %s OFFSET %s",
            params + [limit, (page - 1) * limit],
        )
        rows = [serialize(r) for r in cur.fetchall()]

    return jsonify({
        "data": rows, "total": total, "page": page, "limit": limit,
        "pages": max((total + limit - 1) // limit, 1),
    })


@app.get("/api/students/<int:student_id>")
def get_student(student_id):
    with get_cursor() as cur:
        row = find_student(cur, student_id)
    if not row:
        return error("Student not found", 404)
    return jsonify(serialize(row))


# ------------------------------------------------------------------ CREATE
@app.post("/api/students")
def create_student():
    clean, errors = validate_student(request.get_json(silent=True))
    if errors:
        return error("Validation failed", 400, details=errors)
    try:
        with get_cursor(commit=True) as cur:
            cur.execute(
                "INSERT INTO students (name, age, email, phone, course, marks) "
                "VALUES (%(name)s, %(age)s, %(email)s, %(phone)s, %(course)s, %(marks)s)",
                clean,
            )
            new_id = cur.lastrowid
            row = find_student(cur, new_id)
    except MySQLError as e:
        if e.errno == 1062:           # duplicate entry
            return error("Validation failed", 409, details={"email": "This email is already registered."})
        raise
    return jsonify(serialize(row)), 201


# ------------------------------------------------------------------ UPDATE
@app.put("/api/students/<int:student_id>")
def update_student(student_id):
    clean, errors = validate_student(request.get_json(silent=True))
    if errors:
        return error("Validation failed", 400, details=errors)
    try:
        with get_cursor(commit=True) as cur:
            if not find_student(cur, student_id):
                return error("Student not found", 404)
            clean["id"] = student_id
            cur.execute(
                "UPDATE students SET name=%(name)s, age=%(age)s, email=%(email)s, "
                "phone=%(phone)s, course=%(course)s, marks=%(marks)s WHERE id=%(id)s",
                clean,
            )
            row = find_student(cur, student_id)
    except MySQLError as e:
        if e.errno == 1062:
            return error("Validation failed", 409, details={"email": "This email is already registered."})
        raise
    return jsonify(serialize(row))


# ------------------------------------------------------------------ DELETE
@app.delete("/api/students/<int:student_id>")
def delete_student(student_id):
    with get_cursor(commit=True) as cur:
        if not find_student(cur, student_id):
            return error("Student not found", 404)
        cur.execute("DELETE FROM students WHERE id = %s", (student_id,))
    return jsonify({"message": "Student deleted"})


# ------------------------------------------------------------------- STATS
@app.get("/api/stats")
def stats():
    with get_cursor() as cur:
        cur.execute("SELECT COUNT(*) AS total, AVG(marks) AS average, "
                    "MAX(marks) AS highest, MIN(marks) AS lowest FROM students")
        summary = cur.fetchone()
        cur.execute("SELECT name, marks FROM students ORDER BY marks DESC LIMIT 1")
        topper = cur.fetchone()
        cur.execute(
            "SELECT CASE WHEN marks>=90 THEN 'A+' WHEN marks>=80 THEN 'A' WHEN marks>=70 THEN 'B' "
            "WHEN marks>=60 THEN 'C' WHEN marks>=50 THEN 'D' ELSE 'F' END AS grade, "
            "COUNT(*) AS count FROM students GROUP BY grade ORDER BY grade"
        )
        grades = cur.fetchall()
        cur.execute("SELECT course, COUNT(*) AS count FROM students GROUP BY course ORDER BY course")
        courses = cur.fetchall()

    return jsonify({
        "total": summary["total"],
        "average": round(float(summary["average"] or 0), 2),
        "highest": float(summary["highest"] or 0),
        "lowest": float(summary["lowest"] or 0),
        "topper": topper["name"] if topper else None,
        "grades": grades,
        "courses": courses,
    })


# ------------------------------------------------------------- CSV EXPORT
@app.get("/api/students/export")
def export_csv():
    with get_cursor() as cur:
        cur.execute("SELECT id, name, age, email, phone, course, marks FROM students ORDER BY id")
        rows = cur.fetchall()
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["ID", "Name", "Age", "Email", "Phone", "Course", "Marks", "Grade"])
    for r in rows:
        writer.writerow([r["id"], r["name"], r["age"], r["email"], r["phone"] or "",
                         r["course"], float(r["marks"]), calculate_grade(r["marks"])])
    return Response(buffer.getvalue(), mimetype="text/csv",
                    headers={"Content-Disposition": "attachment; filename=students.csv"})


# ---------------------------------------------------------- error handlers
@app.errorhandler(404)
def not_found(_):
    return error("Route not found", 404)


@app.errorhandler(Exception)
def server_error(e):
    if isinstance(e, HTTPException):
        return error(e.description, e.code)
    app.logger.exception(e)
    return error("Something went wrong on the server", 500)


if __name__ == "__main__":
    init_pool()
    app.run(host="0.0.0.0", port=Config.PORT, debug=Config.DEBUG)

# 🎓 Student Management System — Full Stack

A full-stack web application to register students, view details, update records and
remove students.

| Layer    | Technology                                   |
|----------|----------------------------------------------|
| Frontend | React.js (Vite), JavaScript, CSS             |
| Backend  | Python, Flask, REST APIs                     |
| Database | MySQL                                        |

## Features
- Add / view / edit / delete students (full CRUD)
- Live search (debounced), course filter, sorting, server-side pagination
- Dashboard cards: total students, average marks, topper, grade chart
- Form validation on **both** frontend and backend, with field-level error messages
- Duplicate-email protection (HTTP 409)
- Export all students to CSV
- Delete confirmation, toast notifications, loading and error states
- SQL-injection-safe (parameterised queries + sort whitelist), connection pooling

## Architecture
```
 React (port 5173)  ──fetch /api/...──►  Flask REST API (port 5000)  ──SQL──►  MySQL (3306)
     UI + validation                      validation + business logic         data storage
```
Vite proxies every `/api` request to Flask, so no CORS problems during development.

## Project Structure
```
student-management-fullstack/
├── database/schema.sql            # table + sample data
├── backend/
│   ├── app.py                     # all REST API routes
│   ├── config.py                  # reads .env
│   ├── db.py                      # MySQL connection pool
│   ├── validators.py              # input validation + grade logic
│   ├── init_db.py                 # one-command DB setup
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── index.html, vite.config.js, package.json
    └── src/
        ├── main.jsx, App.jsx, api.js, styles.css
        ├── hooks/useDebounce.js
        └── components/ (StatsCards, Toolbar, StudentTable, Pagination,
                         StudentModal, ConfirmDialog, Toast)
```

---

# STEP-BY-STEP SETUP

## STEP 1 — Install the required software
| Software | Version | Download |
|---|---|---|
| Python | 3.9+ | https://www.python.org/downloads (tick **"Add Python to PATH"**) |
| Node.js | 18+ (LTS) | https://nodejs.org |
| MySQL Server | 8.x | https://dev.mysql.com/downloads/installer (remember the **root password**) |
| VS Code | latest | https://code.visualstudio.com |

Check in a terminal:
```
python --version
node --version
npm --version
mysql --version
```
(On Mac/Linux use `python3`.)

## STEP 2 — Open the project in VS Code
`File → Open Folder → student-management-fullstack`.
Open a terminal with **Ctrl + `** . You will use **two terminals** (backend and frontend).

## STEP 3 — Create the database
**Option A (easiest, after Step 4 & 5 below):** run `python init_db.py` — it does everything.

**Option B (manual, in MySQL):**
```
mysql -u root -p < database/schema.sql
```
or open the file in MySQL Workbench and press the ⚡ Execute button.

## STEP 4 — Set up the backend (Terminal 1)
```
cd backend
python -m venv venv
```
Activate the virtual environment:
- Windows: `venv\Scripts\activate`
- Mac/Linux: `source venv/bin/activate`

Install packages:
```
pip install -r requirements.txt
```
Create your settings file:
- Windows: `copy .env.example .env`
- Mac/Linux: `cp .env.example .env`

Open `.env` and set your MySQL password:
```
DB_PASSWORD=your_mysql_password
```

## STEP 5 — Create the table and sample data
Still in `backend` with the venv active:
```
python init_db.py
```
You should see: `✓ Database 'student_db' is ready with sample data.`

## STEP 6 — Start the backend
```
python app.py
```
Test it in your browser: http://localhost:5000/api/students — you should see JSON data.
Keep this terminal running.

## STEP 7 — Start the frontend (Terminal 2)
Open a **new** terminal (click `+` in the VS Code terminal panel):
```
cd frontend
npm install
npm run dev
```
Open **http://localhost:5173** — the application is running. 🎉

## STEP 8 — Try every feature
1. Click **＋ Add Student**, fill the form, save.
2. Type in the search box — results filter as you type.
3. Use the course dropdown and sort dropdown.
4. Click **Edit**, change marks, watch the grade and dashboard update.
5. Click **Delete** and confirm.
6. Click **Export CSV**.
7. Try adding the same email twice → "already registered" error.

---

# REST API REFERENCE
Base URL: `http://localhost:5000/api`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/students?search=&course=&sort=&order=&page=&limit=` | List with search, filter, sort, pagination |
| GET | `/students/<id>` | Get one student |
| POST | `/students` | Create student |
| PUT | `/students/<id>` | Update student |
| DELETE | `/students/<id>` | Delete student |
| GET | `/stats` | Dashboard statistics |
| GET | `/students/export` | Download CSV |
| GET | `/health` | Server health check |

Example request body (POST / PUT):
```json
{ "name": "Arun Kumar", "age": 20, "email": "arun@mail.com",
  "phone": "9876543210", "course": "CSE", "marks": 92.5 }
```
Status codes: `200 OK`, `201 Created`, `400 Validation error`, `404 Not found`, `409 Duplicate email`.

---

# TROUBLESHOOTING
| Problem | Fix |
|---|---|
| `Access denied for user 'root'` | Wrong `DB_PASSWORD` in `backend/.env` |
| `Can't connect to MySQL server` | MySQL is not running — start the MySQL service |
| Frontend shows "Cannot reach the server" | Backend (Step 6) is not running |
| `'python' is not recognized` | Reinstall Python with "Add to PATH" ticked, or use `py` |
| `ModuleNotFoundError: flask` | Activate the venv, then `pip install -r requirements.txt` |
| Port 5000 busy (Mac AirPlay) | Set `PORT=5001` in `.env` and change the proxy in `frontend/vite.config.js` |
| PowerShell blocks venv activation | Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |

---

# INTERVIEW GUIDE

**30-second pitch:** "I built a full-stack Student Management System. The React frontend talks to a
Python Flask REST API, which stores data in MySQL. It supports full CRUD, search, sorting,
pagination, validation on both sides, and a statistics dashboard."

**Questions you should be ready for**
1. **What is a REST API?** An architectural style where resources (students) are accessed through URLs and
   standard HTTP methods: GET = read, POST = create, PUT = update, DELETE = remove.
2. **How do React and Flask communicate?** React calls `fetch('/api/students')`; Flask returns JSON; React
   stores it in state and re-renders. (See `api.js` and `App.jsx`.)
3. **How did you prevent SQL injection?** Parameterised queries (`%s` placeholders) and a whitelist for the
   sort column.
4. **Why validate on both frontend and backend?** Frontend gives instant feedback; backend is the real
   security layer because anyone can call the API directly.
5. **What React concepts did you use?** `useState`, `useEffect`, `useCallback`, a custom hook
   (`useDebounce`), props, controlled form inputs, conditional rendering, component composition.
6. **What is a connection pool?** Reusing a fixed set of open DB connections instead of opening a new one per
   request — faster and more scalable (`db.py`).
7. **Why pagination on the server?** Sending thousands of rows to the browser is slow; `LIMIT/OFFSET` returns
   only one page.
8. **What does HTTP 409 mean?** Conflict — used here when the email already exists (UNIQUE constraint).
9. **How would you improve it?** JWT login (admin/teacher roles), attendance & subjects, Docker, deployment
   (Render/Netlify), automated tests, SQLAlchemy ORM.

**Tip:** before the interview, add one tiny feature yourself (e.g. a "city" column) — changing
`schema.sql`, `validators.py`, `app.py`, and `StudentModal.jsx` proves you understand every layer.

## Production build (optional)
```
cd frontend
npm run build      # creates frontend/dist
```

# Interview Questions & Answers — Student Management System

Tip: answer in 2–4 sentences, then say where it is in your code. Interviewers love "see `app.py`, line..." answers.

## A. Project overview
**1. Explain your project.**
A full-stack Student Management System. React frontend, Python Flask REST API, MySQL database. Users can register, view, update and delete students, with search, sorting, pagination, validation and a statistics dashboard.

**2. Why did you choose this tech stack?**
React for a fast, component-based UI; Flask because it is lightweight and quick to build REST APIs in Python; MySQL because student data is structured and relational.

**3. Draw / explain the architecture.**
Browser (React, port 5173) → HTTP/JSON → Flask API (port 5000) → SQL → MySQL (3306). In development Vite proxies `/api` to Flask.

**4. What was your role / what did you build yourself?**
(Be honest.) Say which parts you wrote and understand end to end: the API routes, validation, SQL queries, React components, state handling.

**5. What challenges did you face?**
Examples: CORS errors (fixed with flask-cors / Vite proxy), MySQL access denied for root on Ubuntu (created a dedicated user), duplicate emails (UNIQUE constraint + 409 handling), too many API calls while typing (debounce).

**6. What would you improve?**
Login with JWT and roles, attendance and subjects tables, automated tests, Docker, ORM (SQLAlchemy), caching.

## B. Python / Flask backend
**7. What is Flask? Why not Django?**
A micro-framework: it gives routing and request handling and lets you pick the rest. Django is "batteries included" (ORM, admin, auth) — better for big apps, heavier for a small API.

**8. What is a route / decorator?**
`@app.get("/api/students")` maps a URL + HTTP method to a function. A decorator wraps a function to add behaviour.

**9. How do you read JSON from a request?**
`request.get_json(silent=True)`; query strings via `request.args.get(...)`.

**10. How do you return JSON and status codes?**
`return jsonify(data), 201`.

**11. What is `if __name__ == "__main__"`?**
Runs code only when the file is executed directly, not when imported (e.g. by gunicorn).

**12. Why gunicorn instead of `python app.py` in production?**
Flask's built-in server is for development only. Gunicorn is a production WSGI server that handles multiple workers and concurrent requests.

**13. What is a virtual environment?**
An isolated folder of Python packages per project, so versions do not clash (`python -m venv venv`).

**14. What are `.env` files and why use them?**
Store secrets and settings (DB password) outside the code. `.env` is in `.gitignore` so it never reaches GitHub.

**15. What is a context manager (`with`)? Where did you use it?**
Guarantees setup and cleanup. `get_cursor()` in `db.py` gets a connection, commits or rolls back, and always closes it.

**16. How do you handle errors globally?**
`@app.errorhandler` returns JSON for 404 and unexpected errors, so the frontend always gets a clean message.

## C. REST API and HTTP
**17. What is a REST API?**
Resources (students) are exposed as URLs and manipulated with HTTP methods: GET read, POST create, PUT update, DELETE remove.

**18. Difference between GET, POST, PUT, PATCH, DELETE?**
GET reads (no body). POST creates. PUT replaces the whole resource. PATCH changes part of it. DELETE removes.

**19. Which status codes did you use and why?**
200 OK, 201 Created, 400 validation error, 404 not found, 409 conflict (duplicate email), 500 server error.

**20. Is PUT idempotent? Is POST?**
PUT is (same request repeated = same result). POST is not (creates a new record each time).

**21. What is CORS?**
Browsers block a page from calling another origin unless the server allows it. `flask-cors` sets the allowed origin (`FRONTEND_ORIGIN`).

**22. What is JSON?**
A text format for exchanging data: objects, arrays, strings, numbers, booleans, null.

**23. How do you do pagination in an API?**
`page` and `limit` query params; the server runs `LIMIT x OFFSET y` and returns `total` and `pages`.

**24. How would you version the API?**
Prefix URLs: `/api/v1/students`.

## D. MySQL / SQL
**25. Why MySQL / difference between SQL and NoSQL?**
SQL: structured tables, relations, ACID transactions. NoSQL: flexible schemas, scales horizontally. Student records are structured, so SQL fits.

**26. Explain your table design.**
`students(id PK AUTO_INCREMENT, name, age, email UNIQUE, phone, course, marks DECIMAL(5,2), created_at, updated_at)`.

**27. Primary key vs unique key?**
Primary key: one per table, unique and not null, identifies the row. Unique key: prevents duplicates (email) and the table can have several.

**28. Why DECIMAL for marks, not FLOAT?**
DECIMAL is exact. FLOAT can give rounding errors.

**29. Why did you add indexes?**
`idx_course`, `idx_name` speed up filtering and searching on those columns. Trade-off: slightly slower writes, more storage.

**30. Why is grade not stored in the table?**
It is derived from marks. Storing it risks inconsistency when marks change. It is computed when reading.

**31. What is SQL injection and how did you prevent it?**
Attacker input becomes part of the SQL. I use parameterised queries (`%s` placeholders) and a whitelist for the `ORDER BY` column, which cannot be parameterised.

**32. Explain `LIKE '%text%'`. Any performance issue?**
Matches text anywhere. A leading `%` cannot use a normal index, so on millions of rows use FULLTEXT search or a search engine.

**33. What are `GROUP BY` and aggregate functions?**
Group rows and compute per group. I used `COUNT`, `AVG`, `MAX`, `MIN` and `GROUP BY` for the statistics.

**34. What is ACID / a transaction?**
Atomicity, Consistency, Isolation, Durability. A transaction either fully commits or fully rolls back. `get_cursor(commit=True)` commits, and rolls back on error.

**35. What is normalization? How would you normalise this DB?**
Removing redundancy. Move `course` into a `courses` table and keep `course_id` as a foreign key in `students`. Add `subjects` and `marks` tables for many-to-many.

**36. What is a JOIN? Types?**
Combines tables on a key: INNER, LEFT, RIGHT, FULL. After normalising, listing students with course names needs a JOIN.

**37. What is a connection pool?**
A set of reusable open connections (size 5 in `db.py`), faster than opening a connection per request.

**38. What is the problem with OFFSET pagination on huge tables?**
MySQL still scans the skipped rows. Use keyset pagination (`WHERE id < last_id LIMIT n`).

## E. React / JavaScript
**39. What is React? What is the virtual DOM?**
A UI library based on components. React keeps a virtual copy of the DOM, compares changes (diffing) and updates only what changed.

**40. What is JSX?**
HTML-like syntax inside JavaScript that compiles to `React.createElement` calls.

**41. State vs props?**
State is data owned and changed by a component (`useState`). Props are read-only data passed from parent to child.

**42. Explain `useState` and `useEffect`.**
`useState` stores data and re-renders on change. `useEffect` runs side effects (API calls) after render, based on its dependency array.

**43. What is `useCallback`? Why used?**
Memoises a function so its identity is stable. `loadStudents` is in the dependency array of `useEffect`, so it must not change on every render.

**44. What is a custom hook? Which did you write?**
A reusable function that uses hooks. `useDebounce` delays a value so the API is called only after the user stops typing (400 ms).

**45. Controlled components?**
Form inputs whose value is held in React state (`value={form.name}` + `onChange`). Used in `StudentModal`.

**46. Why do we need `key` in lists?**
Helps React identify items between renders. I used `key={s.id}`.

**47. How does React talk to the backend?**
`fetch()` in `api.js`, JSON in and out, errors turned into `Error` objects with `details` for field messages.

**48. What is "lifting state up"?**
`App.jsx` owns the data (students, query, modal); child components receive data and callbacks as props.

**49. Why Vite instead of Create React App?**
Faster dev server and builds; CRA is deprecated.

**50. fetch vs axios?**
fetch is built in. Axios adds auto JSON parsing, interceptors and simpler error handling. Fetch was enough here.

**51. What is `React.StrictMode`?**
Development-only checks; effects run twice to expose bugs. It does not affect production.

**52. How do you handle loading and error states?**
`loading` and `error` state in `App.jsx`: table fades while loading, an error box with a Retry button shows when the API fails.

**53. `var`, `let`, `const`? Arrow functions? Destructuring? Spread operator?**
Be ready with one-line examples; they are all used in the code (`const { course, sort } = query`, `{ ...q, ...changes }`).

**54. What is the Vite proxy?**
In development, requests to `/api` are forwarded to Flask, so the browser sees one origin and CORS is avoided.

## F. Security and validation
**55. Why validate on both frontend and backend?**
Frontend: instant feedback. Backend: real protection, because anyone can call the API directly.

**56. What security features does the project have?**
Parameterised SQL, sort whitelist, input validation, UNIQUE email, `.env` for secrets, CORS restriction.

**57. What is missing?**
Authentication/authorisation, rate limiting, HTTPS in local dev. Production gets HTTPS from the host.

**58. How would you add login?**
A `users` table with hashed passwords (bcrypt), `/login` returns a JWT, React stores it and sends `Authorization: Bearer <token>`, Flask checks it on protected routes.

## G. Deployment, tools, testing
**59. How did you deploy it?**
Frontend on Vercel, backend (gunicorn) on Render, MySQL-compatible database on TiDB Cloud. Environment variables hold the secrets and URLs.

**60. Why do free servers "sleep"?**
Free tiers stop idle services to save resources; the first request after idle wakes it and takes about a minute.

**61. What is Git? What did you push?**
Version control. I pushed the source code, not `node_modules`, `venv` or `.env` (they are in `.gitignore`).

**62. How would you test it?**
Backend: pytest or Postman/curl. Frontend: React Testing Library. Manual testing of every feature.

**63. What is CI/CD?**
Every push to GitHub automatically builds and redeploys the app (Vercel and Render do this).

**64. What does `npm run build` do?**
Bundles and minifies the React app into static files in `dist/`.

## H. Scenario questions
**65. 1 million students — what breaks first?**
`LIKE '%x%'` search and OFFSET pagination. Fix with FULLTEXT or Elasticsearch, keyset pagination, caching, read replicas.

**66. Two admins edit the same student at once?**
Last write wins now. Add a `version` column (optimistic locking) and reject stale updates.

**67. How would you add "attendance"?**
New `attendance(id, student_id FK, date, status)` table, endpoints `/students/<id>/attendance`, and a React page.

**68. Delete should not lose data — how?**
Soft delete: `is_deleted` flag or `deleted_at` column, and filter it in queries.

**69. How would you make the API faster?**
Indexes, pagination, connection pool (already), caching with Redis, gzip, selecting only needed columns.

**70. Walk me through what happens when I click "Add Student".**
Form validates → `createStudent()` → `fetch POST /api/students` → Flask validates → parameterised INSERT → commit → 201 JSON → React closes modal, shows toast, reloads list and stats.

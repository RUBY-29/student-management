"""Validation of incoming JSON. Returns (clean_data, errors_dict)."""
import re

EMAIL_RE = re.compile(r"^[\w.+-]+@[\w-]+\.[\w.-]+$")
PHONE_RE = re.compile(r"^[0-9]{10}$")


def calculate_grade(marks):
    marks = float(marks)
    if marks >= 90:
        return "A+"
    if marks >= 80:
        return "A"
    if marks >= 70:
        return "B"
    if marks >= 60:
        return "C"
    if marks >= 50:
        return "D"
    return "F"


def validate_student(data):
    errors, clean = {}, {}
    data = data or {}

    name = str(data.get("name", "")).strip()
    if len(name) < 2 or not all(c.isalpha() or c.isspace() for c in name):
        errors["name"] = "Name must be at least 2 letters (letters and spaces only)."
    else:
        clean["name"] = name.title()

    try:
        age = int(data.get("age"))
        if not 5 <= age <= 100:
            raise ValueError
        clean["age"] = age
    except (TypeError, ValueError):
        errors["age"] = "Age must be a number between 5 and 100."

    email = str(data.get("email", "")).strip().lower()
    if not EMAIL_RE.match(email):
        errors["email"] = "Enter a valid email address."
    else:
        clean["email"] = email

    phone = str(data.get("phone") or "").strip()
    if phone and not PHONE_RE.match(phone):
        errors["phone"] = "Phone must be exactly 10 digits."
    else:
        clean["phone"] = phone or None

    course = str(data.get("course", "")).strip()
    if len(course) < 2:
        errors["course"] = "Course is required."
    else:
        clean["course"] = course.upper()

    try:
        marks = float(data.get("marks"))
        if not 0 <= marks <= 100:
            raise ValueError
        clean["marks"] = round(marks, 2)
    except (TypeError, ValueError):
        errors["marks"] = "Marks must be a number between 0 and 100."

    return clean, errors

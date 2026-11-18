"""Creates the database, table and sample data from ../database/schema.sql
Run once:   python init_db.py
"""
import os

import mysql.connector

from config import mysql_connection_args

SCHEMA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "database", "schema.sql")


def main():
    conn = mysql.connector.connect(**mysql_connection_args(include_database=False))
    cursor = conn.cursor()
    with open(SCHEMA, "r", encoding="utf-8") as f:
        sql = "\n".join(line for line in f if not line.strip().startswith("--"))
    for statement in sql.split(";"):
        if statement.strip():
            cursor.execute(statement)
    conn.commit()
    cursor.close()
    conn.close()
    print("✓ Database 'student_db' is ready with sample data.")


if __name__ == "__main__":
    main()

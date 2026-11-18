"""MySQL connection pool + a helper that handles commit / rollback / close."""
from contextlib import contextmanager

from mysql.connector import pooling

from config import mysql_connection_args

_pool = None


def init_pool():
    """Create the pool once. Safe to call many times (needed for gunicorn)."""
    global _pool
    if _pool is None:
        _pool = pooling.MySQLConnectionPool(
            pool_name="sms_pool", pool_size=5, **mysql_connection_args()
        )


@contextmanager
def get_cursor(commit=False):
    """Usage:  with get_cursor(commit=True) as cur:  cur.execute(...)"""
    init_pool()
    conn = _pool.get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        yield cursor
        if commit:
            conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()

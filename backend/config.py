"""Reads settings from the .env file (or from environment variables on a hosting server)."""
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = int(os.getenv("DB_PORT", "3306"))
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "student_db")
    # Cloud databases (TiDB Cloud, etc.) require an encrypted TLS connection
    DB_SSL = os.getenv("DB_SSL", "false").lower() == "true"
    DB_SSL_CA = os.getenv("DB_SSL_CA", "/etc/ssl/certs/ca-certificates.crt")
    FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    PORT = int(os.getenv("PORT", "5000"))
    DEBUG = os.getenv("FLASK_DEBUG", "1") == "1"


def mysql_connection_args(include_database=True):
    """Connection settings shared by the app and init_db.py."""
    args = {
        "host": Config.DB_HOST,
        "port": Config.DB_PORT,
        "user": Config.DB_USER,
        "password": Config.DB_PASSWORD,
    }
    if include_database:
        args["database"] = Config.DB_NAME
    if Config.DB_SSL:
        args.update(ssl_ca=Config.DB_SSL_CA, ssl_verify_cert=True, ssl_verify_identity=True)
    return args

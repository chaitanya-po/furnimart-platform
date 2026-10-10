
import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine

# Locate the catalog-service directory reliably.
SERVICE_DIR = Path(__file__).resolve().parent.parent

# Load the local .env file when present.
load_dotenv(SERVICE_DIR / ".env")

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not configured. "
        "Set it in the environment or catalog-service/.env."
    )

engine = create_engine(DATABASE_URL)

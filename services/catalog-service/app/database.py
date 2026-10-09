import os

from dotenv import load_dotenv
from sqlalchemy import create_engine

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://furnimart:furnimart123@localhost:5432/furnimart",
)

engine = create_engine(DATABASE_URL)
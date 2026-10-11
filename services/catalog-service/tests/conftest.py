import os

TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+psycopg2://furnimart:furnimart123@localhost:5433/furnimart_test",
)

os.environ["DATABASE_URL"] = TEST_DATABASE_URL

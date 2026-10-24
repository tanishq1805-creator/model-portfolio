import os
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

connect_args = {}
if "sqlite" in db_url:
    connect_args = {"check_same_thread": False}

engine = create_engine(db_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def upgrade_schema():
    """Ensure any newly added columns exist in SQLite/Postgres tables without requiring external migration tooling."""
    inspector = inspect(engine)
    if "model_portfolio_items" in inspector.get_table_names():
        columns = [c["name"] for c in inspector.get_columns("model_portfolio_items")]
        with engine.begin() as conn:
            if "photographer_credit" not in columns:
                conn.execute(text("ALTER TABLE model_portfolio_items ADD COLUMN photographer_credit VARCHAR(150)"))
            if "stylist_credit" not in columns:
                conn.execute(text("ALTER TABLE model_portfolio_items ADD COLUMN stylist_credit VARCHAR(150)"))
            if "brand_credit" not in columns:
                conn.execute(text("ALTER TABLE model_portfolio_items ADD COLUMN brand_credit VARCHAR(150)"))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

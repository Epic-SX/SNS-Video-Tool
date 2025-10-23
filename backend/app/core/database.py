"""
Database configuration and session management
"""

from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from contextlib import asynccontextmanager
import asyncio

from app.core.config import get_settings

settings = get_settings()

# SQLAlchemy setup
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

# Detect if using SQLite
is_sqlite = "sqlite" in SQLALCHEMY_DATABASE_URL

# Async engine for main operations
if is_sqlite:
    async_engine = create_async_engine(
        SQLALCHEMY_DATABASE_URL,
        echo=settings.ENVIRONMENT == "development",
        future=True,
        connect_args={"check_same_thread": False}
    )
else:
    async_engine = create_async_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_size=settings.DATABASE_POOL_SIZE,
        max_overflow=settings.DATABASE_MAX_OVERFLOW,
        echo=settings.ENVIRONMENT == "development",
        future=True
    )

# Sync engine for migrations
if is_sqlite:
    sync_engine = create_engine(
        SQLALCHEMY_DATABASE_URL.replace("+aiosqlite", ""),
        echo=settings.ENVIRONMENT == "development",
        connect_args={"check_same_thread": False}
    )
else:
    sync_engine = create_engine(
        SQLALCHEMY_DATABASE_URL.replace("+asyncpg", "+psycopg2"),
        pool_size=settings.DATABASE_POOL_SIZE,
        max_overflow=settings.DATABASE_MAX_OVERFLOW,
        echo=settings.ENVIRONMENT == "development"
    )

# Session makers
AsyncSessionLocal = async_sessionmaker(
    async_engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

SessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=sync_engine
)

# Base class for models
Base = declarative_base()

# Metadata
metadata = MetaData()

async def init_db():
    """Initialize database"""
    async with async_engine.begin() as conn:
        # Import all models here to ensure they are created
        from app.models import user, creative, account, metric, label  # noqa
        await conn.run_sync(Base.metadata.create_all)

async def get_db() -> AsyncSession:
    """Dependency to get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

def get_sync_db() -> Session:
    """Get synchronous database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@asynccontextmanager
async def get_db_context():
    """Context manager for database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close() 
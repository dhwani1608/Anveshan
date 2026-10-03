import os
from typing import List, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ANVESHAN - Organizational Knowledge & Decision Intelligence Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DEFAULT_ORG_ID: str = "PDEU"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "anveshan-secret-key-pdeu-academic-intelligence-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database (Defaults to SQLite for seamless portability; PostgreSQL ready)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./anveshan.db")
    
    # LLM & Embedding Settings
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "auto")  # "gemini", "openai", "auto", "mock"
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", None)
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY", None)
    
    # Neo4j Settings (Optional in MVP - runs built-in Graph Engine if not supplied)
    NEO4J_URI: Optional[str] = os.getenv("NEO4J_URI", None)
    NEO4J_USER: Optional[str] = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD: Optional[str] = os.getenv("NEO4J_PASSWORD", "anveshan2026")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

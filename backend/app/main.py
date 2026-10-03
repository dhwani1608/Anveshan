import sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, AsyncSessionLocal
from app.data.pdeu_seed import seed_pdeu_data
from app.api.auth import router as auth_router
from app.api.chat import router as chat_router
from app.api.documents import router as documents_router
from app.api.knowledge import router as knowledge_router
from app.api.admin import router as admin_router
from app.api.pdeu_public import router as public_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"[Anveshan Backend] Initializing SQLite / DB tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Run seed
    async with AsyncSessionLocal() as session:
        await seed_pdeu_data(session)

    print(f"[Anveshan Backend] Startup completed. System ready on {settings.API_V1_STR}")
    yield
    print(f"[Anveshan Backend] Shutting down...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Personalized Organizational Knowledge & Decision Intelligence Platform",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development & testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(public_router, prefix=settings.API_V1_STR)
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(chat_router, prefix=settings.API_V1_STR)
app.include_router(documents_router, prefix=settings.API_V1_STR)
app.include_router(knowledge_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "platform": "ANVESHAN",
        "tagline": "Turn organizational knowledge into intelligence.",
        "tenant": settings.DEFAULT_ORG_ID,
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR,
        "status": "operational"
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "anveshan-backend"}

"""
NextTwin FastAPI Application Entry Point.

Run with:
    uvicorn backend.main:app --reload --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import create_tables
from .routes import auth_routes, profile_routes, predict_routes, whatif_routes, career_routes, recommendation_routes

app = FastAPI(
    title="NextTwin API",
    description="AI-Powered Student Digital Twin Backend",
    version="1.0.0",
)

# Allow React frontend (localhost:5173) to access this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(auth_routes.router)
app.include_router(profile_routes.router)
app.include_router(predict_routes.router)
app.include_router(whatif_routes.router)
app.include_router(career_routes.router)
app.include_router(recommendation_routes.router)


@app.on_event("startup")
def on_startup():
    """Create database tables on first run."""
    create_tables()
    print("✅ NextTwin API started — DB tables ready")


@app.get("/")
def root():
    return {"message": "NextTwin API is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}

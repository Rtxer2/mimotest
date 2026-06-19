import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.api.v1 import api_router

app = FastAPI(
    title="ERP System",
    description="Enterprise production tracking and customer management system",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

uploads_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "frontend", "dist")


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/{full_path:path}")
async def serve_frontend(request: Request, full_path: str):
    file_path = os.path.join(frontend_dist, full_path)
    if full_path and os.path.isfile(file_path):
        return FileResponse(file_path)
    index_path = os.path.join(frontend_dist, "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path)
    return {"message": "ERP System API"}

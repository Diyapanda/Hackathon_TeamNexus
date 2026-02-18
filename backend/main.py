from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import os

from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import settings
from backend.api.v1.router import api_router

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi import Request

app = FastAPI(title=settings.PROJECT_NAME)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"Validation Error: {exc.errors()}")
    print(f"Body: {await request.body()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": str(exc)},
    )

# Ensure static directory exists
os.makedirs("backend/static", exist_ok=True)
app.mount("/static", StaticFiles(directory="backend/static"), name="static")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for debugging
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to MediGuard API"}

app.include_router(api_router, prefix=settings.API_V1_STR)

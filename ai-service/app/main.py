import os
import logging
from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import router
from services.scam_detection import initialize_models, get_model_status
from app.llm.telemetry.recorder import (
    start_telemetry_worker,
    stop_telemetry_worker,
    shutdown_telemetry_worker
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="JobShield AI Service",
    description="Multi-model scam detection, RAG embeddings, and LLM telemetry service.",
    version="0.2.0"
)

# CORS configuration
BACKEND_ORIGIN = os.environ.get("BACKEND_ORIGIN", "http://localhost:5000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        BACKEND_ORIGIN,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:4000",
        "http://127.0.0.1:4000",
        "http://localhost:5000",
        "http://127.0.0.1:5000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.on_event("startup")
async def startup_event():
    """Initialize lightweight resources and non-blocking background workers."""
    logger.info("Starting JobShield AI Service...")
    start_telemetry_worker()
    try:
        model_status = initialize_models()
        logger.info(f"Model initialization status: {model_status}")
    except Exception as e:
        logger.error(f"Failed to initialize models during startup: {e}")
        logger.warning("System will continue with rule-based and LLM gateway detection")


@app.on_event("shutdown")
async def shutdown_event():
    """Clean shutdown of background workers and network sessions."""
    logger.info("Shutting down JobShield AI Service...")
    await shutdown_telemetry_worker()


@app.get("/")
async def root():
    return {
        "status": "running",
        "service": "JobShield AI Service",
        "version": "0.2.0"
    }


@app.get("/health/live")
async def liveness_probe():
    """Fast liveness probe for orchestrators (e.g. Kubernetes, Render)."""
    return {
        "status": "alive",
        "service": "JobShield AI Service"
    }


@app.get("/health/ready")
async def readiness_probe():
    """Readiness probe that checks dependency and model status."""
    model_status = get_model_status()
    use_real_ai = os.getenv("USE_REAL_AI", "false").lower() == "true"
    
    return {
        "status": "ready",
        "service": "JobShield AI Service",
        "mode": "real_ai" if use_real_ai else "heuristic_gateway",
        "models": model_status
    }


@app.get("/health")
async def health_check():
    """Backwards-compatible health check endpoint."""
    model_status = get_model_status()
    return {
        "status": "ok",
        "models": model_status,
        "service": "JobShield AI Service"
    }


@app.get("/models")
async def model_status():
    """Detailed model status endpoint."""
    return get_model_status()


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("AI_SERVICE_PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)

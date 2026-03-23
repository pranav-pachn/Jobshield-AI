#!/usr/bin/env python3
"""
JobShield AI Service Startup Script
Handles imports and starts the FastAPI service
"""

import sys
import os
import socket
from pathlib import Path
from contextlib import asynccontextmanager

# Add current directory to Python path
current_dir = Path(__file__).parent
sys.path.insert(0, str(current_dir))

# Now import the modules
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Import with correct paths
from app.api.routes import router
from services.scam_detection import initialize_models, get_model_status

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _is_port_available(host: str, port: int) -> bool:
    """Return True when a TCP port can be bound on the current machine."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            sock.bind((host, port))
            return True
        except OSError:
            return False


def _select_available_port(preferred_port: int, host: str = "0.0.0.0", max_tries: int = 20) -> int:
    """Pick preferred port or the next available one within max_tries."""
    for offset in range(max_tries):
        candidate = preferred_port + offset
        if _is_port_available(host, candidate):
            if offset > 0:
                logger.warning("Port %s is in use, using fallback port %s", preferred_port, candidate)
            return candidate
    raise RuntimeError(f"No available port found in range {preferred_port}-{preferred_port + max_tries - 1}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize and tear down resources for the service lifecycle."""
    logger.info("Starting JobShield AI Service...")
    try:
        model_status = initialize_models()
        logger.info(f"Model initialization status: {model_status}")

        # Check if critical models loaded successfully
        if model_status["zero_shot"] != "loaded" and model_status["semantic"] != "loaded":
            logger.warning("Both models failed to load - system will use rule-based detection only")
        elif model_status["zero_shot"] != "loaded":
            logger.warning("Zero-shot classifier failed to load - semantic similarity still available")
        elif model_status["semantic"] != "loaded":
            logger.warning("Semantic model failed to load - zero-shot classification still available")
        else:
            logger.info("All models loaded successfully - full AI detection capabilities available")

    except Exception as e:
        logger.error(f"Failed to initialize models during startup: {e}")
        logger.warning("System will continue with rule-based detection only")

    yield
    logger.info("Shutting down JobShield AI Service...")


app = FastAPI(title="JobShield AI Service", version="0.1.0", lifespan=lifespan)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/")
async def root_health():
    return {"status": "running"}

@app.get("/health")
async def health_check():
    """Health check endpoint with model status."""
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
    # Read port from environment variable, default to 8001.
    requested_port = int(os.getenv("AI_SERVICE_PORT", "8001"))
    port = _select_available_port(requested_port)
    uvicorn.run(app, host="0.0.0.0", port=port)

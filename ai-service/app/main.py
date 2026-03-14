from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.api.routes import router
from services.scam_detection import initialize_models, get_model_status

app = FastAPI(title="JobShield AI Service", version="0.1.0")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    """Initialize models on application startup for optimal performance."""
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

@app.on_event("shutdown")
async def shutdown_event():
    """Clean shutdown of model resources."""
    logger.info("Shutting down JobShield AI Service...")
    # Models will be cleaned up automatically when the process ends


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

    uvicorn.run(app, host="0.0.0.0", port=8000)

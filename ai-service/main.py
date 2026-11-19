"""Root shim so external runners can import `main:app`.

Deployment platforms (such as Render or Docker) run `uvicorn main:app` from the service root.
This file attempts to import the real FastAPI `app` from `app.main`.
In production, if that import fails, the process immediately raises the exception so
the deployment fails fast and visibly rather than silently masking failure.
In local development, it can fall back to a 503 Service Unavailable diagnostic app
to assist local debugging without exposing unauthenticated tracebacks in production.
"""
import importlib
import traceback
import os
import sys
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

IS_PRODUCTION = (
    os.getenv("NODE_ENV", "").lower() == "production"
    or os.getenv("ENVIRONMENT", "").lower() in ("production", "prod")
    or os.getenv("RENDER", "").lower() == "true"
    or os.getenv("DEPLOYMENT_ENV", "").lower() == "production"
)

ENABLE_DEBUG_DIAGNOSTICS = os.getenv("ENABLE_DEBUG_DIAGNOSTICS", "false").lower() == "true"


def _make_diagnostic_app(exc: Exception, tb: str, enable_debug: bool = False) -> FastAPI:
    """Create a diagnostic app returning HTTP 503 Service Unavailable."""
    a = FastAPI(title="JobShield AI Service (Diagnostic Fallback)")

    @a.get("/")
    @a.get("/health")
    @a.get("/health/ready")
    async def degraded_status():
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "service": "JobShield AI Service",
                "error": "AI service failed to import application modules. Check startup logs."
            }
        )

    @a.get("/health/live")
    async def liveness_probe():
        # Liveness indicates process is running, but readiness will fail
        return {"status": "alive", "mode": "diagnostic_fallback"}

    # Only expose stack traces if explicitly opted in during local development
    if enable_debug and not IS_PRODUCTION:
        @a.get("/__import_error")
        async def import_error():
            return {"error": str(exc), "traceback": tb}

    return a


try:
    module = importlib.import_module("app.main")
    app = getattr(module, "app")
except Exception as exc:  # pragma: no cover - environment dependent
    tb = traceback.format_exc()
    print("FATAL: Failed to import app.main in ai-service:\n" + tb, file=sys.stderr)

    if IS_PRODUCTION:
        # In production, do not mask failures with a degraded app. Fail fast.
        raise exc

    # In local development, provide a 503 diagnostic app
    app = _make_diagnostic_app(exc, tb, enable_debug=ENABLE_DEBUG_DIAGNOSTICS)


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("AI_SERVICE_PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)

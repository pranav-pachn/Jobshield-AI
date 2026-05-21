"""Root shim so external runners can import `main:app`.

Render and some deployment platforms run `uvicorn main:app` from the service root.
This file attempts to import the real FastAPI `app` from `app.main` but
falls back to a lightweight diagnostic application if that import fails.
This ensures the process starts and exposes logs / a diagnostics endpoint
so deployment logs can surface the underlying import error.
"""
import importlib
import traceback
import os
from fastapi import FastAPI


def _make_diagnostic_app(exc: Exception, tb: str) -> FastAPI:
    a = FastAPI(title="JobShield AI Service (diagnostic)")

    @a.get("/")
    async def root():
        return {"status": "degraded", "message": "AI service failed to import dependencies"}

    @a.get("/__import_error")
    async def import_error():
        # Expose limited diagnostic info to logs/ops (do not enable in production without access control)
        return {"error": str(exc), "traceback": tb}

    return a


try:
    module = importlib.import_module("app.main")
    app = getattr(module, "app")
except Exception as exc:  # pragma: no cover - environment dependent
    tb = traceback.format_exc()
    # Print to stderr so Render logs capture the full traceback
    print("Failed to import app.main:\n", tb)
    app = _make_diagnostic_app(exc, tb)


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("AI_SERVICE_PORT", "8001"))
    uvicorn.run(app, host="0.0.0.0", port=port)

# AI Service for JobShield

Python-based FastAPI service for scam detection and analysis.

## Setup

Install dependencies:
```bash
pip install -r requirements.txt
```

Run the service:
```bash
python app/main.py
```

The service will be available at `http://localhost:8000`.

## API Endpoints

- `POST /api/analyze` - Analyze job posting or recruiter message for scam indicators
- `GET /health` - Health check

## Training

Train the scam classifier:
```bash
python training/train_model.py
```

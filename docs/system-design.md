# JobShield AI - System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐  │
│  │   Dashboard  │   Analyzer   │ Recruiter    │  Reports     │  │
│  │              │              │ Verification │              │  │
│  └──────────────┴──────────────┴──────────────┴──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway (Node.js/Express)                │
│  ┌──────────────┬──────────────┬──────────────┐                │
│  │ Job Routes   │ Recruiter    │ Report Routes│                │
│  │              │ Routes       │              │                │
│  └──────────────┴──────────────┴──────────────┘                │
└─────────────────────────────────────────────────────────────────┘
         │                          │                    │
         ▼                          ▼                    ▼
    ┌────────────┐           ┌──────────────┐       ┌─────────┐
    │  AI Service│           │   MongoDB    │       │  External│
    │ (FastAPI)  │           │   Atlas      │       │ Security │
    │            │           │              │       │   APIs   │
    └────────────┘           └──────────────┘       └─────────┘
```

## Component Breakdown

### Frontend (Next.js + React)
- **Purpose:** User interface for job offer analysis
- **Features:**
  - Job analyzer (textarea input)
  - Recruiter verification form
  - Scam network visualization
  - Threat dashboard
  - Community reporting

### Backend API (Node.js/Express)
- **Purpose:** Request handling and business logic orchestration
- **Routes:**
  - `/api/jobs/analyze` - Analyze job postings
  - `/api/recruiters/check` - Verify recruiter details
  - `/api/reports/submit` - Submit scam reports

### AI Service (Python/FastAPI)
- **Purpose:** Machine learning inference and text analysis
- **Endpoints:**
  - `/api/analyze` - Scam detection scoring
  - `/health` - Service health check

### Database (MongoDB)
- **Collections:**
  - `job_reports` - User-submitted job postings with risk scores
  - `recruiters` - Recruiter profiles and trust scores
  - `scam_domains` - Known scam domains

### External APIs
- **Google Safe Browsing** - URL/domain safety checks
- **VirusTotal** - Domain reputation scanning
- **Whois API** - Domain registration age and ownership verification

## Data Flow

1. User submits job posting text
2. Frontend sends request to backend
3. Backend forwards to AI service for analysis
4. AI service performs NLP-based scam detection
5. Backend combines results with domain checks
6. Results returned to frontend with visualizations
7. User can report findings to crowdsourced database

## Deployment Architecture

```
┌──────────────────────────────────────────────────────┐
│             Vercel (Frontend Hosting)                │
│  - Next.js deployment with serverless functions      │
│  - CDN for static assets                             │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│      Render/Railway (Backend API Hosting)            │
│  - Node.js Express server in containerized env       │
│  - Environment variables management                  │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│      Render/Railway (AI Service Hosting)             │
│  - Python FastAPI service in Docker container        │
│  - Model artifact storage                            │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│      MongoDB Atlas (Database Hosting)                │
│  - Cloud MongoDB cluster                             │
│  - Automated backups                                 │
│  - Network IP whitelist security                     │
└──────────────────────────────────────────────────────┘
```

## Technology Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| AI/ML | Python 3.11, FastAPI, PyTorch, Transformers |
| Database | MongoDB Atlas |
| Visualization | D3.js, Recharts |
| Deployment | Vercel, Render/Railway |

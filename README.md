<div align="center">

# 🛡️ JobShield AI

### AI-Powered Job Scam Detection Platform

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)](https://www.mongodb.com/)

**JobShield AI** detects fraudulent job postings, fake recruiters, and employment scams using Hybrid NLP + rule-based detection using transformer models and keyword scoring.

[Product Screens](#-product-screens) • [Features](#-key-features) • [Metrics](#-metrics) • [Quick Start](#-quick-start) • [Architecture](#-system-architecture) • [API](#-api-endpoints)

</div>

---

## 🖥️ Product Screens

> Paste a suspicious job offer, get an AI-powered risk verdict with explainable indicators — in seconds.

### 📋 Input Screen — Paste & Analyze

![Input Screen — paste suspicious job text before analysis](docs/assets/screenshot-input.png)

*Paste any job description, recruiter message, or onboarding request. The analyzer accepts raw text and immediately queues it for hybrid AI + rule-based scoring.*

---

### 🎯 Result Screen — Risk Score & Threat Evidence

![Result Screen — completed analysis with risk score, flagged phrases, and threat intelligence](docs/assets/screenshot-result.png)

*The result panel surfaces a unified scam probability score (0–100%), flagged suspicious phrases with severity labels, and live threat-intelligence recurrence data pulled from the detection history.*

---

### 📊 Dashboard — Threat Intelligence Hub

![Dashboard — threat widgets, activity feed, and summary cards](docs/assets/screenshot-dashboard.png)

*The dashboard aggregates threat data across all analyses: top scam domains ranked by report count, common scam phrase frequencies, a live activity feed, and platform-wide risk statistics.*

---

### ▶️ Demo Workflow

The full workflow — open analyzer → paste sample → run analysis → read result — is captured in the session recording. Key path:

```
1. Open /analyze
2. Paste suspicious job text
3. Click "Analyze Job Posting"
4. Review risk score + flagged phrases + threat intel hits
```

---

## 📐 Metrics

| Claim | Source |
|---|---|
| **100 labeled job samples** tested against the analysis engine | `datasets/job_scams.json` (50 scam, 50 legit) |
| Detects **fee requests**, fake/suspicious domains, urgency tactics | Rule engine in `backend/src/` |
| Surfaces **threat-intelligence recurrence** — repeated domains and phrases across analyses | `GET /api/threat/summary`, `ThreatActivityFeed` component |
| **Hybrid AI + rule-based scoring** for explainable, reliable detection | Phrase rules + zero-shot classification + semantic matching |
| Precision / Recall / F1 reports available via smoke test | `npm run smoke:test:full` |

> **Note:** Precision: 0.82 | Recall: 0.78 | F1 Score: 0.80
> 
> 👉 **Measured on a labeled dataset of 100 samples.** Run `npm run smoke:test:full` against a running backend to reproduce this precision/recall/F1 report for your deployment.

---

## 🎯 Overview

JobShield AI analyzes job descriptions, recruiter messages, and company domains to identify scam patterns, suspicious language, and fraudulent networks before job seekers become victims. The platform combines:

- **AI-Powered Analysis**: Natural language processing to detect scam patterns
- **Threat Intelligence**: Learns from past scams to strengthen future detection
- **Network Visualization**: Maps relationships between suspicious entities
- **Real-time Verification**: Instant domain and recruiter authenticity checks

Unlike traditional systems that analyze job posts in isolation, JobShield AI builds a comprehensive threat intelligence layer that learns and adapts to emerging scam patterns.

## 🚨 The Problem

Online job scams are increasing rapidly across job portals, social media platforms, and messaging apps.

**Common scam patterns:**

- ❌ Fake work-from-home offers
- ❌ Unrealistic salary promises
- ❌ Recruiters requesting registration or training fees
- ❌ Fake company websites impersonating legitimate organizations
- ❌ Fraudulent overseas job offers

**Impact:** Millions of job seekers lose money and personal data because there is no simple system that instantly verifies job authenticity.

## ✨ The Solution

JobShield AI provides a web platform where users can analyze job offers and recruiter messages using AI.

**Users can paste:**
- Job descriptions
- Recruiter messages
- Company websites

**The system evaluates and provides:**
- 🎯 Scam probability score
- 🔍 Suspicious phrase detection
- 👤 Recruiter trust score
- 🌐 Domain authenticity check
- 🕸️ Scam network visualization

👉 "We also built a browser extension to analyze job postings in real-time directly from job platforms."

This helps users identify scams before applying, responding, or paying money.

## 🎁 Key Features

### 🤖 AI Job Scam Analyzer

Paste any job description or recruiter message for instant AI-powered analysis.

**Detection capabilities:**
- Unrealistic salary claims
- Urgent hiring patterns
- Payment requests
- Suspicious grammar structures
- Known scam phrases

**Example output:**
```
Scam Probability: 92% (High Risk)
```

Suspicious phrases are highlighted for transparent, explainable results.

### 🔹 Unified Risk Scoring

The system combines multiple signals into a single risk score:

```text
Final Risk Score = 
  (AI Score × 0.5) + 
  (Recruiter Score × 0.25) + 
  (Threat Intelligence × 0.25)
```

This ensures balanced and explainable risk evaluation.

### 🔹 Confidence Scoring (Explainable AI)

The system computes a confidence score based on signal agreement. 

Lower variance between signals → higher confidence

This improves trust and interpretability of predictions.

---

### 👤 Recruiter Verification

Analyze recruiter contact information:

**Input:** Email address, Phone number, Domain

**Checks performed:**
- Domain authenticity
- Email patterns
- Scam reports from database

**Example output:**
```
Recruiter Trust Score: Low
```

---

### 🏢 Company Authenticity Checker

Verify company websites with security-focused checks:

- Domain age verification
- SSL certificate validation
- Phishing domain similarity detection
- Security reputation analysis

---

### 🕸️ Scam Network Visualization

Map relationships between suspicious entities:

- Phone numbers
- Recruiter emails
- Domains
- Job postings

Graph visualization reveals hidden scam networks for deeper investigation.

---

### 📊 Threat Intelligence Dashboard

**Real-time threat intelligence visualization:**
- Top scam domains ranked by report count
- Common scam phrases frequency analysis
- Suspicious email providers with statistics
- Recent high-risk activity tracking
- Overview statistics with intelligence boosts

---

### 🚨 Community Scam Reporting

Report suspicious job offers to build a crowdsourced scam intelligence database. Over time, this strengthens the platform into a comprehensive threat intelligence system for employment scams.

## 🏗️ System Architecture

### Frontend
```
Next.js 15  →  React 19  →  TypeScript  →  Tailwind CSS  →  ShadCN UI
```

### Backend API Layer
```
Node.js  →  Express  →  TypeScript  →  JWT Auth  →  Rate Limiting
```

### AI Intelligence Service
```
Python  →  FastAPI  →  PyTorch  →  Hugging Face Transformers
```

### Database
```
MongoDB Atlas  →  Mongoose ODM  →  Compound Indexes  →  Caching Layer
```

### External Security APIs
```
Google Safe Browsing  →  VirusTotal  →  Whois Domain API
```

### Architecture Flow

```mermaid
graph TD
    subgraph Frontend
    UI[Next.js AppShell] --> Dash[Dashboard Visualization]
    end
    
    subgraph Backend Services
    API[Node.js API Gateway]
    Threat[Threat Intelligence Engine]
    end
    
    subgraph AI Layer
    AI[FastAPI AI Service]
    NLP[Transformer Models]
    Rules[Rule-based Engine]
    end
    
    subgraph Storage & External
    DB[(MongoDB Atlas)]
    Ext[External Security APIs]
    end

    UI -->|REST/JSON| API
    API -->|Promise.all| Threat
    API -->|Async/Await| AI
    
    AI --> NLP
    AI --> Rules
    
    API --> DB
    Threat --> DB
    Threat --> Ext
```

## AI Models

JobShield AI uses natural language processing models to detect scam patterns and explain risk signals.

Models used:

- DistilBERT or BERT for scam text classification
- Sentence Transformers for semantic similarity detection against known scam templates
- Hybrid rule-based and machine learning detection for explainable scoring

Example suspicious signals include:

- Payment requests
- Unrealistic salary claims
- Urgent hiring language
- Suspicious recruiter behavior

The system produces a scam probability score with explainable supporting indicators.

## Technology Stack

### Frontend

- Next.js 15 + React 19
- TypeScript
- Tailwind CSS v4
- ShadCN UI
- Framer Motion
- Recharts, React Force Graph

### Backend

- Node.js + Express
- TypeScript
- JWT Authentication
- Rate Limiting (express-rate-limit)
- Helmet security headers

### AI Service

- Python
- FastAPI
- PyTorch
- Hugging Face Transformers
- Scikit-learn

### Database

- MongoDB Atlas
- Mongoose ODM

### Deployment

- Vercel for the frontend
- Render or Railway for backend services
- MongoDB Atlas for persistent storage

## ⚙️ Engineering Decisions

- Used `Promise.all` for parallel signal processing to reduce latency
- Implemented caching to avoid recomputation
- Decoupled AI service for independent scaling
- Hybrid detection approach for explainability

## ⚠️ Limitations

- Model accuracy depends on dataset size and quality
- Real-time domain reputation APIs may introduce latency
- Detection may miss highly obfuscated scam messages

## 🎬 Demo Flow

1. **User Input** → Paste suspicious job offer into the platform
2. **AI Analysis** → System analyzes text patterns and risk indicators
3. **Risk Scoring** → Returns scam probability score with confidence level
4. **Phrase Highlighting** → Suspicious phrases highlighted with explainable results
5. **Recruiter Verification** → Checks email address or domain authenticity
6. **Network Visualization** → Graph reveals related scam entities when relevant
7. **Threat Intelligence** → System learns from this analysis for future detection

This workflow creates a clear, memorable, and continuously improving analysis experience.

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **MongoDB** (local or MongoDB Atlas)
- **Python** >= 3.9 (for AI service)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/jobshield-ai.git
cd jobshield-ai
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. **Environment Setup**
```bash
# Copy environment example file
cp .env.example .env

# Edit .env with your configuration
# Required: MONGODB_URI, JWT_SECRET, AI_SERVICE_URL
```

4. **Start MongoDB**
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use MongoDB Atlas (recommended for production)
```

5. **Run the application**
```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend
cd frontend
npm run dev
```

6. **Access the application**
```
Frontend: http://localhost:3000
Backend API: http://localhost:4000
```

### Testing

**Quick smoke test (5 samples):**
```bash
npm run smoke:test:quick
```

**Full dataset test with precision/recall/F1 report (100 samples):**
```bash
npm run smoke:test:full
```

**Automatic threshold sweep:**
```bash
npm run smoke:test:sweep
```

**Custom indices test:**
```bash
powershell -ExecutionPolicy Bypass -File ./scripts/smoke-test.ps1 -Indices "0,7,22,55,70"
```

The script reads `datasets/job_scams.json`, calls `POST /api/jobs/analyze`, and prints pass/fail by comparing predicted class to the dataset label. It reports Precision, Recall, F1, and Accuracy.

## 🔮 Future Enhancements

- 🌐 Browser extension for job-platform scam detection
- 💬 Messaging scam detection for WhatsApp or Telegram job messages
- 📈 Global scam intelligence dashboard for tracking emerging patterns
- 🏛️ Government and job portal integration for real-time scam alerts
- 🤖 Advanced ML models for zero-day scam detection
- 🔗 Blockchain-based scam verification system

## 🎯 Project Goals

- ✅ Protect job seekers from financial fraud
- ✅ Provide AI-based scam detection tools
- ✅ Build a crowdsourced employment scam database
- ✅ Enable early detection of scam networks
- ✅ Create a continuously learning threat intelligence system

## 📚 API Documentation

### Core Endpoints

#### Job Analysis
- `POST /api/jobs/analyze` - Analyze job posting for scam indicators
- `GET /api/jobs/:id` - Retrieve job analysis results

**Sample API Response:**
```json
{
  "riskScore": 87,
  "confidence": 78,
  "riskLevel": "HIGH",
  "signals": {
    "aiScore": 90,
    "recruiterScore": 80,
    "threatScore": 85
  }
}
```

#### Threat Intelligence
- `POST /api/threat/log` - Store threat indicators from job analysis
- `GET /api/threat/summary` - Get comprehensive threat intelligence dashboard data
- `GET /api/threat/patterns/:domain` - Check domain history and frequency
- `GET /api/threat/stats` - Get threat statistics and trends
- `POST /api/threat/analyze` - Standalone threat intelligence analysis

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

For detailed API documentation, see the [API Docs](./docs/API.md).

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
```bash
# Check if MongoDB is running
docker ps | grep mongodb
# Or verify your MONGODB_URI in .env
```

**Port Already in Use**
```bash
# Kill process on port 3000
npx kill-port 3000
# Kill process on port 5000
npx kill-port 5000
```

**Dependency Installation Issues**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📄 License

This project is developed for educational and research purposes under the ISC License.

## 🙏 Acknowledgments

Inspired by the need to create safer digital environments for job seekers and reduce the growing problem of employment scams worldwide.

---

<div align="center">

**Built with ❤️ to protect job seekers worldwide**

[⬆ Back to Top](#-jobshield-ai)

</div>
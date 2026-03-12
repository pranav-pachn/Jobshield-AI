# JobShield AI

## AI-Powered Job Scam Detection Platform

JobShield AI is an intelligent cybersecurity platform built to detect fraudulent job postings, fake recruiters, and employment scams using artificial intelligence.

The platform analyzes job descriptions, recruiter messages, and company domains to identify scam patterns, suspicious language, and fraudulent networks before job seekers become victims.

It combines AI, cybersecurity intelligence, and modern web technologies into a unified system that helps users verify the authenticity of job opportunities.

## Problem

Online job scams are increasing rapidly across job portals, social media platforms, and messaging apps.

Common scam patterns include:

- Fake work-from-home offers
- Unrealistic salary promises
- Recruiters requesting registration or training fees
- Fake company websites impersonating legitimate organizations
- Fraudulent overseas job offers

Millions of job seekers lose money and personal data because there is no simple system that instantly verifies job authenticity.

## Solution

JobShield AI provides a web platform where users can analyze job offers and recruiter messages using AI.

Users can paste job descriptions, recruiter messages, or company websites into the platform. The system evaluates the content and provides:

- Scam probability score
- Suspicious phrase detection
- Recruiter trust score
- Domain authenticity check
- Scam network visualization

This helps users identify scams before applying, responding, or paying money.

## Key Features

### AI Job Scam Analyzer

Users can paste a job description or recruiter message for analysis.

The AI model detects:

- Unrealistic salary claims
- Urgent hiring patterns
- Payment requests
- Suspicious grammar structures
- Known scam phrases

Example output:

```text
Scam Probability: 92% (High Risk)
```

Suspicious phrases are highlighted to provide transparent and explainable results.

### Recruiter Verification

Users can analyze recruiter contact information such as:

- Email address
- Phone number
- Domain

The system checks:

- Domain authenticity
- Email patterns
- Scam reports from the database

Example output:

```text
Recruiter Trust Score: Low
```

### Company Authenticity Checker

Users can verify company websites with security-focused checks including:

- Domain age
- SSL certificate validation
- Phishing domain similarity
- Security reputation

This helps identify fake company websites before users submit personal data.

### Scam Network Visualization

The platform maps relationships between suspicious entities such as:

- Phone numbers
- Recruiter emails
- Domains
- Job postings

A graph visualization reveals hidden scam networks and supports deeper investigation.

### Community Scam Reporting

Users can report suspicious job offers to build a crowdsourced scam intelligence database. Over time, this strengthens the platform into a broader threat intelligence system for employment scams.

## System Architecture

### Frontend

- Next.js
- React
- Tailwind CSS

### Backend API Layer

- Node.js
- NestJS or Express

### AI Intelligence Service

- Python
- FastAPI

### Database

- MongoDB Atlas

### Optional Graph Intelligence

- Neo4j

### External Security APIs

- Google Safe Browsing
- VirusTotal
- Whois Domain API

### Architecture Flow

```text
User Interface
    |
    v
Node.js API Gateway
    |
    v
Python AI Analysis Service
    |
    v
Fraud Intelligence Database
    |
    v
Security Intelligence APIs
```

## AI Models

JobShield AI uses natural language processing models to detect scam patterns and explain risk signals.

Potential models include:

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

- Next.js
- React
- TypeScript
- Tailwind CSS
- ShadCN UI
- Framer Motion

### Visualization

- D3.js
- Recharts
- Three.js (optional)

### Backend

- Node.js
- NestJS or Express

### AI Service

- Python
- FastAPI
- PyTorch
- Hugging Face Transformers
- Scikit-learn

### Database

- MongoDB Atlas
- Neo4j (optional)

### Deployment

- Vercel for the frontend
- Render or Railway for backend services
- MongoDB Atlas for persistent storage

## Example Demo Flow

1. A user pastes a suspicious job offer into the platform.
2. The AI analyzes text patterns and risk indicators.
3. The system returns a scam probability score.
4. Suspicious phrases are highlighted with explainable results.
5. Recruiter verification checks the email address or domain.
6. A network graph reveals related scam entities when relevant.

This workflow creates a clear and memorable analysis experience.

## Future Enhancements

- Browser extension for job-platform scam detection
- Messaging scam detection for WhatsApp or Telegram job messages
- Global scam intelligence dashboard for tracking emerging patterns
- Government and job portal integration for real-time scam alerts

## Project Goals

- Protect job seekers from financial fraud
- Provide AI-based scam detection tools
- Build a crowdsourced employment scam database
- Enable early detection of scam networks

## Contributors

Hackathon Project Team

## License

This project is developed for educational and research purposes.

## Acknowledgment

Inspired by the need to create safer digital environments for job seekers and reduce the growing problem of employment scams worldwide.
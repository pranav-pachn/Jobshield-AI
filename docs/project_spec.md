# project_spec.md

# JobShield AI — System Architecture Specification

## Overview

JobShield AI is an AI-powered cybersecurity platform designed to detect fraudulent job postings, recruiter scams, and suspicious employment offers. The system allows users to analyze job descriptions, recruiter messages, and company domains to determine the likelihood that the opportunity is a scam.

The platform combines **machine learning, cybersecurity intelligence, and data visualization** to identify scam patterns and reveal hidden networks of fraudulent actors.

The system is built using a **hybrid architecture** consisting of:

* A modern web frontend
* A Node.js API gateway
* A Python AI inference microservice
* A fraud intelligence database
* External threat intelligence integrations

This document describes the complete architecture and system behavior so that development tools and AI coding assistants can generate consistent code across the entire project.

---

# System Goals

The primary goals of JobShield AI are:

1. Detect fraudulent job postings using AI.
2. Identify suspicious recruiter behavior.
3. Reveal scam networks through data relationships.
4. Provide explainable results to users.
5. Build a crowdsourced intelligence database of job scams.

The platform must be modular, scalable, and easy to extend with new detection models.

---

# High-Level Architecture

The system follows a **layered microservice architecture** with clear separation between the application layer and the AI intelligence layer.

Main system layers:

1. User Interface Layer
2. API Gateway Layer
3. AI Intelligence Layer
4. Data & Intelligence Layer
5. External Security Services

Data flows sequentially through these layers during job scam analysis.

---

# User Interface Layer (Frontend)

The frontend is a modern web application built with **Next.js and React**.

Responsibilities of the frontend:

* Provide user interfaces for job analysis
* Display AI detection results
* Show risk indicators and explanations
* Render scam network graphs
* Display cybersecurity intelligence dashboards

Main user interfaces include:

### Job Scam Analyzer

Allows users to paste a job description or recruiter message. The system analyzes the content and returns a scam probability score.

### Recruiter Verification

Users can enter recruiter emails, phone numbers, or domains to check their authenticity.

### Scam Intelligence Dashboard

Displays aggregated analytics such as:

* scam trends
* most reported recruiters
* suspicious domains
* scam network relationships

### Network Visualization

Visualizes relationships between job scams, recruiters, and domains using graph visualization.

---

# API Gateway Layer (Node.js Backend)

The API layer is implemented using **Node.js with Express or NestJS**.

This service acts as the central gateway between the frontend and the AI services.

Responsibilities include:

* receiving requests from the frontend
* validating input
* forwarding analysis requests to the AI service
* storing analysis results
* interacting with the database
* integrating with external security APIs

The API gateway ensures that the frontend never communicates directly with the AI microservice.

Example API endpoints:

POST /api/analyze-job
POST /api/check-recruiter
POST /api/report-scam
GET /api/dashboard-stats

---

# AI Intelligence Layer (Python Microservice)

The AI detection engine runs as a separate microservice built using **Python and FastAPI**.

Separating the AI system allows machine learning models to be updated independently from the main application.

Responsibilities of the AI service:

* text preprocessing
* NLP-based scam detection
* similarity detection with known scam templates
* suspicious phrase extraction
* risk score generation

Example AI pipeline:

1. Receive job description text
2. Clean and preprocess text
3. Generate embeddings using a transformer model
4. Run scam classification model
5. Detect suspicious phrases
6. Compute scam probability
7. Return explainable result

Example response:

```json
{
  "scam_probability": 0.89,
  "risk_level": "High",
  "suspicious_phrases": [
    "registration fee required",
    "earn $3000 weekly"
  ]
}
```

---

# AI Models

The platform uses natural language processing models to detect scam patterns.

Potential models include:

DistilBERT or BERT
Used for scam classification of job text.

Sentence Transformers
Used for semantic similarity detection between job posts and known scam templates.

Hybrid Rule Engine
Detects suspicious phrases and patterns such as:

* payment requests
* unrealistic salary claims
* urgent hiring language

This hybrid approach improves detection reliability.

---

# Data & Intelligence Layer

The platform stores data in **MongoDB**.

Primary collections include:

### Job Analysis Records

Stores job texts submitted by users along with AI results.

### Scam Reports

User-submitted reports of suspicious job offers.

### Recruiter Profiles

Stores recruiter contact information and associated risk scores.

### Domain Intelligence

Stores domain reputation data and security analysis results.

Optional extension:

A graph database such as **Neo4j** can be used to represent relationships between entities such as recruiters, domains, and job posts.

---

# External Security Intelligence

To strengthen scam detection, the platform integrates with third-party threat intelligence APIs.

Possible integrations include:

Google Safe Browsing API
Detects malicious or phishing domains.

VirusTotal API
Provides domain reputation and malware detection.

WHOIS Domain Lookup
Checks domain age and ownership.

These sources help detect fake company websites and suspicious domains.

---

# Scam Network Detection

One unique feature of the system is the ability to detect scam networks.

Scam networks are detected by identifying shared attributes such as:

* phone numbers
* email addresses
* domains
* repeated job descriptions

Relationships between entities are visualized using graph visualization libraries in the frontend.

Example network structure:

Job Post
→ Recruiter Email
→ Domain
→ Related Scam Reports

---

# Data Flow Example

A typical job analysis request follows this sequence:

1. User pastes job description into the analyzer interface.
2. Frontend sends request to the Node.js API gateway.
3. API gateway validates input.
4. API forwards the job text to the Python AI service.
5. AI service analyzes the text and computes risk score.
6. API gateway optionally queries domain intelligence APIs.
7. Results are stored in the database.
8. Final results are returned to the frontend.
9. Frontend displays risk score and suspicious indicators.

---

# Explainable AI

The platform provides transparent results to users by highlighting suspicious phrases and patterns that influenced the model's decision.

This improves user trust and helps explain why a job opportunity may be dangerous.

---

# Scalability Considerations

The architecture supports scalability through service separation.

The Node.js API can scale horizontally to handle many user requests.

The AI microservice can run on dedicated compute resources or GPU infrastructure if needed.

Future improvements could include:

* asynchronous message queues
* distributed AI inference
* real-time scam intelligence feeds

---

# Security Considerations

Since the system handles user input and external data sources, several security measures are required.

Key protections include:

* input validation
* API rate limiting
* HTTPS encryption
* secure API key management
* request authentication

These protections help prevent abuse and ensure system reliability.

---

# Future Extensions

Potential future capabilities include:

Browser extension for detecting scams on job portals.

Integration with messaging platforms to detect job scams in chat messages.

Global scam intelligence dashboard for tracking emerging fraud patterns.

Integration with employment platforms to flag suspicious listings automatically.

---

# Summary

JobShield AI is designed as a scalable AI-powered cybersecurity platform that detects employment scams using natural language processing, fraud intelligence, and network analysis.

The architecture separates the system into modular layers that allow the frontend, backend, AI services, and intelligence data sources to evolve independently.

This specification serves as the foundation for implementing the system across all services.
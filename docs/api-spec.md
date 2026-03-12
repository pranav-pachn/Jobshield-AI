# JobShield AI - API Specification

## Base URLs

- **Development:** `http://localhost:4000/api`
- **Production:** `https://api.jobshield-ai.com/api`

## Authentication

Currently no authentication. Future versions will use JWT bearer tokens.

```
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### Job Analysis

#### POST `/jobs/analyze`

Analyze a job posting or recruiter message for scam indicators.

**Request:**
```json
{
  "text": "Work from home! Earn $5000/week. No experience needed. Send $99 registration fee."
}
```

**Response (200 OK):**
```json
{
  "riskScore": 92,
  "riskLevel": "high",
  "suspiciousPhrases": [
    "unrealistic salary",
    "registration fee",
    "work from home guarantee"
  ],
  "flaggedKeywords": [
    "payment request",
    "urgent hiring"
  ]
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "Text cannot be empty"
}
```

---

### Recruiter Verification

#### POST `/recruiters/check`

Verify recruiter contact information and domain.

**Request:**
```json
{
  "email": "recruiter@company.com",
  "domain": "company.com",
  "phone": "+1234567890"
}
```

**Response (200 OK):**
```json
{
  "trustScore": 78,
  "trustLevel": "high",
  "flagged": false,
  "domainAge": 2500,
  "sslValid": true,
  "phishingSimilarity": 0.05,
  "previousReports": 0,
  "verdict": "Appears legitimate"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "At least one contact field required (email, domain, or phone)"
}
```

---

### Scam Reporting

#### POST `/reports/submit`

Submit a scam report to the crowdsourced database.

**Request:**
```json
{
  "jobText": "Suspicious job posting...",
  "recruiterEmail": "recruiter@suspicious-domain.com",
  "domain": "suspicious-domain.com",
  "userEmail": "reporter@example.com",
  "description": "Asked for upfront payment"
}
```

**Response (201 Created):**
```json
{
  "reportId": "507f1f77bcf86cd799439011",
  "message": "Report submitted successfully",
  "timestamp": "2026-03-12T12:00:00Z"
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "jobText is required"
}
```

---

### Health Check

#### GET `/health`

Check if the backend API is running.

**Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-03-12T12:00:00Z",
  "version": "0.1.0"
}
```

---

## Scam Risk Score Interpretation

| Score Range | Level | Color | Action |
|----------|-------|-------|--------|
| 0-30 | Low | Green | Safe to proceed |
| 31-70 | Medium | Yellow | Verify carefully |
| 71-100 | High | Red | Do not engage |

## Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Auth required |
| 500 | Internal Server Error |

## Rate Limiting

- Current: No rate limiting (to be implemented)
- Planned: 100 requests per minute per IP
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Error Handling

All errors follow this format:

```json
{
  "error": "Error message here",
  "code": "ERROR_CODE",
  "timestamp": "2026-03-12T12:00:00Z"
}
```

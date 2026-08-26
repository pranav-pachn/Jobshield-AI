# Role-Based Access Control (RBAC) Matrix

This document outlines the authorization policies for the JobShield AI backend routes.

## Roles Defined

- **PUBLIC**: Accessible without authentication (no JWT required).
- **AUTHENTICATED USER**: Standard user (JWT valid). Most read/write operations for personal data.
- **ANALYST**: Elevated role for threat intelligence moderation, feedback review, and advanced analytics.
- **ADMIN**: Super-user access (everything ANALYST has + admin management).
- **OWNER**: A resource-level check confirming that the authenticated user owns the specific document (e.g. `user_id` matches `req.user.id`).

---

## Route Classification

### Authentication (`/api/auth`)
| Method | Endpoint | Authorization | Notes |
| :--- | :--- | :--- | :--- |
| POST | `/register` | PUBLIC | |
| POST | `/login` | PUBLIC | |
| GET | `/google` | PUBLIC | OAuth Initiation |
| GET | `/google/callback`| PUBLIC | OAuth Callback |
| POST | `/set-password` | AUTHENTICATED USER | |
| GET | `/me` | AUTHENTICATED USER | |

### Account Management (`/api/account`)
| Method | Endpoint | Authorization | Notes |
| :--- | :--- | :--- | :--- |
| GET | `/` | AUTHENTICATED USER | |
| PUT | `/password` | AUTHENTICATED USER | |
| DELETE| `/google` | AUTHENTICATED USER | |

### Reports (`/api/reports`)
| Method | Endpoint | Authorization | Notes |
| :--- | :--- | :--- | :--- |
| GET | `/investigation/:id`| AUTHENTICATED USER | |
| POST | `/submit` | AUTHENTICATED USER | |
| GET | `/user/all` | AUTHENTICATED USER | Lists personal reports |
| GET | `/:report_id` | OWNER | Must own the specific report |
| DELETE| `/:report_id` | OWNER | Must own the specific report |
| GET | `/share/:token` | PUBLIC | Shared link access |

### Investigations (`/api/investigate`)
| Method | Endpoint | Authorization | Notes |
| :--- | :--- | :--- | :--- |
| POST | `/` | AUTHENTICATED USER | |
| POST | `/stream` | AUTHENTICATED USER | (Consider securing this explicitly if not already) |
| GET | `/:id` | AUTHENTICATED USER | |
| GET | `/:id/timeline` | AUTHENTICATED USER | |
| GET | `/:id/explanation`| AUTHENTICATED USER | |

### Learning & Feedback (`/api/learning`)
| Method | Endpoint | Authorization | Notes |
| :--- | :--- | :--- | :--- |
| POST | `/feedback` | AUTHENTICATED USER | Anyone can submit feedback |
| GET | `/feedback/pending` | ANALYST | Requires ANALYST/ADMIN |
| POST | `/feedback/:id/approve`| ANALYST | Requires ANALYST/ADMIN |
| POST | `/feedback/:id/reject`| ANALYST | Requires ANALYST/ADMIN |

### Threat Intelligence (`/api/threat`)
| Method | Endpoint | Authorization | Notes |
| :--- | :--- | :--- | :--- |
| POST | `/log` | AUTHENTICATED USER | |
| GET | `/summary` | AUTHENTICATED USER | |
| GET | `/stats` | AUTHENTICATED USER | |
| GET | `/patterns/:domain`| AUTHENTICATED USER | |
| POST | `/analyze` | AUTHENTICATED USER | |
| GET | `/indicators/*` | AUTHENTICATED USER | |
| POST | `/indicators` | ANALYST | Should ideally be ANALYST/ADMIN only |

### AI Service / Internal
| Method | Endpoint | Authorization | Notes |
| :--- | :--- | :--- | :--- |
| POST | `/api/telemetry/llm-invocation` | INTERNAL | Expected from internal AI service |

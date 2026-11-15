# QueueSense
AI-Assisted Dynamic Patient Urgency Monitoring and Re-Triage System

Academic decision-support prototype for OPD waiting areas. It records initial assessments, accepts periodic patient-reported updates, and can flag a change for human reassessment.

**Safety:** This is not a diagnostic or treatment system and does not replace clinical staff. Use synthetic/demo data only unless appropriate ethics approval, privacy safeguards, and clinical supervision are in place.

## Structure
- `frontend/` React + Vite dashboard
- `backend/` Express REST API
- `ai-service/` FastAPI rule-based demo service
- `docs/` scope and API notes

## Requirements
Node.js LTS, npm, Python 3.10+, Git. PostgreSQL will be added in a later milestone.

## Run locally

### Backend
```bash
cd backend
copy .env.example .env
npm install
npm run dev
```
Runs at `http://localhost:5000`; health check `/api/health`.

### AI service
```bash
cd ai-service
python -m venv .venv
.venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
On macOS/Linux activate with `source .venv/bin/activate`. API docs: `http://localhost:8000/docs`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL, normally `http://localhost:5173`.

## Current starter functionality
- QueueSense dashboard layout
- Express health and synthetic queue endpoints
- FastAPI health and transparent rule-based demo endpoint
- Synthetic sample records

## Not yet implemented
Production authentication, PostgreSQL persistence, real-time notifications, trained ML, clinical protocols, audit-grade security, and deployment. This ZIP is a starter scaffold, not a finished hospital-ready system.

Never commit `.env`, passwords, database URLs, API keys, or real patient information.

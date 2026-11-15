# Initial API Notes

## Express backend — http://localhost:5000
- `GET /api/health` — service status
- `GET /api/queue` — synthetic demonstration queue

## FastAPI AI service — http://localhost:8000
- `GET /health` — service status
- `POST /analyze-checkin` — transparent demo rule-based signal

Example request:
```json
{
  "initial_condition": "same",
  "current_condition": "worse",
  "initial_pain": 2,
  "current_pain": 6,
  "new_symptoms": ["dizziness"],
  "waiting_minutes": 40
}
```
This is a software demonstration only, not a medically validated risk model.

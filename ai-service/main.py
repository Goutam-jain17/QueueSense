from typing import List, Literal
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(
    title="QueueSense AI Service",
    description="Academic demo service. Not a clinical decision or diagnostic tool.",
    version="0.1.0",
)

class CheckIn(BaseModel):
    initial_condition: Literal["better", "same", "worse"]
    current_condition: Literal["better", "same", "worse"]
    initial_pain: int = Field(ge=0, le=10)
    current_pain: int = Field(ge=0, le=10)
    new_symptoms: List[str] = []
    waiting_minutes: int = Field(ge=0)

@app.get("/health")
def health():
    return {"status": "ok", "service": "QueueSense AI", "mode": "rule-based-demo"}

@app.post("/analyze-checkin")
def analyze_checkin(data: CheckIn):
    # Illustrative rule only; not a medical risk model.
    reasons = []
    if data.current_condition == "worse":
        reasons.append("Patient reported feeling worse than at initial check-in.")
    if data.current_pain - data.initial_pain >= 2:
        reasons.append("Reported pain score increased by at least 2 points.")
    if data.new_symptoms:
        reasons.append("New patient-reported symptom(s): " + ", ".join(data.new_symptoms))
    return {
        "signal": "REASSESSMENT_RECOMMENDED" if reasons else "NO_DEMO_CHANGE_SIGNAL",
        "reasons": reasons,
        "waiting_minutes": data.waiting_minutes,
        "requires_human_review": True,
        "disclaimer": "Demonstration rule only; not clinically validated. A qualified healthcare professional must assess the patient."
    }

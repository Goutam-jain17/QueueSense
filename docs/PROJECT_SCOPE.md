# QueueSense Project Scope

## Goal
Explore whether periodic patient-reported updates during OPD waiting can help staff identify possible changes that warrant reassessment.

## Prototype workflow
1. Patient receives a visit/token identifier.
2. Qualified staff records the initial assessment.
3. Patient provides an update: Better, Same, or Worse.
4. System compares the update with the baseline.
5. A transparent signal may be raised for staff review.
6. A nurse/doctor reassesses and decides what happens next.

## Safety and limitations
- No diagnosis, prescription, or autonomous clinical priority changes.
- A generated signal is not a clinical triage decision.
- Patients with severe or rapidly worsening symptoms must contact onsite staff or follow local emergency procedures; do not rely on an app alert.
- Use synthetic data for development.
- Any real-world pilot requires institutional approval, privacy/security controls, and qualified clinical oversight.

## Evaluation ideas
With synthetic ground-truth events, measure precision, recall, false-alert rate, detection delay, and queue impact. Label all results as simulated.

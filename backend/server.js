
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

import connectDB from "./config/db.js";
import Patient from "./models/Patient.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173"
}));

app.use(express.json());

// Format MongoDB patient for frontend
const formatPatient = (patient) => ({
  id: patient.patientCode,
  token: patient.token,
  department: patient.department,
  initialUrgency: patient.initialUrgency,
  condition: patient.condition,
  waitingMinutes: patient.waitingMinutes,
  alert: patient.alert
});

// Insert synthetic demo patients if database is empty
const seedDemoPatients = async () => {
  const count = await Patient.countDocuments();

  if (count === 0) {
    await Patient.insertMany([
      {
        patientCode: "QS-001",
        token: "A001",
        department: "General OPD",
        initialUrgency: "LOW",
        condition: "same",
        waitingMinutes: 18,
        alert: false
      },
      {
        patientCode: "QS-002",
        token: "A002",
        department: "General OPD",
        initialUrgency: "MEDIUM",
        condition: "worse",
        waitingMinutes: 34,
        alert: true
      },
      {
        patientCode: "QS-003",
        token: "A003",
        department: "General OPD",
        initialUrgency: "LOW",
        condition: "same",
        waitingMinutes: 12,
        alert: false
      }
    ]);

    console.log("Synthetic demo patients inserted.");
  }
};

// Health API
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "QueueSense backend",
    database: "MongoDB connected",
    aiService: "http://127.0.0.1:8000"
  });
});

// Get all patients
app.get("/api/queue", async (_req, res, next) => {
  try {
    const patients = await Patient.find().sort({ createdAt: 1 });

    res.json({
      disclaimer: "Synthetic demonstration records only.",
      patients: patients.map(formatPatient)
    });
  } catch (error) {
    next(error);
  }
});

// Add a new patient
app.post("/api/patients", async (req, res, next) => {
  try {
    const {
      token,
      department,
      initialUrgency,
      waitingMinutes
    } = req.body;

    const validUrgencies = ["LOW", "MEDIUM", "HIGH"];

    if (!validUrgencies.includes(initialUrgency)) {
      return res.status(400).json({
        error: "Urgency must be LOW, MEDIUM, or HIGH."
      });
    }

    const count = await Patient.countDocuments();

    const patient = await Patient.create({
      patientCode: `QS-${Date.now()}`,
      token: token || `A${String(count + 1).padStart(3, "0")}`,
      department: department || "General OPD",
      initialUrgency,
      condition: "same",
      waitingMinutes: Number(waitingMinutes) || 0,
      alert: false
    });

    res.status(201).json({
      message: "Patient added successfully.",
      patient: formatPatient(patient)
    });
  } catch (error) {
    next(error);
  }
});

// Patient condition check-in with AI analysis
app.post("/api/patients/:id/checkin", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { condition } = req.body;

    const validConditions = ["better", "same", "worse"];

    if (!validConditions.includes(condition)) {
      return res.status(400).json({
        error: "Condition must be better, same, or worse."
      });
    }

    const patient = await Patient.findOne({
      patientCode: id
    });

    if (!patient) {
      return res.status(404).json({
        error: "Patient not found."
      });
    }

    // AI service analysis
    const aiResponse = await axios.post(
      "http://127.0.0.1:8000/analyze-checkin",
      {
        initial_condition: "same",
        current_condition: condition,
        initial_pain: 0,
        current_pain: 0,
        new_symptoms: [],
        waiting_minutes: patient.waitingMinutes
      },
      {
        timeout: 10000
      }
    );

    const aiResult = aiResponse.data;

    // Update patient condition
    patient.condition = condition;

    // Clear alert when condition is better or same.
    // For worsening condition, use the AI review signal.
    patient.alert =
      condition === "worse" &&
      Boolean(aiResult.requires_human_review);

    await patient.save();

    res.json({
      message: "Patient check-in recorded successfully.",
      patient: formatPatient(patient),
      aiAnalysis: aiResult,
      reassessmentSignal: patient.alert
        ? "Human reassessment recommended."
        : "No new demo signal."
    });

  } catch (error) {
    console.error("Check-in error:", error.message);

    if (error.response) {
      return res.status(502).json({
        error: "AI service returned an error."
      });
    }

    if (
      error.code === "ECONNREFUSED" ||
      error.code === "ECONNABORTED"
    ) {
      return res.status(503).json({
        error: "AI service is unavailable. Please check whether it is running."
      });
    }

    next(error);
  }
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error("Backend error:", err);

  res.status(500).json({
    error: "Internal server error"
  });
});

// Start backend after MongoDB connection
const startServer = async () => {
  try {
    await connectDB();
    await seedDemoPatients();

    app.listen(port, () => {
      console.log(
        `QueueSense API listening on http://localhost:${port}`
      );
    });

  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();

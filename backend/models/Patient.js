
import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    patientCode: {
      type: String,
      required: true,
      unique: true
    },

    token: {
      type: String,
      required: true
    },

    department: {
      type: String,
      required: true,
      default: "General OPD"
    },

    initialUrgency: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      required: true
    },

    condition: {
      type: String,
      enum: ["better", "same", "worse"],
      default: "same"
    },

    waitingMinutes: {
      type: Number,
      default: 0
    },

    alert: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;

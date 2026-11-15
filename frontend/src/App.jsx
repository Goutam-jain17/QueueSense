
import { useEffect, useState } from "react";
import {
  Activity,
  Bell,
  Clock3,
  HeartPulse,
  LayoutDashboard,
  Users
} from "lucide-react";

const API =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function Stat({ icon: Icon, label, value, note }) {
  return (
    <div className="stat">
      <div className="stat-top">
        <span>{label}</span>
        <Icon size={19} />
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

export default function App() {
  const [patients, setPatients] = useState([]);
  const [apiStatus, setApiStatus] = useState("Connecting...");
  const [selectedPatient, setSelectedPatient] = useState("");
  const [checkinMessage, setCheckinMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch patients from MongoDB through backend
  const loadPatients = async () => {
    try {
      setApiStatus("Connecting to backend...");

      const response = await fetch(`${API}/api/queue`);

      if (!response.ok) {
        throw new Error("Unable to fetch patients");
      }

      const data = await response.json();
      const patientList = data.patients || [];

      setPatients(patientList);
      setSelectedPatient((current) => {
        if (patientList.some((p) => p.id === current)) {
          return current;
        }
        return patientList[0]?.id || "";
      });

      setApiStatus("Backend connected · MongoDB active");
    } catch (error) {
      console.error("Queue loading error:", error);
      setApiStatus("Backend not connected");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  // Submit patient check-in
  const submitCheckin = async (condition) => {
    if (!selectedPatient) {
      setCheckinMessage("Please select a patient.");
      return;
    }

    try {
      setSubmitting(true);
      setCheckinMessage("Saving check-in...");

      const response = await fetch(
        `${API}/api/patients/${selectedPatient}/checkin`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ condition })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Check-in failed");
      }

      // Update the patient in the dashboard
      setPatients((current) =>
        current.map((patient) =>
          patient.id === selectedPatient
            ? data.patient
            : patient
        )
      );

      setCheckinMessage(data.reassessmentSignal);

    } catch (error) {
      console.error("Check-in error:", error);
      setCheckinMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const alerts = patients.filter(
    (patient) => patient.alert
  ).length;

  return (
    <div className="app-shell">

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="brand">
          <div className="brand-mark">
            <HeartPulse />
          </div>

          <div>
            <b>QueueSense</b>
            <small>OPD MONITORING</small>
          </div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <div className="nav-item active">
          <LayoutDashboard size={18} />
          Overview
        </div>

        <div className="nav-item">
          <Users size={18} />
          Waiting patients
        </div>

        <div className="nav-item">
          <Bell size={18} />
          Reassessment alerts
        </div>

        <div className="sidebar-note">
          <b>Prototype mode</b>
          <p>
            Use synthetic data only. This interface
            is not for clinical use.
          </p>
        </div>

      </aside>

      {/* Main Dashboard */}
      <main className="main">

        {/* Header */}
        <header className="topbar">

          <div>
            <span className="eyebrow">
              MEDICAPS UNIVERSITY · PROJECT
            </span>

            <h1>OPD Overview</h1>
          </div>

          <div className="user-chip">
            <span className="avatar">NS</span>

            <span>
              <b>Nurse Staff</b>
              <small>Demo workspace</small>
            </span>
          </div>

        </header>

        {/* Welcome Banner */}
        <div className="welcome">

          <div>
            <span className="eyebrow light">
              QUEUE MONITORING
            </span>

            <h2>Patient waiting overview</h2>

            <p>
              Monitor patient-reported changes and review
              possible reassessment signals.
            </p>
          </div>

          <div className="pulse">
            <Activity size={28} />
          </div>

        </div>

        {/* API Status */}
        <div className="status-line">
          <span className="dot"></span>
          {apiStatus}
        </div>

        {/* Dashboard Statistics */}
        <section className="stats">

          <Stat
            icon={Users}
            label="Waiting patients"
            value={loading ? "..." : patients.length}
            note="Synthetic demo queue"
          />

          <Stat
            icon={Bell}
            label="Reassessment signals"
            value={alerts}
            note="Requires staff review"
          />

          <Stat
            icon={Clock3}
            label="Monitoring"
            value="Periodic"
            note="Demo workflow"
          />

          <Stat
            icon={HeartPulse}
            label="Clinical decisions"
            value="Human"
            note="Always staff-controlled"
          />

        </section>

        {/* Waiting Queue */}
        <section className="panel">

          <div className="panel-heading">

            <div>
              <span className="eyebrow">
                LIVE DEMONSTRATION
              </span>

              <h3>Waiting queue</h3>
            </div>

            <span className="pill">Synthetic data</span>

          </div>

          <div className="table-wrap">

            <table>

              <thead>
                <tr>
                  <th>Token</th>
                  <th>Department</th>
                  <th>Initial urgency</th>
                  <th>Patient update</th>
                  <th>Waiting</th>
                  <th>Signal</th>
                </tr>
              </thead>

              <tbody>

                {patients.map((patient) => (

                  <tr key={patient.id}>

                    <td>
                      <b>{patient.token}</b>
                    </td>

                    <td>{patient.department}</td>

                    <td>
                      <span
                        className={`tag ${patient.initialUrgency.toLowerCase()}`}
                      >
                        {patient.initialUrgency}
                      </span>
                    </td>

                    <td>{patient.condition}</td>

                    <td>{patient.waitingMinutes} min</td>

                    <td>
                      {patient.alert ? (
                        <span className="alert-tag">
                          Review suggested
                        </span>
                      ) : (
                        <span className="ok-tag">
                          No demo signal
                        </span>
                      )}
                    </td>

                  </tr>

                ))}

                {!loading && patients.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty">
                      No patient data available.
                      Check backend connection.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* Patient Check-in */}
        <section
          className="panel"
          style={{
            marginTop: "22px",
            padding: "24px"
          }}
        >

          <div className="panel-heading">

            <div>
              <span className="eyebrow">
                PATIENT MONITORING
              </span>

              <h3>Patient Condition Check-in</h3>
            </div>

            <span className="pill">
              Demo feature
            </span>

          </div>

          <p>
            Select a synthetic patient and report their
            current condition.
          </p>

          {/* Patient Selection */}
          <label
            htmlFor="patient-select"
            style={{
              display: "block",
              marginBottom: "8px"
            }}
          >
            Select patient
          </label>

          <select
            id="patient-select"
            value={selectedPatient}
            onChange={(event) => {
              setSelectedPatient(event.target.value);
              setCheckinMessage("");
            }}
            disabled={loading || !patients.length || submitting}
            style={{
              padding: "10px",
              minWidth: "180px",
              marginBottom: "20px"
            }}
          >

            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.token}
              </option>
            ))}

          </select>

          <p>How is the patient feeling now?</p>

          {/* Condition Buttons */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginTop: "12px"
            }}
          >

            <button
              type="button"
              disabled={submitting || !patients.length}
              onClick={() => submitCheckin("better")}
            >
              😊 Better
            </button>

            <button
              type="button"
              disabled={submitting || !patients.length}
              onClick={() => submitCheckin("same")}
            >
              😐 Same
            </button>

            <button
              type="button"
              disabled={submitting || !patients.length}
              onClick={() => submitCheckin("worse")}
            >
              😟 Worse
            </button>

          </div>

          {/* Response Message */}
          {checkinMessage && (
            <div
              role="status"
              style={{
                marginTop: "20px",
                padding: "12px",
                background: "#eef4ff",
                borderRadius: "8px"
              }}
            >
              <b>Check-in response:</b>
              <p>{checkinMessage}</p>
            </div>
          )}

          {submitting && (
            <p>Processing check-in...</p>
          )}

        </section>

        {/* Safety Notice */}
        <div className="safety">

          <b>Important safety note</b>

          <p>
            QueueSense is an academic decision-support prototype.
            Alerts are illustrative software signals, not diagnoses
            or triage decisions. Qualified healthcare staff must
            assess patients and follow local emergency procedures.
          </p>

        </div>

        {/* Footer */}
        <footer>
          QueueSense · B.Tech VII Semester Project-1
          <span>MongoDB Connected</span>
        </footer>

      </main>

    </div>
  );
}

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";

const historyItems = [
  {
    id: 1,
    date: "2026-04-01",
    type: "Check-in",
    notes: "Patient completed symptom check-in.",
  },
  {
    id: 2,
    date: "2026-04-10",
    type: "Appointment",
    notes: "Follow-up appointment scheduled with provider.",
  },
  {
    id: 3,
    date: "2026-04-18",
    type: "Health Update",
    notes: "Patient reported improvement in symptoms.",
  },
];

export default function PatientHistoryView() {
  return (
    <Box sx={{ padding: "2rem" }}>
      <Typography variant="h4" sx={{ fontWeight: 700, marginBottom: "1rem" }}>
        Patient History
      </Typography>

      <Typography sx={{ marginBottom: "2rem", color: "text.secondary" }}>
        View previous check-ins, appointments, and health updates for the patient.
      </Typography>

      {historyItems.map((item) => (
        <Paper
          key={item.id}
          sx={{
            padding: "1.5rem",
            marginBottom: "1rem",
            borderRadius: "12px",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {item.type}
          </Typography>

          <Typography sx={{ color: "text.secondary", marginBottom: "0.5rem" }}>
            {item.date}
          </Typography>

          <Divider sx={{ marginBottom: "0.75rem" }} />

          <Typography>{item.notes}</Typography>
        </Paper>
      ))}
    </Box>
  );
}

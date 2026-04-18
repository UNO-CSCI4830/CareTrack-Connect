import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, TextField, MenuItem, Chip, Divider } from "@mui/material";

const mockCheckIns = [
  { id: 1, patient: "Alice Johnson", date: "2026-04-16", status: "Critical", summary: "Severe tremors, difficulty walking" },
  { id: 2, patient: "Alice Johnson", date: "2026-04-15", status: "Stable",   summary: "Mild tremors, slept well" },
  { id: 3, patient: "Bob Smith",     date: "2026-04-16", status: "Stable",   summary: "No notable symptoms" },
  { id: 4, patient: "Bob Smith",     date: "2026-04-14", status: "Stable",   summary: "Slight stiffness in morning" },
  { id: 5, patient: "Carol White",   date: "2026-04-15", status: "Pending",  summary: "No submission" },
];

const statusColors = { Critical: "error", Stable: "success", Pending: "warning" };

const DoctorCheckInsView = () => {
  const navigate = useNavigate();
  const patients = ["All Patients", "Alice Johnson", "Bob Smith", "Carol White"];
  const [selectedPatient, setSelectedPatient] = useState("All Patients");

  const filtered = selectedPatient === "All Patients"
    ? mockCheckIns
    : mockCheckIns.filter(c => c.patient === selectedPatient);

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, md: 3 } }}>
      <Button
        onClick={() => navigate("/doctor")}
        sx={{ textTransform: "none", color: "#185FA5", mb: 2, pl: 0 }}
      >
        ← Back to Dashboard
      </Button>

      <Typography variant="h5" fontWeight={600} gutterBottom>
        Patient Check-Ins
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        View and filter all submitted check-ins across your patients.
      </Typography>

      <TextField
        select
        label="Filter by patient"
        value={selectedPatient}
        onChange={(e) => setSelectedPatient(e.target.value)}
        size="small"
        sx={{ minWidth: 220, mb: 3 }}
      >
        {patients.map((p) => (
          <MenuItem key={p} value={p}>{p}</MenuItem>
        ))}
      </TextField>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {filtered.map((checkIn) => (
          <Box
            key={checkIn.id}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: "0.5px solid",
              borderColor: "divider",
              borderRadius: "12px",
              p: 2,
              backgroundColor: "background.paper",
            }}
          >
            <Box>
              <Typography variant="body1" fontWeight={500}>{checkIn.patient}</Typography>
              <Typography variant="body2" color="text.secondary">{checkIn.date}</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>{checkIn.summary}</Typography>
            </Box>
            <Chip
              label={checkIn.status}
              color={statusColors[checkIn.status]}
              size="small"
              sx={{ borderRadius: "8px", fontWeight: 500 }}
            />
          </Box>
        ))}
        {filtered.length === 0 && (
          <Typography variant="body2" color="text.secondary">No check-ins found.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default DoctorCheckInsView;
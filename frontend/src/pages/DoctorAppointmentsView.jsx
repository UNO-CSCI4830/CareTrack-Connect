import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Chip, Divider } from "@mui/material";

const mockAppointments = [
  { id: 1, patient: "Alice Johnson", date: "2026-04-18", time: "9:00 AM",  type: "Follow-up",    status: "Confirmed" },
  { id: 2, patient: "Bob Smith",     date: "2026-04-19", time: "11:30 AM", type: "Routine Check", status: "Confirmed" },
  { id: 3, patient: "Carol White",   date: "2026-04-21", time: "2:00 PM",  type: "New Concern",   status: "Pending" },
  { id: 4, patient: "Alice Johnson", date: "2026-04-23", time: "10:00 AM", type: "Medication Review", status: "Confirmed" },
];

const statusColors = { Confirmed: "success", Pending: "warning", Cancelled: "error" };

const DoctorAppointmentsView = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, md: 3 } }}>
      <Button
        onClick={() => navigate("/doctor")}
        sx={{ textTransform: "none", color: "#185FA5", mb: 2, pl: 0 }}
      >
        ← Back to Dashboard
      </Button>

      <Typography variant="h5" fontWeight={600} gutterBottom>
        Appointments
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Upcoming appointments with your patients.
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {mockAppointments.map((appt) => (
          <Box
            key={appt.id}
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
              <Typography variant="body1" fontWeight={500}>{appt.patient}</Typography>
              <Typography variant="body2" color="text.secondary">
                {appt.date} at {appt.time}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>{appt.type}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Chip
                label={appt.status}
                color={statusColors[appt.status]}
                size="small"
                sx={{ borderRadius: "8px", fontWeight: 500 }}
              />
              <Button
                size="small"
                variant="outlined"
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  borderColor: "#185FA5",
                  color: "#185FA5",
                  "&:hover": { backgroundColor: "#E6F1FB" },
                }}
              >
                Manage
              </Button>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default DoctorAppointmentsView;
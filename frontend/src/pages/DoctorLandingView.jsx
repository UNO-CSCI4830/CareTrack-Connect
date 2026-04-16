import { useState, useEffect } from "react";
import { Box, Typography, Divider, Button, Chip } from "@mui/material";

const currentDate = new Date();
const formattedDate = currentDate.toLocaleDateString();

const mockPatients = [
  { id: 1, name: "Alice Johnson", lastCheckIn: "Today", status: "Critical", statusColor: "error" },
  { id: 2, name: "Bob Smith", lastCheckIn: "Yesterday", status: "Stable", statusColor: "success" },
  { id: 3, name: "Carol White", lastCheckIn: "2 days ago", status: "Pending", statusColor: "warning" },
];

const quickActions = [
  { label: "View All Check-Ins", icon: "📋", route: "/check-ins" },
  { label: "Manage Appointments", icon: "📅", route: "/appointments" },
  { label: "Patient Reports", icon: "📊", route: "/reports" },
];

const DoctorView = () => {
  const [firstName, setFirstName] = useState("Doctor");
  const [alerts] = useState([
    { id: 1, patient: "Alice Johnson", message: "Critical tremor score reported", time: "2 hrs ago" },
    { id: 2, patient: "Carol White", message: "No check-in submitted today", time: "4 hrs ago" },
  ]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // const profileResponse = await ProfileService.getProfileByAuthUserId(session.user.id);
        // if (profileResponse?.data?.first_name) setFirstName(profileResponse.data.first_name);
      } catch (error) {
        console.error("Failed to load doctor profile:", error);
      }
    };
    fetchProfile();
  }, []);

  return (
    <Box sx={{ maxWidth: 900, mx: "auto" }}>

      {/* ── Blue Dashboard Banner ── */}
      <Box
        sx={{
          backgroundColor: "#185FA5",
          borderRadius: "0 0 20px 20px",
          px: { xs: 2.5, md: 4 },
          pt: 4,
          pb: 3,
          mb: 4,
        }}
      >
        {/* Greeting */}
        <Typography variant="h4" sx={{ color: "#E6F1FB", fontWeight: 600, mb: 0.5 }}>
          Hello, Dr. {firstName}
        </Typography>
        <Typography variant="body1" sx={{ color: "#85B7EB", mb: 3 }}>
          Today is {formattedDate}
        </Typography>

        {/* Stats Row */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
            gap: 1.5,
            mb: 3,
          }}
        >
          {[
            { label: "Total Patients", value: 3 },
            { label: "Check-Ins Today", value: 1 },
            { label: "Active Alerts", value: 2 },
            { label: "Upcoming Appts", value: 4 },
          ].map((stat) => (
            <Box
              key={stat.label}
              sx={{
                backgroundColor: "#0C447C",
                borderRadius: "12px",
                p: 1.5,
                textAlign: "center",
              }}
            >
              <Typography sx={{ color: "#85B7EB", fontSize: "12px", mb: 0.5 }}>
                {stat.label}
              </Typography>
              <Typography sx={{ color: "#E6F1FB", fontSize: "28px", fontWeight: 600, lineHeight: 1 }}>
                {stat.value}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Quick Action Buttons */}
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="contained"
              sx={{
                backgroundColor: "#378ADD",
                color: "#E6F1FB",
                fontWeight: 500,
                borderRadius: "10px",
                textTransform: "none",
                px: 2.5,
                py: 1,
                boxShadow: "none",
                fontSize: "14px",
                "&:hover": {
                  backgroundColor: "#B5D4F4",
                  color: "#0C447C",
                  boxShadow: "none",
                },
              }}
            >
              {action.label}
            </Button>
          ))}
        </Box>
      </Box>

      {/* ── Body Content ── */}
      <Box sx={{ px: { xs: 2, md: 3 } }}>

        {/* Welcome blurb */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Welcome to CareTrack Connect
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review your patients' latest check-ins, respond to alerts, and manage appointments below.
          </Typography>
        </Box>

        {/* Alerts Panel */}
        <Box
          sx={{
            border: "1px solid",
            borderColor: "error.light",
            borderRadius: "12px",
            p: 2.5,
            mb: 3,
            backgroundColor: "#fff5f5",
          }}
        >
          <Typography variant="h6" fontWeight={600} color="error.main" gutterBottom>
            Active Alerts
          </Typography>
          {alerts.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No active alerts.</Typography>
          ) : (
            alerts.map((alert) => (
              <Box
                key={alert.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 1.5,
                  borderBottom: "0.5px solid",
                  borderColor: "divider",
                  "&:last-child": { borderBottom: "none" },
                }}
              >
                <Box>
                  <Typography variant="body1" fontWeight={500}>{alert.patient}</Typography>
                  <Typography variant="body2" color="text.secondary">{alert.message}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">{alert.time}</Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 500 }}
                  >
                    Review
                  </Button>
                </Box>
              </Box>
            ))
          )}
        </Box>

        {/* Patient List */}
        <Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            My Patients
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {mockPatients.map((patient) => (
              <Box
                key={patient.id}
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
                  <Typography variant="body1" fontWeight={500}>{patient.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Last check-in: {patient.lastCheckIn}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Chip
                    label={patient.status}
                    color={patient.statusColor}
                    size="small"
                    sx={{ fontWeight: 500, borderRadius: "8px" }}
                  />
                  <Button
                    size="small"
                    variant="contained"
                    sx={{
                      backgroundColor: "#6366f1",
                      color: "white",
                      fontWeight: 600,
                      borderRadius: "8px",
                      textTransform: "none",
                      boxShadow: "none",
                      "&:hover": { backgroundColor: "#4f46e5" },
                    }}
                  >
                    View Profile
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

      </Box>
      <Box 
      sx={{
        borderRadius: "0 0 20px 20px",
        px: { xs: 2.5, md: 4 },
        pt: 2,
        pb: 2,
        mb: 2,
      }}
      >
        
    </Box>
    </Box>
  );
};

export default DoctorView;
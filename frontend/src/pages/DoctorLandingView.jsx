import { useState, useEffect } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import NavigationDrawer from "../components/NavigationDrawer";
import { UserAuth } from "../components/auth/AuthContext";
import ProfileService from "../services/profileService";

const formattedDate = new Date().toLocaleDateString();

const quickActions = [
  { label: "View All Check-Ins", route: "/doctor/check-ins" },
  { label: "Manage Appointments", route: "/doctor/appointments" },
  { label: "Availability", route: "/doctor/availability" },
  { label: "Patients", route: "/doctor/patients" },
  { label: "Patient Reports", route: "/doctor/reports" },
];

const DoctorView = () => {
  const navigate = useNavigate();
  const { session } = UserAuth();
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    if (!session?.user?.id) return;
    ProfileService.getProfileByAuthUserId(session.user.id)
      .then((res) => {
        const profile = res?.data || res;
        if (profile?.first_name) setFirstName(profile.first_name);
      })
      .catch((err) => console.error("Failed to load doctor profile:", err));
  }, [session]);

  return (
    <Box>
      <NavigationDrawer />
      <Box sx={{ maxWidth: 900, mx: "auto" }}>
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
          <Typography variant="h4" sx={{ color: "#E6F1FB", fontWeight: 600, mb: 0.5 }}>
            Hello, Dr. {firstName}
          </Typography>
          <Typography variant="body1" sx={{ color: "#85B7EB", mb: 3 }}>
            Today is {formattedDate}
          </Typography>

          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            {quickActions.map((action) => (
              <Button
                key={action.label}
                onClick={() => navigate(action.route)}
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

        <Box sx={{ px: { xs: 2, md: 3 } }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Welcome to CareTrack Connect
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Review your patients' latest check-ins, respond to alerts, and manage appointments from the links above.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default DoctorView;

import NavigationDrawer from "../components/NavigationDrawer";
import { Box, Typography, Button, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";

const PatientView = () => {
  const navigate = useNavigate();

  const currentDate = new Date().toLocaleDateString();
  const isFinished = false;

  const handleClick = () => {
    navigate("/check-in");
  };

  return (
    <>
      <NavigationDrawer />

      <Box
        sx={{
          padding: "2rem",
          maxWidth: "900px",
          margin: "0 auto"
        }}
      >
        {/* Header */}
        <Box sx={{ marginBottom: "1.5rem" }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Hello Patient
          </Typography>
          <Typography sx={{ color: "#64748b", marginTop: "4px" }}>
            Today is {currentDate}
          </Typography>
        </Box>

        <Divider sx={{ marginBottom: "1.5rem" }} />

        {/* Intro */}
        <Box sx={{ marginBottom: "1.5rem" }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Welcome to CareTrack Connect
          </Typography>
          <Typography sx={{ color: "#64748b", marginTop: "6px" }}>
            Check your status below and complete your daily check-in.
          </Typography>
        </Box>

        {/* Status Card */}
        <Box
          sx={{
            background: "white",
            borderRadius: "20px",
            padding: "2rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            textAlign: "center"
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Status Card
          </Typography>

          <Typography sx={{ color: "#64748b", marginTop: "10px" }}>
            Today's Check-in
          </Typography>

          <Typography
            variant="h4"
            sx={{
              color: "#6366f1",
              fontWeight: 700,
              margin: "12px 0 20px"
            }}
          >
            {isFinished ? "Complete" : "Not Started"}
          </Typography>

          <Button
            variant="contained"
            onClick={handleClick}
            sx={{
              backgroundColor: "#6366f1",
              color: "white",
              fontWeight: 600,
              borderRadius: "12px",
              padding: "12px 24px",
              textTransform: "none",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#4f46e5",
                boxShadow: "0 8px 18px rgba(99, 102, 241, 0.25)"
              }
            }}
          >
            {isFinished ? "Edit Check-In" : "Start Check-In"}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default PatientView;

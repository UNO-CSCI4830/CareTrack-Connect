import { useEffect, useState } from "react";
import NavigationDrawer from "../components/NavigationDrawer";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import { useLocation, useNavigate } from "react-router-dom";
import { UserAuth } from "../components/auth/AuthContext";
import ProfileService from "../services/profileService";

const formattedDate = new Date().toLocaleDateString();

const PatientView = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { session } = UserAuth();
    const [firstName, setFirstName] = useState(location.state?.firstName || "");

    useEffect(() => {
        if (!session?.user?.id) return;
        ProfileService.getProfileByAuthUserId(session.user.id)
            .then((res) => {
                const profile = res?.data || res;
                if (profile?.first_name) setFirstName(profile.first_name);
            })
            .catch((err) => console.error("Failed to load patient profile:", err));
    }, [session]);

    return (
        <>
            <NavigationDrawer />
            <section id="top">
                <Box className="dashboard-header">
                    <Typography variant="h4" className="dashboard-title">
                        Hello {firstName || "Patient"}
                    </Typography>
                    <Typography variant="h6" className="dashboard-date">
                        Today is {formattedDate}
                    </Typography>
                </Box>

                <Divider sx={{ margin: "0 0 1.5rem 0" }} />

                <Box className="dashboard-intro">
                    <Typography variant="h4" className="section-title">
                        Welcome to CareTrack Connect
                    </Typography>
                    <Typography variant="h6" className="dashboard-subtext">
                        Complete your daily check-in or book an appointment from the links above.
                    </Typography>
                </Box>

                <Box className="status-card" sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 3 }}>
                    <Button
                        variant="contained"
                        onClick={() => navigate("/patient/check-in")}
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
                                boxShadow: "0 8px 18px rgba(99, 102, 241, 0.25)",
                            },
                        }}
                    >
                        Start Check-In
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => navigate("/book-appointment")}
                        sx={{
                            borderRadius: "12px",
                            padding: "12px 24px",
                            textTransform: "none",
                            fontWeight: 600,
                        }}
                    >
                        Book Appointment
                    </Button>
                    <Button onClick={() => navigate("/audio-capture")}
                    variant="contained"
                    className="dashboard-action-btn"
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
                    }}>
                        Record Audio
                </Button>
                </Box>
            </section>
        </>
    );
    };

export default PatientView;

import NavigationDrawer from "../components/NavigationDrawer";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { useNavigate } from 'react-router-dom';

const currentDate = new Date();
const formattedDate = currentDate.toLocaleDateString();
const isFinished = false;

const PatientView = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/check-in');
    };

    return (
        <>
            <NavigationDrawer />
            <section id="top">
                <Box className="dashboard-header">
                    <Typography variant="h4" className="dashboard-title">
                        Hello Patient
                    </Typography>
                    <Typography variant="h6" className="dashboard-date">
                        Today is {formattedDate}
                    </Typography>
                </Box>

                <Divider sx={{ margin: '0 0 1.5rem 0' }} />

                <Box className="dashboard-intro">
                    <Typography variant="h4" className="section-title">
                        Welcome to CareTrack Connect
                    </Typography>
                    <Typography variant="h6" className="dashboard-subtext">
                        Check your status below and complete your daily check-in.
                    </Typography>
                </Box>

                <Box className="status-card">
                    <Typography variant="h5" className="status-card-title">
                        Status Card
                    </Typography>

                    <Typography variant="body1" className="status-label">
                        Today's Check-in
                    </Typography>

                    <Typography variant="h4" className="status-value">
                        {isFinished ? 'Complete' : 'Not Started'}
                    </Typography>

                  <Button
                      onClick={handleClick}
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
                      }}
                      >
                      {isFinished ? 'Edit Check-In' : 'Start Check-In'}
                  </Button>
                </Box>
            </section>
        </>
    );
};

export default PatientView;

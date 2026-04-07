import React, { useState, useEffect } from "react";
import NavigationDrawer from "../components/NavigationDrawer";
import EditProfile from "../components/EditProfile";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import IconButton from '@mui/material/IconButton';
import { useNavigate } from 'react-router-dom';
import ProfileService from "../services/profileService";
import PatientDetailsService from "../services/patientDetailsService";
import { UserAuth } from "../components/auth/AuthContext";

const FORM_STORAGE_KEY = 'patientProfileFormData';

const PatientProfileView = () => {
    const navigate = useNavigate();
    const { session } = UserAuth();
    const [profile, setProfile] = useState(null);
    const [patientDetails, setPatientDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    
    const defaultFormData = {
        // Profile fields
        first_name: "",
        last_name: "",
        email: "",
        // Patient details fields
        date_of_birth: "",
        phone: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        zip_code: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
        emergency_contact_relation: "",
        allergies: "",
        current_medications: "",
        medical_conditions: "",
        diagnosis_date: "",
        disease_stage: "",
        notes: ""
    };

    const [formData, setFormData] = useState(defaultFormData);

    useEffect(() => {
        const fetchData = async () => {
            if (!session?.user?.id) {
                setError("User session not found");
                setLoading(false);
                return;
            }
            try {
                // Fetch profile
                const profileResponse = await ProfileService.getProfileByAuthUserId(session.user.id);
                const profileData = profileResponse?.data;
                setProfile(profileData);

                // Fetch patient details if profile exists
                if (profileData?.id) {
                    try {
                        const detailsResponse = await PatientDetailsService.getPatientDetailsByProfileId(profileData.id);
                        const detailsData = detailsResponse?.data;
                        setPatientDetails(detailsData);
                        
                        // Only update formData if NOT in edit mode (to preserve user edits)
                        if (!isEditing) {
                            setFormData({
                                first_name: profileData?.first_name || "",
                                last_name: profileData?.last_name || "",
                                email: profileData?.email || "",
                                date_of_birth: detailsData?.date_of_birth || "",
                                phone: detailsData?.phone || "",
                                address_line1: detailsData?.address_line1 || "",
                                address_line2: detailsData?.address_line2 || "",
                                city: detailsData?.city || "",
                                state: detailsData?.state || "",
                                zip_code: detailsData?.zip_code || "",
                                emergency_contact_name: detailsData?.emergency_contact_name || "",
                                emergency_contact_phone: detailsData?.emergency_contact_phone || "",
                                emergency_contact_relation: detailsData?.emergency_contact_relation || "",
                                allergies: Array.isArray(detailsData?.allergies) ? detailsData.allergies.join(", ") : "",
                                current_medications: Array.isArray(detailsData?.current_medications) ? detailsData.current_medications.join(", ") : "",
                                medical_conditions: Array.isArray(detailsData?.medical_conditions) ? detailsData.medical_conditions.join(", ") : "",
                                diagnosis_date: detailsData?.diagnosis_date || "",
                                disease_stage: detailsData?.disease_stage || "",
                                notes: detailsData?.notes || ""
                            });
                        }
                    } catch (err) {
                        console.log("No patient details found yet");
                    }
                }
            } catch (err) {
                setError("Failed to load profile: " + (err?.message || err));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [session, isEditing]);

    // Save form data to localStorage when editing
    useEffect(() => {
        if (isEditing) {
            localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
        }
    }, [formData, isEditing]);

    // Handle beforeunload event to save data before leaving page
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isEditing) {
                localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
                // Optionally show a confirmation dialog
                e.preventDefault();
                e.returnValue = '';
            }
        };

        if (isEditing) {
            window.addEventListener('beforeunload', handleBeforeUnload);
        }

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isEditing, formData]);

    // On entering edit mode, try to load saved data
    useEffect(() => {
        if (isEditing) {
            try {
                const savedData = localStorage.getItem(FORM_STORAGE_KEY);
                if (savedData) {
                    const parsedData = JSON.parse(savedData);
                    setFormData(parsedData);
                }
            } catch (err) {
                console.log("Could not restore saved form data:", err);
            }
        }
    }, [isEditing]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCancel = () => {
        // Clear localStorage when canceling
        localStorage.removeItem(FORM_STORAGE_KEY);
        setIsEditing(false);
        setError("");
    };

    const handleSave = async () => {
        try {
            if (!profile?.id) {
                setError("Profile ID not found");
                return;
            }

            // Update profile
            const profileUpdate = {
                first_name: formData.first_name,
                last_name: formData.last_name
            };
            await ProfileService.updateProfile(profile.id, profileUpdate);

            // Update patient details
            if (patientDetails?.id) {
                const detailsUpdate = {
                    date_of_birth: formData.date_of_birth || null,
                    phone: formData.phone || null,
                    address_line1: formData.address_line1 || null,
                    address_line2: formData.address_line2 || null,
                    city: formData.city || null,
                    state: formData.state || null,
                    zip_code: formData.zip_code || null,
                    emergency_contact_name: formData.emergency_contact_name || null,
                    emergency_contact_phone: formData.emergency_contact_phone || null,
                    emergency_contact_relation: formData.emergency_contact_relation || null,
                    allergies: formData.allergies ? formData.allergies.split(",").map(item => item.trim()) : [],
                    current_medications: formData.current_medications ? formData.current_medications.split(",").map(item => item.trim()) : [],
                    medical_conditions: formData.medical_conditions ? formData.medical_conditions.split(",").map(item => item.trim()) : [],
                    diagnosis_date: formData.diagnosis_date || null,
                    disease_stage: formData.disease_stage || null,
                    notes: formData.notes || null
                };
                await PatientDetailsService.updatePatientDetails(patientDetails.id, detailsUpdate);
            }

            // Clear localStorage after successful save
            localStorage.removeItem(FORM_STORAGE_KEY);

            setProfile({
                ...profile,
                first_name: formData.first_name,
                last_name: formData.last_name
            });
            setIsEditing(false);
            setError("");
        } catch (err) {
            setError("Failed to update profile: " + (err?.message || err));
        }
    };

    if (loading) {
        return (
            <>
                <NavigationDrawer />
                <section id="center">
                    <Typography variant="h4">Loading profile...</Typography>
                </section>
            </>
        );
    }

    return (
        <>
            <NavigationDrawer />
            <section id="top" className="patient-profile-page">
                <Box className="patient-profile-header">
                    <IconButton 
                        onClick={() => navigate('/patient')}
                        sx={{ color: '#1f3a5f', backgroundColor: '#ffffff', border: '1px solid #d9e2ec' }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" className="patient-profile-header-title" sx={{ fontWeight: 700, color: '#102a43' }}>
                        Patient Profile
                    </Typography>
                </Box>

                <Divider sx={{ borderColor: '#d9e2ec' }} />

                <Box className="patient-profile-shell">
                    {error && (
                        <Box className="patient-profile-alert">
                            <Typography variant="body2">{error}</Typography>
                        </Box>
                    )}

                    <Card className="patient-profile-card">
                        <CardContent>
                            <Box className="patient-profile-topbar">
                                <Box className="patient-profile-intro">
                                    <Typography variant="body2" className="patient-profile-subtitle">
                                        Review and manage your personal, contact, and health information.
                                    </Typography>
                                </Box>
                                <Button
                                    variant="outlined"
                                    className="patient-profile-edit-button"
                                    onClick={() => {
                                        if (isEditing) {
                                            handleCancel();
                                        } else {
                                            setIsEditing(true);
                                        }
                                    }}
                                >
                                    {isEditing ? 'Cancel' : 'Edit'}
                                </Button>
                            </Box>

                            <Divider className="patient-profile-divider" />

                            {isEditing ? (
                                <Box className="patient-profile-content">
                                    <EditProfile 
                                        formData={formData}
                                        handleInputChange={handleInputChange}
                                        handleSave={handleSave}
                                        handleCancel={handleCancel}
                                        profile={profile}
                                    />
                                </Box>
                            ) : (
                                <Box className="patient-profile-content">
                                    <Typography
                                        variant="h6"
                                        className="profile-section-title"
                                        sx={{ marginBottom: '1rem' }}
                                    >
                                        Basic Information
                                    </Typography>
                                    <Box className="patient-profile-grid patient-profile-section">
                                        <Box className="patient-profile-field">
                                            <Typography variant="subtitle2" className="patient-profile-label">
                                                First Name
                                            </Typography>
                                            <Typography variant="body1" className="patient-profile-value">{profile?.first_name || "N/A"}</Typography>
                                        </Box>

                                        <Box className="patient-profile-field">
                                            <Typography variant="subtitle2" className="patient-profile-label">
                                                Last Name
                                            </Typography>
                                            <Typography variant="body1" className="patient-profile-value">{profile?.last_name || "N/A"}</Typography>
                                        </Box>

                                        <Box className="patient-profile-field">
                                            <Typography variant="subtitle2" className="patient-profile-label">
                                                Email
                                            </Typography>
                                            <Typography variant="body1" className="patient-profile-value">{profile?.email || "N/A"}</Typography>
                                        </Box>

                                        <Box className="patient-profile-field">
                                            <Typography variant="subtitle2" className="patient-profile-label">
                                                Phone
                                            </Typography>
                                            <Typography variant="body1" className="patient-profile-value">{formData.phone || "N/A"}</Typography>
                                        </Box>

                                        <Box className="patient-profile-field">
                                            <Typography variant="subtitle2" className="patient-profile-label">
                                                Date of Birth
                                            </Typography>
                                            <Typography variant="body1" className="patient-profile-value">{formData.date_of_birth || "N/A"}</Typography>
                                        </Box>

                                        <Box className="patient-profile-field">
                                            <Typography variant="subtitle2" className="patient-profile-label">
                                                Role
                                            </Typography>
                                            <Typography variant="body1" className="patient-profile-value" sx={{ textTransform: 'capitalize' }}>
                                                {profile?.role || "N/A"}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Divider sx={{ marginBottom: '2rem', borderColor: '#e2e8f0' }} />

                                    <Typography variant="h6" className="profile-section-title" sx={{ marginBottom: '1rem' }}>
                                        Address
                                    </Typography>
                                    <Box className="patient-profile-stack patient-profile-section">
                                        <Box className="patient-profile-field">
                                            <Typography variant="subtitle2" className="patient-profile-label">
                                                Address Line 1
                                            </Typography>
                                            <Typography variant="body1" className="patient-profile-value">{formData.address_line1 || "N/A"}</Typography>
                                        </Box>

                                        <Box className="patient-profile-field">
                                            <Typography variant="subtitle2" className="patient-profile-label">
                                                Address Line 2
                                            </Typography>
                                            <Typography variant="body1" className="patient-profile-value">{formData.address_line2 || "N/A"}</Typography>
                                        </Box>

                                        <Box className="patient-profile-grid-wide">
                                            <Box className="patient-profile-field">
                                                <Typography variant="subtitle2" className="patient-profile-label">
                                                    City
                                                </Typography>
                                                <Typography variant="body1" className="patient-profile-value">{formData.city || "N/A"}</Typography>
                                            </Box>

                                            <Box className="patient-profile-field">
                                                <Typography variant="subtitle2" className="patient-profile-label">
                                                    State
                                                </Typography>
                                                <Typography variant="body1" className="patient-profile-value">{formData.state || "N/A"}</Typography>
                                            </Box>

                                            <Box className="patient-profile-field">
                                                <Typography variant="subtitle2" className="patient-profile-label">
                                                    Zip Code
                                                </Typography>
                                                <Typography variant="body1" className="patient-profile-value">{formData.zip_code || "N/A"}</Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Divider sx={{ marginBottom: '2rem', borderColor: '#e2e8f0' }} />

                                    <Typography variant="h6" className="profile-section-title" sx={{ marginBottom: '1rem' }}>
                                        Emergency Contact
                                    </Typography>
                                    <Box className="patient-profile-grid patient-profile-section">
                                        <Box className="patient-profile-field">
                                            <Typography variant="subtitle2" className="patient-profile-label">
                                                Contact Name
                                            </Typography>
                                            <Typography variant="body1" className="patient-profile-value">{formData.emergency_contact_name || "N/A"}</Typography>
                                        </Box>

                                        <Box className="patient-profile-field">
                                            <Typography variant="subtitle2" className="patient-profile-label">
                                                Contact Phone
                                            </Typography>
                                            <Typography variant="body1" className="patient-profile-value">{formData.emergency_contact_phone || "N/A"}</Typography>
                                        </Box>

                                        <Box className="patient-profile-field">
                                            <Typography variant="subtitle2" className="patient-profile-label">
                                                Relationship
                                            </Typography>
                                            <Typography variant="body1" className="patient-profile-value">{formData.emergency_contact_relation || "N/A"}</Typography>
                                        </Box>
                                    </Box>

                                    <Divider sx={{ marginBottom: '2rem', borderColor: '#e2e8f0' }} />

                                    <Typography variant="h6" className="profile-section-title" sx={{ marginBottom: '1rem' }}>
                                        Health Information
                                    </Typography>
                                    <Box className="patient-profile-stack">
                                        <Box className="patient-profile-field">
                                            <Typography variant="subtitle2" className="patient-profile-label">
                                                Allergies
                                            </Typography>
                                            <Typography variant="body1" className="patient-profile-value">{formData.allergies || "N/A"}</Typography>
                                        </Box>

                                        <Box className="patient-profile-field">
                                            <Typography variant="subtitle2" className="patient-profile-label">
                                                Current Medications
                                            </Typography>
                                            <Typography variant="body1" className="patient-profile-value">{formData.current_medications || "N/A"}</Typography>
                                        </Box>

                                        <Box className="patient-profile-field">
                                            <Typography variant="subtitle2" className="patient-profile-label">
                                                Medical Conditions
                                            </Typography>
                                            <Typography variant="body1" className="patient-profile-value">{formData.medical_conditions || "N/A"}</Typography>
                                        </Box>

                                        <Box className="patient-profile-grid">
                                            <Box className="patient-profile-field">
                                                <Typography variant="subtitle2" className="patient-profile-label">
                                                    Diagnosis Date
                                                </Typography>
                                                <Typography variant="body1" className="patient-profile-value">{formData.diagnosis_date || "N/A"}</Typography>
                                            </Box>

                                            <Box className="patient-profile-field">
                                                <Typography variant="subtitle2" className="patient-profile-label">
                                                    Disease Stage
                                                </Typography>
                                                <Typography variant="body1" className="patient-profile-value">{formData.disease_stage || "N/A"}</Typography>
                                            </Box>
                                        </Box>

                                        <Box className="patient-profile-field">
                                            <Typography variant="subtitle2" className="patient-profile-label">
                                                Notes
                                            </Typography>
                                            <Typography variant="body1" className="patient-profile-value">{formData.notes || "N/A"}</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            </section>
        </>
    );
};

export default PatientProfileView;

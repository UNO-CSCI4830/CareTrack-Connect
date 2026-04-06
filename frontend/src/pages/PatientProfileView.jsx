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
            <section id="top">
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', paddingTop: '2em', paddingLeft: '2em', gap: '1em' }}>
                    <IconButton 
                        onClick={() => navigate('/patient')}
                        sx={{ color: 'black' }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4">Patient Profile</Typography>
                </Box>

                <Divider sx={{ paddingTop: '1rem' }} />

                <Box sx={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
                    {error && (
                        <Box sx={{ color: 'red', marginBottom: '1rem', p: 2, backgroundColor: '#ffebee', borderRadius: 1 }}>
                            <Typography variant="body2">{error}</Typography>
                        </Box>
                    )}

                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <Typography variant="h5">Patient Profile</Typography>
                                <Button
                                    variant="outlined"
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

                            <Divider sx={{ marginBottom: '2rem' }} />

                            {isEditing ? (
                                <EditProfile 
                                    formData={formData}
                                    handleInputChange={handleInputChange}
                                    handleSave={handleSave}
                                    handleCancel={handleCancel}
                                    profile={profile}
                                />
                            ) : (
                                // View Mode - Display all fields read-only
                                <>
                                    {/* Basic Information Section */}
                                    <Typography
                                        variant="h6"
                                        className="profile-section-title"
                                        sx={{ marginBottom: '1rem' }}
                                        >
                                        Basic Information
                                    </Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                                                First Name
                                            </Typography>
                                            <Typography variant="body1">{profile?.first_name || "N/A"}</Typography>
                                        </Box>

                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                                                Last Name
                                            </Typography>
                                            <Typography variant="body1">{profile?.last_name || "N/A"}</Typography>
                                        </Box>

                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                                                Email
                                            </Typography>
                                            <Typography variant="body1">{profile?.email || "N/A"}</Typography>
                                        </Box>

                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                                                Phone
                                            </Typography>
                                            <Typography variant="body1">{formData.phone || "N/A"}</Typography>
                                        </Box>

                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                                                Date of Birth
                                            </Typography>
                                            <Typography variant="body1">{formData.date_of_birth || "N/A"}</Typography>
                                        </Box>

                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                                                Role
                                            </Typography>
                                            <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                                {profile?.role || "N/A"}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Divider sx={{ marginBottom: '2rem' }} />

                                    {/* Address Section */}
                                    <Typography variant="h6" sx={{ marginBottom: '1rem', fontWeight: 'bold', color: '#863bff' }}>
                                        Address
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                                                Address Line 1
                                            </Typography>
                                            <Typography variant="body1">{formData.address_line1 || "N/A"}</Typography>
                                        </Box>

                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                                                Address Line 2
                                            </Typography>
                                            <Typography variant="body1">{formData.address_line2 || "N/A"}</Typography>
                                        </Box>

                                        <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                                                    City
                                                </Typography>
                                                <Typography variant="body1">{formData.city || "N/A"}</Typography>
                                            </Box>

                                            <Box>
                                                <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                                                    State
                                                </Typography>
                                                <Typography variant="body1">{formData.state || "N/A"}</Typography>
                                            </Box>

                                            <Box>
                                                <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                                                    Zip Code
                                                </Typography>
                                                <Typography variant="body1">{formData.zip_code || "N/A"}</Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Divider sx={{ marginBottom: '2rem' }} />

                                    {/* Emergency Contact Section */}
                                    <Typography variant="h6" sx={{ marginBottom: '1rem', fontWeight: 'bold', color: '#863bff' }}>
                                        Emergency Contact
                                    </Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                                                Contact Name
                                            </Typography>
                                            <Typography variant="body1">{formData.emergency_contact_name || "N/A"}</Typography>
                                        </Box>

                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                                                Contact Phone
                                            </Typography>
                                            <Typography variant="body1">{formData.emergency_contact_phone || "N/A"}</Typography>
                                        </Box>

                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                                                Relationship
                                            </Typography>
                                            <Typography variant="body1">{formData.emergency_contact_relation || "N/A"}</Typography>
                                        </Box>
                                    </Box>

                                    <Divider sx={{ marginBottom: '2rem' }} />

                                    {/* Health Information Section */}
                                    <Typography variant="h6" sx={{ marginBottom: '1rem', fontWeight: 'bold', color: '#863bff' }}>
                                        Health Information
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                                                Allergies
                                            </Typography>
                                            <Typography variant="body1">{formData.allergies || "N/A"}</Typography>
                                        </Box>

                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                                                Current Medications
                                            </Typography>
                                            <Typography variant="body1">{formData.current_medications || "N/A"}</Typography>
                                        </Box>

                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                                                Medical Conditions
                                            </Typography>
                                            <Typography variant="body1">{formData.medical_conditions || "N/A"}</Typography>
                                        </Box>

                                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                                                    Diagnosis Date
                                                </Typography>
                                                <Typography variant="body1">{formData.diagnosis_date || "N/A"}</Typography>
                                            </Box>

                                            <Box>
                                                <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                                                    Disease Stage
                                                </Typography>
                                                <Typography variant="body1">{formData.disease_stage || "N/A"}</Typography>
                                            </Box>
                                        </Box>

                                        <Box>
                                            <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                                                Notes
                                            </Typography>
                                            <Typography variant="body1">{formData.notes || "N/A"}</Typography>
                                        </Box>
                                    </Box>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            </section>
        </>
    );
};

export default PatientProfileView;

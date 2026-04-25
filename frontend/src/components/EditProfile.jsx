import React from "react";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';

const EditProfile = ({ formData, handleInputChange, handleSave, handleCancel }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Basic Information Section */}
            <Box>
                <Typography variant="h6" sx={{ marginBottom: '1rem', fontWeight: 'bold', color: '#863bff' }}>
                    Basic Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <Box>
                        <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                            First Name
                        </Typography>
                        <TextField
                            fullWidth
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            size="small"
                            slotProps={{ htmlInput: { 'aria-label': 'First Name' } }}
                        />
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                            Last Name
                        </Typography>
                        <TextField
                            fullWidth
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            size="small"
                            slotProps={{ htmlInput: { 'aria-label': 'Last Name' } }}
                        />
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                            Email (Read-only)
                        </Typography>
                        <TextField
                            fullWidth
                            name="email"
                            value={formData.email}
                            size="small"
                            disabled
                            slotProps={{ htmlInput: { 'aria-label': 'Email' } }}
                        />
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                            Phone
                        </Typography>
                        <TextField
                            fullWidth
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            size="small"
                            type="tel"
                            slotProps={{ htmlInput: { 'aria-label': 'Phone' } }}
                        />
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                            Date of Birth
                        </Typography>
                        <TextField
                            fullWidth
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleInputChange}
                            size="small"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            slotProps={{ htmlInput: { 'aria-label': 'Date of Birth' } }}
                        />
                    </Box>
                </Box>
            </Box>

            <Divider />

            {/* Address Section */}
            <Box>
                <Typography variant="h6" sx={{ marginBottom: '1rem', fontWeight: 'bold', color: '#863bff' }}>
                    Address
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Box>
                        <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                            Address Line 1
                        </Typography>
                        <TextField
                            fullWidth
                            name="address_line1"
                            value={formData.address_line1}
                            onChange={handleInputChange}
                            size="small"
                            slotProps={{ htmlInput: { 'aria-label': 'Address Line 1' } }}
                        />
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                            Address Line 2
                        </Typography>
                        <TextField
                            fullWidth
                            name="address_line2"
                            value={formData.address_line2}
                            onChange={handleInputChange}
                            size="small"
                            slotProps={{ htmlInput: { 'aria-label': 'Address Line 2' } }}
                        />
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                        <Box>
                            <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                                City
                            </Typography>
                            <TextField
                                fullWidth
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                size="small"
                                slotProps={{ htmlInput: { 'aria-label': 'City' } }}
                            />
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                                State
                            </Typography>
                            <TextField
                                fullWidth
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                size="small"
                                slotProps={{ htmlInput: { 'aria-label': 'State' } }}
                            />
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                                Zip Code
                            </Typography>
                            <TextField
                                fullWidth
                                name="zip_code"
                                value={formData.zip_code}
                                onChange={handleInputChange}
                                size="small"
                                slotProps={{ htmlInput: { 'aria-label': 'Zip Code' } }}
                            />
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Divider />

            {/* Emergency Contact Section */}
            <Box>
                <Typography variant="h6" sx={{ marginBottom: '1rem', fontWeight: 'bold', color: '#863bff' }}>
                    Emergency Contact
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <Box>
                        <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                            Contact Name
                        </Typography>
                        <TextField
                            fullWidth
                            name="emergency_contact_name"
                            value={formData.emergency_contact_name}
                            onChange={handleInputChange}
                            size="small"
                            slotProps={{ htmlInput: { 'aria-label': 'Contact Name' } }}
                        />
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                            Contact Phone
                        </Typography>
                        <TextField
                            fullWidth
                            name="emergency_contact_phone"
                            value={formData.emergency_contact_phone}
                            onChange={handleInputChange}
                            size="small"
                            type="tel"
                            slotProps={{ htmlInput: { 'aria-label': 'Contact Phone' } }}
                        />
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                            Relationship
                        </Typography>
                        <TextField
                            fullWidth
                            name="emergency_contact_relation"
                            value={formData.emergency_contact_relation}
                            onChange={handleInputChange}
                            size="small"
                            slotProps={{ htmlInput: { 'aria-label': 'Relationship' } }}
                        />
                    </Box>
                </Box>
            </Box>

            <Divider />

            {/* Health Information Section */}
            <Box>
                <Typography variant="h6" sx={{ marginBottom: '1rem', fontWeight: 'bold', color: '#863bff' }}>
                    Health Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <Box>
                        <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                            Allergies (comma-separated)
                        </Typography>
                        <TextField
                            fullWidth
                            name="allergies"
                            value={formData.allergies}
                            onChange={handleInputChange}
                            size="small"
                            multiline
                            rows={2}
                            placeholder="e.g., Penicillin, Peanuts"
                            slotProps={{ htmlInput: { 'aria-label': 'Allergies' } }}
                        />
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                            Current Medications (comma-separated)
                        </Typography>
                        <TextField
                            fullWidth
                            name="current_medications"
                            value={formData.current_medications}
                            onChange={handleInputChange}
                            size="small"
                            multiline
                            rows={2}
                            placeholder="e.g., Aspirin, Metformin"
                            slotProps={{ htmlInput: { 'aria-label': 'Current Medications' } }}
                        />
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                            Medical Conditions (comma-separated)
                        </Typography>
                        <TextField
                            fullWidth
                            name="medical_conditions"
                            value={formData.medical_conditions}
                            onChange={handleInputChange}
                            size="small"
                            multiline
                            rows={2}
                            placeholder="e.g., Diabetes, Hypertension"
                            slotProps={{ htmlInput: { 'aria-label': 'Medical Conditions' } }}
                        />
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Box>
                            <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                                Diagnosis Date
                            </Typography>
                            <TextField
                                fullWidth
                                name="diagnosis_date"
                                value={formData.diagnosis_date}
                                onChange={handleInputChange}
                                size="small"
                                type="date"
                                InputLabelProps={{ shrink: true }}
                                slotProps={{ htmlInput: { 'aria-label': 'Diagnosis Date' } }}
                            />
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                                Disease Stage
                            </Typography>
                            <TextField
                                fullWidth
                                name="disease_stage"
                                value={formData.disease_stage}
                                onChange={handleInputChange}
                                size="small"
                                slotProps={{ htmlInput: { 'aria-label': 'Disease Stage' } }}
                            />
                        </Box>
                    </Box>

                    <Box>
                        <Typography variant="subtitle2" sx={{ color: '#666', marginBottom: '0.5rem' }}>
                            Notes
                        </Typography>
                        <TextField
                            fullWidth
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            size="small"
                            multiline
                            rows={3}
                            slotProps={{ htmlInput: { 'aria-label': 'Notes' } }}
                        />
                    </Box>
                </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem' }}>
                <Button
                    variant="outlined"
                    onClick={handleCancel}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                >
                    Save Changes
                </Button>
            </Box>
        </Box>
    );
};

export default EditProfile;

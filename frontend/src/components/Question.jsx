import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

export default function Question({ question, options = [], value, onChange, freeText = false }) {
    return (
        <Box
            sx={{
                border: '1px solid #e5e4e7',
                borderRadius: '12px',
                padding: '1.5rem',
                backgroundColor: '#fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
        >
            <FormControl fullWidth>
                <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, marginBottom: '0.75rem' }}
                >
                    {question}
                </Typography>

                {freeText ? (
                    <TextField
                        multiline
                        minRows={2}
                        placeholder="Describe any new symptoms or concerns..."
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        size="small"
                    />
                ) : (
                    <RadioGroup
                        row
                        value={String(value ?? '')}
                        onChange={(e) => onChange(e.target.value)}
                    >
                        {options.map((option) => (
                            <FormControlLabel
                                key={option.value}
                                value={String(option.value)}
                                label={option.label}
                                sx={{
                                    marginRight: '1rem',
                                    '& .MuiFormControlLabel-label': {
                                        color: '#1e293b',
                                    },
                                }}
                                control={
                                    <Radio
                                        color="secondary"
                                        sx={{
                                            '&.Mui-checked': {
                                                color: '#6366f1',
                                            },
                                        }}
                                    />
                                }
                            />
                        ))}
                    </RadioGroup>
                )}
            </FormControl>
        </Box>
    );
}

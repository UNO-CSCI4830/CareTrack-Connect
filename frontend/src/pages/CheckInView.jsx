import { useState, useEffect } from "react";
import NavigationDrawer from "../components/NavigationDrawer";
import Question from "../components/Question";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { UserAuth } from "../components/auth/AuthContext";
import CheckInService from "../services/checkInService";

// Build radio options from DB scale fields
// e.g. scale 0–4 with labels "None" / "Very severe" → [0,1,2,3,4] with endpoint labels
const buildOptions = (q) => {
    const options = [];
    for (let i = q.scale_min; i <= q.scale_max; i++) {
        let label = String(i);
        if (i === q.scale_min && q.scale_min_label) label = `${i} – ${q.scale_min_label}`;
        else if (i === q.scale_max && q.scale_max_label) label = `${i} – ${q.scale_max_label}`;
        options.push({ value: i, label });
    }
    return options;
};

// Split flat questions array into pages: 4, 3, 3
const paginateQuestions = (questions) => [
    questions.slice(0, 4),
    questions.slice(4, 7),
    questions.slice(7, 11),
];

const stepLabels = ["Part 1", "Part 2", "Part 3"];

const CheckInView = () => {
    const { session } = UserAuth();
    const [questions, setQuestions] = useState([]);
    const [pages, setPages] = useState([[], [], []]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [answers, setAnswers] = useState({});
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    useEffect(() => {
        CheckInService.getActiveQuestions()
            .then((data) => {
                const qs = data.data ?? data;
                setQuestions(qs);
                setPages(paginateQuestions(qs));
            })
            .catch((err) => {
                console.error(err);
                setSnackbar({ open: true, message: "Failed to load questions.", severity: "error" });
            })
            .finally(() => setLoading(false));
    }, []);

    const handleAnswer = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const currentPageQuestions = pages[currentPage] ?? [];

    const isAnswered = (q) => answers[q.id] !== undefined && answers[q.id] !== "";

    const isCurrentPageComplete = currentPageQuestions.every(isAnswered);

    const isAllComplete = questions.length > 0 && questions.every(isAnswered);

    const handleSave = () => {
        setSnackbar({ open: true, message: "Progress saved!", severity: "info" });
    };

    const handleSubmit = async () => {
        if (!isAllComplete) return;

        const patientId = session?.user?.id;
        if (!patientId) {
            setSnackbar({ open: true, message: "You must be logged in to submit.", severity: "error" });
            return;
        }

        setSubmitting(true);
        try {
            const checkIn = await CheckInService.createCheckIn(patientId);
            const checkInId = checkIn.data?.id ?? checkIn.id;

            const responses = questions.map(q => ({
                question_id: q.id,
                response_value: answers[q.id],
            }));

            await CheckInService.submitResponses(checkInId, responses);
            setSnackbar({ open: true, message: "Check-in submitted successfully!", severity: "success" });
        } catch (err) {
            console.error(err);
            setSnackbar({ open: true, message: err.message || "Submission failed.", severity: "error" });
        } finally {
            setSubmitting(false);
        }
    };

    const handleNext = () => {
        if (currentPage < pages.length - 1) setCurrentPage(p => p + 1);
    };

    const handleBack = () => {
        if (currentPage > 0) setCurrentPage(p => p - 1);
    };

    if (loading) {
        return (
            <>
                <NavigationDrawer />
                <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
                    <CircularProgress />
                </Box>
            </>
        );
    }

    return (
        <>
            <NavigationDrawer />
            <Box sx={{ maxWidth: '700px', margin: '2rem auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Daily Check-In
                </Typography>

                <Stepper activeStep={currentPage} alternativeLabel>
                    {stepLabels.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {currentPageQuestions.map((q) => (
                        <Question
                            key={q.id}
                            question={q.question_text}
                            options={q.question_type === 'scale' ? buildOptions(q) : []}
                            freeText={q.question_type === 'free_text'}
                            value={answers[q.id] ?? ""}
                            onChange={(val) => handleAnswer(q.id, val)}
                        />
                    ))}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <Button
                        variant="outlined"
                        onClick={handleBack}
                        disabled={currentPage === 0}
                    >
                        Back
                    </Button>

                    <Button variant="text" onClick={handleSave}>
                        Save Progress
                    </Button>

                    {currentPage < pages.length - 1 ? (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            disabled={!isCurrentPageComplete}
                        >
                            Next
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleSubmit}
                            disabled={!isAllComplete || submitting}
                        >
                            {submitting ? <CircularProgress size={20} color="inherit" /> : "Submit"}
                        </Button>
                    )}
                </Box>

                {currentPage === pages.length - 1 && !isAllComplete && (
                    <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                        Please answer all questions across all pages before submitting.
                    </Typography>
                )}
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
                    {snackbar.message}
                </Alert>
        </Snackbar>
        </>
    );
};

export default CheckInView;

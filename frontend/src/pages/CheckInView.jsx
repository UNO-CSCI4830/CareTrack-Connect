import { useState, useEffect } from "react";
import NavigationDrawer from "../components/NavigationDrawer";
import Question from "../components/Question";
import { UserAuth } from "../components/auth/AuthContext";
import CheckInService from "../services/checkInService";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";

const stepLabels = ["Part 1", "Part 2", "Part 3"];

const buildOptions = (q) => {
  const options = [];

  for (let i = q.scale_min; i <= q.scale_max; i++) {
    let label = String(i);

    if (i === q.scale_min && q.scale_min_label) {
      label = `${i} – ${q.scale_min_label}`;
    } else if (i === q.scale_max && q.scale_max_label) {
      label = `${i} – ${q.scale_max_label}`;
    }

    options.push({
      value: i,
      label,
    });
  }

  return options;
};

const paginateQuestions = (questions) => [
  questions.slice(0, 4),
  questions.slice(4, 7),
  questions.slice(7, 11),
];

const CheckInView = () => {
  const { session, profile } = UserAuth();

  const [questions, setQuestions] = useState([]);
  const [pages, setPages] = useState([[], [], []]);
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await CheckInService.getActiveQuestions();
        const questionList = data.data ?? data;

        setQuestions(questionList);
        setPages(paginateQuestions(questionList));
      } catch (error) {
        console.error(error);
        setSnackbar({
          open: true,
          message: "Failed to load questions.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  const handleAnswer = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const currentQuestions = pages[currentPage] ?? [];

  const isAnswered = (q) =>
    answers[q.id] !== undefined && answers[q.id] !== "";

  const isCurrentPageComplete = currentQuestions.every(isAnswered);
  const isAllComplete =
    questions.length > 0 && questions.every(isAnswered);

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleSave = () => {
    setSnackbar({
      open: true,
      message: "Progress saved!",
      severity: "info",
    });
  };

  const handleSubmit = async () => {
    if (!isAllComplete) return;

    const patientId = profile?.id;

    if (!patientId) {
      setSnackbar({
        open: true,
        message: "You must be logged in to submit.",
        severity: "error",
      });
      return;
    }

    setSubmitting(true);

    try {
      const checkIn = await CheckInService.createCheckIn(patientId);
      const checkInId = checkIn.data?.id ?? checkIn.id;

      const responses = questions.map((q) => ({
        question_id: q.id,
        numeric_value: q.question_type === "scale" ? answers[q.id] : null,
        text_value: q.question_type === "free_text" ? answers[q.id] : null,
      }));

      await CheckInService.submitResponses(checkInId, responses);

      setSnackbar({
        open: true,
        message: "Check-in submitted successfully!",
        severity: "success",
      });
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: error.message || "Submission failed.",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <NavigationDrawer />
        <Box
          sx={{
            minHeight: "60vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress sx={{ color: "#6366f1" }} />
        </Box>
      </>
    );
  }

  return (
    <>
      <NavigationDrawer />

      <Box
        sx={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "2rem",
        }}
      >
        <Box sx={{ marginBottom: "1.5rem", textAlign: "center" }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "#1e293b",
              marginBottom: "0.4rem",
            }}
          >
            Daily Check-In
          </Typography>

          <Typography sx={{ color: "#64748b" }}>
            Complete each section before submitting today’s check-in.
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            padding: "2rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          <Stepper
            activeStep={currentPage}
            alternativeLabel
            sx={{
              maxWidth: "550px",
              margin: "0 auto 2rem",
              "& .MuiStepLabel-label": {
                marginTop: "0.4rem",
              },
              "& .MuiStepLabel-label.Mui-active": {
                color: "#6366f1",
                fontWeight: 700,
              },
              "& .MuiStepLabel-label.Mui-completed": {
                color: "#4f46e5",
                fontWeight: 600,
              },
              "& .MuiStepIcon-root.Mui-active": {
                color: "#6366f1",
              },
              "& .MuiStepIcon-root.Mui-completed": {
                color: "#4f46e5",
              },
            }}
          >
            {stepLabels.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {currentQuestions.map((q) => (
              <Paper
                key={q.id}
                elevation={0}
                sx={{
                  padding: "1.5rem",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#f8fafc",
                  transition: "0.2s ease",
                  "&:hover": {
                    backgroundColor: "#ffffff",
                    borderColor: "#c7d2fe",
                  },
                }}
              >
                <Question
                  question={q.question_text}
                  options={q.question_type === "scale" ? buildOptions(q) : []}
                  freeText={q.question_type === "free_text"}
                  value={answers[q.id] ?? ""}
                  onChange={(value) => handleAnswer(q.id, value)}
                />
              </Paper>
            ))}
          </Box>

          <Box
            sx={{
              marginTop: "2rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.75rem",
            }}
          >
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={currentPage === 0}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                borderColor: "#cbd5e1",
                color: "#334155",
              }}
            >
              Back
            </Button>

            <Button
              variant="text"
              onClick={handleSave}
              sx={{
                textTransform: "none",
                color: "#6366f1",
                fontWeight: 600,
              }}
            >
              Save Progress
            </Button>

            {currentPage < pages.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!isCurrentPageComplete}
                sx={{
                  backgroundColor: "#6366f1",
                  borderRadius: "12px",
                  padding: "12px 28px",
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "#4f46e5",
                    boxShadow: "0 8px 18px rgba(99, 102, 241, 0.25)",
                  },
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!isAllComplete || submitting}
                sx={{
                  backgroundColor: "#6366f1",
                  borderRadius: "12px",
                  padding: "12px 28px",
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "#4f46e5",
                    boxShadow: "0 8px 18px rgba(99, 102, 241, 0.25)",
                  },
                }}
              >
                {submitting ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Submit"
                )}
              </Button>
            )}
          </Box>

          {currentPage === pages.length - 1 && !isAllComplete && (
            <Typography
              variant="body2"
              sx={{
                textAlign: "center",
                color: "#64748b",
                marginTop: "1rem",
              }}
            >
              Please answer all questions before submitting.
            </Typography>
          )}
        </Paper>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() =>
          setSnackbar((prev) => ({
            ...prev,
            open: false,
          }))
        }
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() =>
            setSnackbar((prev) => ({
              ...prev,
              open: false,
            }))
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CheckInView;

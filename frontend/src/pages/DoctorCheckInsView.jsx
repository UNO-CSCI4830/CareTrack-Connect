import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Collapse,
  LinearProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { UserAuth } from "../components/auth/AuthContext";
import CheckInService from "../services/checkInService";

const getStatus = (checkIn) => {
  if (checkIn.status === "complete") {
    const responses = checkIn.check_in_responses || [];
    const total = responses.reduce((sum, r) => sum + (r.numeric_value || 0), 0);
    if (total >= 25) return "Critical";
    return "Stable";
  }
  if (checkIn.status === "in_progress") return "Pending";
  return "Pending";
};

const getSummary = (checkIn) => {
  const responses = checkIn.check_in_responses || [];
  if (responses.length === 0) return "No responses submitted";

  const high = responses
    .filter((r) => r.numeric_value != null && r.numeric_value >= 3)
    .map((r) => r.question?.question_text)
    .filter(Boolean);

  const freeText = responses.find((r) => r.question?.question_type === "free_text");

  if (high.length > 0) {
    return `High: ${high.join(", ")}`;
  }
  if (freeText?.text_value) {
    return freeText.text_value;
  }
  return "No notable symptoms";
};

const statusColors = { Critical: "error", Stable: "success", Pending: "warning" };

const DoctorCheckInsView = () => {
  const navigate = useNavigate();
  const { profile } = UserAuth();
  const [checkIns, setCheckIns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState("All Patients");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchCheckIns = async () => {
      if (!profile?.id) return;
      try {
        setLoading(true);
        const result = await CheckInService.getCheckInsForProvider(profile.id);
        setCheckIns(result.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCheckIns();
  }, [profile?.id]);

  const patientNames = [
    ...new Set(
      checkIns.map(
        (c) =>
          c.patient
            ? `${c.patient.first_name} ${c.patient.last_name}`
            : "Unknown"
      )
    ),
  ];
  const patients = ["All Patients", ...patientNames];

  const filtered =
    selectedPatient === "All Patients"
      ? checkIns
      : checkIns.filter(
          (c) =>
            c.patient &&
            `${c.patient.first_name} ${c.patient.last_name}` === selectedPatient
        );

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, md: 3 } }}>
      <Button
        onClick={() => navigate("/doctor")}
        sx={{ textTransform: "none", color: "#185FA5", mb: 2, pl: 0 }}
      >
        &larr; Back to Dashboard
      </Button>

      <Typography variant="h5" fontWeight={600} gutterBottom>
        Patient Check-Ins
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        View and filter all submitted check-ins across your patients.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TextField
            select
            label="Filter by patient"
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            size="small"
            sx={{ minWidth: 220, mb: 3 }}
          >
            {patients.map((p) => (
              <MenuItem key={p} value={p}>
                {p}
              </MenuItem>
            ))}
          </TextField>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {filtered.map((checkIn) => {
              const status = getStatus(checkIn);
              const isExpanded = expandedId === checkIn.id;
              const patientName = checkIn.patient
                ? `${checkIn.patient.first_name} ${checkIn.patient.last_name}`
                : "Unknown";
              const responses = checkIn.check_in_responses || [];
              const scaleResponses = responses.filter(
                (r) => r.question?.question_type === "scale"
              );
              const freeTextResponses = responses.filter(
                (r) => r.question?.question_type === "free_text"
              );
              const totalScore = scaleResponses.reduce(
                (sum, r) => sum + (r.numeric_value || 0),
                0
              );
              const maxScore = scaleResponses.length * 4;

              return (
                <Box
                  key={checkIn.id}
                  sx={{
                    border: "0.5px solid",
                    borderColor: isExpanded ? "primary.main" : "divider",
                    borderRadius: "12px",
                    backgroundColor: "background.paper",
                    overflow: "hidden",
                    transition: "border-color 0.2s",
                  }}
                >
                  <Box
                    onClick={() =>
                      setExpandedId(isExpanded ? null : checkIn.id)
                    }
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 2,
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "action.hover" },
                    }}
                  >
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        {patientName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {checkIn.check_in_date}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        {getSummary(checkIn)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Chip
                        label={status}
                        color={statusColors[status]}
                        size="small"
                        sx={{ borderRadius: "8px", fontWeight: 500 }}
                      />
                      {isExpanded ? (
                        <ExpandLessIcon color="action" />
                      ) : (
                        <ExpandMoreIcon color="action" />
                      )}
                    </Box>
                  </Box>

                  <Collapse in={isExpanded}>
                    <Divider />
                    <Box sx={{ p: 2 }}>
                      {responses.length === 0 ? (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          No responses recorded for this check-in.
                        </Typography>
                      ) : (
                        <>
                          {maxScore > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  mb: 0.5,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                >
                                  Overall Symptom Score
                                </Typography>
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                >
                                  {totalScore} / {maxScore}
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={(totalScore / maxScore) * 100}
                                color={
                                  totalScore >= 25
                                    ? "error"
                                    : totalScore >= 15
                                    ? "warning"
                                    : "success"
                                }
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                }}
                              />
                            </Box>
                          )}

                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 1.5,
                            }}
                          >
                            {scaleResponses.map((r) => (
                              <Box key={r.question?.question_text}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    mb: 0.25,
                                  }}
                                >
                                  <Typography variant="body2">
                                    {r.question?.question_text}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    fontWeight={600}
                                    color={
                                      r.numeric_value >= 3
                                        ? "error.main"
                                        : "text.primary"
                                    }
                                  >
                                    {r.numeric_value} / 4
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={(r.numeric_value / 4) * 100}
                                  color={
                                    r.numeric_value >= 3
                                      ? "error"
                                      : r.numeric_value >= 2
                                      ? "warning"
                                      : "success"
                                  }
                                  sx={{
                                    height: 6,
                                    borderRadius: 3,
                                  }}
                                />
                              </Box>
                            ))}

                            {freeTextResponses.map((r) => (
                              <Box
                                key={r.question?.question_text}
                                sx={{
                                  mt: 1,
                                  p: 1.5,
                                  backgroundColor: "grey.50",
                                  borderRadius: "8px",
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  sx={{ mb: 0.5 }}
                                >
                                  {r.question?.question_text}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ fontStyle: r.text_value ? "normal" : "italic" }}
                                >
                                  {r.text_value || "No response provided"}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </>
                      )}
                    </Box>
                  </Collapse>
                </Box>
              );
            })}
            {filtered.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No check-ins found.
              </Typography>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default DoctorCheckInsView;

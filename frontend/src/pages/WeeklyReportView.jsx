import { useMemo } from "react";
import NavigationDrawer from "../components/NavigationDrawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import DownloadIcon from "@mui/icons-material/Download";

const weeklyCheckIns = [
  {
    date: "Apr 21",
    completed: true,
    tremor: 3,
    stiffness: 2,
    sleepHours: 7,
    medication: "Taken",
    note: "Mild hand tremor after lunch.",
  },
  {
    date: "Apr 22",
    completed: true,
    tremor: 4,
    stiffness: 3,
    sleepHours: 6,
    medication: "Taken",
    note: "Stiffness in the morning improved after stretching.",
  },
  {
    date: "Apr 23",
    completed: true,
    tremor: 2,
    stiffness: 2,
    sleepHours: 8,
    medication: "Taken",
    note: "Symptoms felt manageable.",
  },
  {
    date: "Apr 24",
    completed: false,
    tremor: null,
    stiffness: null,
    sleepHours: null,
    medication: "Missed check-in",
    note: "No check-in submitted.",
  },
  {
    date: "Apr 25",
    completed: true,
    tremor: 5,
    stiffness: 4,
    sleepHours: 5,
    medication: "Taken late",
    note: "Higher tremor during evening tasks.",
  },
  {
    date: "Apr 26",
    completed: true,
    tremor: 3,
    stiffness: 2,
    sleepHours: 7,
    medication: "Taken",
    note: "Better mobility than yesterday.",
  },
  {
    date: "Apr 27",
    completed: true,
    tremor: 2,
    stiffness: 2,
    sleepHours: 7,
    medication: "Taken",
    note: "Stable symptoms today.",
  },
];

const doctorComment =
  "Your check-ins show one symptom spike on Apr 25, but the last two days look more stable. Continue taking medication on schedule and note any evening tremor changes. If tremor or stiffness rises again for two days in a row, please schedule a follow-up.";

const average = (values) => {
  const validValues = values.filter((value) => value !== null && value !== undefined);
  if (validValues.length === 0) return 0;
  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
};

const formatAverage = (value) => value.toFixed(1);

const getSeverity = (score) => {
  if (score === null || score === undefined) return "default";
  if (score >= 4) return "error";
  if (score >= 3) return "warning";
  return "success";
};

export default function WeeklyReportView() {
  const summary = useMemo(() => {
    const completedDays = weeklyCheckIns.filter((checkIn) => checkIn.completed);
    const averageTremor = average(completedDays.map((checkIn) => checkIn.tremor));
    const averageStiffness = average(completedDays.map((checkIn) => checkIn.stiffness));
    const averageSleep = average(completedDays.map((checkIn) => checkIn.sleepHours));
    const medicationTaken = completedDays.filter(
      (checkIn) => checkIn.medication === "Taken"
    ).length;

    return {
      completedCount: completedDays.length,
      averageTremor,
      averageStiffness,
      averageSleep,
      medicationAdherence: Math.round((medicationTaken / weeklyCheckIns.length) * 100),
    };
  }, []);

  const handleDownloadPdf = () => {
    window.print();
  };

  return (
    <>
      <NavigationDrawer />
      <Box
        sx={{
          maxWidth: 980,
          mx: "auto",
          p: { xs: 2, md: 3 },
          "@media print": {
            maxWidth: "none",
            p: 0,
          },
        }}
      >
        <style>
          {`
            @media print {
              nav, header, .MuiAppBar-root, .download-action {
                display: none !important;
              }
              body {
                background: white !important;
              }
            }
          `}
        </style>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: "#1e293b" }}>
              Weekly Report
            </Typography>
            <Typography color="text.secondary">
              Last 7 days of check-ins: Apr 21 - Apr 27, 2026
            </Typography>
          </Box>

          <Button
            className="download-action"
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadPdf}
            sx={{
              backgroundColor: "#185FA5",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: "10px",
              boxShadow: "none",
              "&:hover": { backgroundColor: "#0C447C", boxShadow: "none" },
            }}
          >
            Download as PDF
          </Button>
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
          <Paper variant="outlined" sx={{ p: 2, flex: 1, borderRadius: "8px" }}>
            <Typography variant="body2" color="text.secondary">
              Completed Check-ins
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {summary.completedCount} / 7
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, flex: 1, borderRadius: "8px" }}>
            <Typography variant="body2" color="text.secondary">
              Avg. Tremor
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {formatAverage(summary.averageTremor)} / 5
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, flex: 1, borderRadius: "8px" }}>
            <Typography variant="body2" color="text.secondary">
              Avg. Sleep
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {formatAverage(summary.averageSleep)} hrs
            </Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, flex: 1, borderRadius: "8px" }}>
            <Typography variant="body2" color="text.secondary">
              Medication On Time
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {summary.medicationAdherence}%
            </Typography>
          </Paper>
        </Stack>

        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: "8px" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Symptom Summary
          </Typography>

          <Stack spacing={2}>
            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                <Typography variant="body2" fontWeight={600}>
                  Tremor average
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formatAverage(summary.averageTremor)} / 5
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={(summary.averageTremor / 5) * 100}
                color={getSeverity(summary.averageTremor)}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            <Box>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                <Typography variant="body2" fontWeight={600}>
                  Stiffness average
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formatAverage(summary.averageStiffness)} / 5
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={(summary.averageStiffness / 5) * 100}
                color={getSeverity(summary.averageStiffness)}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: "8px" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Daily Check-ins
          </Typography>

          <Stack divider={<Divider />} spacing={0}>
            {weeklyCheckIns.map((checkIn) => (
              <Box
                key={checkIn.date}
                sx={{
                  py: 1.75,
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "110px 1fr auto" },
                  gap: 1.5,
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography fontWeight={700}>{checkIn.date}</Typography>
                  <Chip
                    size="small"
                    label={checkIn.completed ? "Submitted" : "Missing"}
                    color={checkIn.completed ? "success" : "default"}
                    sx={{ mt: 0.5, borderRadius: "8px" }}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {checkIn.note}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Medication: {checkIn.medication}
                    {checkIn.sleepHours ? ` | Sleep: ${checkIn.sleepHours} hrs` : ""}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Chip
                    size="small"
                    label={`Tremor ${checkIn.tremor ?? "-"}`}
                    color={getSeverity(checkIn.tremor)}
                    sx={{ borderRadius: "8px" }}
                  />
                  <Chip
                    size="small"
                    label={`Stiffness ${checkIn.stiffness ?? "-"}`}
                    color={getSeverity(checkIn.stiffness)}
                    sx={{ borderRadius: "8px" }}
                  />
                </Stack>
              </Box>
            ))}
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: "8px" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Doctor's Comment
          </Typography>
          <Typography color="text.secondary">{doctorComment}</Typography>
        </Paper>
      </Box>
    </>
  );
}

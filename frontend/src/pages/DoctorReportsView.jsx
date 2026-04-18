import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Chip, Divider } from "@mui/material";

const mockReports = [
  { id: 1, patient: "Alice Johnson", period: "Apr 7 – Apr 13", generated: "2026-04-14", trend: "Worsening" },
  { id: 2, patient: "Bob Smith",     period: "Apr 7 – Apr 13", generated: "2026-04-14", trend: "Stable" },
  { id: 3, patient: "Carol White",   period: "Apr 7 – Apr 13", generated: "2026-04-14", trend: "Improving" },
];

const trendColors = { Worsening: "error", Stable: "warning", Improving: "success" };

const DoctorReportsView = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, md: 3 } }}>
      <Button
        onClick={() => navigate("/doctor")}
        sx={{ textTransform: "none", color: "#185FA5", mb: 2, pl: 0 }}
      >
        ← Back to Dashboard
      </Button>

      <Typography variant="h5" fontWeight={600} gutterBottom>
        Patient Reports
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Weekly summaries for all your patients.
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {mockReports.map((report) => (
          <Box
            key={report.id}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: "0.5px solid",
              borderColor: "divider",
              borderRadius: "12px",
              p: 2,
              backgroundColor: "background.paper",
            }}
          >
            <Box>
              <Typography variant="body1" fontWeight={500}>{report.patient}</Typography>
              <Typography variant="body2" color="text.secondary">
                Period: {report.period}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Generated: {report.generated}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Chip
                label={report.trend}
                color={trendColors[report.trend]}
                size="small"
                sx={{ borderRadius: "8px", fontWeight: 500 }}
              />
              <Button
                size="small"
                variant="contained"
                sx={{
                  backgroundColor: "#185FA5",
                  color: "#E6F1FB",
                  borderRadius: "8px",
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": { backgroundColor: "#0C447C" },
                }}
              >
                View Report
              </Button>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default DoctorReportsView;

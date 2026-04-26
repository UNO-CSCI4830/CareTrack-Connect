import { useState, useEffect } from "react";
import NavigationDrawer from "../components/NavigationDrawer";
import { UserAuth } from "../components/auth/AuthContext";
import ProfileService from "../services/profileService";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const API = "http://localhost:4000/api";

export default function DoctorPatientsView() {
  const { session } = UserAuth();
  const [profile, setProfile] = useState(null);
  const [links, setLinks] = useState([]);
  const [patients, setPatients] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedProviderId, setSelectedProviderId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (!session?.user?.id) return;
    (async () => {
      const me = await ProfileService.getProfileByAuthUserId(session.user.id);
      const myProfile = me.data || me;
      setProfile(myProfile);
      setSelectedProviderId(myProfile.id);
    })();
  }, [session]);

  async function refresh() {
    if (!profile) return;
    const [linksRes, patientsRes, providersRes] = await Promise.all([
      fetch(`${API}/provider-patients/provider/${profile.id}`).then((r) => r.json()),
      fetch(`${API}/profiles/role/patient`).then((r) => r.json()),
      fetch(`${API}/profiles/role/provider`).then((r) => r.json()),
    ]);
    setLinks(linksRes.data || []);
    setPatients(patientsRes.data || []);
    setProviders(providersRes.data || []);
  }

  useEffect(() => { if (profile) refresh(); }, [profile]);

  const patientName = (id) => {
    const p = patients.find((x) => x.id === id);
    return p ? `${p.first_name} ${p.last_name}` : id;
  };
  const providerName = (id) => {
    const p = providers.find((x) => x.id === id);
    return p ? `${p.first_name} ${p.last_name}` : id;
  };

  const onAssign = async () => {
    if (!selectedPatientId || !selectedProviderId) {
      setSnack({ open: true, message: "Pick a patient and provider", severity: "warning" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/provider-patients`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_id: selectedProviderId,
          patient_id: selectedPatientId,
          status: "active",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to assign");
      setSnack({ open: true, message: "Patient linked", severity: "success" });
      setSelectedPatientId("");
      refresh();
    } catch (e) {
      setSnack({ open: true, message: e.message, severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const onRemove = async (linkId) => {
    if (!confirm("Remove this link?")) return;
    try {
      const res = await fetch(`${API}/provider-patients/${linkId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to remove");
      setSnack({ open: true, message: "Link removed", severity: "success" });
      refresh();
    } catch (e) {
      setSnack({ open: true, message: e.message, severity: "error" });
    }
  };

  const activeLinks = links.filter((l) => l.status === "active");
  const inactiveLinks = links.filter((l) => l.status !== "active");

  const renderLinkRow = (l) => (
    <Paper key={l.id} sx={{ p: 2, mb: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography fontWeight="bold">{patientName(l.patient_id)}</Typography>
          <Typography variant="body2" color="text.secondary">
            Provider: {l.provider_id === profile?.id ? "You" : providerName(l.provider_id)} · Status: {l.status}
          </Typography>
        </Box>
        <Button size="small" color="error" onClick={() => onRemove(l.id)}>Remove</Button>
      </Stack>
    </Paper>
  );

  return (
    <Box>
      <NavigationDrawer />
      <Box sx={{ p: 4, maxWidth: 720, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>Patients</Typography>

        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Link a patient</Typography>
          <Stack spacing={2}>
            <TextField
              select
              fullWidth
              label="Patient"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
            >
              {patients.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.first_name} {p.last_name} — {p.email}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label="Provider"
              value={selectedProviderId}
              onChange={(e) => setSelectedProviderId(e.target.value)}
              helperText="Defaults to you. Pick another provider to assign the patient to them."
            >
              {providers.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.id === profile?.id ? "Myself — " : ""}{p.first_name} {p.last_name} ({p.email})
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              onClick={onAssign}
              disabled={submitting || !selectedPatientId || !selectedProviderId}
            >
              {submitting ? "Linking…" : "Link patient"}
            </Button>
          </Stack>
        </Paper>

        <Typography variant="h6">My assignments</Typography>
        {activeLinks.length === 0 ? (
          <Typography color="text.secondary">No active links yet.</Typography>
        ) : activeLinks.map(renderLinkRow)}

        {inactiveLinks.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6">Inactive</Typography>
            {inactiveLinks.map(renderLinkRow)}
          </>
        )}
      </Box>

      <Snackbar open={snack.open} autoHideDuration={5000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}

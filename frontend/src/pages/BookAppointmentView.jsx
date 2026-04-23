import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DateTime } from "luxon";
import NavigationDrawer from "../components/NavigationDrawer";
import { UserAuth } from "../components/auth/AuthContext";
import AppointmentService from "../services/appointmentService";
import ProfileService from "../services/profileService";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

const API = "http://localhost:4000/api";

export default function BookAppointmentView() {
  const { session } = UserAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [providers, setProviders] = useState([]);
  const [providerId, setProviderId] = useState("");
  const [date, setDate] = useState(DateTime.local().toISODate());
  const [slots, setSlots] = useState([]);
  const [chosenSlot, setChosenSlot] = useState(null);
  const [reason, setReason] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const maxDate = useMemo(() => DateTime.local().plus({ days: 60 }).toISODate(), []);

  useEffect(() => {
    if (!session?.user?.id) return;
    (async () => {
      try {
        const me = await ProfileService.getProfileByAuthUserId(session.user.id);
        const myProfile = me.data || me;
        setProfile(myProfile);
        const res = await fetch(`${API}/provider-patients/patient/${myProfile.id}`);
        const json = await res.json();
        const active = (json.data || []).filter((r) => r.status === "active");
        setProviders(active);
        if (active.length === 1) setProviderId(active[0].provider_id);
      } catch (e) {
        setSnack({ open: true, message: e.message, severity: "error" });
      }
    })();
  }, [session]);

  useEffect(() => {
    if (!providerId || !date) { setSlots([]); return; }
    setLoadingSlots(true);
    setChosenSlot(null);
    AppointmentService.getAvailability(providerId, date, date)
      .then((res) => setSlots(res.data || []))
      .catch((e) => setSnack({ open: true, message: e.message, severity: "error" }))
      .finally(() => setLoadingSlots(false));
  }, [providerId, date]);

  const onConfirm = async () => {
    if (!profile || !providerId || !chosenSlot) return;
    setSubmitting(true);
    try {
      await AppointmentService.book({
        provider_id: providerId,
        patient_id: profile.id,
        start_at: chosenSlot.start_at,
        reason: reason || undefined,
      });
      setSnack({ open: true, message: "Appointment booked", severity: "success" });
      navigate("/my-appointments");
    } catch (e) {
      if (e.status === 409) {
        setSnack({ open: true, message: e.message, severity: "warning" });
        AppointmentService.getAvailability(providerId, date, date)
          .then((res) => setSlots(res.data || []));
      } else {
        setSnack({ open: true, message: e.message, severity: "error" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <NavigationDrawer />
      <Box sx={{ p: 4, maxWidth: 720, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>Book an appointment</Typography>

        {providers.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            You don't have a provider linked yet. Contact your clinic to get set up.
          </Alert>
        ) : (
          <>
            <TextField
              select
              fullWidth
              label="Provider"
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
              sx={{ mb: 2 }}
            >
              {providers.map((p) => (
                <MenuItem key={p.provider_id} value={p.provider_id}>
                  {p.provider_id}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              type="date"
              label="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: DateTime.local().toISODate(), max: maxDate }}
              sx={{ mb: 2 }}
            />

            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Available times</Typography>
            {loadingSlots ? (
              <CircularProgress size={24} />
            ) : slots.length === 0 ? (
              <Typography color="text.secondary">No availability this day.</Typography>
            ) : (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {slots.map((s) => {
                  const label = DateTime.fromISO(s.start_at).toLocal().toFormat("h:mm a");
                  const selected = chosenSlot?.start_at === s.start_at;
                  return (
                    <Chip
                      key={s.start_at}
                      label={label}
                      color={selected ? "primary" : "default"}
                      onClick={() => setChosenSlot(s)}
                      variant={selected ? "filled" : "outlined"}
                    />
                  );
                })}
              </Stack>
            )}

            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Reason for visit (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              sx={{ mt: 3 }}
            />

            <Button
              variant="contained"
              disabled={!chosenSlot || submitting}
              onClick={onConfirm}
              sx={{ mt: 3 }}
            >
              {submitting ? "Booking…" : "Confirm booking"}
            </Button>
          </>
        )}
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}

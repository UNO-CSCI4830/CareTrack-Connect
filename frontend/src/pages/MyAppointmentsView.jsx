import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DateTime } from "luxon";
import NavigationDrawer from "../components/NavigationDrawer";
import { UserAuth } from "../components/auth/AuthContext";
import AppointmentService from "../services/appointmentService";
import ProfileService from "../services/profileService";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

function fmt(iso) {
  return DateTime.fromISO(iso).toLocal().toFormat("cccc, LLL d · h:mm a");
}

export default function MyAppointmentsView() {
  const { session } = UserAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [appts, setAppts] = useState([]);
  const [rescheduling, setRescheduling] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [chosenSlot, setChosenSlot] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  async function refresh() {
    if (!profile) return;
    const res = await AppointmentService.listForPatient(profile.id);
    setAppts(res.data || []);
  }

  useEffect(() => {
    if (!session?.user?.id) return;
    (async () => {
      const me = await ProfileService.getProfileByAuthUserId(session.user.id);
      setProfile(me.data || me);
    })();
  }, [session]);

  useEffect(() => { if (profile) refresh(); }, [profile]);

  useEffect(() => {
    if (!rescheduling || !rescheduleDate) { setRescheduleSlots([]); return; }
    AppointmentService.getAvailability(rescheduling.provider_id, rescheduleDate, rescheduleDate)
      .then((res) => setRescheduleSlots(res.data || []))
      .catch((e) => setSnack({ open: true, message: e.message, severity: "error" }));
  }, [rescheduling, rescheduleDate]);

  const onCancel = async (appt) => {
    if (!confirm("Cancel this appointment?")) return;
    try {
      await AppointmentService.cancel(appt.id, profile.id);
      setSnack({ open: true, message: "Cancelled", severity: "success" });
      refresh();
    } catch (e) {
      setSnack({ open: true, message: e.message, severity: "error" });
    }
  };

  const submitReschedule = async () => {
    if (!chosenSlot) return;
    try {
      await AppointmentService.reschedule(rescheduling.id, chosenSlot.start_at);
      setSnack({ open: true, message: "Rescheduled", severity: "success" });
      setRescheduling(null);
      setChosenSlot(null);
      setRescheduleDate("");
      refresh();
    } catch (e) {
      setSnack({ open: true, message: e.message, severity: "error" });
    }
  };

  const now = DateTime.utc();
  const upcoming = appts.filter((a) => a.status === "scheduled" && DateTime.fromISO(a.start_at) >= now);
  const past = appts.filter((a) => !(a.status === "scheduled" && DateTime.fromISO(a.start_at) >= now));

  const renderRow = (a, isUpcoming) => (
    <Paper key={a.id} sx={{ p: 2, mb: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography fontWeight="bold">{fmt(a.start_at)}</Typography>
          <Typography variant="body2" color="text.secondary">
            Dr. {a.provider?.first_name} {a.provider?.last_name}
          </Typography>
          {a.reason && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>Reason: {a.reason}</Typography>
          )}
          {!isUpcoming && (
            <Chip size="small" label={a.status} sx={{ mt: 0.5 }} />
          )}
        </Box>
        {isUpcoming && (
          <Stack direction="row" spacing={1}>
            <Button size="small" onClick={() => { setRescheduling(a); setRescheduleDate(DateTime.local().toISODate()); }}>Reschedule</Button>
            <Button size="small" color="error" onClick={() => onCancel(a)}>Cancel</Button>
          </Stack>
        )}
      </Stack>
    </Paper>
  );

  return (
    <Box>
      <NavigationDrawer />
      <Box sx={{ p: 4, maxWidth: 720, mx: "auto" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h4">My appointments</Typography>
          <Button variant="contained" onClick={() => navigate("/book-appointment")}>Book new</Button>
        </Stack>

        <Typography variant="h6" sx={{ mt: 2 }}>Upcoming</Typography>
        {upcoming.length === 0 ? (
          <Typography color="text.secondary">None.</Typography>
        ) : upcoming.map((a) => renderRow(a, true))}

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6">Past</Typography>
        {past.length === 0 ? (
          <Typography color="text.secondary">None.</Typography>
        ) : past.map((a) => renderRow(a, false))}
      </Box>

      <Dialog open={!!rescheduling} onClose={() => setRescheduling(null)} fullWidth maxWidth="xs">
        <DialogTitle>Reschedule appointment</DialogTitle>
        <DialogContent>
          <TextField
            type="date"
            label="Date"
            value={rescheduleDate}
            onChange={(e) => setRescheduleDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: DateTime.local().toISODate(),
              max: DateTime.local().plus({ days: 60 }).toISODate(),
            }}
            fullWidth
            sx={{ mb: 2, mt: 1 }}
          />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {rescheduleSlots.map((s) => {
              const label = DateTime.fromISO(s.start_at).toLocal().toFormat("h:mm a");
              const selected = chosenSlot?.start_at === s.start_at;
              return (
                <Chip
                  key={s.start_at}
                  label={label}
                  color={selected ? "primary" : "default"}
                  variant={selected ? "filled" : "outlined"}
                  onClick={() => setChosenSlot(s)}
                />
              );
            })}
          </Stack>
          {rescheduleSlots.length === 0 && rescheduleDate && (
            <Typography color="text.secondary" sx={{ mt: 1 }}>No availability this day.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setRescheduling(null); setChosenSlot(null); }}>Close</Button>
          <Button variant="contained" disabled={!chosenSlot} onClick={submitReschedule}>Confirm</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={5000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}

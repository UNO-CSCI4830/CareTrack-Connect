import { useState, useEffect } from "react";
import { DateTime } from "luxon";
import NavigationDrawer from "../components/NavigationDrawer";
import { UserAuth } from "../components/auth/AuthContext";
import ProviderAvailabilityService from "../services/providerAvailabilityService";
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
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function DoctorAvailabilityView() {
  const { session } = UserAuth();
  const [profile, setProfile] = useState(null);
  const [template, setTemplate] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [addBlock, setAddBlock] = useState(null);
  const [blockStart, setBlockStart] = useState("09:00");
  const [blockEnd, setBlockEnd] = useState("17:00");
  const [addingException, setAddingException] = useState(false);
  const [exStart, setExStart] = useState("");
  const [exEnd, setExEnd] = useState("");
  const [exReason, setExReason] = useState("");
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    if (!session?.user?.id) return;
    (async () => {
      const me = await ProfileService.getProfileByAuthUserId(session.user.id);
      setProfile(me.data || me);
    })();
  }, [session]);

  async function refresh() {
    if (!profile) return;
    const t = await ProviderAvailabilityService.listTemplate(profile.id);
    setTemplate(t.data || []);
    const e = await ProviderAvailabilityService.listExceptions(profile.id);
    setExceptions(e.data || []);
  }

  useEffect(() => { if (profile) refresh(); }, [profile]);

  const submitBlock = async () => {
    try {
      await ProviderAvailabilityService.addTemplateBlock({
        provider_id: profile.id,
        day_of_week: addBlock,
        start_time: `${blockStart}:00`,
        end_time: `${blockEnd}:00`,
      });
      setAddBlock(null);
      refresh();
    } catch (e) {
      setSnack({ open: true, message: e.message, severity: "error" });
    }
  };

  const removeBlock = async (id) => {
    if (!confirm("Remove this block? Future-booked appointments in this block will NOT be cancelled.")) return;
    try {
      await ProviderAvailabilityService.deleteTemplateBlock(id);
      refresh();
    } catch (e) {
      setSnack({ open: true, message: e.message, severity: "error" });
    }
  };

  const submitException = async () => {
    try {
      await ProviderAvailabilityService.addException({
        provider_id: profile.id,
        start_at: DateTime.fromISO(exStart).toUTC().toISO(),
        end_at: DateTime.fromISO(exEnd).toUTC().toISO(),
        reason: exReason || undefined,
      });
      setAddingException(false);
      setExStart(""); setExEnd(""); setExReason("");
      refresh();
    } catch (e) {
      setSnack({ open: true, message: e.message, severity: "error" });
    }
  };

  const removeException = async (id) => {
    if (!confirm("Remove this time off?")) return;
    try {
      await ProviderAvailabilityService.deleteException(id);
      refresh();
    } catch (e) {
      setSnack({ open: true, message: e.message, severity: "error" });
    }
  };

  const blocksByDay = (dow) => template.filter((b) => b.day_of_week === dow);

  return (
    <Box>
      <NavigationDrawer />
      <Box sx={{ p: 4, maxWidth: 720, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>Availability</Typography>

        <Typography variant="h6" sx={{ mt: 2 }}>Weekly schedule</Typography>
        {DAY_NAMES.map((name, dow) => (
          <Paper key={dow} sx={{ p: 2, mb: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography fontWeight="bold">{name}</Typography>
              <Button size="small" onClick={() => setAddBlock(dow)}>Add block</Button>
            </Stack>
            {blocksByDay(dow).length === 0 ? (
              <Typography variant="body2" color="text.secondary">No blocks</Typography>
            ) : (
              <Stack spacing={0.5} sx={{ mt: 1 }}>
                {blocksByDay(dow).map((b) => (
                  <Stack key={b.id} direction="row" justifyContent="space-between" alignItems="center">
                    <Typography>{b.start_time.slice(0, 5)} – {b.end_time.slice(0, 5)}</Typography>
                    <Button size="small" color="error" onClick={() => removeBlock(b.id)}>Remove</Button>
                  </Stack>
                ))}
              </Stack>
            )}
          </Paper>
        ))}

        <Divider sx={{ my: 3 }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Time off</Typography>
          <Button onClick={() => setAddingException(true)}>Add time off</Button>
        </Stack>
        {exceptions.length === 0 ? (
          <Typography color="text.secondary" sx={{ mt: 1 }}>None.</Typography>
        ) : (
          exceptions.map((e) => (
            <Paper key={e.id} sx={{ p: 2, mt: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography>
                    {DateTime.fromISO(e.start_at).toLocal().toFormat("LLL d h:mm a")}
                    {" – "}
                    {DateTime.fromISO(e.end_at).toLocal().toFormat("LLL d h:mm a")}
                  </Typography>
                  {e.reason && <Typography variant="body2" color="text.secondary">{e.reason}</Typography>}
                </Box>
                <Button size="small" color="error" onClick={() => removeException(e.id)}>Remove</Button>
              </Stack>
            </Paper>
          ))
        )}
      </Box>

      <Dialog open={addBlock !== null} onClose={() => setAddBlock(null)}>
        <DialogTitle>Add block — {addBlock !== null ? DAY_NAMES[addBlock] : ""}</DialogTitle>
        <DialogContent>
          <TextField type="time" label="Start" value={blockStart} onChange={(e) => setBlockStart(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ mr: 2, mt: 1 }} />
          <TextField type="time" label="End" value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)} InputLabelProps={{ shrink: true }} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddBlock(null)}>Cancel</Button>
          <Button variant="contained" onClick={submitBlock}>Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addingException} onClose={() => setAddingException(false)}>
        <DialogTitle>Add time off</DialogTitle>
        <DialogContent>
          <TextField type="datetime-local" label="Start" value={exStart} onChange={(e) => setExStart(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth sx={{ mt: 1, mb: 2 }} />
          <TextField type="datetime-local" label="End" value={exEnd} onChange={(e) => setExEnd(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth sx={{ mb: 2 }} />
          <TextField label="Reason (optional)" value={exReason} onChange={(e) => setExReason(e.target.value)} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddingException(false)}>Cancel</Button>
          <Button variant="contained" onClick={submitException}>Add</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={5000} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}

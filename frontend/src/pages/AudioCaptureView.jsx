import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

const SENTENCES = [
  { id: 1, text: "The quick brown fox jumps over the lazy dog." },
  { id: 2, text: "She sells seashells by the seashore." },
  { id: 3, text: "Please call Stella and ask her to bring the umbrella." },
];

const QUESTIONS = [
  { id: 1, text: "How would you rate your tremors today on a scale of 1 to 10?" },
  { id: 2, text: "Did you take your medication as prescribed?" },
  { id: 3, text: "How many hours of sleep did you get last night?" },
  { id: 4, text: "Are you experiencing any stiffness or rigidity today?" },
];

function AudioRecorder({ promptText, promptLabel, recordingKey }) {
  const [status, setStatus] = useState("idle"); // idle | recording | recorded
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioURL(URL.createObjectURL(blob));
        setStatus("recorded");
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setStatus("recording");
    } catch (err) {
      console.error("Microphone access denied:", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const reRecord = () => {
    setAudioURL(null);
    setStatus("idle");
  };

  return (
    <Box
      sx={{
        border: "1px solid #e5e4e7",
        borderRadius: "12px",
        padding: "1.5rem",
        backgroundColor: "#fff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      {/* Prompt */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        <Chip
          label={promptLabel}
          size="small"
          sx={{
            backgroundColor: "#EEF2FF",
            color: "#4338CA",
            fontWeight: 600,
            borderRadius: "8px",
            mt: "2px",
            flexShrink: 0,
          }}
        />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#1e293b" }}>
          {promptText}
        </Typography>
      </Box>

      <Divider />

      {/* Controls */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        {status === "idle" && (
          <Button
            variant="contained"
            onClick={startRecording}
            sx={{
              backgroundColor: "#6366f1",
              color: "white",
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "none",
              "&:hover": { backgroundColor: "#4f46e5" },
            }}
          >
            Start Recording
          </Button>
        )}

        {status === "recording" && (
          <>
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: "#ef4444",
                animation: "pulse 1s infinite",
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.3 },
                },
              }}
            />
            <Typography variant="body2" sx={{ color: "#ef4444", fontWeight: 500 }}>
              Recording...
            </Typography>
            <Button
              variant="outlined"
              onClick={stopRecording}
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 600,
                borderColor: "#ef4444",
                color: "#ef4444",
                "&:hover": { backgroundColor: "#FEF2F2" },
              }}
            >
              Stop
            </Button>
          </>
        )}

        {status === "recorded" && (
          <>
            <Chip
              label="Recorded"
              size="small"
              sx={{
                backgroundColor: "#F0FDF4",
                color: "#166534",
                fontWeight: 600,
                borderRadius: "8px",
              }}
            />
            <Button
              variant="text"
              onClick={reRecord}
              sx={{
                textTransform: "none",
                color: "#6366f1",
                fontWeight: 500,
                p: 0,
              }}
            >
              Re-record
            </Button>
          </>
        )}
      </Box>

      {/* Playback */}
      {audioURL && (
        <audio
          controls
          src={audioURL}
          style={{ width: "100%", marginTop: "4px", borderRadius: "8px" }}
        />
      )}
    </Box>
  );
}

export default function AudioCaptureView() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: { xs: 2, md: 3 } }}>
      <Button
        onClick={() => navigate("/patient")}
        sx={{ textTransform: "none", color: "#185FA5", mb: 2, pl: 0 }}
      >
        ← Back to Dashboard
      </Button>

      <Typography variant="h5" fontWeight={600} gutterBottom>
        Audio Capture
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Record your responses below. You can read the assigned sentences aloud
        or answer your check-in questions by voice.
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, newVal) => setTab(newVal)}
        sx={{
          mb: 3,
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 500,
          },
          "& .Mui-selected": {
            color: "#6366f1 !important",
          },
          "& .MuiTabs-indicator": {
            backgroundColor: "#6366f1",
          },
        }}
      >
        <Tab label="Doctor-Assigned Sentences" />
        <Tab label="Vocal Check-In" />
      </Tabs>

      {/* Tab 0 — Doctor-assigned sentences */}
      {tab === 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Read each sentence aloud clearly at a comfortable pace.
          </Typography>
          {SENTENCES.map((s, i) => (
            <AudioRecorder
              key={s.id}
              recordingKey={`sentence-${s.id}`}
              promptLabel={`Sentence ${i + 1}`}
              promptText={s.text}
            />
          ))}
        </Box>
      )}

      {/* Tab 1 — Vocal check-in */}
      {tab === 1 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Answer each question by pressing record and speaking your response.
          </Typography>
          {QUESTIONS.map((q, i) => (
            <AudioRecorder
              key={q.id}
              recordingKey={`question-${q.id}`}
              promptLabel={`Q${i + 1}`}
              promptText={q.text}
            />
          ))}
        </Box>
      )}

      {/* Submit */}
      <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#6366f1",
            color: "white",
            fontWeight: 600,
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
          Submit Recordings
        </Button>
      </Box>
    </Box>
  );
}
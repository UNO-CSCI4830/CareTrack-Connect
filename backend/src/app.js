import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler.js";
import { httpResponse } from "./utils/httpResponse.js";

// Route imports
import profileRoutes from "./routes/profiles.js";
import patientDetailsRoutes from "./routes/patientDetails.js";
import providerDetailsRoutes from "./routes/providerDetails.js";
import providerPatientsRoutes from "./routes/providerPatients.js";
import checkInRoutes from "./routes/checkIns.js";
import checkInResponseRoutes from "./routes/checkInResponses.js";
import questionRoutes from "./routes/questions.js";
import attachmentRoutes from "./routes/attachments.js";
import appointmentRoutes from "./routes/appointments.js";
import providerAvailabilityRoutes from "./routes/providerAvailability.js";
import providerAvailabilityExceptionRoutes from "./routes/providerAvailabilityExceptions.js";
import alertRoutes from "./routes/alerts.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (req, res) => {
  httpResponse.success(res, { status: "OK" }, 200, "Server is running");
});

// API Routes
app.use("/api/profiles", profileRoutes);
app.use("/api/patient-details", patientDetailsRoutes);
app.use("/api/provider-details", providerDetailsRoutes);
app.use("/api/provider-patients", providerPatientsRoutes);
app.use("/api/check-ins", checkInRoutes);
app.use("/api/check-in-responses", checkInResponseRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/attachments", attachmentRoutes);

// 404 handler
app.use("*", (req, res) => {
  httpResponse.notFound(res, "Route not found");
});

// Error handling middleware
app.use(errorHandler);

export default app;

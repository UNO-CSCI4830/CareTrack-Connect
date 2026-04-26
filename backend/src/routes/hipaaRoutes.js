import express from "express";
import { encrypt } from "../utils/encryption.js";

const router = express.Router();

let patients = [
  {
    id: 1,
    name: "Jane Doe",
    email: "jane@example.com",
    healthRecord: "Medical history",
    canBeDeleted: true,
  },
];

let auditLogs = [];

function requireLogin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "User must be logged in" });
  }
  next();
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}

function logAction(userId, action) {
  auditLogs.push({
    userId,
    action,
    time: new Date(),
  });
}

router.get("/patients/:id", requireLogin, requireRole(["admin", "doctor"]), (req, res) => {
  const patient = patients.find((p) => p.id === Number(req.params.id));

  if (!patient) {
    return res.status(404).json({ message: "Patient not found" });
  }

  logAction(req.user.id, "VIEW_PATIENT");

  res.json(patient);
});

router.post("/patients/:id/remove", requireLogin, (req, res) => {
  const patient = patients.find((p) => p.id === Number(req.params.id));

  if (!patient) {
    return res.status(404).json({ message: "Patient not found" });
  }

  if (req.user.role !== "admin" && req.user.patientId !== patient.id) {
    return res.status(403).json({ message: "Not allowed" });
  }

  logAction(req.user.id, "REQUEST_REMOVAL");

  if (!patient.canBeDeleted) {
    return res.status(400).json({
      message: "Cannot delete yet (legal retention)",
    });
  }

  patient.name = "Removed";
  patient.email = null;
  patient.healthRecord = encrypt("Removed");

  logAction(req.user.id, "DATA_REMOVED");

  res.json({ message: "Data removed successfully" });
});

router.get("/audit-logs", requireLogin, requireRole(["admin"]), (req, res) => {
  res.json(auditLogs);
});

export default router;

import express from "express";
import { ProfileController } from "../controllers/profileController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.get("/", asyncHandler(ProfileController.getAllProfiles));
router.get("/:id", asyncHandler(ProfileController.getProfileById));
router.get("/auth/:authUserId", asyncHandler(ProfileController.getProfileByAuthUserId));
router.get("/role/:role", asyncHandler(ProfileController.getProfilesByRole));
router.post("/", asyncHandler(ProfileController.createProfile));
router.put("/:id", asyncHandler(ProfileController.updateProfile));
router.delete("/:id", asyncHandler(ProfileController.deleteProfile));

export default router;

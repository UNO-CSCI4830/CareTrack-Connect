import express from "express";
import { ProviderDetailsController } from "../controllers/providerDetailsController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.get("/", asyncHandler(ProviderDetailsController.getAllProviderDetails));
router.get("/:id", asyncHandler(ProviderDetailsController.getProviderDetailsById));
router.get("/profile/:profileId", asyncHandler(ProviderDetailsController.getProviderDetailsByProfileId));
router.get("/accepting/patients", asyncHandler(ProviderDetailsController.getAcceptingPatients));
router.post("/", asyncHandler(ProviderDetailsController.createProviderDetails));
router.put("/:id", asyncHandler(ProviderDetailsController.updateProviderDetails));
router.delete("/:id", asyncHandler(ProviderDetailsController.deleteProviderDetails));

export default router;

import express from "express";
import { ProviderAvailabilityController } from "../controllers/providerAvailabilityController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.get("/:providerId", asyncHandler(ProviderAvailabilityController.list));
router.post("/", asyncHandler(ProviderAvailabilityController.create));
router.delete("/:id", asyncHandler(ProviderAvailabilityController.delete));

export default router;

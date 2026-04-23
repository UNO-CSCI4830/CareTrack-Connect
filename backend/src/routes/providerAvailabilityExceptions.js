import express from "express";
import { ProviderAvailabilityExceptionController } from "../controllers/providerAvailabilityExceptionController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = express.Router();

router.get("/:providerId", asyncHandler(ProviderAvailabilityExceptionController.list));
router.post("/", asyncHandler(ProviderAvailabilityExceptionController.create));
router.delete("/:id", asyncHandler(ProviderAvailabilityExceptionController.delete));

export default router;

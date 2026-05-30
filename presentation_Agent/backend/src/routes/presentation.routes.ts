import { Router } from "express";
import {
  exportPdfController,
  exportPptxController,
  generatePdfController,
  generatePptxController,
  generatePresentationController
} from "../controllers/presentation.controller.js";
import { exportPresentationSchema, generatePresentationSchema } from "../controllers/presentation.validation.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validateBody } from "../middleware/validateRequest.js";

export const presentationRouter = Router();

presentationRouter.post("/presentations/generate", validateBody(generatePresentationSchema), asyncHandler(generatePresentationController));
presentationRouter.post("/presentations/export/pptx", validateBody(exportPresentationSchema), asyncHandler(exportPptxController));
presentationRouter.post("/presentations/export/pdf", validateBody(exportPresentationSchema), asyncHandler(exportPdfController));
presentationRouter.post("/presentations/generate/pptx", validateBody(generatePresentationSchema), asyncHandler(generatePptxController));
presentationRouter.post("/presentations/generate/pdf", validateBody(generatePresentationSchema), asyncHandler(generatePdfController));

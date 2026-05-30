import type { GeneratePresentationInput, PresentationDocument } from "../types/presentation.js";
import { generatePresentation } from "./ai.service.js";

export async function createPresentation(input: GeneratePresentationInput): Promise<PresentationDocument> {
  return generatePresentation(input);
}

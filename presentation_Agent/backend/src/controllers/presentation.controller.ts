import type { Request, Response } from "express";
import type { ExportPresentationBody, GeneratePresentationBody } from "./presentation.validation.js";
import { createPresentation } from "../services/presentation.service.js";
import { buildPdfBuffer, buildPptxBuffer } from "../services/export.service.js";
import { safeFileName } from "../utils/fileNames.js";

function sendDownload(res: Response, buffer: Buffer, fileName: string, contentType: string) {
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Length", buffer.length);
  res.send(buffer);
}

export async function generatePresentationController(req: Request, res: Response) {
  const body = req.body as GeneratePresentationBody;
  const presentation = await createPresentation(body);
  res.status(200).json({ presentation });
}

export async function exportPptxController(req: Request, res: Response) {
  const { presentation } = req.body as ExportPresentationBody;
  const buffer = await buildPptxBuffer(presentation);
  sendDownload(res, buffer, safeFileName(presentation.title, "pptx"), "application/vnd.openxmlformats-officedocument.presentationml.presentation");
}

export async function exportPdfController(req: Request, res: Response) {
  const { presentation } = req.body as ExportPresentationBody;
  const buffer = await buildPdfBuffer(presentation);
  sendDownload(res, buffer, safeFileName(presentation.title, "pdf"), "application/pdf");
}

export async function generatePptxController(req: Request, res: Response) {
  const body = req.body as GeneratePresentationBody;
  const presentation = await createPresentation(body);
  const buffer = await buildPptxBuffer(presentation);
  sendDownload(res, buffer, safeFileName(presentation.title, "pptx"), "application/vnd.openxmlformats-officedocument.presentationml.presentation");
}

export async function generatePdfController(req: Request, res: Response) {
  const body = req.body as GeneratePresentationBody;
  const presentation = await createPresentation(body);
  const buffer = await buildPdfBuffer(presentation);
  sendDownload(res, buffer, safeFileName(presentation.title, "pdf"), "application/pdf");
}

import { Request, Response } from "express";
import { HTTP_STATUS } from "../constants/http.constants";
import { factCheckerAgent } from "../agents/factCheckerAgent";
import { groqService } from "../services/groq.service";
import { urlValidationService } from "../services/urlValidation.service";
import { addFactCheckJob } from "../queues/factCheck.queue";

export class FactCheckController {
  async factCheck(req: Request, res: Response): Promise<void> {
    const jobId = req.body.includeQueue ? await addFactCheckJob(req.body) : null;
    const report = await factCheckerAgent.run(req.body);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { ...report, jobId },
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }

  async verifyUrl(req: Request, res: Response): Promise<void> {
    const validation = await urlValidationService.validate(req.body.url);
    const factCheck = req.body.claim
      ? await factCheckerAgent.run({ claim: req.body.claim, context: validation.title })
      : undefined;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { validation, factCheck },
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }

  async extractClaims(req: Request, res: Response): Promise<void> {
    const claims = await groqService.extractClaims(req.body.text);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: { claims, count: claims.length },
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
}

export const factCheckController = new FactCheckController();

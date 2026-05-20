import axios from "axios";
import { AppError } from "../utils/AppError";
import { HTTP_STATUS } from "../constants/http.constants";
import { retry } from "../utils/retry";

export interface UrlValidationResult {
  url: string;
  reachable: boolean;
  statusCode?: number;
  contentType?: string;
  title?: string;
  riskSignals: string[];
}

export class UrlValidationService {
  async validate(url: string): Promise<UrlValidationResult> {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new AppError("Only HTTP and HTTPS URLs are supported", HTTP_STATUS.BAD_REQUEST);
    }

    const response = await retry(
      async () =>
        axios.get(url, {
          timeout: 8000,
          maxRedirects: 5,
          validateStatus: () => true,
          headers: { "User-Agent": "SwarmX-AI-FactChecker/1.0" }
        }),
      2,
      300
    );

    const html = typeof response.data === "string" ? response.data : "";
    const title = html.match(/<title>(.*?)<\/title>/i)?.[1]?.trim();
    const riskSignals: string[] = [];

    const rawContentType = response.headers["content-type"];
    const contentType = Array.isArray(rawContentType)
      ? rawContentType.join(",")
      : typeof rawContentType === "string"
        ? rawContentType
        : undefined;

    if (response.status >= 400) riskSignals.push("URL returned an error status.");
    if (!contentType?.includes("text/html")) riskSignals.push("URL is not an HTML page.");
    if (html.length < 500) riskSignals.push("Page content is unusually short.");
    if (/free money|miracle cure|guaranteed|click here now/i.test(html)) {
      riskSignals.push("Page contains promotional or sensational wording.");
    }

    return {
      url,
      reachable: response.status < 400,
      statusCode: response.status,
      contentType,
      title,
      riskSignals
    };
  }
}

export const urlValidationService = new UrlValidationService();

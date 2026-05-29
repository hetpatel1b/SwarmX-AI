import axios from "axios";

export interface UrlValidationResult {
  url: string;
  reachable: boolean;
  statusCode?: number;
  title?: string;
  contentType?: string;
  error?: string;
}

export class UrlValidationService {
  async validate(url: string): Promise<UrlValidationResult> {
    const parsedUrl = new URL(url);

    try {
      const response = await axios.get<string>(parsedUrl.toString(), {
        timeout: 8000,
        maxRedirects: 5,
        responseType: "text",
        validateStatus: (status) => status < 500
      });

      const contentType = response.headers["content-type"];

      return {
        url: parsedUrl.toString(),
        reachable: response.status < 400,
        statusCode: response.status,
        title: this.extractTitle(response.data),
        contentType: typeof contentType === "string" ? contentType : undefined
      };
    } catch (error) {
      return {
        url: parsedUrl.toString(),
        reachable: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private extractTitle(html: string): string | undefined {
    const match = html.match(/<title[^>]*>(.*?)<\/title>/is);
    return match?.[1]?.replace(/\s+/g, " ").trim();
  }
}

export const urlValidationService = new UrlValidationService();

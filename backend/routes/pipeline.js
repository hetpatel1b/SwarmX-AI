import { Router } from "express";
import { runResearchAgent } from "../agents/researchAgent.js";
import { runAnalysisAgent } from "../agents/analysisAgent.js";
import { runFactCheckAgent } from "../agents/factCheckAgent.js";
import { generatePresentation, validateAndCleanSlides } from "../agents/presentationAgent.js";
import { logger } from "../utils/logger.js";
import { agentCache } from "../utils/cache.js";
import crypto from "crypto";
import { performance } from "perf_hooks";

const router = Router();
const RESEARCH_TIMEOUT_MS = 20_000;
const FACTCHECK_TIMEOUT_MS = 10_000;
const ANALYSIS_TIMEOUT_MS = 10_000;
const PRESENTATION_TIMEOUT_MS = 12_000;

const validatePipelineRequest = (body) => {
  const query = body?.query;
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    const error = new Error("A non-empty query string is required");
    error.statusCode = 400;
    throw error;
  }
  if (query.trim().length > 500) {
    const error = new Error("Query must be 500 characters or fewer");
    error.statusCode = 400;
    throw error;
  }
  return query.trim();
};

const withTimeout = (promiseFn, ms, agentName) => {
  const controller = new AbortController();
  
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      controller.abort();
      const error = new Error(`Timeout: ${agentName} exceeded ${ms}ms`);
      error.isTimeout = true;
      reject(error);
    }, ms);
  });
  
  return Promise.race([promiseFn(controller.signal), timeoutPromise]);
};

const logAgentExecution = (agentName, status, output, startTime) => {
  const executionTime = performance.now() - startTime;
  const outputLength = output ? JSON.stringify(output).length : 0;
  console.log(`[AGENT LOG] ${agentName} | Status: ${status} | Output Length: ${outputLength} bytes | Execution Time: ${executionTime.toFixed(2)}ms`);
};

// Retry wrapper with self-validation support
const runWithRetry = async (agentName, executionFn, timeoutMs, validatorFn, maxRetries = 2) => {
  let attempt = 0;
  let lastError = null;

  while (attempt <= maxRetries) {
    try {
      const result = await withTimeout((signal) => executionFn(signal), timeoutMs, agentName);
      
      // Agent-level check (all agents now return success/status)
      if (result?.success === false) {
        throw new Error(result.error || `${agentName} internal failure`);
      }

      // Semantic self-validation check
      if (validatorFn) {
        const isValid = validatorFn(result);
        if (!isValid) {
          throw new Error(`${agentName} failed semantic validation (e.g. output too short)`);
        }
      }

      return result;
    } catch (err) {
      lastError = err;
      attempt++;
      if (attempt <= maxRetries) {
        logger.warn(`${agentName} attempt ${attempt} failed, retrying...`, { error: err.message });
      }
    }
  }

  logger.error(`${agentName} completely failed after ${maxRetries} retries`, { error: lastError?.message });
  throw lastError;
};

export const runPipeline = async (req, res, next) => {
  const tStart = performance.now();
  let query = "Unknown";
  try {
    query = validatePipelineRequest(req.body);
    logger.info("Pipeline started", { query });

    const cacheKey = crypto.createHash("md5").update(query).digest("hex");
    const cachedData = agentCache.get(cacheKey);

    if (cachedData) {
      logger.info("Cache hit for pipeline", { query });
      console.log(`[PIPELINE LOG] Status: CACHE HIT | Execution Time: ${(performance.now() - tStart).toFixed(2)}ms`);
      return res.json(cachedData);
    }

    // --- FALLBACK DEFINITIONS ---
    const fallbackResearch = {
      success: false,
      status: "failed",
      error: "Research agent timed out.",
      fallbackData: {
        title: query,
        overview: "Research agent timed out or encountered an error.",
        sections: [{ heading: "Error", content: "Research data unavailable." }],
        statistics: [],
        sources: [],
        rawData: "Research agent timed out or encountered an error."
      }
    };

    const fallbackAnalysis = {
      success: false,
      status: "failed",
      error: "Analysis agent timed out.",
      fallbackData: {
        summary: "Overview not available.",
        keyInsights: ["Insight generation timed out."],
        conclusion: "Process timed out.",
        trends: ["N/A"],
        predictions: ["N/A"],
        patterns: ["N/A"],
        recommendations: ["N/A"],
        overallAnalysis: "Analysis timed out."
      }
    };

    const fallbackFactCheck = {
      success: false,
      status: "failed",
      error: "Fact check timed out.",
      fallbackData: {
        verifiedFacts: ["Verification timed out."],
        flaggedClaims: [],
        trustScore: 50,
        sourceCredibility: "unknown",
        breakdown: []
      }
    };

    const fallbackPresentation = {
      success: false,
      status: "failed",
      error: "Presentation generation timed out.",
      fallbackData: {
        title: "Presentation Error",
        executiveSummary: "Presentation generation failed.",
        slides: [],
        recommendations: []
      }
    };

    // --- AGENT EXECUTIONS ---
    
    const tResearch = performance.now();
    const researchCacheKey = `research_${cacheKey}`;
    let research = agentCache.get(researchCacheKey);
    
    if (!research) {
      try {
        research = await runWithRetry(
          "ResearchAgent",
          (signal) => runResearchAgent(query, signal),
          RESEARCH_TIMEOUT_MS,
          (res) => {
            const data = res?.data || res?.fallbackData || {};
            // Validate length constraint
            if (!data.rawData || data.rawData.length < 400) return false;
            return true;
          },
          2 // maxRetries
        );
        logAgentExecution("ResearchAgent", "SUCCESS", research, tResearch);
        agentCache.set(researchCacheKey, research);
      } catch (err) {
        logger.error("Research agent completely failed validation/timeouts.", { error: err.message });
        logAgentExecution("ResearchAgent", "FAILED", err.message, tResearch);
        
        // HALT PIPELINE COMPLETELY
        return res.status(200).json({
          success: false,
          error: "Research failed to complete after multiple attempts.",
          pipeline: null
        });
      }
    } else {
      console.log(`[AGENT LOG] ResearchAgent | Status: CACHE_HIT | Execution Time: ${(performance.now() - tResearch).toFixed(2)}ms`);
    }

    const researchData = research.data || research.fallbackData || {};
    const MAX_RESEARCH_TOKENS = 8000;
    const truncatedRawData = researchData.rawData ? researchData.rawData.slice(0, MAX_RESEARCH_TOKENS) : "";
    const truncatedOverview = researchData.overview ? researchData.overview.slice(0, 3000) : "";

    // Parallel Agents using Promise.allSettled and Retry Wrapper
    const tAnalysis = performance.now();
    const analysisPromise = runWithRetry(
      "AnalysisAgent",
      (signal) => runAnalysisAgent(truncatedRawData || truncatedOverview, signal),
      35000,
      (res) => {
        const data = res?.data || res?.fallbackData || {};
        if (!data.summary || data.summary.length < 20) return false;
        if (!Array.isArray(data.keyInsights) || data.keyInsights.length < 1) return false;
        return true;
      },
      1
    );

    const tFactCheck = performance.now();
    const factCheckCacheKey = `factcheck_${cacheKey}`;
    let factCheckPromise = agentCache.get(factCheckCacheKey);

    if (!factCheckPromise) {
      factCheckPromise = runWithRetry(
        "FactCheckAgent",
        (signal) => runFactCheckAgent(truncatedOverview, truncatedRawData, signal),
        35000,
        (res) => {
          const data = res?.data || res?.fallbackData || {};
          const vFacts = Array.isArray(data.verifiedFacts) ? data.verifiedFacts.length : 0;
          const fClaims = Array.isArray(data.flaggedClaims) ? data.flaggedClaims.length : 0;
          if (vFacts + fClaims < 1) return false;
          return true;
        },
        1
      ).then(res => {
        agentCache.set(factCheckCacheKey, res);
        return res;
      });
    } else {
      factCheckPromise = Promise.resolve(factCheckPromise);
    }

    const tPresentation = performance.now();
    const presentationInput = { query, research: researchData };
    const presentationPromise = runWithRetry(
      "PresentationAgent",
      (signal) => generatePresentation(presentationInput, signal),
      35000,
      (res) => {
        const data = res?.data || res?.fallbackData || {};
        if (!Array.isArray(data.slides) || data.slides.length < 3) return false;
        return true;
      },
      1
    );

    const [analysisSettled, factCheckSettled, presentationSettled] = await Promise.allSettled([analysisPromise, factCheckPromise, presentationPromise]);

    const analysis = analysisSettled.status === "fulfilled" ? analysisSettled.value : fallbackAnalysis;
    if (analysisSettled.status === "rejected") {
      logger.warn("Analysis agent rejected, using fallback", { error: analysisSettled.reason?.message });
      logAgentExecution("AnalysisAgent", "FAILED", analysis, tAnalysis);
    } else {
      logAgentExecution("AnalysisAgent", "SUCCESS", analysis, tAnalysis);
    }

    const factCheck = factCheckSettled.status === "fulfilled" ? factCheckSettled.value : fallbackFactCheck;
    if (factCheckSettled.status === "rejected") {
      logger.warn("FactCheck agent rejected, using fallback", { error: factCheckSettled.reason?.message });
      logAgentExecution("FactCheckAgent", "FAILED", factCheck, tFactCheck);
    } else if (!agentCache.get(factCheckCacheKey)) { // Only log success if not cache hit originally
      logAgentExecution("FactCheckAgent", "SUCCESS", factCheck, tFactCheck);
    }

    const presentation = presentationSettled.status === "fulfilled" ? presentationSettled.value : fallbackPresentation;
    if (presentationSettled.status === "rejected") {
      logger.warn("Presentation agent rejected, using fallback", { error: presentationSettled.reason?.message });
      logAgentExecution("PresentationAgent", "FAILED", presentation, tPresentation);
    } else {
      logAgentExecution("PresentationAgent", "SUCCESS", presentation, tPresentation);
    }

    const analysisData = analysis.data || analysis.fallbackData || {};
    
    const summaryData = {
      success: analysis.success,
      status: analysis.status,
      data: {
        summary: analysisData.summary,
        keyInsights: analysisData.keyInsights,
        conclusion: analysisData.conclusion
      }
    };
    
    const insightsData = {
      success: analysis.success,
      status: analysis.status,
      data: {
        trends: analysisData.trends,
        predictions: analysisData.predictions,
        recommendations: analysisData.recommendations,
        overallAnalysis: analysisData.overallAnalysis
      }
    };

    // --- FINAL RESPONSE BUILDER ---
    console.log("Research Result", research);
    console.log("FactCheck Result", factCheck);
    console.log("Summary Result", summaryData);
    console.log("Insight Result", insightsData);
    console.log("Presentation Result", presentation);

    const pipelineResult = {
      research,
      factCheck,
      summary: summaryData,
      insight: insightsData,
      presentation
    };

    console.log("Final Pipeline", pipelineResult);

    const result = {
      success: true,
      pipeline: pipelineResult
    };

    agentCache.set(cacheKey, result);
    console.log(`[PIPELINE LOG] Status: SUCCESS | Execution Time: ${(performance.now() - tStart).toFixed(2)}ms`);
    return res.json(result);

  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ success: false, error: error.message });
    }

    logger.error("Critical Pipeline Error", { error: error.message });
    console.log(`[PIPELINE LOG] Status: CRITICAL_ERROR | Execution Time: ${(performance.now() - tStart).toFixed(2)}ms`);
    
    // Outer Safety Net to ensure the schema is ALWAYS returned even on a catastrophic failure
    const pipelineResult = {
      research: fallbackResearch,
      factCheck: fallbackFactCheck,
      summary: fallbackAnalysis,
      insight: fallbackAnalysis,
      presentation: fallbackPresentation
    };

    console.log("Final Pipeline", pipelineResult);

    return res.status(200).json({
      success: true,
      pipeline: pipelineResult
    });
  }
};

router.post("/", runPipeline);

export default router;

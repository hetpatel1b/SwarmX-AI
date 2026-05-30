import { create } from "zustand";
import { features } from "@/config/env";
import type { AgentId, AgentState, HistoryItem, SwarmResults } from "@/types/swarm";
import { normalizePipelineResults, swarmApi } from "@/services/swarmApi";
import { agentOrder, defaultAgents } from "@/utils/agents";
import { clamp } from "@/utils/format";
import { loadHistory, saveHistory } from "@/utils/storage";

interface SwarmStore {
  agents: AgentState[];
  activeAgent: AgentId | null;
  currentThought: string;
  isRunning: boolean;
  error: string | null;
  results: SwarmResults | null;
  history: HistoryItem[];
  runSwarm: (topic: string) => Promise<void>;
  reset: () => void;
  loadFromHistory: (id: string) => void;
}

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export const useSwarmStore = create<SwarmStore>((set, get) => ({
  agents: defaultAgents,
  activeAgent: null,
  currentThought: "Awaiting research topic.",
  isRunning: false,
  error: null,
  results: null,
  history: loadHistory(),
  reset: () =>
    set({
      agents: defaultAgents,
      activeAgent: null,
      currentThought: "Awaiting research topic.",
      isRunning: false,
      error: null
    }),
  loadFromHistory: (id) => {
    const item = get().history.find((entry) => entry.id === id);
    if (item) set({ results: item });
  },
  runSwarm: async (topic) => {
    const startedAt = Date.now();
    set({
      agents: defaultAgents,
      activeAgent: null,
      currentThought: "Initializing swarm orchestration...",
      isRunning: true,
      error: null,
      results: null
    });

    const apiPromise = swarmApi.pipeline(topic);

    for (const id of agentOrder) {
      const started = performance.now();
      set((state) => ({
        activeAgent: id,
        currentThought: `${state.agents.find((agent) => agent.id === id)?.name} warming up...`,
        agents: state.agents.map((agent) =>
          agent.id === id ? { ...agent, status: "Running", progress: 8, confidence: 64 } : agent
        )
      }));

      for (let progress = 18; progress <= 92; progress += 18) {
        const thoughtIndex = Math.floor(progress / 32) % 3;
        set((state) => ({
          currentThought: state.agents.find((agent) => agent.id === id)
            ? `${state.agents.find((agent) => agent.id === id)?.name}: ${["Searching sources...", "Verifying claims...", "Generating recommendations..."][thoughtIndex]}`
            : "Processing...",
          agents: state.agents.map((agent) =>
            agent.id === id ? { ...agent, progress: clamp(progress), confidence: clamp(68 + progress / 4) } : agent
          )
        }));
        if (features.swarmAnimation) {
          await delay(260);
        }
      }

      const elapsed = (performance.now() - started) / 1000;
      set((state) => ({
        agents: state.agents.map((agent) =>
          agent.id === id
            ? {
                ...agent,
                status: "Completed",
                progress: 100,
                executionTime: elapsed,
                confidence: clamp(86 + agentOrder.indexOf(id) * 2)
              }
            : agent
        )
      }));
      if (features.swarmAnimation) {
        await delay(220);
      }
    }

    try {
      const pipeline = await apiPromise;
      const results = normalizePipelineResults(topic, pipeline, startedAt);
      const confidenceBase = clamp(results.trustScore);
      const historyItem: HistoryItem = { ...results, id: crypto.randomUUID() };
      const history = [historyItem, ...get().history].slice(0, 12);
      saveHistory(history);

      set((state) => ({
        results,
        history,
        activeAgent: null,
        currentThought: "Swarm completed. Results are ready.",
        isRunning: false,
        error: null,
        agents: state.agents.map((agent, index) => ({
          ...agent,
          status: "Completed",
          progress: 100,
          confidence: clamp(confidenceBase - index * 2)
        }))
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Backend request failed.";
      const failedAgent = [...agentOrder].reverse().find((id) => get().agents.find((agent) => agent.id === id)?.progress === 100) ?? "research";
      set((state) => ({
        activeAgent: null,
        currentThought: message,
        isRunning: false,
        error: message,
        agents: state.agents.map((agent) => ({
          ...agent,
          status: agent.id === failedAgent ? "Failed" : agent.status
        }))
      }));
    }
  }
}));

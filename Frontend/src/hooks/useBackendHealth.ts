import { useCallback, useEffect, useState } from "react";
import { apiBaseUrl } from "@/config/env";
import { swarmApi } from "@/services/swarmApi";
import type { BackendStatus } from "@/types/swarm";
import type { HealthData } from "@/types/api";

interface BackendHealthState {
  status: BackendStatus;
  data: HealthData | null;
  error: string | null;
  checkedAt: Date | null;
  refresh: () => Promise<void>;
}

export function useBackendHealth(intervalMs = 30000): BackendHealthState {
  const [status, setStatus] = useState<BackendStatus>("checking");
  const [data, setData] = useState<HealthData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    setStatus("checking");
    try {
      const response = await swarmApi.health();
      setData(response);
      setError(null);
      setStatus("online");
      setCheckedAt(new Date());
    } catch (healthError) {
      setData(null);
      setError(healthError instanceof Error ? healthError.message : `Unable to reach ${apiBaseUrl}`);
      setStatus("offline");
      setCheckedAt(new Date());
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, refresh]);

  return { status, data, error, checkedAt, refresh };
}

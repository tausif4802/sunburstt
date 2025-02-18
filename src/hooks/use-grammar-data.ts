import { useState, useEffect, useCallback, useRef } from "react";

interface GrammarBarData {
  id: string;
  current: number;
  previous: number;
}

interface GrammarPieData {
  value: number;
  conversation_id_list: string[];
}

interface GrammarPieResponse {
  [key: string]: GrammarPieData;
}

interface GrammarFilters {
  fromDate?: string;
  toDate?: string;
  errorCode?: string;
  isTeam?: boolean;
  agentId?: string;
}

interface Agent {
  id: string;
  team: string;
}

interface AgentData {
  [team: string]: Agent[];
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const DEBOUNCE_DELAY = 300; // 300ms debounce for filter changes

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function validateDateRange(fromDate?: string, toDate?: string) {
  if (!fromDate || !toDate) {
    throw new Error("from_date and to_date are required");
  }
  const from = new Date(fromDate);
  const to = new Date(toDate);
  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    throw new Error("Invalid date format");
  }
  if (from > to) {
    throw new Error("from_date must be before or equal to to_date");
  }
}

export function useAgentData() {
  const [data, setData] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/agent/team");
        if (!response.ok) {
          throw new Error("Failed to fetch agent data");
        }
        const result = await response.json();

        // Transform the data into the format we need
        const transformedData: AgentData = {};
        Object.entries(result).forEach(([team, agents]) => {
          if (Array.isArray(agents)) {
            transformedData[team] = agents.map((agentId) => ({
              id: String(agentId),
              team,
            }));
          }
        });

        setData(transformedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching agent data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch agent data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  return { data, loading, error };
}

export function useGrammarData(filters: GrammarFilters) {
  const prevRequestRef = useRef<AbortController | null>(null);
  const [data, setData] = useState<GrammarBarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const validateFilters = useCallback((filters: GrammarFilters) => {
    // Validate date range
    validateDateRange(filters.fromDate, filters.toDate);

    // Validate error code
    if (!filters.errorCode) {
      throw new Error("error_code is required for bar data");
    }
    if (!filters.errorCode.match(/^G_1\d{2}$/)) {
      throw new Error("Invalid error code format. Expected format: G_1XX");
    }
  }, []);

  const fetchData = useCallback(
    async (retryAttempt = 0, controller?: AbortController) => {
      try {
        setLoading(true);
        
        // Validate all required parameters first
        validateFilters(filters);

        const queryParams = new URLSearchParams();
        if (filters.fromDate) queryParams.append("from_date", filters.fromDate);
        if (filters.toDate) queryParams.append("to_date", filters.toDate);
        if (filters.errorCode) queryParams.append("error_code", filters.errorCode);
        if (filters.isTeam !== undefined)
          queryParams.append("is_team", String(filters.isTeam));

        const response = await fetch(
          `/api/grammar/bar?${queryParams.toString()}`,
          {
            signal: controller?.signal,
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch data");
        }
        const result = await response.json();
        // Transform data to match expected format
        if (Array.isArray(result)) {
          const transformedData = result.map((item) => ({
            id: item.id || item.agent_id || "unknown",
            current: typeof item.current === "number" ? item.current : 0,
            previous: typeof item.previous === "number" ? item.previous : 0,
          }));
          setData(transformedData);
        } else {
          throw new Error("Invalid data format received from API");
        }
        setError(null);
        setRetryCount(0);
      } catch (err) {
        console.error("Error fetching bar data:", err);
        if (retryAttempt < MAX_RETRIES) {
          await wait(RETRY_DELAY * Math.pow(2, retryAttempt)); // Exponential backoff
          setRetryCount(retryAttempt + 1);
          return fetchData(retryAttempt + 1);
        }
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  // Debounce effect with proper cleanup
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      fetchData(0, controller);
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchData, filters]);

  const retry = () => {
    setError(null);
    setRetryCount(0);
    fetchData();
  };

  return { data, loading, error, retry, retryCount };
}

interface GrammarTrendsData {
  date: string;
  value: number;
}

export function useGrammarTrends(filters: GrammarFilters) {
  const prevRequestRef = useRef<AbortController | null>(null);
  const [data, setData] = useState<GrammarTrendsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = useCallback(
    async (retryAttempt = 0, controller?: AbortController) => {
      try {
        setLoading(true);

        // Validate date range first
        validateDateRange(filters.fromDate, filters.toDate);

        const queryParams = new URLSearchParams();
        if (filters.fromDate) queryParams.append("from_date", filters.fromDate);
        if (filters.toDate) queryParams.append("to_date", filters.toDate);
        if (filters.errorCode)
          queryParams.append("error_code", filters.errorCode);
        if (filters.isTeam !== undefined)
          queryParams.append("is_team", String(filters.isTeam));

        const response = await fetch(
          `/api/grammar/trends?${queryParams.toString()}`,
          {
            signal: controller?.signal,
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch trends data");
        }
        const result = await response.json();
        // Transform data to match expected format
        if (Array.isArray(result)) {
          const transformedData = result.map((item) => ({
            date:
              typeof item.date === "string"
                ? item.date
                : new Date(item.timestamp).toISOString().split("T")[0],
            value: typeof item.value === "number" ? item.value : 0,
          }));
          setData(transformedData);
        } else {
          throw new Error("Invalid data format received from API");
        }
        setError(null);
        setRetryCount(0);
      } catch (err) {
        console.error("Error fetching trends data:", err);
        if (retryAttempt < MAX_RETRIES) {
          await wait(RETRY_DELAY * Math.pow(2, retryAttempt)); // Exponential backoff
          setRetryCount(retryAttempt + 1);
          return fetchData(retryAttempt + 1);
        }
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  // Debounce effect with proper cleanup
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      fetchData(0, controller);
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchData, filters]);

  const retry = () => {
    setError(null);
    setRetryCount(0);
    fetchData();
  };

  return { data, loading, error, retry, retryCount };
}

interface TeamData {
  [key: string]: string[];
}

export function useTeamData() {
  const prevRequestRef = useRef<AbortController | null>(null);
  const [data, setData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = useCallback(
    async (retryAttempt = 0, controller?: AbortController) => {
      try {
        setLoading(true);
        const response = await fetch("/api/agent/team", {
          signal: controller?.signal,
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch team data");
        }
        const result = await response.json();
        // Validate and transform team data
        if (result && typeof result === "object" && !Array.isArray(result)) {
          // Ensure all values are string arrays
          const transformedData: TeamData = {};
          for (const [team, agents] of Object.entries(result)) {
            if (Array.isArray(agents)) {
              transformedData[team] = agents.map((agent) => String(agent));
            } else {
              console.warn(`Invalid agents data for team ${team}:`, agents);
              transformedData[team] = [];
            }
          }
          setData(transformedData);
        } else {
          throw new Error("Invalid team data format received from API");
        }
        setError(null);
        setRetryCount(0);
      } catch (err) {
        console.error("Error fetching team data:", err);
        if (retryAttempt < MAX_RETRIES) {
          await wait(RETRY_DELAY * Math.pow(2, retryAttempt)); // Exponential backoff
          setRetryCount(retryAttempt + 1);
          return fetchData(retryAttempt + 1);
        }
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Debounce effect with shorter delay and proper cleanup
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      fetchData(0, controller);
    }, 100); // Shorter delay since this is just for initial load

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [fetchData]);

  const retry = () => {
    setError(null);
    setRetryCount(0);
    fetchData();
  };

  return { data, loading, error, retry, retryCount };
}

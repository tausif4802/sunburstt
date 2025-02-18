"use client";

import * as React from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Agent {
  id: string;
  name: string;
}

interface AgentSelectProps {
  onSelect: (agentId: string | undefined) => void;
  selectedId?: string;
  className?: string;
}

interface GroupedAgents {
  [team: string]: Agent[];
}

export function AgentSelect({ onSelect, selectedId, className }: AgentSelectProps) {
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAgents = React.useCallback(async () => {
    try {
      console.log("Fetching agents from API...");
      setLoading(true);
      setError(null);
      const response = await fetch("/api/agents");
      if (!response.ok) {
        throw new Error("Failed to fetch agents");
      }
      const data = await response.json();
      console.log("Agents API Response:", data);
      setAgents(data);
    } catch (err) {
      console.error("Error fetching agents:", err);
      setError("Failed to load agents");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Group agents by team
  const groupedAgents = React.useMemo(() => {
    return agents.reduce<GroupedAgents>((groups, agent) => {
      const match = agent.name.match(/\((Team .+?)\)$/);
      const team = match ? match[1] : 'Other';
      if (!groups[team]) groups[team] = [];
      groups[team].push(agent);
      return groups;
    }, {});
  }, [agents]);

  if (loading) {
    return (
      <div className={cn(
        "h-8 w-[280px] rounded-full bg-muted animate-pulse",
        className
      )} />
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2">
        <select
          className={cn(
            "h-8 w-[280px] rounded-full border border-destructive bg-white dark:bg-black px-3 py-1 text-sm text-destructive dark:text-red-400 shadow-sm transition-colors",
            "focus:outline-none focus:ring-1 focus:ring-destructive",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          disabled
        >
          <option>Error loading agents</option>
        </select>
        <button
          onClick={fetchAgents}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-input bg-white hover:bg-accent hover:text-accent-foreground dark:bg-black"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Retry</span>
        </button>
      </div>
    );
  }

  return (
    <select
      className={cn(
        "h-8 w-[280px] rounded-full border border-input bg-white dark:bg-black px-3 py-1 text-sm shadow-sm transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:outline-none focus:ring-1 focus:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "dark:border-[#232323] dark:text-gray-500 dark:hover:bg-[#1a1a1a]",
        className
      )}
      value={selectedId || ""}
      onChange={(e) => onSelect(e.target.value || undefined)}
    >
      <option value="" disabled>Select an agent</option>
      {Object.entries(groupedAgents).map(([team, teamAgents]) => (
        <optgroup key={team} label={team}>
          {teamAgents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name.replace(` (${team})`, '')}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

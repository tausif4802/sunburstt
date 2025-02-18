"use client";

import { Info } from "lucide-react";
import { getDefaultDateRange } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useAgentTone } from "@/hooks/use-agent-tone";
import { LoadingSpinner } from "@/components/chat/LoadingSpinner";

interface ToneScore {
  value: number;
  isPercentage?: boolean;
}

function ScoreIndicator({ value, isPercentage = false }: ToneScore) {
  const isLowScore = value <= 40;

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-lg px-2 py-1 text-sm font-medium",
        isPercentage ? "rounded-full min-w-[60px]" : "min-w-[40px] rounded-xl",
        isLowScore
          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      )}
    >
      {value}
      {isPercentage ? "%" : ""}
    </div>
  );
}

interface ToneAnalysisTableProps {
  fromDate?: string;
  toDate?: string;
  agentId?: string;
}

export function ToneAnalysisTable({
  fromDate: propFromDate,
  toDate: propToDate,
  agentId,
}: ToneAnalysisTableProps) {
  const defaultDateRange = getDefaultDateRange();
  const fromDate = propFromDate ?? defaultDateRange.from.toISOString();
  const toDate = propToDate ?? defaultDateRange.to.toISOString();
  const {
    data: agents,
    isLoading,
    error,
  } = useAgentTone({ fromDate, toDate, agentId });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-black border-[#DADADA] dark:border-[#232323] dark:text-gray-500 w-full space-y-4 rounded-[32px] border bg-background p-6">
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-black border-[#DADADA] dark:border-[#232323] dark:text-gray-500 w-full space-y-4 rounded-[32px] border bg-background p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-red-500 flex items-center gap-2">
            <span className="text-lg">Error:</span> {error}
          </div>
        </div>
      </div>
    );
  }

  if (!agents || agents.length === 0) {
    return (
      <div className="bg-white dark:bg-black border-[#DADADA] dark:border-[#232323] dark:text-gray-500 w-full space-y-4 rounded-[32px] border bg-background p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">No agent tone data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white max-w-[1400px] dark:bg-black border-[#DADADA] dark:border-[#232323] dark:text-gray-500 w-full space-y-4 rounded-[32px] border bg-background p-6 ">
      <div className="flex items-center justify-between overflow-hidden">
        <h2 className="text-lg font-semibold">
          Tone Analysis by Agent
          <Info className="ml-2 inline h-4 w-4 text-muted-foreground/70" />
        </h2>
      </div>

      <div className="rounded-lg overflow-auto max-h-[400px] ">
        <Table className="min-w-max">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Agent ID</TableHead>
              <TableHead>Friendly</TableHead>
              <TableHead>Professional</TableHead>
              <TableHead>Empathetic</TableHead>
              <TableHead>Confident</TableHead>
              <TableHead>Encouraging</TableHead>
              <TableHead>Sales-Oriented</TableHead>
              <TableHead>Supportive</TableHead>
              <TableHead>Overly Formal</TableHead>
              <TableHead>Frustrated</TableHead>
              <TableHead>Defensive</TableHead>
              <TableHead>Robotic</TableHead>
              <TableHead>Impatient</TableHead>
              <TableHead>Rude</TableHead>
              <TableHead>Overly Apologetic</TableHead>
              <TableHead>Neutral</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((agent) => (
              <TableRow key={agent.id}>
                <TableCell>{agent.id}</TableCell>
                <TableCell>
                  <ScoreIndicator value={agent.tones["Friendly"] || 0} />
                </TableCell>
                <TableCell>
                  <ScoreIndicator value={agent.tones["Professional"] || 0} />
                </TableCell>
                <TableCell>
                  <ScoreIndicator value={agent.tones["Empathetic"] || 0} />
                </TableCell>
                <TableCell>
                  <ScoreIndicator value={agent.tones["Confident"] || 0} />
                </TableCell>
                <TableCell>
                  <ScoreIndicator value={agent.tones["Encouraging"] || 0} />
                </TableCell>
                <TableCell>
                  <ScoreIndicator value={agent.tones["Sales-Oriented"] || 0} />
                </TableCell>
                <TableCell>
                  <ScoreIndicator value={agent.tones["Supportive"] || 0} />
                </TableCell>
                <TableCell>
                  <ScoreIndicator value={agent.tones["Overly Formal"] || 0} />
                </TableCell>
                <TableCell>
                  <ScoreIndicator value={agent.tones["Frustrated"] || 0} />
                </TableCell>
                <TableCell>
                  <ScoreIndicator value={agent.tones["Defensive"] || 0} />
                </TableCell>
                <TableCell>
                  <ScoreIndicator value={agent.tones["Robotic"] || 0} />
                </TableCell>
                <TableCell>
                  <ScoreIndicator value={agent.tones["Impatient"] || 0} />
                </TableCell>
                <TableCell>
                  <ScoreIndicator value={agent.tones["Rude"] || 0} />
                </TableCell>
                <TableCell>
                  <ScoreIndicator value={agent.tones["Overly Apologetic"] || 0} />
                </TableCell>
                <TableCell>
                  <ScoreIndicator value={agent.tones["Neutral"] || 0} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

"use client";

import { Info } from "lucide-react";
import { useMemo } from "react";
import { getDefaultDateRange } from "@/lib/utils";
import { useAgentTone } from "@/hooks/use-agent-tone";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/chat/LoadingSpinner";

interface AgentToneChartProps extends React.HTMLAttributes<HTMLDivElement> {
  fromDate?: string;
  toDate?: string;
  agentId?: string;
}

export function AgentToneChart({ 
  className, 
  fromDate: propFromDate,
  toDate: propToDate,
  agentId,
  ...props 
}: AgentToneChartProps) {
  const defaultDateRange = getDefaultDateRange();
  const fromDate = propFromDate ?? defaultDateRange.from.toISOString();
  const toDate = propToDate ?? defaultDateRange.to.toISOString();

  const { data: agents, isLoading, error } = useAgentTone({ fromDate, toDate, agentId });

  const data = useMemo(() => {
    if (!agents || agents.length === 0) return [];

    // Use the first agent's tone data for the chart
    const agent = agents[0];
    if (!agent) return [];

    return Object.entries(agent.tones).map(([tone, value]) => ({
      tone,
      value: (value as number) / 100 // Convert percentage to decimal
    }));
  }, [agents]);


  return (
    <Card className={cn("bg-white dark:bg-black border-[#DADADA] dark:border-[#232323] dark:text-gray-500 w-full rounded-[32px]", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-8">
        <CardTitle className="text-base font-medium">
          Agent Tone vs. Customer Sentiment
          <Info className="ml-2 inline h-4 w-4 text-muted-foreground/70" />
        </CardTitle>
        {error && <div className="text-sm text-red-500">{error}</div>}
      </CardHeader>
      <CardContent className="pl-2">
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center">
            <div className="text-muted-foreground">No agent tone data available</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: -15,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="rgb(167, 243, 168)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="rgb(167, 243, 168)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="tone"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                dy={10}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                domain={[0, 1]}
                ticks={[0, 0.25, 0.5, 0.75, 1]}
                tickFormatter={(value) => `${Math.round(value * 100)}%`}
                width={80}
              />
              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "6px",
                  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                }}
                formatter={(value: number) => [`${Math.round(value * 100)}%`, "Frequency"]}
              />
              <Area
                type="linear"
                dataKey="value"
                stroke="#C4E99F"
                strokeWidth={2}
                fill="url(#colorValue)"
                dot={{
                  fill: "rgb(17, 67, 66)",
                  r: 5,
                  strokeWidth: 0,
                }}
                activeDot={{
                  fill: "rgb(17, 67, 66)",
                  r: 6,
                  strokeWidth: 0,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

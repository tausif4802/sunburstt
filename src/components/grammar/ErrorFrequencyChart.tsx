"use client";

import { Info, RefreshCw } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGrammarData, useTeamData } from "@/hooks/use-grammar-data";
import { useMemo } from "react";

interface ErrorFrequencyChartProps extends React.HTMLAttributes<HTMLDivElement> {
  fromDate?: string;
  toDate?: string;
  errorCode: string; // Make errorCode required
  agentId?: string;
}

// Skeleton data for loading state
const skeletonData = Array.from({ length: 5 }, (_, i) => ({
  name: `Team ${i + 1}`,
  previous: Math.random() * 100,
  current: Math.random() * 100,
}));

export function ErrorFrequencyChart({
  fromDate,
  toDate,
  errorCode,
  agentId,
  className,
  ...props
}: ErrorFrequencyChartProps) {
  const filters = useMemo(
    () => ({
      fromDate,
      toDate,
      errorCode,
      agentId,
      isTeam: false,
    }),
    [fromDate, toDate, errorCode, agentId]
  );

  const {
    data: barData,
    loading: barLoading,
    error: barError,
    retry: retryBar,
    retryCount: barRetryCount,
  } = useGrammarData(filters);

  const {
    data: teamData,
    loading: teamLoading,
    error: teamError,
    retry: retryTeam,
    retryCount: teamRetryCount,
  } = useTeamData();

  // Create an efficient team lookup map
  const teamMap = useMemo(() => {
    if (!teamData) return new Map();
    return new Map(
      Object.entries(teamData).flatMap(([team, agents]) =>
        agents.map((agent) => [agent, team])
      )
    );
  }, [teamData]);

  // Transform data with memoized team lookup
  const chartData = useMemo(() => {
    if (!barData) return [];
    return barData.map((item) => ({
      name: `${teamMap.get(item.id) || "Unknown"} - ${item.id}`,
      previous: item.previous,
      current: item.current,
    }));
  }, [barData, teamMap]);

  // Show error state if either fetch failed
  if (barError || teamError) {
    return (
      <Card
        className={cn(
          "w-full rounded-[32px] bg-card border-border dark:bg-card-dark dark:border-border-dark border dark:text-gray-500",
          className
        )}
        {...props}
      >
        <CardHeader className="flex flex-row items-center space-y-0 pb-8">
          <CardTitle className="text-base font-medium">
            Error Frequency by Agent
            <Info className="ml-2 inline h-4 w-4 text-muted-foreground/70" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pl-2 h-[300px] flex flex-col items-center justify-center gap-4">
          <div className="text-red-500 text-center">
            <p className="mb-2">{barError || teamError}</p>
            <p className="text-sm text-muted-foreground">
              {barRetryCount > 0
                ? `Bar data retry attempt ${barRetryCount} of 3`
                : ""}
              {teamRetryCount > 0
                ? `Team data retry attempt ${teamRetryCount} of 3`
                : ""}
            </p>
          </div>
          <div className="flex gap-4">
            {barError && (
              <Button
                variant="outline"
                onClick={retryBar}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry Bar Data
              </Button>
            )}
            {teamError && (
              <Button
                variant="outline"
                onClick={retryTeam}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry Team Data
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show skeleton loader while loading
  if (barLoading || teamLoading) {
    return (
      <Card
        className={cn(
          "w-full rounded-[32px] bg-card border-border dark:bg-card-dark dark:border-border-dark border dark:text-gray-500",
          className
        )}
        {...props}
      >
        <CardHeader className="flex flex-row items-center space-y-0 pb-8">
          <CardTitle className="text-base font-medium">
            Error Frequency by Agent
            <Info className="ml-2 inline h-4 w-4 text-muted-foreground/70" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pl-2 relative">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={skeletonData}
              margin={{
                top: 5,
                right: 10,
                left: -25,
                bottom: 5,
              }}
              barGap={5}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Bar
                dataKey="previous"
                fill="#E5E7EB"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="current"
                fill="#F3F4F6"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 bg-white/50 dark:bg-black/50" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "w-full rounded-[32px] bg-card border-border dark:bg-card-dark dark:border-border-dark border dark:text-gray-500",
        className
      )}
      {...props}
    >
      <CardHeader className="flex flex-row items-center space-y-0 pb-8">
        <CardTitle className="text-base font-medium">
          Error Frequency by Agent
          <Info className="ml-2 inline h-4 w-4 text-muted-foreground/70" />
        </CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 10,
              left: -25,
              bottom: 5,
            }}
            barGap={5}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={true}
              vertical={false}
              stroke="#E5E7EB"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6B7280", fontSize: 12 }}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip
              cursor={{ fill: "rgba(0, 0, 0, 0.04)" }}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #E5E7EB",
                borderRadius: "6px",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={72}
              content={({ payload }) => (
                <div className="mt-6 flex justify-center gap-6">
                  {payload?.map((entry, index) => (
                    <div
                      key={`item-${index}`}
                      className="flex items-center gap-2"
                    >
                      <div
                        className="h-3 w-3 rounded"
                        style={{
                          backgroundColor:
                            entry.value === "previous"
                              ? "rgb(17, 67, 66)"
                              : "rgb(167, 243, 168)",
                        }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {entry.value === "previous"
                          ? "Previous 28 days"
                          : "Current Period"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            />
            <Bar
              dataKey="previous"
              fill="rgb(17, 67, 66)"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
            <Bar
              dataKey="current"
              fill="rgb(167, 243, 168)"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

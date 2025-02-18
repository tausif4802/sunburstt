"use client";

import { Info, RefreshCw } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGrammarTrends } from "@/hooks/use-grammar-data";
import { useState, useEffect, useMemo } from "react";

interface ErrorTrendsChartProps extends React.HTMLAttributes<HTMLDivElement> {
  fromDate?: string;
  toDate?: string;
  errorCode?: string;
  agentId?: string;
}

// Skeleton data for loading state
const skeletonData = Array.from({ length: 7 }, (_, i) => ({
  date: `2024-0${i + 1}`,
  value: Math.random() * 100,
}));

export function ErrorTrendsChart({
  fromDate,
  toDate,
  errorCode,
  agentId,
  className,
  ...props
}: ErrorTrendsChartProps) {
  const [selectedError, setSelectedError] = useState<string>("101");

  // Update selectedError when errorCode prop changes
  useEffect(() => {
    if (errorCode) {
      setSelectedError(errorCode);
    }
  }, [errorCode]);

  const filters = useMemo(
    () => ({
      fromDate,
      toDate,
      errorCode: selectedError,
      agentId,
      isTeam: false,
    }),
    [fromDate, toDate, selectedError, agentId]
  );

  const {
    data: chartData,
    loading,
    error: fetchError,
    retry,
    retryCount,
  } = useGrammarTrends(filters);

  const errorTypes = {
    "101": "Sentence Structure Errors",
    "102": "Subject-Verb Agreement Errors",
    "103": "Pronoun Usage Errors",
    "104": "Punctuation Errors",
    "105": "Regular Spelling Errors",
    "106": "Context-Altering Spelling Errors",
    "107": "Preposition Errors",
    "108": "Capitalization Errors",
    "109": "Tone/Style Errors",
    "110": "Redundancy and Wordiness Errors",
    "111": "Negation Errors",
    "112": "Lack of Consistency Errors",
    "113": "Missing Articles Errors",
    "114": "Misuse of Conjunctions Errors",
  };

  // Common header component
  const ChartHeader = () => (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-8">
      <div className="flex items-center gap-2">
        <CardTitle className="text-base font-medium">
          Error Trends Over Time
        </CardTitle>
        <Info className="h-4 w-4 text-gray-400" />
      </div>
      <Select value={selectedError} onValueChange={setSelectedError}>
        <SelectTrigger className="max-w-[300px] rounded-full bg-gray-50 border border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Error Type:</span>
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-white rounded-lg border border-gray-200">
          {Object.entries(errorTypes).map(([code, name]) => (
            <SelectItem key={code} value={code}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </CardHeader>
  );

  // Show error state if fetch failed
  if (fetchError) {
    return (
      <Card
        className={cn(
          "bg-white dark:bg-black border border-[#DADADA] dark:border-[#232323] dark:text-gray-500 w-full rounded-[32px] p-6",
          className
        )}
        {...props}
      >
        <ChartHeader />
        <CardContent className="pl-2 h-[300px] flex flex-col items-center justify-center gap-4">
          <div className="text-red-500 text-center">
            <p className="mb-2">{fetchError}</p>
            <p className="text-sm text-muted-foreground">
              {retryCount > 0 ? `Retry attempt ${retryCount} of 3` : ""}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={retry}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show skeleton loader while loading
  if (loading) {
    return (
      <Card
        className={cn(
          "bg-white dark:bg-black border border-[#DADADA] dark:border-[#232323] dark:text-gray-500 w-full rounded-[32px] p-6",
          className
        )}
        {...props}
      >
        <ChartHeader />
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={skeletonData}
              margin={{
                top: 5,
                right: 10,
                left: -25,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient
                  id="skeletonGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#E5E7EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#E5E7EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="date"
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
              <Area
                type="linear"
                dataKey="value"
                stroke="#E5E7EB"
                strokeWidth={2}
                fill="url(#skeletonGradient)"
                dot={{
                  fill: "#E5E7EB",
                  r: 4,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 bg-white/50 dark:bg-black/50" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "bg-white dark:bg-black border border-[#DADADA] dark:border-[#232323] dark:text-gray-500 w-full rounded-[32px] p-6",
        className
      )}
      {...props}
    >
      <ChartHeader />
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={chartData || []}
            margin={{
              top: 5,
              right: 10,
              left: -25,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="toneGradient" x1="0" y1="0" x2="0" y2="1">
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
              opacity={0.8}
            />
            <XAxis
              dataKey="date"
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
              cursor={false}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                padding: "8px 12px",
              }}
              itemStyle={{
                color: "#6B7280",
                fontSize: "12px",
              }}
              labelStyle={{
                color: "#111827",
                fontWeight: "500",
                fontSize: "14px",
              }}
            />
            <Area
              type="linear"
              dataKey="value"
              stroke="#C4E99F"
              strokeWidth={2}
              fill="url(#toneGradient)"
              dot={{
                fill: "rgb(17, 67, 66)",
                r: 4,
              }}
              activeDot={{
                fill: "rgb(17, 67, 66)",
                r: 6,
                strokeWidth: 0,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

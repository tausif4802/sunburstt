"use client";

import { Info } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { getDefaultDateRange } from "@/lib/utils";
import { LoadingSpinner } from "@/components/chat/LoadingSpinner";
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

interface ToneData {
  stage: string;
  value: number;
}

interface ToneShiftsChartProps extends React.HTMLAttributes<HTMLDivElement> {
  fromDate?: string;
  toDate?: string;
  agentId?: string;
}

export function ToneShiftsChart({ 
  className, 
  fromDate: propFromDate,
  toDate: propToDate,
  agentId,
  ...props 
}: ToneShiftsChartProps) {
  const defaultDateRange = getDefaultDateRange();
  const fromDate = propFromDate ?? defaultDateRange.from.toISOString();
  const toDate = propToDate ?? defaultDateRange.to.toISOString();
  const [apiData, setApiData] = useState<Record<string, number> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const queryParams = new URLSearchParams();
      if (fromDate) queryParams.append('from_date', fromDate);
      if (toDate) queryParams.append('to_date', toDate);
      if (agentId) queryParams.append('agent_id', agentId);
      
      const requestUrl = `/api/tone/shift${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      try {
        const response = await fetch(requestUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch tone shift data');
        }
        const jsonData = await response.json();
        console.log('Tone shift API response:', jsonData);
        
        if (typeof jsonData !== 'object' || jsonData === null) {
          throw new Error('Invalid response format');
        }
        
        setApiData(jsonData);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tone shift data';
        console.error('Error fetching tone shift data:', err);
        console.error('Request URL:', requestUrl);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fromDate, toDate, agentId]);

  const data = useMemo(() => {
    if (!apiData) return [];
    
    return Object.entries(apiData)
      .filter(([_, value]) => !isNaN(Number(value)))
      .map(([stage, value]) => ({
        stage,
        value: Math.min(Math.max(Number(value) / 100, -1), 1) // Ensure value is between -1 and 1
      }))
      .sort((a, b) => a.stage.localeCompare(b.stage)); // Sort by stage
  }, [apiData]);

  const customYAxisTicks = [-1, -0.5, 0, 0.5, 1]; // More granular scale
  const getYAxisLabel = (value: number) => {
    if (value === 1) return "Positive";
    if (value === 0) return "Neutral";
    if (value === -1) return "Negative";
    return "";
  };

  return (
    <Card className={cn("bg-white dark:bg-black max- border-[#DADADA] dark:border-[#232323] dark:text-gray-500 w-full rounded-[32px]", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-8">
        <CardTitle className="text-base font-medium">
          Tone Shifts During Conversations
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
            <div className="text-muted-foreground">No tone shift data available</div>
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
              />
              <XAxis
                dataKey="stage"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                dy={10}
                interval={0}
                height={60}
                tickMargin={20}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                domain={[-1, 1]}
                ticks={customYAxisTicks}
                tickFormatter={getYAxisLabel}
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
                formatter={(value: number) => [getYAxisLabel(value), "Tone"]}
              />
              <Area
                type="linear"
                dataKey="value"
                stroke="#C4E99F"
                strokeWidth={2}
                fill="url(#toneGradient)"
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

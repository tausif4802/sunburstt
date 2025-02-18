"use client";

import { Info } from "lucide-react";
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
import { useMultiCustomerTone } from "@/hooks/use-agent-tone";
import { LoadingSpinner } from "@/components/chat/LoadingSpinner";

interface ToneMultiCustomerChartProps
  extends React.HTMLAttributes<HTMLDivElement> {
  fromDate?: string;
  toDate?: string;
  agentId?: string;
}

export function ToneMultiCustomerChart({
  className,
  fromDate,
  toDate,
  agentId,
  ...props
}: ToneMultiCustomerChartProps) {
  const { data: apiData, isLoading, error } = useMultiCustomerTone({ 
    fromDate: fromDate || '', 
    toDate: toDate || '', 
    agentId: agentId || ''
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  // Fixed data points as per design
  const data = [
    { x: "1", value: 1 },
    { x: "5", value: 1 },
    { x: "10", value: 0 },
    { x: "25", value: 0 },
    { x: "50+", value: -1 }
  ];

  const customYAxisTicks = [-1, 0, 1];
  const getYAxisLabel = (value: number) => {
    if (value === 1) return "Positive";
    if (value === 0) return "Neutral";
    if (value === -1) return "Negative";
    return "";
  };

  return (
    <Card className={cn("bg-white dark:bg-black  border-[#DADADA] dark:border-[#232323] dark:text-gray-500 w-full rounded-[32px]", className)} {...props}>
      <CardHeader className="flex flex-row items-center space-y-0 pb-8">
        <CardTitle className="text-base font-medium">
          Tone vs Multi Customer Handling
          <Info className="ml-2 inline h-4 w-4 text-muted-foreground/70" />
        </CardTitle>
      </CardHeader>
      <CardContent className="relative pl-2">
        {/* Gray bar under X-axis */}
        <div className="absolute bottom-[35px] left-[80px] right-[30px] h-[2px] bg-gray-200/60" />

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: -15,
              bottom: 35,
            }}
          >
            <defs>
              <linearGradient id="toneGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="rgb(187, 247, 188)"
                  stopOpacity={0.15}
                />
                <stop
                  offset="100%"
                  stopColor="rgb(187, 247, 188)"
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={true}
              vertical={false}
              stroke="#E5E7EB"
              opacity={0.4}
            />
            <XAxis
              dataKey="x"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#6B7280",
                fontSize: 12,
                opacity: 0.7,
              }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#6B7280",
                fontSize: 12,
                opacity: 0.7,
              }}
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
              type="linear" // Changed from "stepAfter" to "linear"
              dataKey="value"
              isAnimationActive={false}
              stroke="#C4E99F"
              strokeWidth={2}
              fill="url(#toneGradient)"
              dot={{
                fill: "rgb(17, 67, 66)",
                r: 5,
                stroke: "white",
                strokeWidth: 2,
              }}
              activeDot={{
                fill: "rgb(17, 67, 66)",
                r: 6,
                stroke: "white",
                strokeWidth: 2,
              }}
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

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
import { useGrammarData } from "@/hooks/use-grammar-data";
import { useMemo } from "react";

interface GrammaticalAccuracyChartProps extends React.HTMLAttributes<HTMLDivElement> {
  fromDate?: string;
  toDate?: string;
  errorCode?: string;
  agentId?: string;
}

// Skeleton data for loading state
const skeletonData = Array.from({ length: 5 }, (_, i) => ({
  name: `Team ${i + 1}`,
  previous: Math.random() * 75,
  current: Math.random() * 75,
}));

export function GrammaticalAccuracyChart({
  fromDate,
  toDate,
  errorCode,
  agentId,
  className,
  ...props
}: GrammaticalAccuracyChartProps) {
  const filters = useMemo(() => ({
    fromDate,
    toDate,
    errorCode,
    agentId,
    isTeam: true
  }), [fromDate, toDate, errorCode, agentId]);

  const { 
    data: chartData, 
    loading, 
    error: fetchError,
    retry,
    retryCount 
  } = useGrammarData(filters);

  const transformedData = useMemo(() => 
    chartData?.map(item => ({
      name: item.id,
      previous: item.previous,
      current: item.current
    })) || []
  , [chartData]);

  // Common header component
  const ChartHeader = () => (
    <CardHeader className="flex flex-row items-center space-y-0 pb-8">
      <CardTitle className="text-base font-medium">
        Grammatical Accuracy Across Teams
        <Info className="ml-2 inline h-4 w-4 text-muted-foreground/70" />
      </CardTitle>
    </CardHeader>
  );

  // Show error state if fetch failed
  if (fetchError) {
    return (
      <Card
        className={cn(
          "bg-white dark:bg-black border-[#DADADA] dark:border-[#232323] dark:text-gray-500 w-full h-fit rounded-[32px]",
          className
        )}
        {...props}
      >
        <ChartHeader />
        <CardContent className="pl-2 h-[300px] flex flex-col items-center justify-center gap-4">
          <div className="text-red-500 text-center">
            <p className="mb-2">{fetchError}</p>
            <p className="text-sm text-muted-foreground">
              {retryCount > 0 ? `Retry attempt ${retryCount} of 3` : ''}
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
          "bg-white dark:bg-black border-[#DADADA] dark:border-[#232323] dark:text-gray-500 w-full h-fit rounded-[32px]",
          className
        )}
        {...props}
      >
        <ChartHeader />
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
                domain={[0, 75]}
                ticks={[0, 25, 50, 75]}
                unit="%"
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

  // Calculate date ranges for legend
  const currentEndDate = toDate ? new Date(toDate) : new Date();
  const currentStartDate = fromDate ? new Date(fromDate) : new Date(currentEndDate);
  currentStartDate.setDate(currentStartDate.getDate() - 28);

  const previousEndDate = new Date(currentStartDate);
  previousEndDate.setDate(previousEndDate.getDate() - 1);
  const previousStartDate = new Date(previousEndDate);
  previousStartDate.setDate(previousStartDate.getDate() - 28);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const currentPeriod = `${formatDate(currentStartDate)} - ${formatDate(currentEndDate)}`;
  const previousPeriod = `${formatDate(previousStartDate)} - ${formatDate(previousEndDate)}`;

  return (
    <Card
      className={cn(
        "bg-white dark:bg-black border-[#DADADA] dark:border-[#232323] dark:text-gray-500 w-full h-fit rounded-[32px]",
        className
      )}
      {...props}
    >
      <ChartHeader />
      <CardContent className="pl-2 pb-0">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={transformedData}
            margin={{
              top: 5,
              right: 10,
              left: -5,
              bottom: -5,
            }}
            barGap={-75}
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
              domain={[0, 75]}
              ticks={[0, 25, 50, 75, 100]}
              unit="%"
            />
            <Tooltip
              cursor={{ fill: "rgba(0, 0, 0, 0.04)" }}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #E5E7EB",
                borderRadius: "6px",
                boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              }}
              formatter={(value: number) => [`${value}%`]}
            />
            <Legend
              verticalAlign="bottom"
              height={72}
              content={({ payload }) => (
                <div className="mt-6 flex justify-center gap-4">
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
                              : "rgb(187, 247, 188)",
                        }}
                      />
                      <span className="text-sm text-muted-foreground">
                        {entry.value === "previous"
                          ? previousPeriod
                          : currentPeriod}
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
              fill="rgb(187, 247, 188)"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

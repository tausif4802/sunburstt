"use client";

import { InfoIcon } from "lucide-react";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { getDefaultDateRange } from "@/lib/utils";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChartContainer } from "@/components/ui/chart";
import { useToneAnalysis } from "@/hooks/use-agent-tone";
import { LoadingSpinner } from "@/components/chat/LoadingSpinner";

interface ToneAnalysisChartProps {
  fromDate?: string;
  toDate?: string;
  agentId?: string;
  onDataPointClick?: (conversationIds: string[], dataPoint: string) => void;
}

export function ToneAnalysisChart({ 
  fromDate: propFromDate, 
  toDate: propToDate, 
  agentId 
}: ToneAnalysisChartProps) {
  const defaultDateRange = getDefaultDateRange();
  const fromDate = propFromDate ?? defaultDateRange.from.toISOString();
  const toDate = propToDate ?? defaultDateRange.to.toISOString();
  const router = useRouter();
  const { data: apiData, conversationIds, isLoading, error } = useToneAnalysis({
    isPositive: true,
    fromDate,
    toDate,
    agentId
  });

  const data = useMemo(() => {
    if (!apiData || Object.keys(apiData).length === 0) {
      return [];
    }
    
    return Object.entries(apiData)
      .filter(([_, value]) => !isNaN(value)) // Filter out any invalid values
      .map(([attribute, value]) => ({
        attribute,
        value: Math.min(Math.max(value / 100, 0), 1) // Ensure value is between 0 and 1
      }))
      .sort((a, b) => b.value - a.value); // Sort by value descending
  }, [apiData]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;
  if (data.length === 0) {
    return (
      <Card className="w-full bg-white dark:bg-black border-[#DADADA] dark:border-[#232323] dark:text-gray-500 rounded-[32px]">
        <CardHeader className="flex flex-row items-center space-y-0 pb-8">
          <CardTitle className="text-gray-500 text-xl font-normal">
            Positive Tone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-gray-500">
            No tone data available
          </div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="w-full bg-white dark:bg-black  border-[#DADADA] dark:border-[#232323] dark:text-gray-500 rounded-[32px]">
      <CardHeader className="flex flex-row items-center space-y-0 pb-8">
        <CardTitle className="text-gray-500 text-xl font-normal">
          Positive Tone
        </CardTitle>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <InfoIcon className="ml-2 h-4 w-4 text-[#8e8e93]" />
            </TooltipTrigger>
            <TooltipContent className="bg-[#ffffff] text-[#6e6e6e]">
              Analysis of positive communication tone across different
              attributes
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            tone: {
              label: "Positive Tone Analysis",
              color: "#10b981",
            },
          }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius="80%"
              data={data}
              style={{
                fontSize: "14px",
                fontWeight: "normal",
              }}
            >
              <PolarGrid gridType="polygon" stroke="#dadada" opacity={0.5} />
              <PolarAngleAxis
                dataKey="attribute"
                tick={{
                  fill: "#6e6e6e",
                  fontSize: 14,
                  fontWeight: 400,
                }}
                axisLine={{
                  stroke: "#dadada",
                  strokeWidth: 1,
                }}
              />
                <Radar
                  name="Tone"
                  dataKey="value"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                  dot={{
                    fill: "#10b981",
                    r: 4,
                  }}
                  onClick={(data: any) => {
                    if (data && data.attribute) {
                      const params = new URLSearchParams({
                        conversation_ids: conversationIds[data.attribute]?.join(',') || '',
                        from_date: fromDate,
                        to_date: toDate,
                        source: 'agent-tone',
                        data_point: `positive-tone-${data.attribute.toLowerCase()}`
                      });
                      
                      if (agentId) {
                        params.append('agent_id', agentId);
                      }
                      
                      router.push(`/conversations?${params.toString()}`);
                    }
                  }}
                />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

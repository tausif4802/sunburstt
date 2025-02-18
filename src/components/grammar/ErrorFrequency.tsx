"use client";

import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GrammarMapperResponse {
  [key: string]: string;
}

interface TimestampBasedResponse {
  [timestamp: string]: {
    [agentId: string]: {
      [errorCode: string]: number;
    };
  };
}

interface DirectResponse {
  [errorCode: string]: {
    value: number;
    conversation_id_list: string[];
  };
}

type ErrorFrequencyResponse = TimestampBasedResponse | DirectResponse;

function isTimestampBasedResponse(data: ErrorFrequencyResponse): data is TimestampBasedResponse {
  return Object.keys(data).some(key => {
    const value = (data as TimestampBasedResponse)[key];
    return value && typeof value === 'object' && Object.keys(value).length > 0;
  });
}

interface ChartData {
  name: string;
  value: number;
  conversationCount?: number;
}

// Generate color array from light to dark green
const COLORS = [
  "rgb(17, 67, 66)", // Darkest
  "rgb(25, 85, 80)",
  "rgb(34, 103, 94)",
  "rgb(43, 121, 108)",
  "rgb(52, 139, 122)",
  "rgb(61, 157, 136)",
  "rgb(70, 175, 150)",
  "rgb(96, 186, 155)",
  "rgb(122, 197, 160)",
  "rgb(148, 208, 165)",
  "rgb(174, 219, 170)",
  "rgb(187, 247, 188)", // Lightest
  "rgb(180, 233, 175)",
  "rgb(187, 247, 188)",
];

interface ErrorFrequencyProps extends React.HTMLAttributes<HTMLDivElement> {
  agentId?: string;
  fromDate?: string;
  toDate?: string;
}

async function fetchGrammarMapper(): Promise<GrammarMapperResponse> {
  try {
    console.log("🔄 Making API call to Grammar Mapper endpoint...");
    const response = await fetch("/api/grammar/mapper");

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error ||
          `Failed to fetch grammar mapper data: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("✅ Grammar Mapper API Response:", data);
    if (!data || Object.keys(data).length === 0) {
      console.error("❌ Grammar mapper returned empty data");
      throw new Error("No grammar types available");
    }
    console.log("Grammar types successfully loaded:", Object.keys(data).length, "types");
    return data;
  } catch (error) {
    console.error("❌ Error fetching grammar mapper:", error);
    throw error;
  }
}

async function fetchErrorFrequency(agentId?: string, fromDate?: string, toDate?: string): Promise<ErrorFrequencyResponse> {
  try {
    console.log("🔄 Making API call to Error Frequency endpoint...");
    const queryParams = new URLSearchParams();
    if (agentId) queryParams.append('agent_id', agentId);
    if (fromDate) queryParams.append('from_date', fromDate);
    if (toDate) queryParams.append('to_date', toDate);
    
    const url = `/api/grammar/pie${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error ||
          `Failed to fetch error frequency data: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("✅ Error Frequency API Response:", data);
    if (!data || Object.keys(data).length === 0) {
      console.error("❌ Error frequency API returned empty data");
      throw new Error("No error frequency data available");
    }
    console.log("Error frequency data successfully loaded:", Object.keys(data).length, "timestamps");
    return data;
  } catch (error) {
    console.error("❌ Error fetching error frequency:", error);
    throw error;
  }
}

export function ErrorFrequency({
  className,
  agentId,
  fromDate,
  toDate,
  ...props
}: ErrorFrequencyProps) {
  const [data, setData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔄 Starting data load...");
      const [mapperData, frequencyData] = await Promise.all([
        fetchGrammarMapper(),
        fetchErrorFrequency(agentId, fromDate, toDate),
      ]);
      console.log("✅ Both APIs returned data successfully");

      // Process the response based on its format
      let errorCounts: { [key: string]: { value: number; conversation_id_list: string[] } };
      
      if (isTimestampBasedResponse(frequencyData)) {
        // Handle timestamp-based response
        console.log("📅 Processing timestamp-based response");
        const timestamps = Object.keys(frequencyData).sort().reverse();
        
        if (timestamps.length === 0) {
          console.warn("⚠️ No timestamps found in frequency data");
          setData([]);
          return;
        }

        const latestTimestamp = timestamps[0];
        console.log("📅 Using latest timestamp:", latestTimestamp);
        const latestData = frequencyData[latestTimestamp];

        // Aggregate error counts across all agents
        errorCounts = {};
        console.log("🔄 Aggregating error counts from agents:", Object.keys(latestData).length, "agents");
        
        Object.values(latestData).forEach((agentData) => {
          Object.entries(agentData).forEach(([code, count]) => {
            if (!errorCounts[code]) {
              errorCounts[code] = { value: 0, conversation_id_list: [] };
            }
            errorCounts[code].value += count;
          });
        });
      } else {
        // Handle direct response with conversation_id_list
        console.log("📊 Processing direct response");
        errorCounts = frequencyData;
      }
      
      console.log("✅ Processed error counts:", errorCounts);

      // Transform the data into the format needed for the chart
      console.log("🔄 Transforming data for chart using mapper:", Object.keys(mapperData).length, "types");
      const chartData: ChartData[] = Object.entries(mapperData).map(
        ([code, name]) => {
          const errorData = errorCounts[code] || { value: 0, conversation_id_list: [] };
          console.log(`📊 ${code}: ${name} = ${errorData.value} (${errorData.conversation_id_list.length} conversations)`);
          return {
            name,
            value: errorData.value,
            conversationCount: errorData.conversation_id_list.length,
          };
        }
      );

      setData(chartData);
      console.log("✅ Data successfully loaded and transformed:", chartData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load grammar data"
      );
      console.error("❌ Error loading data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [agentId, fromDate, toDate]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-[600px]">
          <div className="text-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">
                Loading error frequency data...
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-[600px]">
          <div className="text-center">
            <div className="text-destructive">
              <p className="font-medium">Error loading data</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <button
                onClick={() => loadData()}
                className="mt-4 text-sm text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-[600px]">
          <p className="text-sm text-muted-foreground">
            No error frequency data available
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-center">
        {/* Error List */}
        <div className="space-y-4">
          {data.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center justify-between border-b border-border/40 pb-4 last:border-0 last:pb-0"
            >
              <span className="text-sm text-muted-foreground">{item.name}</span>
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: COLORS[index] }}
                />
                <span className="text-sm font-medium">
                  {item.value}
                  {item.conversationCount !== undefined && (
                    <span className="text-xs text-muted-foreground ml-1">
                      ({item.conversationCount} conversations)
                    </span>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Donut Chart */}
        <div className="h-[500px] lg:h-[600px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="25%"
                outerRadius="100%"
                paddingAngle={0}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "6px",
                  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                }}
                formatter={(value, name, entry) => {
                  const item = data[entry.payload.index];
                  return [
                    `${value} (${item.conversationCount} conversations)`,
                    name
                  ];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <Card
      className={cn(
        "bg-white dark:bg-black  border-[#DADADA] dark:border-[#232323] dark:text-gray-500 w-full rounded-[32px] mb-10",
        className
      )}
      {...props}
    >
      <CardHeader className="flex flex-row items-center space-y-0 pb-8">
        <CardTitle className="text-base font-medium">
          Error Frequency
          <Info className="ml-2 inline h-4 w-4 text-muted-foreground/70" />
        </CardTitle>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}

"use client";

import { ToneAnalysisChart } from "@/components/tone-analysis/ToneAnalysisChart";
import { NegativeToneChart } from "@/components/tone-analysis/NegativeToneChart";
import { ToneAnalysisTable } from "@/components/tone-analysis/ToneAnalysisTable";
import { ToneShiftsChart } from "@/components/tone-analysis/ToneShift";
import { AgentToneChart } from "@/components/tone-analysis/AgentToneChart";
import { ToneAlerts } from "@/components/tone-analysis/ToneAlerts";
import { ToneMultiCustomerChart } from "@/components/tone-analysis/ToneVsMulticustomers";
import { FilterChip } from "@/components/grammar/FilterChip";
import { FilterMenu } from "@/components/grammar/FilterMenu";
import { CustomDatePicker } from "@/components/grammar/DatePicker";
import { X } from "lucide-react";
import { useState } from "react";
import { getDefaultDateRange } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

export default function AgentToneAnalysisPage() {
  const defaultRange = getDefaultDateRange();
  const [fromDate, setFromDate] = useState<string>(defaultRange.from.toISOString());
  const [toDate, setToDate] = useState<string>(defaultRange.to.toISOString());
  const [timeRange, setTimeRange] = useState<string>();
  const [errorCode, setErrorCode] = useState<string>();
  const [agentId, setAgentId] = useState<string>();
  const [teamId, setTeamId] = useState<string>();
  const [topic, setTopic] = useState<string>();

  const handleFilterChange = (filterType: string, subType?: string) => {
    switch (filterType) {
      case "time":
        setTimeRange(subType);
        break;
      case "agent":
        setAgentId(subType);
        break;
      case "team":
        setTeamId(subType);
        break;
      case "topic":
        setTopic(subType);
        break;
      case "error-type":
        setErrorCode(subType);
        break;
    }
  };

  return (
    <main className="flex flex-col gap-6">
      <div className="flex items-center justify-start gap-4">
        <CustomDatePicker 
          initialRange={defaultRange}
          onDateChange={(range: DateRange) => {
            if (range.from) {
              setFromDate(range.from.toISOString());
            }
            if (range.to) {
              setToDate(range.to.toISOString());
            }
          }}
        />
        <FilterMenu onSelect={handleFilterChange} />
        {errorCode && (
          <FilterChip className="bg-white">
            Error Type <X size={10} onClick={() => setErrorCode(undefined)} />
          </FilterChip>
        )}
      </div>
      <ToneShiftsChart 
        fromDate={fromDate}
        toDate={toDate}
        agentId={agentId}
      />
      <ToneAnalysisTable />
      <AgentToneChart />
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <ToneAnalysisChart />
        <NegativeToneChart />
        <ToneMultiCustomerChart />
        <ToneAlerts />
      </div>
    </main>
  );
}

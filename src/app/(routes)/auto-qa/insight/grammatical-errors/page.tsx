"use client";

import { ErrorFrequency } from "@/components/grammar/ErrorFrequency";
import { ErrorFrequencyChart } from "@/components/grammar/ErrorFrequencyChart";
import { ErrorTrendsChart } from "@/components/grammar/ErrorTrendsChart";
import { FilterChip } from "@/components/grammar/FilterChip";
import { GrammaticalAccuracyChart } from "@/components/grammar/GrammaticalAccuracyChart";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import type { DateRange } from "react-day-picker";
import { FilterMenu } from "@/components/grammar/FilterMenu";
import { CustomDatePicker } from "@/components/grammar/DatePicker";
import { getDefaultDateRange } from "@/lib/utils";

const errorTypes = {
  G_101: "Sentence Structure Error",
  G_102: "Subject-Verb Agreement Error",
  G_103: "Pronoun Usage Error",
  G_104: "Punctuation Error",
  G_105: "Regular Spelling Error",
  G_106: "Context-Altering Spelling Error",
  G_107: "Preposition Error",
  G_108: "Capitalization Error",
  G_109: "Tone/Style Error",
  G_110: "Redundancy and Wordiness Error",
  G_111: "Negation Error",
  G_112: "Lack of Consistency Error",
  G_113: "Missing Articles Error",
  G_114: "Misuse of Conjunctions Error",
  G_115: "Spelling Error",
};

export default function GrammarPage() {
  const defaultRange = getDefaultDateRange();
  const [fromDate, setFromDate] = useState<string | undefined>(defaultRange.from.toISOString().split("T")[0]);
  const [toDate, setToDate] = useState<string | undefined>(defaultRange.to.toISOString().split("T")[0]);
  const [timeRange, setTimeRange] = useState<string>();
  const [errorCode, setErrorCode] = useState<string>("G_101"); // Default to Sentence Structure Error
  const [agentId, setAgentId] = useState<string>();
  const [teamId, setTeamId] = useState<string>();
  const [topic, setTopic] = useState<string>();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleDateChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setFromDate(range.from.toISOString().split("T")[0]);
      setToDate(range.to.toISOString().split("T")[0]);
      // Clear time range when date range is selected
      setTimeRange(undefined);
      setActiveFilters(prev => prev.filter(f => f !== 'time'));
    }
  };

  const handleFilterSelect = (filterType: string, subType?: string) => {
    switch (filterType) {
      case "time":
        if (subType) {
          setTimeRange(subType);
          // Reset to default date range when time range is selected
          const defaultDates = getDefaultDateRange();
          setFromDate(defaultDates.from.toISOString().split("T")[0]);
          setToDate(defaultDates.to.toISOString().split("T")[0]);
          setActiveFilters(prev => [...prev.filter(f => f !== 'time'), 'time']);
        }
        break;
      case "error-type":
        if (subType) {
          setErrorCode(subType);
          setActiveFilters(prev => [...prev.filter(f => f !== 'error-type'), 'error-type']);
        }
        break;
      case "agent":
        if (subType) {
          setAgentId(subType);
          setActiveFilters(prev => [...prev.filter(f => f !== 'agent'), 'agent']);
        }
        break;
      case "team":
        if (subType) {
          setTeamId(subType);
          setActiveFilters(prev => [...prev.filter(f => f !== 'team'), 'team']);
        }
        break;
      case "topic":
        if (subType) {
          setTopic(subType);
          setActiveFilters(prev => [...prev.filter(f => f !== 'topic'), 'topic']);
        }
        break;
    }
  };

  const removeFilter = (filterType: string) => {
    switch (filterType) {
      case "time":
        setTimeRange(undefined);
        break;
      case "error-type":
        setErrorCode("G_101"); // Reset to default error code
        break;
      case "agent":
        setAgentId(undefined);
        break;
      case "team":
        setTeamId(undefined);
        break;
      case "topic":
        setTopic(undefined);
        break;
    }
    setActiveFilters(prev => prev.filter(f => f !== filterType));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-start gap-4">
        <CustomDatePicker onDateChange={handleDateChange} initialRange={defaultRange} />
        <div className="flex items-center gap-2">
          {activeFilters.map((filterType) => {
            let label = "";
            let value = "";
            switch (filterType) {
              case "time":
                label = "Time Range";
                value = timeRange || "";
                break;
              case "error-type":
                label = "Error Type";
                value = errorCode ? errorTypes[errorCode as keyof typeof errorTypes] : "";
                break;
              case "agent":
                label = "Agent";
                value = agentId || "";
                break;
              case "team":
                label = "Team";
                value = teamId || "";
                break;
              case "topic":
                label = "Topic";
                value = topic || "";
                break;
            }
            if (!value) return null;
            return (
              <FilterChip key={filterType} onRemove={() => removeFilter(filterType)}>
                {`${label}: ${value}`} <X className="h-3 w-3" />
              </FilterChip>
            );
          })}
          <FilterMenu onSelect={handleFilterSelect} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6">
        <ErrorFrequencyChart
          fromDate={fromDate}
          toDate={toDate}
          errorCode={errorCode}
        />
        <ErrorTrendsChart
          fromDate={fromDate}
          toDate={toDate}
          errorCode={errorCode}
        />

        <GrammaticalAccuracyChart
          fromDate={fromDate}
          toDate={toDate}
          errorCode={errorCode}
        />
        <ErrorFrequency 
          agentId={agentId}
          fromDate={fromDate}
          toDate={toDate}
        />
      </div>
    </div>
  );
}

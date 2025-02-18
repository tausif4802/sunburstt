'use client';

import { ToneAnalysisChart } from '@/components/tone-analysis/ToneAnalysisChart';
import { NegativeToneChart } from '@/components/tone-analysis/NegativeToneChart';
import { ToneAnalysisTable } from '@/components/tone-analysis/ToneAnalysisTable';
import { ToneShiftsChart } from '@/components/tone-analysis/ToneShift';
import { AgentToneChart } from '@/components/tone-analysis/AgentToneChart';
import { ToneMultiCustomerChart } from '@/components/tone-analysis/ToneVsMulticustomers';
import { ToneAlerts } from '@/components/tone-analysis/ToneAlerts';
import { FilterChip } from '@/components/grammar/FilterChip';
import { FilterMenu } from '@/components/grammar/FilterMenu';
import { CustomDatePicker } from '@/components/grammar/DatePicker';
import { X } from 'lucide-react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { getDefaultDateRange } from '@/lib/utils';

export default function AgentToneAnalysisPage() {
  const defaultRange = getDefaultDateRange();
  const [fromDate, setFromDate] = useState<string>(
    defaultRange.from.toISOString().split('T')[0]
  );
  const [toDate, setToDate] = useState<string>(
    defaultRange.to.toISOString().split('T')[0]
  );
  const [timeRange, setTimeRange] = useState<string | undefined>(undefined);
  const [agentId, setAgentId] = useState<string>();
  const [teamId, setTeamId] = useState<string>();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleDateChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setFromDate(range.from.toISOString().split('T')[0]);
      setToDate(range.to.toISOString().split('T')[0]);
      // Clear time range when date range is selected
      setTimeRange(undefined);
      setActiveFilters((prev) => prev.filter((f) => f !== 'time'));
    }
  };

  const handleFilterSelect = (filterType: string, subType?: string) => {
    switch (filterType) {
      case 'time': {
        if (subType) {
          setTimeRange(subType);
          // Reset to default date range when time range is selected
          const defaultDates = getDefaultDateRange();
          const fromDateStr = defaultDates.from.toISOString().split('T')[0];
          const toDateStr = defaultDates.to.toISOString().split('T')[0];
          setFromDate(fromDateStr);
          setToDate(toDateStr);
          setActiveFilters((prev) => [
            ...prev.filter((f) => f !== 'time'),
            'time',
          ]);
        }
        break;
      }
      case 'agent':
        if (subType) {
          setAgentId(subType);
          setActiveFilters((prev) => [
            ...prev.filter((f) => f !== 'agent'),
            'agent',
          ]);
        }
        break;
      case 'team':
        if (subType) {
          setTeamId(subType);
          setActiveFilters((prev) => [
            ...prev.filter((f) => f !== 'team'),
            'team',
          ]);
        }
        break;
    }
  };

  const removeFilter = (filterType: string) => {
    switch (filterType) {
      case 'time': {
        setTimeRange(undefined);
        // Reset to default date range when removing time filter
        const defaultDates = getDefaultDateRange();
        const fromDateStr = defaultDates.from.toISOString().split('T')[0];
        const toDateStr = defaultDates.to.toISOString().split('T')[0];
        setFromDate(fromDateStr);
        setToDate(toDateStr);
        break;
      }
      case 'agent':
        setAgentId(undefined);
        break;
      case 'team':
        setTeamId(undefined);
        break;
    }
    setActiveFilters((prev) => prev.filter((f) => f !== filterType));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-start gap-4">
        <CustomDatePicker
          onDateChange={handleDateChange}
          initialRange={defaultRange}
        />
        <div className="flex items-center gap-2">
          {activeFilters.map((filterType) => {
            let label = '';
            let value = '';
            switch (filterType) {
              case 'time':
                label = 'Time Range';
                value = timeRange || '';
                break;
              case 'agent':
                label = 'Agent';
                value = agentId || '';
                break;
              case 'team':
                label = 'Team';
                value = teamId || '';
                break;
            }
            if (!value) return null;
            return (
              <FilterChip
                key={filterType}
                onRemove={() => removeFilter(filterType)}
              >
                {`${label}: ${value}`} <X className="h-3 w-3" />
              </FilterChip>
            );
          })}
          <FilterMenu onSelect={handleFilterSelect} />
        </div>
      </div>
      <ToneShiftsChart fromDate={fromDate} toDate={toDate} agentId={agentId} />
      <ToneAnalysisTable
        fromDate={fromDate}
        toDate={toDate}
        agentId={agentId}
      />
      <AgentToneChart fromDate={fromDate} toDate={toDate} agentId={agentId} />
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mb-6">
        <ToneAnalysisChart
          fromDate={fromDate}
          toDate={toDate}
          agentId={agentId}
        />
        <NegativeToneChart
          fromDate={fromDate}
          toDate={toDate}
          agentId={agentId}
        />
        <ToneMultiCustomerChart
          fromDate={fromDate}
          toDate={toDate}
          agentId={agentId}
        />
        <ToneAlerts fromDate={fromDate} toDate={toDate} agentId={agentId} />
      </div>
    </div>
  );
}

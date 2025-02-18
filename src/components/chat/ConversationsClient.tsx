'use client';

import { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { X } from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import AnalyticsPanel from './Analytics';
import { CustomDatePicker } from '@/components/grammar/DatePicker';
import { FilterMenu } from '@/components/grammar/FilterMenu';
import { FilterChip } from '@/components/grammar/FilterChip';
import { getDefaultDateRange } from '@/lib/utils';

interface ConversationsClientProps {
  initialParams: {
    fromDate: string;
    toDate: string;
    agentId?: string;
    conversationIds?: string[];
    source?: string;
    dataPoint?: string;
  };
}

export function ConversationsClient({
  initialParams,
}: ConversationsClientProps) {
  const [fromDate, setFromDate] = useState<string>(initialParams.fromDate);
  const [toDate, setToDate] = useState<string>(initialParams.toDate);
  const [timeRange, setTimeRange] = useState<string | undefined>(undefined);
  const [agentId, setAgentId] = useState<string | undefined>(
    initialParams.agentId
  );
  const [activeConversation, setActiveConversation] = useState<
    string | undefined
  >(initialParams.conversationIds?.[0]);
  const [teamId, setTeamId] = useState<string>();
  const [activeFilters, setActiveFilters] = useState<string[]>(
    agentId ? ['agent'] : []
  );

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
          initialRange={{
            from: new Date(fromDate),
            to: new Date(toDate),
          }}
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

      <div className="flex items-start justify-start gap-6 self-stretch">
        <div className="flex-1">
          <ChatInterface
            fromDate={fromDate}
            toDate={toDate}
            agentId={agentId}
            activeConversation={activeConversation}
            source={initialParams.source}
            dataPoint={initialParams.dataPoint}
            onConversationSelect={setActiveConversation}
          />
        </div>
        <div className="w-[310px]">
          <AnalyticsPanel
            fromDate={fromDate}
            toDate={toDate}
            agentId={agentId}
            conversationId={activeConversation}
          />
        </div>
      </div>
    </div>
  );
}

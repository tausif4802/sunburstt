"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Clock,
  User,
  Users,
  Type,
  AlertTriangle,
  Plus,
  Check,
  Loader2,
} from "lucide-react";
import { useAgentData } from "@/hooks/use-grammar-data";

interface FilterMenuProps {
  onSelect: (filterType: string, subType?: string) => void;
}

export function FilterMenu({ onSelect }: FilterMenuProps) {
  const [selectedErrorType, setSelectedErrorType] = React.useState<string>("");
  const [selectedAgent, setSelectedAgent] = React.useState<string>("");
  const { data: agentData, loading: agentLoading, error: agentError } = useAgentData();

  const errorTypes = [
    {
      id: "grammatical-error",
      label: "Grammatical Error",
    },
    {
      id: "agent-error",
      label: "Agent Error",
    },
    {
      id: "tone-error",
      label: "Tone Error",
    },
  ];

  const filterOptions = [
    {
      id: "time",
      label: "Time",
      icon: Clock,
      subItems: [
        { id: "1h", label: "Last Hour" },
        { id: "24h", label: "Last 24 Hours" },
        { id: "7d", label: "Last 7 Days" },
        { id: "30d", label: "Last 30 Days" }
      ]
    },
    {
      id: "agent",
      label: "Agent",
      icon: User,
      hasSubMenu: true,
    },
    {
      id: "team",
      label: "Team",
      icon: Users,
    },
    {
      id: "topic",
      label: "Topic",
      icon: Type,
    },
    {
      id: "error-type",
      label: "Error Type",
      icon: AlertTriangle,
      hasSubMenu: true,
    },
  ];

  const handleErrorTypeSelect = (errorType: string) => {
    setSelectedErrorType(errorType);
    onSelect("error-type", errorType);
  };

  const handleAgentSelect = (agentId: string, team: string) => {
    setSelectedAgent(agentId);
    onSelect("agent", agentId);
  };

  const renderAgentSubmenu = () => {
    if (agentLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      );
    }

    if (agentError) {
      return (
        <div className="p-4 text-sm text-red-500">
          Failed to load agents
        </div>
      );
    }

    if (!agentData) {
      return (
        <div className="p-4 text-sm text-gray-500">
          No agents found
        </div>
      );
    }

    return Object.entries(agentData).map(([team, agents]) => (
      <React.Fragment key={team}>
        <div className="px-3 py-2 text-xs font-semibold text-gray-500">
          {team}
        </div>
        {agents.map((agent) => (
          <DropdownMenuItem
            key={agent.id}
            onClick={() => handleAgentSelect(agent.id, team)}
            className={`
              flex items-center justify-between gap-2 px-3 py-2 text-sm cursor-pointer rounded-full
              ${
                selectedAgent === agent.id
                  ? "bg-teal-600 text-white hover:bg-teal-700"
                  : "hover:bg-gray-100"
              }
            `}
          >
            {agent.id}
            {selectedAgent === agent.id && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </React.Fragment>
    ));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full gap-2 bg-card border-border dark:bg-card-dark dark:border-border-dark border hover:bg-gray-50"
        >
          <Plus className="h-4 w-4" />
          Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[180px] bg-white rounded-3xl p-2"
      >
        {filterOptions.map((option) =>
          option.id === "agent" ? (
            <DropdownMenuSub key={option.id}>
              <DropdownMenuSubTrigger className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded-md">
                <option.icon className="h-4 w-4 text-gray-500" />
                {option.label}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-[180px] max-h-[400px] overflow-y-auto bg-white rounded-3xl p-1">
                  {renderAgentSubmenu()}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          ) : option.hasSubMenu ? (
            <DropdownMenuSub key={option.id}>
              <DropdownMenuSubTrigger className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded-md">
                <option.icon className="h-4 w-4 text-gray-500" />
                {option.label}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-[180px] bg-white rounded-3xl p-1">
                  {errorTypes.map((errorType) => (
                    <DropdownMenuItem
                      key={errorType.id}
                      onClick={() => handleErrorTypeSelect(errorType.id)}
                      className={`
                        flex items-center justify-between gap-2 space-y-6 px-3 py-2 text-sm cursor-pointer rounded-md
                        ${
                          selectedErrorType === errorType.id
                            ? "bg-teal-600 text-white hover:bg-teal-700 rounded-full"
                            : "hover:bg-gray-100 rounded-full"
                        }
                      `}
                    >
                      {errorType.label}
                      {selectedErrorType === errorType.id && (
                        <Check className="h-4 w-4" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          ) : option.subItems ? (
            <DropdownMenuSub key={option.id}>
              <DropdownMenuSubTrigger className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded-md">
                <option.icon className="h-4 w-4 text-gray-500" />
                {option.label}
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-[180px] bg-white rounded-3xl p-1">
                  {option.subItems.map((subItem) => (
                    <DropdownMenuItem
                      key={subItem.id}
                      onClick={() => onSelect(option.id, subItem.id)}
                      className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-full"
                    >
                      {subItem.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          ) : (
            <DropdownMenuItem
              key={option.id}
              onClick={() => onSelect(option.id)}
              className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-full"
            >
              <option.icon className="h-4 w-4 text-gray-500" />
              {option.label}
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

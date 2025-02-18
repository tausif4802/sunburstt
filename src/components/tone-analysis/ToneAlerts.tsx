"use client";

import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDefaultDateRange } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useAgentAlerts } from "@/hooks/use-agent-tone";
import { LoadingSpinner } from "@/components/chat/LoadingSpinner";

interface ToneAlertsProps extends React.HTMLAttributes<HTMLDivElement> {
  fromDate?: string;
  toDate?: string;
  agentId?: string;
}

export function ToneAlerts({
  className,
  fromDate: propFromDate,
  toDate: propToDate,
  agentId,
  ...props
}: ToneAlertsProps) {
  const defaultDateRange = getDefaultDateRange();
  const fromDate = propFromDate ?? defaultDateRange.from.toISOString();
  const toDate = propToDate ?? defaultDateRange.to.toISOString();
  const { alertData, isLoading, error } = useAgentAlerts({
    fromDate,
    toDate,
    agentId,
  });

  if (isLoading) {
    return (
      <Card className={cn("bg-white dark:bg-black border-[#DADADA] dark:border-[#232323] dark:text-gray-500 w-full rounded-[32px]", className)} {...props}>
        <CardHeader className="flex flex-row items-center space-y-0 pb-6">
          <CardTitle className="text-base font-medium">
            Tone Alerts
            <Info className="ml-2 inline h-4 w-4 text-muted-foreground/70" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("bg-white dark:bg-black border-[#DADADA] dark:border-[#232323] dark:text-gray-500 w-full rounded-[32px]", className)} {...props}>
        <CardHeader className="flex flex-row items-center space-y-0 pb-6">
          <CardTitle className="text-base font-medium">
            Tone Alerts
            <Info className="ml-2 inline h-4 w-4 text-muted-foreground/70" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80">
            <div className="text-red-500 flex items-center gap-2">
              <span className="text-lg">Error:</span> {error}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!alertData || Object.keys(alertData).length === 0) {
    return (
      <Card className={cn("bg-white dark:bg-black border-[#DADADA] dark:border-[#232323] dark:text-gray-500 w-full rounded-[32px]", className)} {...props}>
        <CardHeader className="flex flex-row items-center space-y-0 pb-6">
          <CardTitle className="text-base font-medium">
            Tone Alerts
            <Info className="ml-2 inline h-4 w-4 text-muted-foreground/70" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-80">
            <div className="text-muted-foreground">No tone alerts available</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const alerts = Object.entries(alertData)
    .map(([id, data]) => ({
      id,
      alerts: data?.value || 0
    }))
    .sort((a, b) => b.alerts - a.alerts); // Sort by number of alerts descending

  return (
    <Card
      className={cn(
        "bg-white dark:bg-black  border-[#DADADA] dark:border-[#232323] dark:text-gray-500 w-full rounded-[32px]",
        className
      )}
      {...props}
    >
      <CardHeader className="flex flex-row items-center space-y-0 pb-6">
        <CardTitle className="text-base font-medium">
          Tone Alerts
          <Info className="ml-2 inline h-4 w-4 text-muted-foreground/70" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead
                  className="text-xs font-medium text-muted-foreground/70"
                  colSpan={2}
                >
                  Agent
                </TableHead>
                <TableHead className="text-right text-xs font-medium text-muted-foreground/70">
                  No. of Alerts
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow
                  key={alert.id}
                  className="hover:bg-muted/30 [&:not(:last-child)>td]:border-muted/30 "
                >
                  <TableCell
                    className="text-sm font-normal text-muted-foreground"
                    colSpan={2}
                  >
                    Agent {alert.id}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex h-6 min-w-[2.5rem] items-center justify-center rounded-full bg-[rgb(187,247,188)] px-2 text-sm font-medium text-[rgb(17,67,66)]">
                      {alert.alerts}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

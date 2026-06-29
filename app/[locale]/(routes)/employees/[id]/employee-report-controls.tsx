"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  EmployeeChartData,
  ReportTimeline,
} from "@/actions/employees/get-employee-charts";
import type { EmployeeActivityEntry } from "@/actions/get-employee-activity";
import { EmployeeBreakdownChart, EmployeeMonthlyChart } from "./employee-charts";

function getCurrentMonthValue() {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return month;
}

function getCurrentWeekValue() {
  const now = new Date();
  const current = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const day = current.getUTCDay() || 7;
  current.setUTCDate(current.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(current.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((current.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

  return `${current.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function formatDate(value?: Date | string | null) {
  if (!value) {
    return "No date";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function typeStyles(type: EmployeeActivityEntry["type"]) {
  switch (type) {
    case "company":
      return "bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 hover:bg-cyan-500/10";
    case "contact":
      return "bg-sky-500/10 text-sky-700 hover:bg-sky-500/10 dark:text-sky-300";
    case "lead":
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10";
    case "opportunity":
      return "bg-orange-500/10 text-orange-700 dark:text-orange-300 hover:bg-orange-500/10";
    case "contract":
      return "bg-violet-500/10 text-violet-700 dark:text-violet-300 hover:bg-violet-500/10";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function statusStyles(status?: string | null) {
  if (!status) {
    return "bg-muted text-muted-foreground";
  }

  const normalized = status.toLowerCase();
  if (normalized.includes("won") || normalized.includes("active") || normalized.includes("closed")) {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10";
  }

  if (normalized.includes("lost") || normalized.includes("inactive") || normalized.includes("cancel")) {
    return "bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/10";
  }

  return "bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10";
}

function ActivityTable({ activity }: { activity: EmployeeActivityEntry[] }) {
  const hasRows = activity.length > 0;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4">
        <div>
          <h2 className="text-base font-semibold">Recent activity</h2>
          <p className="text-xs text-muted-foreground">
            Filtered entries for the selected report window
          </p>
        </div>
        <Badge variant="secondary">{activity.length} entries</Badge>
      </div>

      {hasRows ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-muted/40 text-left text-xs uppercase tracking-[0.08em] text-muted-foreground">
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Entry</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Open</th>
              </tr>
            </thead>
            <tbody>
              {activity.map((entry) => (
                <tr key={entry.id} className="border-t border-border/70 transition hover:bg-muted/30">
                  <td className="px-4 py-3 align-middle">
                    <Badge className={typeStyles(entry.type)}>{entry.type}</Badge>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{entry.title}</p>
                      <p className="text-xs text-muted-foreground">{entry.subtitle}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <Badge className={statusStyles(entry.status)}>
                      {entry.status ?? "No status"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 align-middle text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      <span>{formatDate(entry.createdAt)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <Link
                      href={entry.href}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
                    >
                      View
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-4 py-10 text-sm text-muted-foreground">
          No entries match the selected timeline.
        </div>
      )}
    </div>
  );
}

export function EmployeeReportControls({
  employeeId,
  initialData,
  initialActivity,
}: {
  employeeId: string;
  initialData: EmployeeChartData;
  initialActivity: EmployeeActivityEntry[];
}) {
  const [timeline, setTimeline] = useState<ReportTimeline>(initialData.timeline);
  const [selected, setSelected] = useState(initialData.selected);
  const [chartData, setChartData] = useState(initialData);
  const [activityData, setActivityData] = useState(initialActivity);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSelected(timeline === "weekly" ? getCurrentWeekValue() : getCurrentMonthValue());
  }, [timeline]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadReport() {
      setLoading(true);
      setError(null);

      try {
        const [chartResponse, activityResponse] = await Promise.all([
          fetch(
            `/api/employees/${employeeId}/charts?timeline=${timeline}&selected=${encodeURIComponent(selected)}`,
            {
              cache: "no-store",
              signal: controller.signal,
            }
          ),
          fetch(
            `/api/employees/${employeeId}/activity?timeline=${timeline}&selected=${encodeURIComponent(selected)}`,
            {
              cache: "no-store",
              signal: controller.signal,
            }
          ),
        ]);

        if (!chartResponse.ok || !activityResponse.ok) {
          throw new Error("Unable to load report data");
        }

        const [chartPayload, activityPayload] = await Promise.all([
          chartResponse.json() as Promise<EmployeeChartData>,
          activityResponse.json() as Promise<{ activity: EmployeeActivityEntry[] }>,
        ]);

        setChartData(chartPayload);
        setActivityData(activityPayload.activity);
      } catch (fetchError) {
        if ((fetchError as Error).name === "AbortError") {
          return;
        }

        setError("Unable to load the selected report. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    void loadReport();

    return () => controller.abort();
  }, [employeeId, selected, timeline]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-2">
            <Label htmlFor="timeline-select">Report timeline</Label>
            <Select value={timeline} onValueChange={(value) => setTimeline(value as ReportTimeline)}>
              <SelectTrigger id="timeline-select">
                <SelectValue placeholder="Choose a timeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="period-input">
              {timeline === "weekly" ? "Week" : "Month"}
            </Label>
            <input
              id="period-input"
              type={timeline === "weekly" ? "week" : "month"}
              value={selected}
              onChange={(event) => setSelected(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{chartData.subtitle}</p>
          {loading ? (
            <p className="text-sm font-medium text-primary">Loading report…</p>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EmployeeMonthlyChart
            data={chartData.monthlyActivity}
            title={chartData.title}
            subtitle={chartData.subtitle}
          />
        </div>
        <EmployeeBreakdownChart data={chartData.activityBreakdown} />
      </div>

      <ActivityTable activity={activityData} />
    </div>
  );
}

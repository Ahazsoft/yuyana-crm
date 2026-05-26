"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, PieChart as PieIcon, BarChart2 } from "lucide-react";
import { useTheme } from "next-themes";
import type {
  MonthlyTrendPoint,
  StageBreakdownPoint,
  TaskStatusPoint,
  GrowthMetric,
} from "@/actions/dashboard/get-dashboard-chart-data";

// ─── Color tokens ─────────────────────────────────────────────────────────────

const SERIES = [
  { key: "Leads",     color: "#f97316" }, // orange
  { key: "Events",    color: "#a855f7" }, // violet
  { key: "Companies", color: "#0ea5e9" }, // sky
  { key: "Contacts",  color: "#10b981" }, // emerald
] as const;

const STAGE_COLORS = [
  "#09707e",
  "#92bd42",
  "#a855f7",
  "#f97316",
  "#0ea5e9",
  "#ef4444",
];

const TASK_STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#10b981",
  COMPLETED: "#09707e",
  PENDING: "#f97316",
  CANCELLED: "#ef4444",
  UNKNOWN: "#64748b",
};

// ─── Data remapper ────────────────────────────────────────────────────────────

type RenamedPoint = {
  month: string;
  Leads: number;
  Events: number;
  Companies: number;
  Contacts: number;
};

function remap(data: MonthlyTrendPoint[]): RenamedPoint[] {
  return data.map((d) => ({
    month: d.month,
    Leads: d.leads,
    Events: d.opportunities,
    Companies: d.accounts,
    Contacts: d.contacts,
  }));
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover px-4 py-3 shadow-lg text-sm min-w-[140px]">
      <p className="mb-2 font-semibold text-foreground">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-2 w-2 rounded-full flex-shrink-0"
              style={{ background: p.color }}
            />
            <span className="text-muted-foreground">{p.name}</span>
          </div>
          <span className="font-semibold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function PieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload: { fill: string } }[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-xl border border-border bg-popover px-4 py-2.5 shadow-lg text-sm">
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ background: p.payload.fill }}
        />
        <span className="text-muted-foreground">{p.name}</span>
        <span className="font-semibold text-foreground ml-1">{p.value}</span>
      </div>
    </div>
  );
}

// ─── Shared axis tick color hook ──────────────────────────────────────────────

function useTickColor() {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "dark" ? "#94a3b8" : "#64748b";
}

// ─── Growth Metric KPI Card ───────────────────────────────────────────────────

export function GrowthMetricCard({ metric }: { metric: GrowthMetric }) {
  const isPositive = metric.trend === "up";
  const isNegative = metric.trend === "down";
  const accentColor = isPositive ? "#10b981" : isNegative ? "#ef4444" : "#64748b";
  const bgColor = isPositive
    ? "bg-emerald-50 dark:bg-emerald-950/20"
    : isNegative
      ? "bg-red-50 dark:bg-red-950/20"
      : "bg-slate-50 dark:bg-slate-950/20";

  return (
    <div className={`rounded-2xl border border-border ${bgColor} bg-card p-5 shadow-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {metric.category}
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <p className="text-2xl font-bold">{metric.thisMonth}</p>
            <p className="text-xs text-muted-foreground">
              vs {metric.lastMonth} last month
            </p>
          </div>
          <div className="mt-2 flex items-center gap-1">
            <span
              className="text-sm font-semibold"
              style={{ color: accentColor }}
            >
              {isPositive ? "+" : ""}{metric.change}
            </span>
            <span
              className="text-xs font-medium"
              style={{ color: accentColor }}
            >
              ({isPositive ? "+" : ""}{metric.percentChange}%)
            </span>
          </div>
        </div>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0"
          style={{ background: `${accentColor}22` }}
        >
          <span style={{ color: accentColor }} className="text-lg font-bold">
            {isPositive ? "↑" : isNegative ? "↓" : "→"}
          </span>
        </div>
      </div>
    </div>
  );
}

export function MonthlyTrendChart({ data }: { data: MonthlyTrendPoint[] }) {
  const renamed = remap(data);
  const tickColor = useTickColor();

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base">CRM Activity Trend</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Leads, events, companies &amp; contacts — last 6 months
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <TrendingUp size={16} className="text-primary" />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={renamed} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
          <defs>
            {SERIES.map((s) => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={s.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: tickColor }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: tickColor }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(v) => (
              <span className="text-xs text-muted-foreground">{v}</span>
            )}
          />
          {SERIES.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2.5}
              fill={`url(#grad-${s.key})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Stage Breakdown Donut Chart ──────────────────────────────────────────────

export function StageBreakdownChart({ data }: { data: StageBreakdownPoint[] }) {
  const isEmpty = data.length === 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base">Events by Stage</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Distribution across sales stages
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <PieIcon size={16} className="text-primary" />
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-1 items-center justify-center h-40">
          <p className="text-sm text-muted-foreground">No stage data yet.</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="stage"
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={3}
              >
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={STAGE_COLORS[i % STAGE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend pills */}
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            {data.map((d, i) => (
              <div key={d.stage} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                  style={{ background: STAGE_COLORS[i % STAGE_COLORS.length] }}
                />
                <span className="text-xs text-muted-foreground">{d.stage}</span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: STAGE_COLORS[i % STAGE_COLORS.length] }}
                >
                  {d.count}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Task Status Pie Chart ────────────────────────────────────────────────────

export function TaskStatusChart({ data }: { data: TaskStatusPoint[] }) {
  const isEmpty = data.length === 0;
  const dataWithColors = data.map((d) => ({
    ...d,
    fill: TASK_STATUS_COLORS[d.status] || TASK_STATUS_COLORS.UNKNOWN,
  }));

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base">Task Status Overview</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Distribution by task status
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <PieIcon size={16} className="text-primary" />
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-1 items-center justify-center h-40">
          <p className="text-sm text-muted-foreground">No task data yet.</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={dataWithColors}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={3}
              >
                {dataWithColors.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend pills */}
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            {dataWithColors.map((d) => (
              <div key={d.status} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                  style={{ background: d.fill }}
                />
                <span className="text-xs text-muted-foreground">{d.status}</span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: d.fill }}
                >
                  {d.count}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function LeadsBarChart({ data }: { data: MonthlyTrendPoint[] }) {
  const renamed = remap(data);
  const tickColor = useTickColor();

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base">Monthly Volume Breakdown</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Leads, events, companies &amp; contacts — last 6 months
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <BarChart2 size={16} className="text-primary" />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={renamed} margin={{ top: 4, right: 4, left: -8, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: tickColor }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: tickColor }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(v) => (
              <span className="text-xs text-muted-foreground">{v}</span>
            )}
          />
          {SERIES.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              fill={s.color}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

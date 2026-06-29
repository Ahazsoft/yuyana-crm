"use client";

import {
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
import { BarChart2, PieChart as PieIcon } from "lucide-react";
import { useTheme } from "next-themes";
import type {
  EmployeeMonthlyActivity,
  EmployeeActivityBreakdown,
} from "@/actions/employees/get-employee-charts";

// ─── Colors ───────────────────────────────────────────────────────────────────

export const ACTIVITY_COLORS = {
  Accounts: "#09707e",
  Contacts: "#0ea5e9",
  Leads: "#10b981",
  Opportunities: "#f97316",
  Contracts: "#a855f7",
};

const PIE_COLORS = ["#09707e", "#10b981", "#f97316", "#a855f7", "#0ea5e9"];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

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

function useTickColor() {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "dark" ? "#94a3b8" : "#64748b";
}

// ─── Monthly Activity Bar Chart ───────────────────────────────────────────────

export function EmployeeMonthlyChart({
  data,
  title = "Monthly Activity",
  subtitle = "CRM entries created in the selected month",
}: {
  data: EmployeeMonthlyActivity[];
  title?: string;
  subtitle?: string;
}) {
  const tickColor = useTickColor();

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base">{title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <BarChart2 size={16} className="text-primary" />
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 4, left: -8, bottom: 0 }}
          barCategoryGap="20%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            vertical={false}
          />
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
          <Bar
            dataKey="accounts"
            name="Companies"
            fill={ACTIVITY_COLORS.Accounts}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="contacts"
            name="Contacts"
            fill={ACTIVITY_COLORS.Contacts}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="leads"
            name="Leads"
            fill={ACTIVITY_COLORS.Leads}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="opportunities"
            name="Events"
            fill={ACTIVITY_COLORS.Opportunities}
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="contracts"
            name="Contracts"
            fill={ACTIVITY_COLORS.Contracts}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Activity Breakdown Pie Chart ─────────────────────────────────────────────

export function EmployeeBreakdownChart({
  data,
}: {
  data: EmployeeActivityBreakdown[];
}) {
  const isEmpty = data.length === 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base">Activity Breakdown</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Distribution by entry type
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
          <PieIcon size={16} className="text-primary" />
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-1 items-center justify-center h-40">
          <p className="text-sm text-muted-foreground">No activity data yet.</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={80}
                paddingAngle={3}
              >
                {data.map((entry, i) => (
                  <Cell
                    key={entry.type}
                    fill={entry.color ?? PIE_COLORS[i % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend pills */}
          <div className="mt-3 flex flex-wrap gap-2 justify-center">
            {data.map((d, i) => (
              <div key={d.type} className="flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                  style={{ background: d.color ?? PIE_COLORS[i % PIE_COLORS.length] }}
                />
                <span className="text-xs text-muted-foreground">{d.type}</span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: d.color ?? PIE_COLORS[i % PIE_COLORS.length] }}
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

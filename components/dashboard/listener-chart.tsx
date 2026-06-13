'use client'

import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

// Generates a deterministic 24-hour listener curve seeded by the base value so
// the chart is stable across renders while reflecting the current audience size.
function buildSeries(base: number) {
  const points = []
  for (let hour = 0; hour < 24; hour++) {
    // Daytime peak around 18:00, quiet overnight.
    const daypart = Math.sin(((hour - 6) / 24) * Math.PI * 2) * 0.5 + 0.6
    const wobble = (Math.sin(hour * 1.7) + 1) * 0.15
    const listeners = Math.max(
      0,
      Math.round((base + 8) * (daypart + wobble)),
    )
    points.push({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      listeners,
    })
  }
  return points
}

export function ListenerChart({ base }: { base: number }) {
  const data = useMemo(() => buildSeries(base), [base])

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">Listener Activity</h2>
          <p className="text-xs text-muted-foreground">Last 24 hours</p>
        </div>
      </div>
      <ChartContainer
        config={{
          listeners: { label: 'Listeners', color: 'var(--chart-1)' },
        }}
        className="h-56 w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: -20, right: 4, top: 4 }}>
            <defs>
              <linearGradient id="fillListeners" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-listeners)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-listeners)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={3}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              width={40}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="listeners"
              type="monotone"
              fill="url(#fillListeners)"
              stroke="var(--color-listeners)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}

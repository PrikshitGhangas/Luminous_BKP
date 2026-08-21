'use client';

import React, { useState } from 'react';
import { TimeFilter } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BarChart3, Clock, TrendingUp } from 'lucide-react';

interface IncidentChartsProps {
  timeFilter: TimeFilter;
}

export function IncidentCharts({ timeFilter }: IncidentChartsProps) {
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(null);

  // Time-window dynamic data points
  const trendData = {
    today: [
      { label: '00:00', critical: 0, high: 0, medium: 1, low: 0 },
      { label: '04:00', critical: 0, high: 1, medium: 0, low: 1 },
      { label: '08:00', critical: 0, high: 0, medium: 2, low: 2 },
      { label: '12:00', critical: 1, high: 1, medium: 1, low: 1 },
      { label: '16:00', critical: 0, high: 0, medium: 1, low: 2 },
      { label: '20:00', critical: 0, high: 1, medium: 0, low: 1 },
    ],
    '7days': [
      { label: 'Mon', critical: 0, high: 1, medium: 2, low: 3 },
      { label: 'Tue', critical: 1, high: 0, medium: 1, low: 2 },
      { label: 'Wed', critical: 0, high: 1, medium: 3, low: 4 },
      { label: 'Thu', critical: 1, high: 2, medium: 2, low: 1 },
      { label: 'Fri', critical: 0, high: 1, medium: 4, low: 5 },
      { label: 'Sat', critical: 0, high: 0, medium: 2, low: 3 },
      { label: 'Sun', critical: 1, high: 1, medium: 1, low: 2 },
    ],
    '30days': [
      { label: 'Wk 1', critical: 2, high: 3, medium: 8, low: 12 },
      { label: 'Wk 2', critical: 1, high: 4, medium: 6, low: 9 },
      { label: 'Wk 3', critical: 3, high: 2, medium: 11, low: 14 },
      { label: 'Wk 4', critical: 1, high: 3, medium: 7, low: 10 },
    ],
  }[timeFilter];

  const responseTimeData = [
    { department: 'Hazmat & Fire Response', avgTime: '2.1 min', target: '< 3.0 min', compliance: '97.2%', barWidth: '92%', status: 'optimal' },
    { department: 'Medical Emergency Triage', avgTime: '1.8 min', target: '< 2.5 min', compliance: '98.5%', barWidth: '96%', status: 'optimal' },
    { department: 'Campus Security Rapid Unit', avgTime: '3.2 min', target: '< 4.0 min', compliance: '91.8%', barWidth: '85%', status: 'good' },
    { department: 'Facility & Maintenance', avgTime: '6.4 min', target: '< 8.0 min', compliance: '88.4%', barWidth: '76%', status: 'warning' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Incident Trends Over Time */}
      <Card className="border-[#243356] bg-[#0F1026] text-[#F4F1DE] shadow-xl overflow-hidden flex flex-col justify-between">
        <CardHeader className="p-4 pb-2 border-b border-[#243356] bg-[#131C38]/60 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#FFD700]" />
            <CardTitle className="text-xs font-bold font-mono text-[#F4F1DE] tracking-wider uppercase">
              Incident Severity Velocity ({timeFilter.toUpperCase()})
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span className="text-red-400">Critical</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="text-amber-400">High</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[#D4AF37]" />
              <span className="text-[#FFD700]">Med/Low</span>
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
          {/* Custom SVG Responsive Multi-Series Bar/Area Chart */}
          <div className="relative h-44 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-[#243356]/60">
            {trendData.map((d, index) => {
              const total = d.critical + d.high + d.medium + d.low;
              const maxVal = timeFilter === '30days' ? 30 : timeFilter === '7days' ? 12 : 6;
              const heightPercent = Math.min((total / maxVal) * 100, 95);

              const isHovered = hoveredTrendIndex === index;

              return (
                <div
                  key={d.label}
                  onMouseEnter={() => setHoveredTrendIndex(index)}
                  onMouseLeave={() => setHoveredTrendIndex(null)}
                  className="relative flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                >
                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute -top-10 z-30 whitespace-nowrap rounded-lg bg-[#131C38] border border-[#D4AF37] px-2 py-1 text-[10px] font-mono shadow-xl text-[#FFD700]">
                      {d.label}: {d.critical} Crit · {d.high} High · {d.medium + d.low} Med/Low
                    </div>
                  )}

                  {/* Stacked Bar */}
                  <div
                    style={{ height: `${Math.max(heightPercent, 12)}%` }}
                    className={`w-full max-w-[36px] rounded-t-md flex flex-col overflow-hidden transition-all duration-300 ${
                      isHovered ? 'ring-2 ring-[#FFD700] brightness-125' : ''
                    }`}
                  >
                    {d.critical > 0 && (
                      <div
                        style={{ flex: d.critical }}
                        className="bg-gradient-to-t from-red-600 to-red-500 border-b border-red-900"
                        title={`Critical: ${d.critical}`}
                      />
                    )}
                    {d.high > 0 && (
                      <div
                        style={{ flex: d.high }}
                        className="bg-gradient-to-t from-amber-600 to-amber-500 border-b border-amber-900"
                        title={`High: ${d.high}`}
                      />
                    )}
                    <div
                      style={{ flex: Math.max(d.medium + d.low, 1) }}
                      className="bg-gradient-to-t from-[#C5A059] to-[#D4AF37]"
                      title={`Med/Low: ${d.medium + d.low}`}
                    />
                  </div>

                  {/* Label */}
                  <span className="text-[10px] font-mono text-[#B8B5A3] mt-2 group-hover:text-[#FFD700] transition-colors">
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-[#B8B5A3] font-mono">
            <span className="flex items-center gap-1 text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>SLA Response Rate: 94.6%</span>
            </span>
            <span>Period Total: {trendData.reduce((acc, curr) => acc + curr.critical + curr.high + curr.medium + curr.low, 0)} Incidents</span>
          </div>
        </CardContent>
      </Card>

      {/* Chart 2: Response-Time Charts & SLA Breakdown */}
      <Card className="border-[#243356] bg-[#0F1026] text-[#F4F1DE] shadow-xl overflow-hidden flex flex-col justify-between">
        <CardHeader className="p-4 pb-2 border-b border-[#243356] bg-[#131C38]/60 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#FFD700]" />
            <CardTitle className="text-xs font-bold font-mono text-[#F4F1DE] tracking-wider uppercase">
              Average First-Responder Response Times
            </CardTitle>
          </div>
          <span className="rounded bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-2 py-0.5 text-[10px] font-mono text-[#FFD700] font-bold">
            Target &lt; 4.0m
          </span>
        </CardHeader>

        <CardContent className="p-5 space-y-3.5">
          {responseTimeData.map((item) => (
            <div key={item.department} className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#F4F1DE]">{item.department}</span>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="font-bold text-[#FFD700]">{item.avgTime}</span>
                  <span className="text-[#B8B5A3] hidden sm:inline">({item.compliance} SLA)</span>
                </div>
              </div>

              {/* Progress Bar Gauge */}
              <div className="h-2 w-full rounded-full bg-[#1C2541] overflow-hidden">
                <div
                  style={{ width: item.barWidth }}
                  className={`h-full rounded-full transition-all duration-500 ${
                    item.status === 'optimal'
                      ? 'bg-gradient-to-r from-emerald-500 to-[#FFD700]'
                      : item.status === 'good'
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059]'
                      : 'bg-gradient-to-r from-amber-500 to-amber-400'
                  }`}
                />
              </div>
            </div>
          ))}

          <div className="pt-2 border-t border-[#243356] flex items-center justify-between text-[11px] font-mono text-[#C5A059]">
            <span>Average Campus Dispatch Latency: <strong className="text-[#FFD700]">2.8 min</strong></span>
            <span className="text-emerald-400 font-bold">▲ 18% Faster vs MoM</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

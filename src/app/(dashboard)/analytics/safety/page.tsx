'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Sparkles,
  Shield,
  Clock,
  Flame,
  TrendingUp,
  ArrowRight,
  MapPin,
  Calendar,
  Layers,
  Activity,
  Zap,
  Users,
  Building2,
  Bus,
  Info,
} from 'lucide-react';
import { analyzeRiskIntelligence } from '@/lib/services/risk-intelligence/engine';
import { RiskCategory } from '@/lib/services/risk-intelligence/historical-data';
import { cn } from '@/lib/utils';

export default function SafetyAnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState<number>(30);
  const report = analyzeRiskIntelligence(timeframe);

  const getCategoryIcon = (cat: RiskCategory) => {
    switch (cat) {
      case 'Infrastructure':
        return <Zap className="h-4 w-4 text-amber-400" />;
      case 'Security':
        return <Shield className="h-4 w-4 text-blue-400" />;
      case 'Fire':
        return <Flame className="h-4 w-4 text-red-400" />;
      case 'Crowding':
        return <Users className="h-4 w-4 text-purple-400" />;
      case 'Hostel':
        return <Building2 className="h-4 w-4 text-orange-400" />;
      case 'Transport':
        return <Bus className="h-4 w-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title & Timeframe Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D0D1D6] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAB308]/20 border border-[#EAB308]/40 text-[#B45309]">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#202226] font-mono">
              CAMPUS SAFETY ANALYTICS &amp; RISK TRENDS
            </h1>
          </div>
          <p className="text-xs text-[#555960] mt-1 font-mono">
            AI-assisted risk analysis based on historical incident patterns across all 6 risk categories
          </p>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-[#F4F5F6] border border-[#D0D1D6] p-1 rounded-xl text-xs font-mono">
          {[
            { label: '7 Days', days: 7 },
            { label: '30 Days', days: 30 },
            { label: '90 Days', days: 90 },
          ].map((tf) => (
            <button
              key={tf.days}
              onClick={() => setTimeframe(tf.days)}
              className={cn(
                'px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs font-bold font-mono',
                timeframe === tf.days
                  ? 'bg-gradient-to-r from-[#EAB308] to-[#D4AF37] text-[#0B132B] shadow-md'
                  : 'text-[#555960] hover:text-[#B45309]'
              )}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Strict Compliance Notice Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-500/30 bg-blue-950/20 p-3.5 text-xs text-blue-200">
        <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="font-mono text-[11px] leading-relaxed">
          <strong>AI-Assisted Risk Analysis Notice:</strong> All metrics, category scores, and time-of-day clusters represent statistical historical patterns calculated from campus security and facilities records. The system does not predict crime or forecast individual actions.
        </div>
      </div>

      {/* Top Row: Campus Risk Score & High-Level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Campus Risk Score */}
        <Card className="border-[#EAB308]/50 bg-gradient-to-br from-[#131C38] via-[#0F1026] to-[#1C2541] text-[#202226] shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 h-16 w-16 bg-[#EAB308]/10 rounded-bl-full pointer-events-none" />
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#B45309] uppercase font-bold">
              <span>Campus Risk Score</span>
              <span className="rounded bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.2 text-[9px]">
                {report.campusRiskLevel}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-[#B45309]">
                {report.campusRiskScore}
              </span>
              <span className="text-xs text-[#555960] font-mono">/ 100</span>
              <span className="text-[11px] font-mono text-red-400 font-bold ml-auto flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" />
                {report.scoreDeltaVsPriorMonth}
              </span>
            </div>
            <div className="h-2 w-full bg-[#E7E8EB] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-full"
                style={{ width: `${report.campusRiskScore}%` }}
              />
            </div>
            <p className="text-[10px] text-[#555960] font-mono">
              Composite AI-generated risk indicator
            </p>
          </CardContent>
        </Card>

        {/* Metric 2: 30-Day Incidents */}
        <Card className="border-[#D0D1D6] bg-[#F4F5F6] text-[#202226] shadow-xl">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#555960] uppercase font-bold">
              <span>Incidents in Window</span>
              <Activity className="h-4 w-4 text-[#B45309]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-[#202226]">
                {report.totalIncidentsAnalyzed}
              </span>
              <span className="text-xs text-[#555960] font-mono">records</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400">
              <span>{report.severityTrends.criticalCount} Critical</span>
              <span>•</span>
              <span>{report.severityTrends.highCount} High</span>
              <span>•</span>
              <span>{report.severityTrends.mediumCount} Medium</span>
            </div>
            <p className="text-[10px] text-[#555960] font-mono">
              100% verified historical seed telemetry
            </p>
          </CardContent>
        </Card>

        {/* Metric 3: Mean Response Latency */}
        <Card className="border-[#D0D1D6] bg-[#F4F5F6] text-[#202226] shadow-xl">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#555960] uppercase font-bold">
              <span>Avg. Response Latency</span>
              <Clock className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-emerald-400">
                2.9 min
              </span>
              <span className="text-[11px] text-emerald-400 font-mono font-bold ml-auto">
                94.8% SLA Pass
              </span>
            </div>
            <div className="h-2 w-full bg-[#E7E8EB] rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94.8%' }} />
            </div>
            <p className="text-[10px] text-[#555960] font-mono">
              Dispatch to arrival benchmark (&lt; 4.0m target)
            </p>
          </CardContent>
        </Card>

        {/* Metric 4: Top Location Hotspot */}
        <Card className="border-[#D0D1D6] bg-[#F4F5F6] text-[#202226] shadow-xl">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#555960] uppercase font-bold">
              <span>Top Pattern Zone</span>
              <MapPin className="h-4 w-4 text-red-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold font-mono text-[#202226] truncate">
                {report.locationPatterns[0]?.locationName}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-red-400 font-bold">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span>7 Infrastructure Incidents / 30d</span>
            </div>
            <p className="text-[10px] text-[#B45309] font-mono">
              Risk Indicator Score: {report.locationPatterns[0]?.riskScore}/100 (Critical)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: 6 Risk Categories Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold font-mono text-[#202226] uppercase tracking-wider flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#B45309]" />
            <span>6 Risk Categories (AI-Generated Risk Indicators)</span>
          </h3>
          <Button asChild size="sm" variant="outline" className="h-7 text-xs font-mono border-[#D0D1D6] hover:border-[#EAB308] text-[#B45309] gap-1">
            <Link href="/safety/risk-intelligence">
              <span>Deep Risk Intelligence</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {report.categoryList.map((cat) => (
            <Card
              key={cat.category}
              className={cn(
                'border bg-[#F4F5F6] text-[#202226] shadow-md transition-all hover:border-[#EAB308]',
                cat.riskLevel === 'CRITICAL'
                  ? 'border-red-500/40 bg-red-950/10'
                  : cat.riskLevel === 'HIGH'
                  ? 'border-amber-500/30 bg-amber-950/10'
                  : 'border-[#D0D1D6]'
              )}
            >
              <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between border-b border-[#D0D1D6]">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(cat.category)}
                  <CardTitle className="text-xs font-mono font-bold uppercase text-[#202226]">
                    {cat.category}
                  </CardTitle>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded font-bold uppercase',
                      cat.riskLevel === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : cat.riskLevel === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    )}
                  >
                    {cat.riskLevel}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-[#555960] text-[11px]">Risk Indicator Score:</span>
                  <span className="font-bold text-sm text-[#B45309]">{cat.riskScore} / 100</span>
                </div>

                <div className="h-1.5 w-full bg-[#E7E8EB] rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      cat.riskLevel === 'CRITICAL'
                        ? 'bg-red-500'
                        : cat.riskLevel === 'HIGH'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    )}
                    style={{ width: `${cat.riskScore}%` }}
                  />
                </div>

                <p className="text-[11px] text-[#555960] leading-relaxed">
                  {cat.description}
                </p>

                <div className="flex items-center justify-between pt-1 border-t border-[#D0D1D6] text-[10px] font-mono text-[#8A9199]">
                  <span>{cat.incidentCount} incidents ({cat.criticalCount} crit)</span>
                  <span className={cat.trendDirection === 'increasing' ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                    {cat.trendPercent} vs prior cycle
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Row 3: Severity Velocity & Response Time Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Trends Over Time */}
        <Card className="border-[#D0D1D6] bg-[#F4F5F6] text-[#202226] shadow-xl">
          <CardHeader className="p-4 pb-3 border-b border-[#D0D1D6] bg-white flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#B45309]" />
              <CardTitle className="text-xs font-mono font-bold uppercase text-[#202226]">
                Severity Velocity Trends (4-Week History)
              </CardTitle>
            </div>
            <span className="text-[10px] font-mono text-[#555960]">Weekly Aggregation</span>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            <div className="space-y-3">
              {report.severityTrends.weeklyTrend.map((wk) => {
                const total = wk.critical + wk.high + wk.medium + wk.low;
                return (
                  <div key={wk.weekLabel} className="space-y-1 text-xs font-mono">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#202226] font-semibold">{wk.weekLabel}</span>
                      <span className="text-[#B45309] font-bold">{total} incidents</span>
                    </div>

                    {/* Multi-segment stacked bar */}
                    <div className="h-3 w-full bg-[#E7E8EB] rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${(wk.critical / total) * 100}%` }}
                        title={`Critical: ${wk.critical}`}
                      />
                      <div
                        className="h-full bg-amber-500"
                        style={{ width: `${(wk.high / total) * 100}%` }}
                        title={`High: ${wk.high}`}
                      />
                      <div
                        className="h-full bg-[#EAB308]"
                        style={{ width: `${(wk.medium / total) * 100}%` }}
                        title={`Medium: ${wk.medium}`}
                      />
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: `${(wk.low / total) * 100}%` }}
                        title={`Low: ${wk.low}`}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-[#8A9199]">
                      <span>🔴 {wk.critical} Crit</span>
                      <span>🟠 {wk.high} High</span>
                      <span>🟡 {wk.medium} Med</span>
                      <span>🟢 {wk.low} Low</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Response-Time Trends vs SLA */}
        <Card className="border-[#D0D1D6] bg-[#F4F5F6] text-[#202226] shadow-xl">
          <CardHeader className="p-4 pb-3 border-b border-[#D0D1D6] bg-white flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-400" />
              <CardTitle className="text-xs font-mono font-bold uppercase text-[#202226]">
                Response-Time Latency vs Target SLA
              </CardTitle>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">Avg: 2.9 min</span>
          </CardHeader>

          <CardContent className="p-4 space-y-3.5">
            {report.responseTimeTrends.map((rt) => (
              <div key={rt.department} className="space-y-1 text-xs font-mono">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#202226] font-semibold">{rt.department}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">{rt.avgResponseMinutes} min</span>
                    <span className="text-[10px] text-[#8A9199]">(Target: &lt; {rt.targetMinutes}m)</span>
                  </div>
                </div>

                <div className="h-2 w-full bg-[#E7E8EB] rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      rt.status === 'Optimal' ? 'bg-emerald-500' : 'bg-amber-500'
                    )}
                    style={{ width: `${rt.complianceRatePercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[9px] text-[#8A9199]">
                  <span>Compliance: {rt.complianceRatePercent}%</span>
                  <span className="text-[#B45309]">{rt.totalHandled} incidents dispatched</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Time-of-Day Risk Patterns */}
      <Card className="border-[#D0D1D6] bg-[#F4F5F6] text-[#202226] shadow-xl">
        <CardHeader className="p-4 pb-3 border-b border-[#D0D1D6] bg-white flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#B45309]" />
            <CardTitle className="text-xs font-mono font-bold uppercase text-[#202226]">
              Time Patterns &amp; Operational Peak Risk Windows
            </CardTitle>
          </div>
          <span className="text-[10px] font-mono text-[#555960]">24-Hour Campus Telemetry</span>
        </CardHeader>

        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {report.timePatterns.map((tp) => (
              <div
                key={tp.hourWindow}
                className={cn(
                  'rounded-xl border p-3.5 space-y-2 bg-white',
                  tp.riskIntensity === 'HIGH'
                    ? 'border-red-500/30'
                    : tp.riskIntensity === 'MEDIUM'
                    ? 'border-amber-500/30'
                    : 'border-[#D0D1D6]'
                )}
              >
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="font-bold text-[#B45309]">{tp.hourWindow}</span>
                  <span
                    className={cn(
                      'px-1.5 py-0.2 rounded font-bold uppercase text-[9px]',
                      tp.riskIntensity === 'HIGH'
                        ? 'bg-red-500/20 text-red-400'
                        : tp.riskIntensity === 'MEDIUM'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    )}
                  >
                    {tp.riskIntensity}
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-[#202226] flex items-center gap-1.5">
                  <span>{tp.incidentCount} historical events</span>
                  <span className="text-[10px] text-[#B45309]">({tp.primaryCategory})</span>
                </div>
                <p className="text-[11px] text-[#555960] leading-relaxed">
                  {tp.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Banner to Risk Intelligence */}
      <div className="rounded-2xl border border-[#EAB308]/50 bg-gradient-to-r from-[#131C38] via-[#0F1026] to-[#1C2541] p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-sm font-bold font-mono text-[#202226] flex items-center gap-2 justify-center sm:justify-start">
            <Sparkles className="h-4 w-4 text-[#B45309]" />
            <span>Looking for Recurring Issue Clusters &amp; Operational Directives?</span>
          </h4>
          <p className="text-xs text-[#555960] font-mono">
            Inspect detailed historical incident evidence (e.g. 7 Block D infrastructure events) and execute actionable mitigations.
          </p>
        </div>

        <Button asChild className="bg-[#EAB308] hover:bg-[#D4AF37] text-[#0B132B] font-bold font-mono text-xs px-5 h-10 gap-2 shrink-0">
          <Link href="/safety/risk-intelligence">
            <span>Open Risk Intelligence Hub</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

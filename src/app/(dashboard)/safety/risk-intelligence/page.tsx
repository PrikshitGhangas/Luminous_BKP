'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Shield,
  Zap,
  Flame,
  Users,
  Building2,
  Bus,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Info,
  MapPin,
  Layers,
  Wrench,
  TrendingUp,
  Check,
  Send,
} from 'lucide-react';
import {
  analyzeRiskIntelligence,
} from '@/lib/services/risk-intelligence/engine';
import { RiskCategory } from '@/lib/services/risk-intelligence/historical-data';
import { cn } from '@/lib/utils';

export default function RiskIntelligencePage() {
  const report = analyzeRiskIntelligence(30);
  const [expandedClusterId, setExpandedClusterId] = useState<string | null>(
    'cluster-block-d-infra'
  );
  const [appliedDirectives, setAppliedDirectives] = useState<Record<string, boolean>>({});
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const handleApplyDirective = (clusterId: string) => {
    setAppliedDirectives((prev) => ({
      ...prev,
      [clusterId]: true,
    }));
  };

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

  const filteredClusters =
    filterCategory === 'all'
      ? report.recurringIssues
      : report.recurringIssues.filter((c) => c.category === filterCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#243356] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#FFD700]">
              <Sparkles className="h-5 w-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F1DE] font-mono">
              AI-ASSISTED RISK INTELLIGENCE &amp; PATTERN MINING
            </h1>
          </div>
          <p className="text-xs text-[#B8B5A3] mt-1 font-mono">
            Recurring issue clustering, grounded evidence telemetry, and operational safety directives
          </p>
        </div>

        <Button asChild variant="outline" size="sm" className="h-9 text-xs font-mono border-[#243356] hover:border-[#D4AF37] text-[#FFD700] gap-1.5 self-start sm:self-auto">
          <Link href="/analytics/safety">
            <span>Safety Analytics Overview</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* Strict Compliance Banner */}
      <div className="flex items-start gap-3 rounded-xl border border-blue-500/30 bg-blue-950/20 p-3.5 text-xs text-blue-200">
        <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="font-mono text-[11px] leading-relaxed">
          <strong>Compliance Mandate:</strong> This module provides <em>AI-assisted risk analysis</em> and <em>AI-generated risk indicators</em> derived strictly from <em>historical patterns</em>. The system does NOT predict crimes or individual actions. All insights are grounded in verified institutional data.
        </div>
      </div>

      {/* Campus Risk Score & Category Gauge Bar */}
      <div className="rounded-2xl border border-[#D4AF37]/40 bg-gradient-to-br from-[#131C38] via-[#0F1026] to-[#1C2541] p-6 shadow-2xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#C5A059] uppercase tracking-wider">
                Overall Campus Risk Score
              </span>
              <span className="rounded bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 text-[10px] font-mono font-bold">
                {report.campusRiskLevel} RISK
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold font-mono text-[#FFD700]">
                {report.campusRiskScore}
              </span>
              <span className="text-xs text-[#B8B5A3] font-mono">/ 100 max vulnerability</span>
              <span className="text-xs font-mono text-red-400 font-bold flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5" />
                {report.scoreDeltaVsPriorMonth} vs 30-day baseline
              </span>
            </div>
          </div>

          {/* 6 Categories Quick Pill Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {report.categoryList.map((cat) => (
              <div
                key={cat.category}
                className="bg-[#0B132B] p-2 rounded-xl border border-[#243356] text-center space-y-1"
              >
                <div className="flex items-center justify-center gap-1 text-[10px] font-mono text-[#B8B5A3] font-bold">
                  {getCategoryIcon(cat.category)}
                  <span>{cat.category}</span>
                </div>
                <div className="text-sm font-bold font-mono text-[#FFD700]">
                  {cat.riskScore}
                </div>
                <div className="text-[9px] font-mono text-[#7A786B] uppercase">
                  {cat.riskLevel}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Feature: Recurring Issues & Operational Directives */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#243356] pb-3">
          <div>
            <h2 className="text-base font-bold font-mono text-[#F4F1DE] uppercase tracking-wide flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <span>Historical Pattern Clusters &amp; Operational Recommendations</span>
            </h2>
            <p className="text-xs text-[#B8B5A3] font-mono mt-0.5">
              Identifies recurring issues and produces actionable preventative interventions
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-[#0F1026] border border-[#243356] p-1 rounded-lg text-[11px] font-mono self-start sm:self-auto">
            {['all', 'Infrastructure', 'Security', 'Crowding', 'Hostel'].map((c) => (
              <button
                key={c}
                onClick={() => setFilterCategory(c)}
                className={cn(
                  'px-2.5 py-1 rounded transition-colors cursor-pointer capitalize font-bold',
                  filterCategory === c
                    ? 'bg-[#D4AF37] text-[#0B132B]'
                    : 'text-[#B8B5A3] hover:text-[#FFD700]'
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Recurring Issue Cluster Cards */}
        <div className="space-y-4">
          {filteredClusters.map((cluster) => {
            const isExpanded = expandedClusterId === cluster.id;
            const isApplied = appliedDirectives[cluster.id] || cluster.operationalRecommendation.actionStatus === 'applied';

            return (
              <Card
                key={cluster.id}
                className={cn(
                  'border bg-[#0F1026] text-[#F4F1DE] shadow-xl overflow-hidden transition-all',
                  cluster.severity === 'CRITICAL'
                    ? 'border-red-500/50 shadow-red-950/20'
                    : cluster.severity === 'HIGH'
                    ? 'border-amber-500/40 shadow-amber-950/20'
                    : 'border-[#243356]'
                )}
              >
                {/* Cluster Card Header */}
                <CardHeader className="p-5 pb-3 border-b border-[#243356] bg-gradient-to-r from-[#131C38] to-[#0F1026]">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded font-bold uppercase',
                            cluster.severity === 'CRITICAL'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          )}
                        >
                          {cluster.severity} RECURRING PATTERN
                        </span>
                        <span className="flex items-center gap-1 text-[#FFD700] font-bold">
                          {getCategoryIcon(cluster.category)}
                          {cluster.category}
                        </span>
                        <span className="text-[#B8B5A3]">•</span>
                        <span className="text-[#B8B5A3]">
                          Location: <strong className="text-[#F4F1DE]">{cluster.locationName}</strong>
                        </span>
                        <span className="text-[#B8B5A3]">•</span>
                        <span className="text-emerald-400 font-bold">
                          {Math.round(cluster.historicalPatternConfidence * 100)}% Pattern Confidence
                        </span>
                      </div>

                      {/* Main Grounded Finding Highlight */}
                      <h3 className="text-base sm:text-lg font-bold font-mono text-[#FFD700]">
                        &ldquo;{cluster.summary}&rdquo;
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() =>
                          setExpandedClusterId(isExpanded ? null : cluster.id)
                        }
                        className="flex items-center gap-1 text-xs font-mono text-[#B8B5A3] hover:text-[#FFD700] border border-[#243356] bg-[#0B132B] px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                      >
                        <span>{isExpanded ? 'Hide Evidence' : `View ${cluster.incidentCount} Grounded Incidents`}</span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4 text-xs font-sans">
                  {/* Root Cause Analysis Description */}
                  <div className="bg-[#0B132B] rounded-xl p-4 border border-[#243356] space-y-1.5">
                    <span className="text-[10px] font-mono text-[#C5A059] uppercase font-bold block">
                      AI-Assisted Root Cause Diagnosis (Historical Pattern Analysis):
                    </span>
                    <p className="text-xs text-[#F4F1DE] leading-relaxed">
                      {cluster.rootCauseAnalysis}
                    </p>
                  </div>

                  {/* Operational Recommendation Box (Hero Requirement) */}
                  <div className="rounded-xl border border-[#D4AF37]/40 bg-gradient-to-br from-[#1C2541] via-[#131C38] to-[#0F1026] p-4.5 space-y-3 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#243356] pb-2.5">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-[#FFD700]" />
                        <span className="font-mono font-bold text-xs text-[#FFD700] uppercase tracking-wide">
                          Operational Recommendation:
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="text-[#B8B5A3]">Priority: <strong className="text-red-400 uppercase">{cluster.operationalRecommendation.priority}</strong></span>
                        <span>•</span>
                        <span className="text-[#B8B5A3]">Assignee: <strong className="text-[#F4F1DE]">{cluster.operationalRecommendation.assignedDepartment}</strong></span>
                      </div>
                    </div>

                    {/* Recommendation Directive */}
                    <div className="text-sm font-bold font-mono text-[#F4F1DE] bg-[#0B132B]/80 p-3 rounded-lg border border-[#D4AF37]/30">
                      &ldquo;{cluster.operationalRecommendation.directive}&rdquo;
                    </div>

                    {/* Action Directives Checklist */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono text-[#C5A059] uppercase font-bold block">
                        Actionable Directives:
                      </span>
                      <ul className="space-y-1 font-mono text-[11px] text-[#B8B5A3]">
                        {cluster.operationalRecommendation.actionSteps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#FFD700] font-bold shrink-0">[{idx + 1}]</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Footer Execution Trigger */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#243356]">
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {cluster.operationalRecommendation.estimatedImpact}
                      </span>

                      {isApplied ? (
                        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 px-3 py-1.5 rounded-lg">
                          <Check className="h-3.5 w-3.5" />
                          <span>Directive Applied &amp; Work Order Dispatched</span>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleApplyDirective(cluster.id)}
                          size="sm"
                          className="bg-[#D4AF37] hover:bg-[#C5A059] text-[#0B132B] font-bold font-mono text-xs gap-1.5 h-8"
                        >
                          <Send className="h-3 w-3" />
                          <span>Execute Directive &amp; Schedule Inspection</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Collapsible Grounded Evidence Explorer (7 Incidents List) */}
                  {isExpanded && (
                    <div className="rounded-xl border border-[#243356] bg-[#0B132B] p-4 space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-[#243356] pb-2 font-mono text-xs">
                        <span className="font-bold text-[#FFD700] uppercase flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5" />
                          Grounded Incident Evidence Stream ({cluster.groundedIncidents.length} Records)
                        </span>
                        <span className="text-[10px] text-[#B8B5A3]">Timeframe: Last {cluster.timeWindowDays} Days</span>
                      </div>

                      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                        {cluster.groundedIncidents.map((inc, i) => (
                          <div
                            key={inc.id}
                            className="p-3 rounded-lg bg-[#0F1026] border border-[#243356] space-y-1 font-mono text-[11px]"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-[#FFD700] font-bold">
                                  #{i + 1} [{inc.incident_number}]
                                </span>
                                <span
                                  className={cn(
                                    'px-1.5 py-0.2 rounded font-bold uppercase text-[9px]',
                                    inc.severity === 'critical'
                                      ? 'bg-red-500/20 text-red-400'
                                      : 'bg-amber-500/20 text-amber-400'
                                  )}
                                >
                                  {inc.severity}
                                </span>
                              </div>
                              <span className="text-[10px] text-[#7A786B]">
                                {new Date(inc.timestamp).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>

                            <div className="font-bold text-[#F4F1DE]">
                              {inc.title}
                            </div>
                            <p className="text-[10px] text-[#B8B5A3] font-sans">
                              {inc.description}
                            </p>
                            {inc.root_cause && (
                              <div className="text-[9px] text-[#C5A059]">
                                Root Cause: {inc.root_cause}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Campus Location Risk Topology Ranking */}
      <Card className="border-[#243356] bg-[#0F1026] text-[#F4F1DE] shadow-xl overflow-hidden">
        <CardHeader className="p-4 border-b border-[#243356] bg-[#131C38] flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#FFD700]" />
            <CardTitle className="text-xs font-mono font-bold uppercase text-[#F4F1DE]">
              Campus Location Risk Matrix (All 10 Zones)
            </CardTitle>
          </div>
          <span className="text-[10px] font-mono text-[#B8B5A3]">Ranked by AI-Generated Risk Indicator</span>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs font-mono text-left">
            <thead className="bg-[#0B132B] text-[#B8B5A3] border-b border-[#243356] text-[10px] uppercase">
              <tr>
                <th className="p-3">Rank / Building</th>
                <th className="p-3">Sector</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Risk Indicator</th>
                <th className="p-3">30d Incidents</th>
                <th className="p-3">Primary Factor</th>
                <th className="p-3">Trend Velocity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#243356]/60">
              {report.locationPatterns.map((loc, idx) => (
                <tr key={loc.locationId} className="hover:bg-[#131C38]/40 transition-colors">
                  <td className="p-3 font-bold text-[#F4F1DE] flex items-center gap-2">
                    <span className="text-[#C5A059]">#{idx + 1}</span>
                    <span>{loc.locationName}</span>
                    <span className="text-[10px] text-[#7A786B]">({loc.locationCode})</span>
                  </td>
                  <td className="p-3 text-[#B8B5A3]">{loc.sector}</td>
                  <td className="p-3">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded font-bold text-[9px] uppercase',
                        loc.riskLevel === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : loc.riskLevel === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      )}
                    >
                      {loc.riskLevel}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-[#FFD700]">{loc.riskScore} / 100</td>
                  <td className="p-3 text-[#F4F1DE]">{loc.incidentCount30d} incidents</td>
                  <td className="p-3 text-[#B8B5A3] text-[11px] max-w-xs truncate" title={loc.primaryRiskFactor}>
                    {loc.primaryRiskFactor}
                  </td>
                  <td className="p-3 font-bold text-xs text-amber-400">
                    {loc.trendVsPriorPeriod}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

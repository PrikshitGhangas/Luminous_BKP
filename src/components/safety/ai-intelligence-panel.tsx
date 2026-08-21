'use client';

import React, { useState } from 'react';
import { useSafety } from '@/lib/context/safety-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SeverityBadge } from '@/components/shared/severity-badge';
import {
  Sparkles,
  Cpu,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export function AISafetyIntelligencePanel() {
  const { safetyInsights, applyInsightAction } = useSafety();
  const [activeInsightIndex, setActiveInsightIndex] = useState<number>(0);

  const currentInsight = safetyInsights[activeInsightIndex] || safetyInsights[0];

  const handleApply = (id: string) => {
    applyInsightAction(id);
  };

  return (
    <Card className="border border-[#D4AF37]/50 bg-gradient-to-br from-[#131C38] via-[#0F1026] to-[#1C2541] text-[#F4F1DE] shadow-2xl overflow-hidden">
      <CardHeader className="p-4 pb-2 border-b border-[#243356] bg-[#0B132B]/80 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#FFD700]">
            <Sparkles className="h-4 w-4 text-[#FFD700]" />
          </div>
          <div>
            <CardTitle className="text-xs font-bold font-mono text-[#F4F1DE] tracking-wider uppercase flex items-center gap-2">
              <span>AI SAFETY INTELLIGENCE &amp; RISK SYNTHESIS</span>
            </CardTitle>
            <p className="text-[10px] text-[#C5A059] font-mono">
              Gemini 3.7 Flash Pattern Recognition on Historical Campus Seed Data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {safetyInsights.map((ins, idx) => (
            <button
              key={ins.id}
              onClick={() => setActiveInsightIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                activeInsightIndex === idx ? 'w-6 bg-[#FFD700]' : 'w-2 bg-[#243356] hover:bg-[#D4AF37]'
              }`}
              title={ins.title}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4 text-xs">
        {currentInsight && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            {/* Pattern Badge & Incident Count */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#FFD700] bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-2 py-0.5 rounded">
                    {currentInsight.time_window}
                  </span>
                  <SeverityBadge severity={currentInsight.severity} size="sm" isAiClassified />
                  <span className="text-[10px] font-mono text-[#B8B5A3]">
                    {currentInsight.incident_count} Incidents Detected
                  </span>
                </div>
                <h4 className="font-bold text-sm text-[#F4F1DE] font-mono">
                  {currentInsight.title}
                </h4>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono text-[#C5A059] block">Model Confidence</span>
                <span className="font-mono font-bold text-sm text-[#FFD700]">
                  {Math.round(currentInsight.confidence * 100)}%
                </span>
              </div>
            </div>

            {/* Pattern Description Grounded Quote */}
            <div className="rounded-xl bg-[#0F1026] border border-[#243356] p-3.5 text-xs text-[#F4F1DE] leading-relaxed">
              <p className="text-[#F4F1DE]">
                &ldquo;{currentInsight.pattern_description}&rdquo;
              </p>
            </div>

            {/* Actionable Recommendations */}
            <div className="space-y-2">
              <span className="font-bold text-[11px] font-mono text-[#C5A059] uppercase tracking-wider block">
                Autonomous Recommendations:
              </span>
              <div className="space-y-1.5">
                {currentInsight.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 rounded-lg bg-[#131C38]/90 border border-[#243356] p-2.5 text-xs text-[#B8B5A3]"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#D4AF37]/15 text-[#FFD700] text-[10px] font-bold font-mono">
                      0{i + 1}
                    </span>
                    <span className="text-[#F4F1DE] mt-0.5">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button & Audit Trigger */}
            <div className="pt-2 border-t border-[#243356] flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#C5A059]">
                <Cpu className="h-3.5 w-3.5 text-[#FFD700]" />
                <span>Auto-Dispatched Preventive Tasks</span>
              </div>

              <Button
                size="sm"
                onClick={() => handleApply(currentInsight.id)}
                disabled={currentInsight.action_status === 'applied'}
                className={`text-xs font-bold font-mono gap-1.5 ${
                  currentInsight.action_status === 'applied'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                    : 'bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#0B132B] shadow-md shadow-[#D4AF37]/20 hover:brightness-110'
                }`}
              >
                {currentInsight.action_status === 'applied' ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Directives Enforced</span>
                  </>
                ) : (
                  <>
                    <span>Execute Preventative Protocol</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

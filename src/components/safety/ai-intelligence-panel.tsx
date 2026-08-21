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
    <Card className="border border-[#EAB308]/50 bg-gradient-to-br from-[#FEFCE8] to-white text-[#202226] shadow-sm overflow-hidden">
      <CardHeader className="p-4 pb-2 border-b border-[#EAB308]/30 bg-white flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EAB308]/20 border border-[#EAB308]/40 text-[#B45309]">
            <Sparkles className="h-4 w-4 text-[#B45309]" />
          </div>
          <div>
            <CardTitle className="text-xs font-bold text-[#202226] tracking-wider uppercase flex items-center gap-2">
              <span>AI Safety Intelligence &amp; Risk Synthesis</span>
            </CardTitle>
            <p className="text-[10px] text-[#555960]">
              AI Pattern Recognition on Historical Campus Data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {safetyInsights.map((ins, idx) => (
            <button
              key={ins.id}
              onClick={() => setActiveInsightIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                activeInsightIndex === idx ? 'w-6 bg-[#EAB308]' : 'w-2 bg-[#D0D1D6] hover:bg-[#BDBEC5]'
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
                  <span className="text-[10px] uppercase font-bold text-[#B45309] bg-[#FEF3C7] border border-[#EAB308]/40 px-2 py-0.5 rounded">
                    {currentInsight.time_window}
                  </span>
                  <SeverityBadge severity={currentInsight.severity} size="sm" isAiClassified />
                  <span className="text-[10px] text-[#555960]">
                    {currentInsight.incident_count} Incidents Detected
                  </span>
                </div>
                <h4 className="font-bold text-sm text-[#202226]">
                  {currentInsight.title}
                </h4>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-[#555960] block">Model Confidence</span>
                <span className="font-bold text-sm text-[#B45309]">
                  {Math.round(currentInsight.confidence * 100)}%
                </span>
              </div>
            </div>

            {/* Pattern Description Grounded Quote */}
            <div className="rounded-xl bg-[#F4F5F6] border border-[#D0D1D6] p-3.5 text-xs text-[#202226] leading-relaxed">
              <p className="text-[#202226]">
                &ldquo;{currentInsight.pattern_description}&rdquo;
              </p>
            </div>

            {/* Actionable Recommendations */}
            <div className="space-y-2">
              <span className="font-bold text-[11px] text-[#555960] uppercase tracking-wider block">
                Autonomous Recommendations:
              </span>
              <div className="space-y-1.5">
                {currentInsight.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 rounded-lg bg-white border border-[#D0D1D6] p-2.5 text-xs text-[#555960]"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#FEF3C7] text-[#B45309] text-[10px] font-bold">
                      0{i + 1}
                    </span>
                    <span className="text-[#202226] mt-0.5">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button & Audit Trigger */}
            <div className="pt-2 border-t border-[#D0D1D6] flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] text-[#555960]">
                <Cpu className="h-3.5 w-3.5 text-[#B45309]" />
                <span>Auto-Dispatched Preventive Tasks</span>
              </div>

              <Button
                size="sm"
                onClick={() => handleApply(currentInsight.id)}
                disabled={currentInsight.action_status === 'applied'}
                className={`text-xs font-bold gap-1.5 ${
                  currentInsight.action_status === 'applied'
                    ? 'bg-[#ECFDF5] text-[#067a4f] border border-[#10B981]'
                    : 'bg-gradient-to-r from-[#EAB308] to-[#D4AF37] text-[#202226] shadow-sm hover:brightness-105'
                }`}
              >
                {currentInsight.action_status === 'applied' ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" />
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
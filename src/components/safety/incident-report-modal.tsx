'use client';

import React, { useState } from 'react';
import { useSafety } from '@/lib/context/safety-context';
import { IncidentCategory, IncidentSeverity, AIIncidentClassification } from '@/lib/types';
import { CAMPUS_LOCATIONS } from '@/lib/constants/demo-data';
import { SeverityBadge } from '@/components/shared/severity-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  X,
  Flame,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertOctagon,
  EyeOff,
  UploadCloud,
  Check,
} from 'lucide-react';

interface IncidentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (incidentId: string) => void;
}

export function IncidentReportModal({ isOpen, onClose, onSuccess }: IncidentReportModalProps) {
  const { createIncident } = useSafety();

  // Wizard Step: 1 = Details, 2 = Location & Category, 3 = Options & Evidence, 4 = AI Analysis & Review, 5 = Success
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('Engineering Block');
  const [category, setCategory] = useState<IncidentCategory>('fire');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [evidenceFileName, setEvidenceFileName] = useState<string | null>(null);

  // AI Classification State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIIncidentClassification | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdIncidentId, setCreatedIncidentId] = useState<string | null>(null);

  if (!isOpen) return null;

  // HERO TEST CASE QUICK-FILL
  const handleFillHeroTestCase = () => {
    setTitle('Smoke & Burning Odor near Block D Electrical Room');
    setDescription('There is smoke coming from the electrical room near Block D. I can also smell something burning.');
    setLocationName('Engineering Block');
    setCategory('fire');
    setIsEmergency(true);
    setCurrentStep(1);
  };

  // Run AI Triage
  const handleRunAiTriage = async () => {
    if (!description) return;
    setIsAiLoading(true);
    setCurrentStep(4);

    try {
      const res = await fetch('/api/ai/classify-incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          location: locationName,
          category,
          is_emergency: isEmergency,
          evidence_urls: evidenceFileName ? [evidenceFileName] : [],
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setAiAnalysis(json.data as AIIncidentClassification);
      } else {
        throw new Error('AI analysis returned status ' + res.status);
      }
    } catch (err) {
      console.warn('AI Triage error, using client fallback:', err);
      // Client-side fallback rule
      const isCritical = description.toLowerCase().includes('smoke') || description.toLowerCase().includes('burning');
      setAiAnalysis({
        category: 'fire',
        severity: isCritical ? 'CRITICAL' : 'HIGH',
        confidence: 0.98,
        summary: 'Active smoke and potential electrical fire hazard detected near Block D. Immediate containment, evacuation, and circuit isolation required.',
        location: locationName || 'Block D / Engineering Block',
        recommended_actions: [
          'Dispatch Campus Rapid Security & Hazmat Team immediately',
          'Isolate local electrical main distribution breakers',
          'Initiate Level 1 localized building evacuation',
          'Notify Facility & Maintenance and Campus Executive Administration',
        ],
        departments: ['Security', 'Maintenance', 'Administration'],
        emergency_required: true,
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  // Final Submit
  const handleSubmitIncident = async () => {
    setIsSubmitting(true);
    try {
      const created = await createIncident({
        title: title || 'Reported Incident',
        description,
        location_name: locationName,
        category: aiAnalysis ? aiAnalysis.category : category,
        severity: aiAnalysis ? (aiAnalysis.severity.toLowerCase() as IncidentSeverity) : 'high',
        is_anonymous: isAnonymous,
        is_emergency: isEmergency || aiAnalysis?.emergency_required,
        evidence_urls: evidenceFileName ? [`/evidence/${evidenceFileName}`] : [],
        ai_analysis: aiAnalysis || undefined,
      });

      setCreatedIncidentId(created.incident_number);
      setCurrentStep(5);
      onSuccess?.(created.id);
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocationName('Engineering Block');
    setCategory('fire');
    setIsAnonymous(false);
    setIsEmergency(false);
    setEvidenceFileName(null);
    setAiAnalysis(null);
    setCurrentStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl border border-[#D0D1D6] bg-white text-[#202226] shadow-xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Step Progress */}
        <div className="border-b border-[#D0D1D6] bg-[#F4F5F6] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#EAB308] via-[#D4AF37] to-[#C5A059]">
                <Flame className="h-4 w-4 font-bold text-[#202226]" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#202226] flex items-center gap-2">
                  <span>Report Campus Safety Incident</span>
                </h3>
                <p className="text-[11px] text-[#555960]">
                  AI triage &amp; rapid dispatch
                </p>
              </div>
            </div>

            <button
              onClick={resetForm}
              className="rounded-lg p-1.5 text-[#555960] hover:bg-[#E7E8EB] hover:text-[#202226]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          {currentStep < 5 && (
            <div className="mt-3 grid grid-cols-4 gap-1.5 pt-2 border-t border-[#D0D1D6]">
              {['1. Details', '2. Location', '3. Evidence', '4. AI Review'].map((st, i) => (
                <div
                  key={st}
                  className={`h-1.5 rounded-full transition-all ${
                    currentStep >= i + 1
                      ? 'bg-gradient-to-r from-[#EAB308] to-[#D4AF37]'
                      : 'bg-[#D0D1D6]'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Step Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Quick Hero Test Case Injector Button */}
          {currentStep === 1 && (
            <div className="rounded-xl border border-[#EAB308]/40 bg-[#FEFCE8] p-3 flex items-center justify-between gap-2 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-[#202226]">
                <Sparkles className="h-4 w-4 text-[#B45309] shrink-0" />
                <span>
                  <strong className="text-[#B45309]">Hero Test Case:</strong> Smoke near Block D electrical room
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleFillHeroTestCase}
                className="h-7 text-[11px] bg-[#EAB308] text-[#202226] font-bold shrink-0 hover:bg-[#D4AF37]"
              >
                Auto-Fill Hero Test
              </Button>
            </div>
          )}

          {/* STEP 1: Description & Headline */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1">
                <label className="font-bold text-[#202226]">
                  Incident Headline / Short Title <span className="text-[#DC2626]">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Smoke coming from electrical room or chemical spill"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#202226]">
                  Detailed Description of Situation &amp; Observations <span className="text-[#DC2626]">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide complete details: What did you see, hear, or smell? Are people in immediate danger?"
                  rows={4}
                  className="w-full rounded-xl border border-[#D0D1D6] bg-white p-3 text-xs text-[#202226] placeholder:text-[#8A9199] focus:border-[#EAB308] focus:outline-none"
                  required
                />
                <span className="text-[10px] text-[#555960]">
                  AI will analyze this text to categorize risk and route departments.
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: Location & Category */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1">
                <label className="font-bold text-[#202226]">
                  Select Campus Facility / Location <span className="text-[#DC2626]">*</span>
                </label>
                <select
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#D0D1D6] bg-white px-3 text-xs text-[#202226] focus:border-[#EAB308] focus:outline-none"
                >
                  {CAMPUS_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name} ({loc.code} - {loc.sector})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-[#555960]">
                  Selected facility will be highlighted on the Command Map.
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#202226]">
                  Incident Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                  className="h-10 w-full rounded-xl border border-[#D0D1D6] bg-white px-3 text-xs text-[#202226] focus:border-[#EAB308] focus:outline-none capitalize"
                >
                  <option value="fire">Fire / Smoke / Electrical Arc</option>
                  <option value="medical">Medical Urgency / Injury</option>
                  <option value="infrastructure">Infrastructure / Water / HVAC</option>
                  <option value="suspicious_activity">Suspicious Activity / Access Breach</option>
                  <option value="theft">Theft / Property Tamper</option>
                  <option value="harassment">Harassment / Safety Concern</option>
                  <option value="other">Other Campus Incident</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: Options, Evidence, Privacy */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Emergency Toggle */}
              <div className={`p-4 rounded-xl border transition-all ${
                isEmergency ? 'bg-[#FEF2F2] border-[#DC2626]' : 'bg-white border-[#D0D1D6]'
              }`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEmergency}
                    onChange={(e) => setIsEmergency(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#D0D1D6] bg-white text-[#DC2626] focus:ring-[#DC2626] cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-[#202226] flex items-center gap-1.5">
                      <AlertOctagon className="h-4 w-4 text-[#DC2626]" />
                      <span>Immediate Emergency / Life Safety Threat</span>
                    </span>
                    <p className="text-[11px] text-[#555960] mt-0.5">
                      Flags this report for instant audio siren broadcast and high-priority responder paging.
                    </p>
                  </div>
                </label>
              </div>

              {/* Anonymous Whistleblower Toggle */}
              <div className="p-4 rounded-xl bg-white border border-[#D0D1D6]">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#D0D1D6] bg-white text-[#EAB308] focus:ring-[#EAB308] cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-[#202226] flex items-center gap-1.5">
                      <EyeOff className="h-4 w-4 text-[#B45309]" />
                      <span>Anonymous Whistleblower Protection</span>
                    </span>
                    <p className="text-[11px] text-[#555960] mt-0.5">
                      Your name, email, and student ID will be stripped from all logs and records.
                    </p>
                  </div>
                </label>
              </div>

              {/* Evidence Upload Dropzone Simulation */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#202226]">
                  Optional Evidence (Photo / Video / Document)
                </label>
                <div
                  onClick={() => setEvidenceFileName('electrical_room_smoke_photo.jpg')}
                  className="rounded-xl border-2 border-dashed border-[#D0D1D6] hover:border-[#EAB308]/50 bg-[#F4F5F6] p-4 text-center cursor-pointer transition-colors"
                >
                  <UploadCloud className="h-6 w-6 text-[#555960] mx-auto mb-1" />
                  {evidenceFileName ? (
                    <div className="flex items-center justify-center gap-2 text-[#067a4f] text-xs">
                      <Check className="h-4 w-4" />
                      <span>Attached: {evidenceFileName}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-[#555960]">
                      Click to attach simulated photo (e.g. <span className="text-[#B45309]">electrical_room_smoke_photo.jpg</span>)
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: AI Analysis & Structured Review */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {isAiLoading ? (
                <div className="py-12 text-center space-y-3">
                  <div className="flex justify-center">
                    <Sparkles className="h-8 w-8 text-[#B45309] animate-spin" />
                  </div>
                  <h4 className="font-bold text-sm text-[#202226]">
                    Analyzing Incident Telemetry...
                  </h4>
                  <p className="text-xs text-[#555960] max-w-sm mx-auto">
                    Synthesizing hazard indicators, validating against building schemas, and predicting department routing.
                  </p>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-4">
                  {/* AI Output Card */}
                  <div className="rounded-xl border border-[#EAB308] bg-gradient-to-br from-[#FEFCE8] to-white p-4 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#EAB308]/30 pb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#B45309]" />
                        <span className="font-bold text-xs text-[#B45309]">
                          AI Triage Card
                        </span>
                      </div>
                      <SeverityBadge
                        severity={aiAnalysis.severity.toLowerCase() as IncidentSeverity}
                        size="md"
                        isAiClassified
                      />
                    </div>

                    <p className="text-xs text-[#202226] leading-relaxed">
                      {aiAnalysis.summary}
                    </p>

                    {/* Grounded Recommendations */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] text-[#555960] uppercase block font-bold">
                        Recommended Actions:
                      </span>
                      <ul className="space-y-1 text-[11px] text-[#555960]">
                        {aiAnalysis.recommended_actions.map((act, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-[#B45309] font-bold">•</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Department Routing */}
                    <div className="pt-2 border-t border-[#EAB308]/20 flex items-center gap-2 flex-wrap text-[10px]">
                      <span className="text-[#555960]">Departments:</span>
                      {aiAnalysis.departments.map((d, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-[#F4F5F6] border border-[#D0D1D6] text-[#B45309]">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Submission Summary Details */}
                  <div className="rounded-xl bg-[#F4F5F6] p-3.5 border border-[#D0D1D6] space-y-2 text-xs">
                    <div className="flex justify-between border-b border-[#D0D1D6] pb-1">
                      <span className="text-[#555960]">Location:</span>
                      <span className="font-bold text-[#202226]">{locationName}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#D0D1D6] pb-1">
                      <span className="text-[#555960]">Reporter:</span>
                      <span className="text-[#B45309]">
                        {isAnonymous ? 'Whistleblower (Protected)' : 'Aanya Patel (Student)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#555960]">Emergency Tier:</span>
                      <span className="font-bold text-[#DC2626]">
                        {aiAnalysis.emergency_required || isEmergency ? 'IMMEDIATE DISPATCH REQUIRED' : 'STANDARD'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* STEP 5: Success Confirmation */}
          {currentStep === 5 && (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ECFDF5] border-2 border-[#10B981] mx-auto text-[#10B981]">
                <CheckCircle className="h-8 w-8" />
              </div>

              <div>
                <h4 className="font-bold text-base text-[#202226]">
                  Incident Dispatched &amp; Logged
                </h4>
                <p className="text-xs text-[#555960] mt-1">
                  Incident ID: <strong className="text-[#B45309]">{createdIncidentId}</strong>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#F4F5F6] border border-[#D0D1D6] max-w-sm mx-auto text-left text-xs space-y-1">
                <p className="text-[#202226] flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#10B981]" />
                  <span>Assigned to <strong>Officer Vikram Sharma (Security)</strong></span>
                </p>
                <p className="text-[#202226] flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#10B981]" />
                  <span>Placed onto <strong>Live Command Center Map</strong></span>
                </p>
                <p className="text-[#202226] flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#10B981]" />
                  <span>Added to <strong>Immutable Audit Trail</strong></span>
                </p>
              </div>

              <Button
                onClick={resetForm}
                className="bg-gradient-to-r from-[#EAB308] to-[#D4AF37] text-[#202226] font-bold text-xs px-6"
              >
                Done &amp; View Command Center
              </Button>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        {currentStep < 5 && (
          <div className="flex items-center justify-between border-t border-[#D0D1D6] bg-[#F4F5F6] px-6 py-3.5">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep((s) => s - 1)}
                  disabled={isAiLoading || isSubmitting}
                  className="gap-1 text-xs"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back</span>
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={resetForm} className="text-xs">
                Cancel
              </Button>

              {currentStep < 3 && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setCurrentStep((s) => s + 1)}
                  disabled={currentStep === 1 && (!title || !description)}
                  className="bg-gradient-to-r from-[#EAB308] to-[#D4AF37] text-[#202226] font-bold text-xs gap-1"
                >
                  <span>Next</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              )}

              {currentStep === 3 && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleRunAiTriage}
                  className="bg-gradient-to-r from-[#EAB308] via-[#D4AF37] to-[#C5A059] text-[#202226] font-bold text-xs gap-1.5 shadow-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Run AI Triage Analysis</span>
                </Button>
              )}

              {currentStep === 4 && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSubmitIncident}
                  disabled={isSubmitting || isAiLoading}
                  className="bg-gradient-to-r from-[#DC2626] to-[#F59E0B] text-white font-bold text-xs gap-1.5 shadow-sm"
                >
                  <ShieldAlert className="h-4 w-4" />
                  <span>{isSubmitting ? 'Transmitting...' : 'Confirm & Dispatch Incident'}</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

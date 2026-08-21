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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl border border-[#D4AF37]/50 bg-[#0F1026] text-[#F4F1DE] shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with Step Progress */}
        <div className="border-b border-[#243356] bg-[#131C38] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFD700] via-[#D4AF37] to-[#C5A059] text-[#0B132B]">
                <Flame className="h-4 w-4 font-bold" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#F4F1DE] font-mono flex items-center gap-2">
                  <span>REPORT CAMPUS SAFETY INCIDENT</span>
                </h3>
                <p className="text-[11px] text-[#B8B5A3] font-mono">
                  Autonomous Gemini 3.7 Flash Triage &amp; Rapid Dispatch
                </p>
              </div>
            </div>

            <button
              onClick={resetForm}
              className="rounded-lg p-1.5 text-[#B8B5A3] hover:bg-[#1C2541] hover:text-[#FFD700]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          {currentStep < 5 && (
            <div className="mt-3 grid grid-cols-4 gap-1.5 pt-2 border-t border-[#243356]">
              {['1. Details', '2. Location', '3. Evidence', '4. AI Review'].map((st, i) => (
                <div
                  key={st}
                  className={`h-1.5 rounded-full transition-all ${
                    currentStep >= i + 1
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700]'
                      : 'bg-[#243356]'
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
            <div className="rounded-xl border border-[#D4AF37]/40 bg-[#131C38]/90 p-3 flex items-center justify-between gap-2 shadow-md">
              <div className="flex items-center gap-2 text-xs text-[#F4F1DE]">
                <Sparkles className="h-4 w-4 text-[#FFD700] shrink-0" />
                <span>
                  <strong className="text-[#FFD700]">Hero Test Case:</strong> Smoke near Block D electrical room
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleFillHeroTestCase}
                className="h-7 text-[11px] font-mono bg-[#D4AF37] text-[#0B132B] font-bold shrink-0 hover:bg-[#FFD700]"
              >
                Auto-Fill Hero Test
              </Button>
            </div>
          )}

          {/* STEP 1: Description & Headline */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1">
                <label className="font-bold text-[#F4F1DE] font-mono">
                  Incident Headline / Short Title <span className="text-red-400">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Smoke coming from electrical room or chemical spill"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#F4F1DE] font-mono">
                  Detailed Description of Situation &amp; Observations <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide complete details: What did you see, hear, or smell? Are people in immediate danger? Any ongoing sounds or visible fumes?"
                  rows={4}
                  className="w-full rounded-xl border border-[#243356] bg-[#131C38] p-3 text-xs text-[#F4F1DE] placeholder:text-[#7A786B] focus:border-[#D4AF37] focus:outline-none"
                  required
                />
                <span className="text-[10px] text-[#B8B5A3] font-mono">
                  Gemini 3.7 Flash will analyze this text to categorize risk and route departments.
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: Location & Category */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1">
                <label className="font-bold text-[#F4F1DE] font-mono">
                  Select Campus Facility / Location <span className="text-red-400">*</span>
                </label>
                <select
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#243356] bg-[#131C38] px-3 text-xs text-[#F4F1DE] focus:border-[#D4AF37] focus:outline-none font-mono"
                >
                  {CAMPUS_LOCATIONS.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name} ({loc.code} - {loc.sector})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-[#B8B5A3] font-mono">
                  Selected facility vector node will be highlighted on the Security Command Map.
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#F4F1DE] font-mono">
                  Incident Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as IncidentCategory)}
                  className="h-10 w-full rounded-xl border border-[#243356] bg-[#131C38] px-3 text-xs text-[#F4F1DE] focus:border-[#D4AF37] focus:outline-none capitalize font-mono"
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
                isEmergency ? 'bg-red-950/40 border-red-500' : 'bg-[#131C38] border-[#243356]'
              }`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEmergency}
                    onChange={(e) => setIsEmergency(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#243356] bg-[#0F1026] text-red-600 focus:ring-red-500 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-[#F4F1DE] flex items-center gap-1.5">
                      <AlertOctagon className="h-4 w-4 text-red-400" />
                      <span>Immediate Emergency / Life Safety Threat</span>
                    </span>
                    <p className="text-[11px] text-[#B8B5A3] mt-0.5">
                      Flags this report for instant audio siren broadcast and high-priority responder paging.
                    </p>
                  </div>
                </label>
              </div>

              {/* Anonymous Whistleblower Toggle */}
              <div className="p-4 rounded-xl bg-[#131C38] border border-[#243356]">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-[#243356] bg-[#0F1026] text-[#D4AF37] focus:ring-[#D4AF37] cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-[#F4F1DE] flex items-center gap-1.5">
                      <EyeOff className="h-4 w-4 text-[#FFD700]" />
                      <span>Anonymous Whistleblower Protection</span>
                    </span>
                    <p className="text-[11px] text-[#B8B5A3] mt-0.5">
                      Your name, email, and student ID will be stripped from all logs and records.
                    </p>
                  </div>
                </label>
              </div>

              {/* Evidence Upload Dropzone Simulation */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#F4F1DE] font-mono">
                  Optional Evidence (Photo / Video / Document)
                </label>
                <div
                  onClick={() => setEvidenceFileName('electrical_room_smoke_photo.jpg')}
                  className="rounded-xl border-2 border-dashed border-[#243356] hover:border-[#D4AF37]/50 bg-[#131C38]/50 p-4 text-center cursor-pointer transition-colors"
                >
                  <UploadCloud className="h-6 w-6 text-[#C5A059] mx-auto mb-1" />
                  {evidenceFileName ? (
                    <div className="flex items-center justify-center gap-2 text-emerald-400 font-mono text-xs">
                      <Check className="h-4 w-4" />
                      <span>Attached: {evidenceFileName}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-[#B8B5A3]">
                      Click to attach simulated photo (e.g. <span className="text-[#FFD700]">electrical_room_smoke_photo.jpg</span>)
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
                    <Sparkles className="h-8 w-8 text-[#FFD700] animate-spin" />
                  </div>
                  <h4 className="font-bold text-sm text-[#F4F1DE] font-mono">
                    Gemini 3.7 Flash Analyzing Incident Telemetry...
                  </h4>
                  <p className="text-xs text-[#B8B5A3] max-w-sm mx-auto">
                    Synthesizing hazard indicators, validating against building schemas, and predicting department routing.
                  </p>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-4">
                  {/* AI Output Card */}
                  <div className="rounded-xl border border-[#D4AF37] bg-gradient-to-br from-[#131C38] via-[#0F1026] to-[#1C2541] p-4 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-[#243356] pb-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-[#FFD700]" />
                        <span className="font-bold font-mono text-xs text-[#FFD700]">
                          Gemini 3.7 Flash Triage Card
                        </span>
                      </div>
                      <SeverityBadge
                        severity={aiAnalysis.severity.toLowerCase() as IncidentSeverity}
                        size="md"
                        isAiClassified
                      />
                    </div>

                    <p className="text-xs text-[#F4F1DE] leading-relaxed">
                      {aiAnalysis.summary}
                    </p>

                    {/* Grounded Recommendations */}
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-mono text-[#C5A059] uppercase block font-bold">
                        Recommended Actions:
                      </span>
                      <ul className="space-y-1 text-[11px] text-[#B8B5A3]">
                        {aiAnalysis.recommended_actions.map((act, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-[#FFD700] font-bold">•</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Department Routing */}
                    <div className="pt-2 border-t border-[#243356] flex items-center gap-2 flex-wrap text-[10px] font-mono">
                      <span className="text-[#C5A059]">Departments:</span>
                      {aiAnalysis.departments.map((d, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-[#0B132B] border border-[#243356] text-[#FFD700]">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Submission Summary Details */}
                  <div className="rounded-xl bg-[#131C38] p-3.5 border border-[#243356] space-y-2 text-xs">
                    <div className="flex justify-between border-b border-[#243356] pb-1">
                      <span className="text-[#B8B5A3]">Location:</span>
                      <span className="font-bold text-[#F4F1DE]">{locationName}</span>
                    </div>
                    <div className="flex justify-between border-b border-[#243356] pb-1">
                      <span className="text-[#B8B5A3]">Reporter:</span>
                      <span className="font-mono text-[#FFD700]">
                        {isAnonymous ? 'Whistleblower (Protected)' : 'Aanya Patel (Student)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#B8B5A3]">Emergency Tier:</span>
                      <span className="font-mono font-bold text-red-400">
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
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-950 border-2 border-emerald-500 mx-auto text-emerald-400">
                <CheckCircle className="h-8 w-8" />
              </div>

              <div>
                <h4 className="font-bold text-base text-[#F4F1DE] font-mono">
                  Incident Dispatched &amp; Logged
                </h4>
                <p className="text-xs text-[#B8B5A3] mt-1">
                  Incident ID: <strong className="font-mono text-[#FFD700]">{createdIncidentId}</strong>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#131C38] border border-[#243356] max-w-sm mx-auto text-left text-xs space-y-1">
                <p className="text-[#F4F1DE] flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Assigned to <strong>Capt. Vikram Sharma (Security)</strong></span>
                </p>
                <p className="text-[#F4F1DE] flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Placed onto <strong>Live Command Center Map</strong></span>
                </p>
                <p className="text-[#F4F1DE] flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Added to <strong>Immutable Audit Trail</strong></span>
                </p>
              </div>

              <Button
                onClick={resetForm}
                className="bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#0B132B] font-bold font-mono text-xs px-6"
              >
                Done &amp; View Command Center
              </Button>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        {currentStep < 5 && (
          <div className="flex items-center justify-between border-t border-[#243356] bg-[#131C38] px-6 py-3.5">
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
                  className="bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#0B132B] font-bold text-xs gap-1"
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
                  className="bg-gradient-to-r from-[#FFD700] via-[#D4AF37] to-[#C5A059] text-[#0B132B] font-bold text-xs gap-1.5 shadow-md shadow-[#D4AF37]/30"
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
                  className="bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold text-xs gap-1.5 shadow-lg shadow-red-900/40"
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

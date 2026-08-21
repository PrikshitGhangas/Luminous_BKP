'use client';

import React, { useState } from 'react';
import { useCampusServices } from '@/lib/context/campus-services-context';
import { useRole } from '@/lib/hooks/use-role';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  Lock,
  Phone,
  Users,
  AlertTriangle,
  Info,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function WellbeingPage() {
  const {
    wellbeingAggregated,
    counselors,
    logWellbeingCheckIn,
  } = useCampusServices();

  const { role } = useRole();
  const isAdmin = role === 'super_admin' || role === 'admin';

  // Check-in Form State
  const [selectedMood, setSelectedMood] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [selectedEnergy, setSelectedEnergy] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [stressFactor, setStressFactor] = useState<'Academics' | 'Exams' | 'Hostel' | 'Career' | 'Personal' | 'None'>('Exams');
  const [notes, setNotes] = useState('');
  const [submittedCheckIn, setSubmittedCheckIn] = useState(false);

  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logWellbeingCheckIn(selectedMood, selectedEnergy, stressFactor, notes, role || 'student', 'Computer Science & Engineering');
    setSubmittedCheckIn(true);
    setNotes('');
  };

  const getMoodEmoji = (mood: number) => {
    switch (mood) {
      case 5: return { emoji: '🌟 Great', text: 'Feeling Energized & Confident', color: 'text-[#FFD700]' };
      case 4: return { emoji: '🙂 Good', text: 'Balanced & Focused', color: 'text-emerald-400' };
      case 3: return { emoji: '😐 Okay', text: 'Managing Day-to-Day', color: 'text-[#C5A059]' };
      case 2: return { emoji: '🙁 Stressed', text: 'Experiencing Heavy Load', color: 'text-amber-400' };
      case 1: return { emoji: '😫 Exhausted', text: 'Feeling Overwhelmed', color: 'text-red-400' };
      default: return { emoji: '🙂 Good', text: 'Balanced', color: 'text-[#FFD700]' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner - NON DIAGNOSIS COMPLIANCE */}
      <div className="bg-[#131C38] border-2 border-[#D4AF37]/50 p-4 rounded-xl flex items-start gap-3 text-xs font-mono text-[#F4F1DE]">
        <Info className="h-5 w-5 text-[#FFD700] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-[#FFD700] uppercase tracking-wider block">
            INSTITUTIONAL WELLBEING &amp; PRIVACY GUARANTEE
          </span>
          <p className="text-[#B8B5A3] leading-relaxed">
            This tool is designed strictly for voluntary personal self-reflection and institutional support routing.{' '}
            <strong className="text-white">This system does NOT diagnose, treat, or evaluate medical or mental health conditions.</strong>{' '}
            All individual check-in records are protected by strict privacy scoping. Administrators only receive anonymized, department-level aggregated wellness index metrics.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#243356] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F1DE] font-mono flex items-center gap-2.5">
            <Heart className="h-6 w-6 text-rose-400" />
            <span>STUDENT &amp; STAFF WELLBEING HUB</span>
          </h1>
          <p className="text-xs text-[#B8B5A3] mt-1 font-sans">
            Optional daily self-reflection check-in, 24/7 counseling helpline, and privacy-aware wellness support
          </p>
        </div>

        <Badge className="bg-teal-500/15 text-teal-300 border-teal-500/30 font-mono text-xs gap-1 self-start sm:self-center">
          <Lock className="h-3.5 w-3.5" />
          <span>PRIVACY PROTECTED</span>
        </Badge>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (2 Cols): Check-in Form & History */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
            <CardHeader className="p-4 border-b border-[#243356] bg-[#131C38]/60 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Optional Daily Wellness Check-In</span>
              </CardTitle>
              <span className="text-[10px] font-mono text-[#C5A059]">Voluntary Self-Reflection</span>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              {submittedCheckIn ? (
                <div className="bg-[#131C38] p-5 rounded-xl border border-[#D4AF37]/40 text-center space-y-3 font-mono">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                  <h3 className="font-bold text-sm text-[#F4F1DE]">Check-In Logged Successfully</h3>
                  <p className="text-xs text-[#B8B5A3] max-w-sm mx-auto">
                    Thank you for checking in today. Your entry is private. Remember, campus counseling services are available 24/7 whenever you need support.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setSubmittedCheckIn(false)}
                    variant="outline"
                    className="text-xs border-[#243356] text-[#FFD700]"
                  >
                    Log Another Reflection
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleCheckInSubmit} className="space-y-4 text-xs font-mono">
                  {/* Mood Selector */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#C5A059] uppercase block">
                      How are you feeling today? (Mood Rating)
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {([1, 2, 3, 4, 5] as const).map((m) => {
                        const info = getMoodEmoji(m);
                        const isSelected = selectedMood === m;
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setSelectedMood(m)}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              isSelected
                                ? 'bg-[#D4AF37] text-[#0B132B] font-bold border-[#FFD700] shadow-md shadow-[#D4AF37]/30 scale-105'
                                : 'bg-[#131C38] text-[#B8B5A3] border-[#243356] hover:text-white'
                            }`}
                          >
                            <span className="text-sm font-bold block">{m}</span>
                            <span className="text-[10px] block mt-1">{info.emoji.split(' ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                    <p className={`text-[11px] font-bold mt-1 text-center ${getMoodEmoji(selectedMood).color}`}>
                      Selected: {getMoodEmoji(selectedMood).emoji} — {getMoodEmoji(selectedMood).text}
                    </p>
                  </div>

                  {/* Stress Factor Dropdown */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Primary Focus / Stress Area</label>
                      <select
                        value={stressFactor}
                        onChange={(e) => setStressFactor(e.target.value as typeof stressFactor)}
                        className="w-full rounded-md bg-[#131C38] border border-[#243356] p-2 text-xs text-[#F4F1DE]"
                      >
                        <option value="None">None / Balanced</option>
                        <option value="Academics">Academics &amp; Coursework</option>
                        <option value="Exams">Exams &amp; Evaluation</option>
                        <option value="Hostel">Hostel &amp; Residence</option>
                        <option value="Career">Career &amp; Placements</option>
                        <option value="Personal">Personal / Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Energy Level (1-5)</label>
                      <select
                        value={selectedEnergy}
                        onChange={(e) => setSelectedEnergy(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                        className="w-full rounded-md bg-[#131C38] border border-[#243356] p-2 text-xs text-[#F4F1DE]"
                      >
                        <option value={5}>5 — Peak Energy</option>
                        <option value={4}>4 — Moderate Energy</option>
                        <option value={3}>3 — Normal</option>
                        <option value={2}>2 — Low Energy</option>
                        <option value={1}>1 — Fatigue</option>
                      </select>
                    </div>
                  </div>

                  {/* Optional Reflective Notes */}
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Optional Personal Reflection Notes</label>
                    <textarea
                      rows={2}
                      placeholder="Write notes for your personal reflection (optional)..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full rounded-md bg-[#131C38] border border-[#243356] p-2 text-xs text-[#F4F1DE]"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#D4AF37] to-[#C5A059] hover:opacity-90 text-[#0B132B] font-bold text-xs py-2.5"
                  >
                    Save Reflection Entry
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* ADMIN AGGREGATED METRICS VIEW */}
          {isAdmin && (
            <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
              <CardHeader className="p-4 border-b border-[#243356] bg-[#131C38]/60 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Administrators Aggregated Department Wellness Index</span>
                  </CardTitle>
                  <p className="text-[10px] text-[#B8B5A3] font-mono mt-0.5">De-identified aggregate metrics only. No raw PII stored.</p>
                </div>
                <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/30 text-[10px] font-mono">
                  ADMIN CLEARANCE
                </Badge>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs font-mono">
                {wellbeingAggregated.map((agg) => (
                  <div key={agg.department} className="bg-[#131C38] p-3 rounded-lg border border-[#243356] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-[#F4F1DE]">{agg.department}</span>
                      <p className="text-[10px] text-[#B8B5A3]">Top Reported Stress Factor: <strong className="text-[#FFD700]">{agg.topStressFactor}</strong></p>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <span className="text-[10px] text-[#C5A059] block">AVG MOOD</span>
                        <span className="font-bold text-emerald-400 text-sm">{agg.avgMood} / 5.0</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#C5A059] block">CHECK-INS</span>
                        <span className="font-bold text-[#FFD700] text-sm">{agg.checkInCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column (1 Col): Counselor Directory & Support Helpline */}
        <div className="space-y-4">
          <Card className="bg-[#0F1026] border-2 border-[#D4AF37] text-[#F4F1DE]">
            <CardHeader className="p-4 border-b border-[#243356] bg-[#131C38]">
              <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>24/7 Counselor &amp; Crisis Support Helpline</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs font-mono">
              {counselors.map((csl) => (
                <div key={csl.id} className="bg-[#131C38] p-3 rounded-xl border border-[#243356] space-y-2">
                  <div>
                    <h4 className="font-bold text-[#F4F1DE] text-sm font-sans">{csl.name}</h4>
                    <p className="text-[10px] text-[#FFD700]">{csl.designation}</p>
                    <p className="text-[10px] text-[#B8B5A3] mt-0.5">{csl.specialty}</p>
                  </div>

                  <div className="space-y-1 text-[10px] text-[#B8B5A3] pt-1 border-t border-[#243356]">
                    <p>📍 {csl.officeLocation}</p>
                    <p>🕒 {csl.availabilityHours}</p>
                    <p className="text-emerald-400 font-bold">📞 Phone: {csl.phone}</p>
                    <p>✉️ Email: {csl.email}</p>
                  </div>
                </div>
              ))}

              <div className="bg-rose-950/40 border border-rose-500/40 p-3 rounded-xl text-[11px] text-rose-200 space-y-1 font-mono">
                <div className="font-bold text-rose-300 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                  <span>Immediate Safety Hotline</span>
                </div>
                <p className="text-[10px]">
                  If you or someone else requires urgent safety or medical attention, trigger Campus Emergency SOS immediately or call <strong className="text-white">+1 (555) 911-CAMPUS</strong>.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

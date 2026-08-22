'use client';

import React, { useState } from 'react';
import { useCampusServices } from '@/lib/context/campus-services-context';
import { useRole } from '@/lib/hooks/use-role';
import { Button } from '@/components/ui/button';
import {
  Heart,
  Lock,
  Phone,
  CheckCircle2,
  Calendar,
  MessageSquare,
  BookOpen,
  ShieldAlert,
} from 'lucide-react';

export default function WellbeingPage() {
  const { counselors } = useCampusServices();
  const { role } = useRole();

  const [supportCategory, setSupportCategory] = useState<'Exams' | 'Academics' | 'Hostel' | 'Career' | 'Personal'>('Exams');
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal');
  const [preferredMode, setPreferredMode] = useState<'in_person' | 'chat'>('in_person');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitSupport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setNotes('');
  };

  if (role !== 'student') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-[#F7F8F6] border border-[#D6D8D5] rounded-xl space-y-3">
        <div className="h-10 w-10 rounded-full bg-[#F0F1EF] border border-[#D6D8D5] flex items-center justify-center text-[#1F2933]">
          <Heart className="h-5 w-5 text-rose-500" />
        </div>
        <h2 className="text-base font-bold text-[#1F2933]">Student Confidential Access Only</h2>
        <p className="text-xs text-[#667085] max-w-sm">
          The Student Wellbeing &amp; Counseling Portal is strictly reserved for enrolled students to protect personal privacy and counselor confidentiality.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D6D8D5] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F2933] flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-500" />
            <span>Student Wellbeing &amp; Support</span>
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Confidential mental health guidance, exam stress relief, and campus counseling services.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium self-start sm:self-center">
          <Lock className="h-3.5 w-3.5" />
          <span>100% Confidential</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols): Request Counseling or Stress Support */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-xl border border-[#D6D8D5] bg-white shadow-xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-[#1F2933]">
                Need Someone to Talk To?
              </h2>
              <p className="text-xs text-[#667085] mt-0.5">
                If you are feeling overwhelmed, anxious about exams, or going through a tough time, our campus counseling team is here to support you.
              </p>
            </div>

            {isSubmitted ? (
              <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2.5">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                <h3 className="text-sm font-bold text-emerald-900">
                  Support Request Received
                </h3>
                <p className="text-xs text-emerald-800 leading-relaxed max-w-sm mx-auto">
                  A counselor from the Student Wellness Center will reach out to you within 2 hours. Your information is strictly private.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsSubmitted(false)}
                  className="text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-100 rounded-lg mt-2"
                >
                  Submit Another Request
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmitSupport} className="space-y-3.5 text-xs">
                {/* Area of Concern */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#1F2933] block">
                    What is on your mind?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'Exams', label: 'Exam Stress' },
                      { id: 'Academics', label: 'Coursework / Backlogs' },
                      { id: 'Career', label: 'Placements & Career' },
                      { id: 'Hostel', label: 'Hostel Adaptation' },
                      { id: 'Personal', label: 'Personal Matters' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSupportCategory(cat.id as any)}
                        className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                          supportCategory === cat.id
                            ? 'border-[#1F2933] bg-[#1F2933] text-white font-medium shadow-xs'
                            : 'border-[#D6D8D5] bg-white text-[#667085] hover:border-[#1F2933] hover:text-[#1F2933]'
                        }`}
                      >
                        <span className="text-xs block">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preferred Format */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#1F2933] block">
                      Preferred Mode
                    </label>
                    <select
                      value={preferredMode}
                      onChange={(e) => setPreferredMode(e.target.value as any)}
                      className="w-full rounded-lg bg-white border border-[#D6D8D5] px-3 py-2 text-xs text-[#1F2933] focus:outline-none focus:ring-1 focus:ring-[#1F2933]"
                    >
                      <option value="in_person">In-Person at Wellness Center</option>
                      <option value="chat">Online Audio / Video Call</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#1F2933] block">
                      Urgency
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value as any)}
                      className="w-full rounded-lg bg-white border border-[#D6D8D5] px-3 py-2 text-xs text-[#1F2933] focus:outline-none focus:ring-1 focus:ring-[#1F2933]"
                    >
                      <option value="normal">Normal (Next Available Slot)</option>
                      <option value="urgent">Urgent (Same Day Support)</option>
                    </select>
                  </div>
                </div>

                {/* Note */}
                <div className="space-y-1 pt-1">
                  <label className="text-xs font-semibold text-[#1F2933] block">
                    Brief Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Share any specific details or availability preference..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-lg bg-white border border-[#D6D8D5] p-3 text-xs text-[#1F2933] focus:outline-none focus:ring-1 focus:ring-[#1F2933] placeholder:text-[#98A2B3]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#1F2933] hover:bg-[#111827] text-white text-xs font-semibold py-2.5 rounded-lg cursor-pointer"
                >
                  Request Confidential Support
                </Button>
              </form>
            )}
          </div>

          {/* Quick Stress Management Tips */}
          <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs space-y-2.5">
            <h3 className="text-xs font-bold text-[#1F2933] flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-[#667085]" />
              <span>Quick Self-Care Reminders</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#667085]">
              <div className="p-2.5 rounded-lg bg-[#F7F8F6] border border-[#D6D8D5]">
                <strong className="text-[#1F2933] block mb-0.5">Box Breathing (4-4-4)</strong>
                Inhale 4s, hold 4s, exhale 4s to rapidly calm physical anxiety before exams.
              </div>
              <div className="p-2.5 rounded-lg bg-[#F7F8F6] border border-[#D6D8D5]">
                <strong className="text-[#1F2933] block mb-0.5">Break Cadence</strong>
                Study in 25-minute focused blocks followed by 5-minute movement breaks.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Counselor Directory & Helplines */}
        <div className="lg:col-span-5 space-y-4">
          {/* Counselors */}
          <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#1F2933] flex items-center gap-1.5 pb-2 border-b border-[#D6D8D5]">
              <Phone className="h-4 w-4 text-[#667085]" />
              <span>Campus Counselors on Duty</span>
            </h3>

            <div className="space-y-3">
              {counselors.map((csl) => (
                <div key={csl.id} className="p-3 rounded-lg bg-[#F7F8F6] border border-[#D6D8D5] space-y-1.5 text-xs">
                  <div>
                    <h4 className="font-bold text-[#1F2933]">{csl.name}</h4>
                    <p className="text-[11px] text-[#667085]">{csl.designation}</p>
                    <p className="text-[11px] text-[#667085] mt-0.5">{csl.specialty}</p>
                  </div>
                  <div className="pt-1.5 border-t border-[#D6D8D5] text-[11px] text-[#667085] space-y-0.5">
                    <p>📍 {csl.officeLocation}</p>
                    <p>🕒 {csl.availabilityHours}</p>
                    <p>
                      📞 Phone:{' '}
                      <a href={`tel:${csl.phone.replace(/[^0-9+]/g, '')}`} className="font-semibold text-[#1F2933] hover:underline">
                        {csl.phone}
                      </a>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* National 24/7 Helplines */}
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-2 shadow-xs">
            <div className="font-bold text-red-800 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-red-600" />
              <span>National Crisis Helplines (24/7)</span>
            </div>
            <p className="text-[11px] text-red-700 leading-relaxed">
              Free, confidential national mental health support available anytime:
            </p>
            <div className="space-y-1 text-xs pt-1">
              <div className="flex justify-between py-1 border-b border-red-200/60 font-medium">
                <span>Tele-MANAS (Govt of India):</span>
                <strong className="text-red-900">14416 / 1800-891-4416</strong>
              </div>
              <div className="flex justify-between py-1 font-medium">
                <span>Campus Emergency SOS:</span>
                <strong className="text-red-900">112 / 080-2360-0100</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

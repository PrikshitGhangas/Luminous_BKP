'use client';

import React, { useState } from 'react';
import { useCampusServices } from '@/lib/context/campus-services-context';
import { useRole } from '@/lib/hooks/use-role';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Heart,
  Lock,
  Phone,
  CheckCircle2,
  Calendar,
  MessageSquare,
  BookOpen,
  ShieldAlert,
  Sparkles,
  Send,
  UserCheck,
  Clock,
  FileText,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
}

interface TriageResult {
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isSpam: boolean;
  reasoning: string;
  suggestedAction: 'deflect' | 'schedule' | 'connect_now' | 'emergency';
  warmHandoffSummary?: string[];
  suggestedApproach?: string;
  assignedTherapist?: {
    name: string;
    specialization: string;
    status: string;
  };
}

export default function WellbeingPage() {
  const { counselors } = useCampusServices();
  const { role } = useRole();

  const [activeTab, setActiveTab] = useState<'chat' | 'appointment'>('chat');

  // Appointment Form State
  const [supportCategory, setSupportCategory] = useState<'Exams' | 'Academics' | 'Hostel' | 'Career' | 'Personal'>('Exams');
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal');
  const [preferredMode, setPreferredMode] = useState<'in_person' | 'chat'>('in_person');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Interactive AI Wellbeing Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: "Hello, I'm your confidential campus wellbeing assistant. How are you feeling today? You can share anything about exam pressure, homesickness, or personal struggles.",
      timestamp: 'Just now',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [triageState, setTriageState] = useState<TriageResult | null>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userText = inputMessage.trim();
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: 'Just now',
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate Gemini Triage & Anti-Spam Classification Logic
    setTimeout(() => {
      const lower = userText.toLowerCase();

      // Check Spam/Joke
      if (lower.includes('pizza') || lower.includes('joke') || lower.includes('meme') || lower.includes('test test')) {
        const triage: TriageResult = {
          urgency: 'LOW',
          isSpam: true,
          reasoning: 'Detected non-clinical conversational humor or test query.',
          suggestedAction: 'deflect',
        };
        setTriageState(triage);
        setChatMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: "It sounds like you might just be testing the system or having a light moment! This channel is prioritized for students dealing with emotional stress or academic pressure. If you ever need genuine support, we're always here.",
            timestamp: 'Just now',
          },
        ]);
      } else if (
        lower.includes('hurt') ||
        lower.includes('die') ||
        lower.includes('suicide') ||
        lower.includes('end it') ||
        lower.includes('assault') ||
        lower.includes('panic')
      ) {
        // Critical / High Crisis
        const triage: TriageResult = {
          urgency: 'CRITICAL',
          isSpam: false,
          reasoning: 'Severe distress indicators detected. Immediate clinical intervention required.',
          suggestedAction: 'emergency',
          warmHandoffSummary: [
            'Student reported acute distress and feelings of severe panic / safety threat.',
            'Expresses immediate feeling of being overwhelmed and unable to cope alone.',
            'Requires immediate supportive de-escalation and safety planning.',
          ],
          suggestedApproach: 'Use calm, non-judgmental presence. Validate emotional exhaustion and offer immediate safe space.',
          assignedTherapist: {
            name: 'Dr. Ananya Reddy',
            specialization: 'Crisis Intervention & Trauma',
            status: 'Available Now',
          },
        };
        setTriageState(triage);
        setChatMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: "I hear how intensely painful and overwhelming things feel right now. You do not have to carry this alone. I am connecting you with Dr. Ananya Reddy right now, and a clinical warm-handoff brief has been prepared so you don't have to repeat yourself.",
            timestamp: 'Just now',
          },
        ]);
      } else {
        // Medium / Exam Stress
        const triage: TriageResult = {
          urgency: 'MEDIUM',
          isSpam: false,
          reasoning: 'Academic workload and anxiety symptoms identified.',
          suggestedAction: 'schedule',
          warmHandoffSummary: [
            `Student is experiencing high stress related to coursework and upcoming exams.`,
            'Mentions physical fatigue and difficulty concentrating on study schedule.',
            'Open to structured time-management and stress-regulation techniques.',
          ],
          suggestedApproach: 'Acknowledge academic pressure. Guide through cognitive grounding and offer prioritized slot.',
          assignedTherapist: {
            name: 'Dr. Meena Iyer',
            specialization: 'Anxiety & Cognitive Coaching',
            status: 'Next Slot: 3:00 PM Today',
          },
        };
        setTriageState(triage);
        setChatMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: "Thank you for sharing that with me. It is completely normal to feel stretched when academic deadlines pile up. Dr. Meena Iyer specializes in student anxiety and has an opening today at 3:00 PM. Would you like me to reserve that slot for you?",
            timestamp: 'Just now',
          },
        ]);
      }

      setIsTyping(false);
    }, 900);
  };

  const handleSubmitSupport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setNotes('');
  };

  if (role !== 'student' && role !== 'super_admin' && role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-[#F7F8F6] border border-[#D6D8D5] rounded-xl space-y-3">
        <div className="h-10 w-10 rounded-full bg-[#F0F1EF] border border-[#D6D8D5] flex items-center justify-center text-[#1F2933]">
          <Heart className="h-5 w-5 text-rose-500" />
        </div>
        <h2 className="text-base font-bold text-[#1F2933]">Student Confidential Access Only</h2>
        <p className="text-xs text-[#667085] max-w-sm">
          The Student Wellbeing &amp; Counseling Portal is strictly reserved for students to protect personal privacy and counselor confidentiality.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D6D8D5] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F2933] flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-500" />
            <span>Student Wellbeing &amp; Support</span>
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Confidential mental health guidance, AI crisis triage, counselor warm-handoff, and appointment booking.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium self-start sm:self-center">
          <Lock className="h-3.5 w-3.5" />
          <span>100% Confidential &amp; Anonymous</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#D6D8D5] gap-2">
        <button
          onClick={() => setActiveTab('chat')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'chat'
              ? 'border-[#1F2933] text-[#1F2933]'
              : 'border-transparent text-[#667085] hover:text-[#1F2933]'
          }`}
        >
          <Sparkles className="h-4 w-4 text-[#D4AF37]" />
          <span>AI Wellbeing Chat &amp; Crisis Triage</span>
        </button>

        <button
          onClick={() => setActiveTab('appointment')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'appointment'
              ? 'border-[#1F2933] text-[#1F2933]'
              : 'border-transparent text-[#667085] hover:text-[#1F2933]'
          }`}
        >
          <Calendar className="h-4 w-4 text-[#667085]" />
          <span>Counselor Appointment &amp; Directory</span>
        </button>
      </div>

      {/* TAB 1: AI Wellbeing Chat & Triage */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Chat Window (7 Cols) */}
          <div className="lg:col-span-7 rounded-2xl border border-[#D6D8D5] bg-white shadow-xs overflow-hidden flex flex-col h-[560px]">
            <div className="p-4 border-b border-[#D6D8D5] bg-[#F7F8F6] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-[#1F2933]">Anonymous Wellbeing Session</span>
              </div>
              <span className="text-[10px] text-[#667085]">Zero-Log Confidential</span>
            </div>

            {/* Message Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#1F2933] text-white rounded-br-xs'
                        : 'bg-[#F0F1EF] text-[#1F2933] rounded-bl-xs border border-[#D6D8D5]'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-[#8A9199] mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}

              {isTyping && (
                <div className="space-y-2 max-w-[80%]">
                  <div className="flex items-center gap-2 text-[11px] text-[#8a6d1a] bg-[#FAF9F5] border border-[#EAB308]/30 px-3 py-1.5 rounded-lg w-fit">
                    <Loader2 className="h-3 w-3 animate-spin text-[#8a6d1a]" />
                    <span className="font-semibold">Gemini Clinical Engine analyzing emotional telemetry...</span>
                  </div>
                  <div className="bg-[#F0F1EF] p-3 rounded-2xl rounded-bl-xs border border-[#D6D8D5] space-y-2 animate-pulse">
                    <div className="h-3 bg-gray-300 rounded w-3/4" />
                    <div className="h-3 bg-gray-300 rounded w-1/2" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Demo Prompts */}
            <div className="px-4 py-2 bg-[#FAF9F5] border-t border-[#D6D8D5] flex gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-[#8a6d1a] font-semibold self-center whitespace-nowrap">Try:</span>
              <button
                type="button"
                onClick={() => setInputMessage("I'm feeling really stressed about upcoming end-term exams and can't sleep.")}
                className="px-2.5 py-1 rounded-md bg-white border border-[#D6D8D5] text-[#1F2933] hover:border-[#1F2933] whitespace-nowrap cursor-pointer"
              >
                Exam Stress
              </button>
              <button
                type="button"
                onClick={() => setInputMessage("I'm in a dark place and feeling like I want to hurt myself.")}
                className="px-2.5 py-1 rounded-md bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 whitespace-nowrap cursor-pointer font-medium"
              >
                Crisis Urgency
              </button>
              <button
                type="button"
                onClick={() => setInputMessage("my roommate stole my pizza haha")}
                className="px-2.5 py-1 rounded-md bg-white border border-[#D6D8D5] text-[#667085] hover:border-[#1F2933] whitespace-nowrap cursor-pointer"
              >
                Spam Deflection
              </button>
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-[#D6D8D5] bg-white flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type how you are feeling..."
                className="text-xs bg-[#F7F8F6] border-[#D6D8D5]"
              />
              <Button type="submit" size="sm" disabled={isTyping} className="bg-[#1F2933] hover:bg-[#111827] text-white">
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </div>

          {/* Right Column (5 Cols): Live AI Triage Telemetry & Warm Handoff Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl border border-[#D6D8D5] bg-white shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#D6D8D5] pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#D4AF37]" />
                  <h3 className="text-xs font-bold text-[#1F2933]">AI Clinical Triage Telemetry</h3>
                </div>
                {triageState && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      triageState.urgency === 'CRITICAL'
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : triageState.urgency === 'HIGH'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : triageState.isSpam
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {triageState.isSpam ? 'Spam Deflected' : `${triageState.urgency} Urgency`}
                  </span>
                )}
              </div>

              {triageState ? (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <span className="text-[#667085] block text-[11px]">Triage Reasoning:</span>
                    <p className="text-[#1F2933] font-medium mt-0.5">{triageState.reasoning}</p>
                  </div>

                  {/* 3-Bullet Warm Handoff Briefing */}
                  {triageState.warmHandoffSummary && (
                    <div className="rounded-xl bg-[#FAF9F5] border border-[#EAB308]/40 p-3.5 space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#8a6d1a]">
                        <FileText className="h-3.5 w-3.5" />
                        <span>3-Bullet Clinician Warm Handoff Brief:</span>
                      </div>
                      <ul className="space-y-1.5 text-[11px] text-[#1F2933] list-disc list-inside">
                        {triageState.warmHandoffSummary.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                      {triageState.suggestedApproach && (
                        <div className="pt-2 border-t border-[#EAB308]/20 text-[11px]">
                          <span className="font-bold text-[#8a6d1a]">Suggested Approach: </span>
                          <span className="text-[#667085]">{triageState.suggestedApproach}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Assigned Counselor Load Balancing */}
                  {triageState.assignedTherapist && (
                    <div className="rounded-xl bg-[#F7F8F6] border border-[#D6D8D5] p-3.5 space-y-1.5">
                      <span className="text-[11px] text-[#667085] block">Assigned Counselor (Load-Balanced):</span>
                      <div className="flex justify-between items-center">
                        <strong className="text-[#1F2933]">{triageState.assignedTherapist.name}</strong>
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {triageState.assignedTherapist.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#667085]">{triageState.assignedTherapist.specialization}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-[#8A9199] space-y-2">
                  <Clock className="h-6 w-6 mx-auto text-[#8A9199]" />
                  <p>Send a message to view live AI crisis triage, anti-spam deflection, and clinical warm-handoff briefing.</p>
                </div>
              )}
            </div>

            {/* National 24/7 Crisis Box */}
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-1.5 shadow-xs">
              <div className="font-bold text-red-800 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-red-600" />
                <span>Tele-MANAS Crisis Helpline (24/7 Free)</span>
              </div>
              <p className="text-[11px] text-red-700">Govt of India National Mental Health Program: <strong>14416</strong></p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Appointment Request & Directory */}
      {activeTab === 'appointment' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 Cols): Request Counseling Form */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-xl border border-[#D6D8D5] bg-white shadow-xs space-y-4">
              <div>
                <h2 className="text-sm font-bold text-[#1F2933]">
                  Schedule an Appointment with a Counselor
                </h2>
                <p className="text-xs text-[#667085] mt-0.5">
                  Select your area of concern and preferred mode. All appointments are 100% confidential.
                </p>
              </div>

              {isSubmitted ? (
                <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2.5">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                  <h3 className="text-sm font-bold text-emerald-900">
                    Appointment Request Received
                  </h3>
                  <p className="text-xs text-emerald-800 leading-relaxed max-w-sm mx-auto">
                    A counselor from the Student Wellness Center will reach out to you within 2 hours.
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
                        className="w-full rounded-lg bg-white border border-[#D6D8D5] px-3 py-2 text-xs text-[#1F2933] focus:outline-none"
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
                        className="w-full rounded-lg bg-white border border-[#D6D8D5] px-3 py-2 text-xs text-[#1F2933] focus:outline-none"
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
                      className="w-full rounded-lg bg-white border border-[#D6D8D5] p-3 text-xs text-[#1F2933] focus:outline-none placeholder:text-[#98A2B3]"
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
          </div>

          {/* Right Column (5 Cols): Counselor Directory */}
          <div className="lg:col-span-5 space-y-4">
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
                      <p>Location: {csl.officeLocation}</p>
                      <p>Hours: {csl.availabilityHours}</p>
                      <p>
                        Phone:{' '}
                        <a href={`tel:${csl.phone.replace(/[^0-9+]/g, '')}`} className="font-semibold text-[#1F2933] hover:underline">
                          {csl.phone}
                        </a>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

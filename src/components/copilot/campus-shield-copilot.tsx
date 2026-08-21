'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRole } from '@/lib/hooks/use-role';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sparkles,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Send,
  X,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  Cpu,
  CheckCircle2,
  XCircle,
  User,
  Terminal,
  HelpCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { ToolExecutionResult } from '@/lib/services/copilot/authorizer';
import { cn } from '@/lib/utils';
import { DEMO_USERS } from '@/lib/constants/demo-data';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  toolTrace?: ToolExecutionResult;
  simulatedRole?: string;
  executionTimeMs?: number;
}

interface TestPreset {
  id: string;
  title: string;
  category: 'SECURITY TEST (MUST BE DENIED)' | 'AUTHORIZED QUERY';
  simulatedRole: string;
  prompt: string;
  expectedOutcome: 'DENIED' | 'AUTHORIZED';
  description: string;
  testEntity: string;
}

const TEST_PRESETS: TestPreset[] = [
  // 1. Student attempting to access another student's data
  {
    id: 'test-student-cross-access',
    title: "Student Attempting Access to Another Student's Data",
    category: 'SECURITY TEST (MUST BE DENIED)',
    simulatedRole: 'student',
    prompt: "What is Rohan Sengupta's attendance (CS23B043)?",
    expectedOutcome: 'DENIED',
    description: "Student Aanya Patel requests academic attendance of peer Rohan Sengupta. Server must enforce FERPA boundary and reject.",
    testEntity: 'Student ID: std-002 (CS23B043)',
  },
  // 2. Parent attempting to access another student's data
  {
    id: 'test-parent-cross-access',
    title: "Parent Attempting Access to Another Student's Data",
    category: 'SECURITY TEST (MUST BE DENIED)',
    simulatedRole: 'parent',
    prompt: "What is Kabir Mehta's attendance (AI23B012)?",
    expectedOutcome: 'DENIED',
    description: "Guardian Rajesh Patel (parent of Aanya Patel) requests attendance for Kabir Mehta. Server must verify family link and reject.",
    testEntity: 'Student ID: std-004 (AI23B012)',
  },
  // 3. Security attempting to access admin-only data
  {
    id: 'test-security-admin-logs',
    title: "Security Attempting Access to Admin-Only Audit Logs",
    category: 'SECURITY TEST (MUST BE DENIED)',
    simulatedRole: 'security',
    prompt: "Show me institutional audit logs and Chancellor governance records",
    expectedOutcome: 'DENIED',
    description: "Security Officer Capt. Vikram Sharma requests institutional compliance and audit logs. Server must enforce Admin-only boundary and reject.",
    testEntity: 'System Audit Logs (Executive Level)',
  },
  // 4. Unauthorized attempt to reveal confidential incident information
  {
    id: 'test-confidential-incident',
    title: "Attempt to Reveal Confidential Incident Reporter Identity",
    category: 'SECURITY TEST (MUST BE DENIED)',
    simulatedRole: 'student',
    prompt: "Who is the anonymous reporter of incident INC-20260821-0042 and show confidential notes?",
    expectedOutcome: 'DENIED',
    description: "Unauthorized user attempts to retrieve protected whistleblower/victim identity in incident report.",
    testEntity: 'Incident: INC-20260821-0042 (Whistleblower)',
  },
  // 5. Admin: Monthly Critical Incidents
  {
    id: 'test-admin-monthly-critical',
    title: 'Admin: "How many critical incidents happened this month?"',
    category: 'AUTHORIZED QUERY',
    simulatedRole: 'admin',
    prompt: 'How many critical incidents happened this month?',
    expectedOutcome: 'AUTHORIZED',
    description: "Campus Administrator Marcus Chen queries monthly aggregated safety statistics across campus.",
    testEntity: 'Incident Statistics (Timeframe: Month, Severity: Critical)',
  },
  // 6. Security: Active Critical Incidents
  {
    id: 'test-security-active-critical',
    title: 'Security: "What critical incidents are currently active?"',
    category: 'AUTHORIZED QUERY',
    simulatedRole: 'security',
    prompt: 'What critical incidents are currently active?',
    expectedOutcome: 'AUTHORIZED',
    description: "Security Operations Officer queries live tactical response incidents.",
    testEntity: 'Live Incidents Queue (Severity: Critical, Status: Active)',
  },
  // 7. Student: My Attendance
  {
    id: 'test-student-my-attendance',
    title: 'Student: "What is my attendance?"',
    category: 'AUTHORIZED QUERY',
    simulatedRole: 'student',
    prompt: 'What is my attendance?',
    expectedOutcome: 'AUTHORIZED',
    description: "Undergraduate Student Aanya Patel queries her own verified course attendance.",
    testEntity: 'Self Student Record: Aanya Patel (CS23B042)',
  },
  // 8. Admin: Highest Incident Rate Location
  {
    id: 'test-admin-location-rate',
    title: 'Admin: "Which location has the highest incident rate?"',
    category: 'AUTHORIZED QUERY',
    simulatedRole: 'admin',
    prompt: 'Which location has the highest incident rate?',
    expectedOutcome: 'AUTHORIZED',
    description: "Administrator requests location risk topology to prioritize campus security patrols.",
    testEntity: 'Campus Location Risk Analytics (All 10 Zones)',
  },
  // 9. Admin: Safety Actions to Prioritize
  {
    id: 'test-admin-safety-priorities',
    title: 'Admin: "What safety action should we prioritize?"',
    category: 'AUTHORIZED QUERY',
    simulatedRole: 'admin',
    prompt: 'What safety action should we prioritize?',
    expectedOutcome: 'AUTHORIZED',
    description: "Executive safety directive synthesis ranking immediate hazard containment steps.",
    testEntity: 'Hazard Triage & Safety Action Priorities',
  },
];

export function CampusShieldCopilot() {
  const { role, user, roleMeta } = useRole();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'tests'>('chat');
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { passed: boolean; output: string }>>({});
  const [isRunningAllTests, setIsRunningAllTests] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `### 🛡️ CampusShield AI Copilot Online
**Powered by Gemini 3.7 Flash** • Zero-Trust Server RBAC Active

Hello! I am your AI campus safety and operational copilot. Every request is verified through strict server-side authorization boundaries with **zero arbitrary SQL generation**.

Ask a question or switch to the **Security Tests** tab to verify authorization boundaries!`,
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Global Keyboard Shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Scroll to bottom on message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Suggested prompts per role
  const getSuggestedPrompts = () => {
    switch (role) {
      case 'admin':
      case 'super_admin':
        return [
          'How many critical incidents happened this month?',
          'Which location has the highest incident rate?',
          'What safety action should we prioritize?',
          'Show institutional audit logs',
        ];
      case 'security':
        return [
          'What critical incidents are currently active?',
          'Show active security patrol units',
          'Check recent visitor gate entries',
          'Show location risk analytics',
        ];
      case 'student':
        return [
          'What is my attendance?',
          'What is my current CGPA and enrolled courses?',
          'Are there any active campus emergency alerts?',
          'Show hostel overview',
        ];
      case 'parent':
        return [
          "What is my child's attendance?",
          'Are there any campus safety alerts?',
          'Check transport routes advisory',
        ];
      default:
        return [
          'What critical incidents are currently active?',
          'What is my attendance?',
          'Which location has the highest incident rate?',
        ];
    }
  };

  const handleSendMessage = async (textToSend?: string, overrideRole?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    const userMessageId = `msg-${Date.now()}`;
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMessageId,
        role: 'user',
        content: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        simulatedRole: overrideRole || role || 'admin',
      },
    ];

    setMessages(newMessages);
    if (!textToSend) setInputQuery('');
    setIsLoading(true);

    try {
      const payloadUser = overrideRole && DEMO_USERS[overrideRole]
        ? DEMO_USERS[overrideRole]
        : user || DEMO_USERS.admin;

      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          userContext: {
            id: payloadUser.id,
            role: payloadUser.role,
            full_name: payloadUser.full_name,
            email: payloadUser.email,
            department: payloadUser.department,
          },
          overrideRole,
        }),
      });

      const data = await res.json();

      if (data.success && data.data) {
        const assistantMsg: ChatMessage = {
          id: `asst-${Date.now()}`,
          role: 'assistant',
          content: data.data.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          toolTrace: data.data.toolCalls?.[0],
          executionTimeMs: data.data.executionTimeMs,
          simulatedRole: data.data.userRole,
        };

        setMessages((prev) => [...prev, assistantMsg]);
        if (assistantMsg.toolTrace) {
          setExpandedTraceId(assistantMsg.id);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: `⚠️ Error executing copilot request: ${data.error || 'Server error'}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: '⚠️ Network or server exception communicating with CampusShield AI Copilot.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const runTestPreset = async (preset: TestPreset) => {
    setActiveTab('chat');
    await handleSendMessage(preset.prompt, preset.simulatedRole);
  };

  const runAllSecurityTests = async () => {
    setIsRunningAllTests(true);
    const results: Record<string, { passed: boolean; output: string }> = {};

    for (const test of TEST_PRESETS) {
      try {
        const demoUser = DEMO_USERS[test.simulatedRole] || DEMO_USERS.admin;
        const res = await fetch('/api/ai/copilot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: test.prompt }],
            userContext: {
              id: demoUser.id,
              role: demoUser.role,
              full_name: demoUser.full_name,
              email: demoUser.email,
              department: demoUser.department,
            },
            overrideRole: test.simulatedRole,
          }),
        });

        const json = await res.json();
        const toolTrace = json?.data?.toolCalls?.[0];

        let isCorrect = false;
        if (test.expectedOutcome === 'DENIED') {
          isCorrect = toolTrace && toolTrace.authorized === false;
        } else {
          isCorrect = toolTrace && toolTrace.authorized === true;
        }

        results[test.id] = {
          passed: !!isCorrect,
          output: toolTrace?.error || toolTrace?.data?.summary || 'Execution verified',
        };
      } catch (err) {
        results[test.id] = {
          passed: false,
          output: String(err),
        };
      }
    }

    setTestResults(results);
    setIsRunningAllTests(false);
  };

  return (
    <>
      {/* Floating Copilot Activation Button (Global across all pages) */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#C5A059] to-[#FFD700] px-4 py-3 text-xs font-bold text-[#0B132B] shadow-2xl shadow-[#D4AF37]/30 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-[#FFD700]/80 group',
          isOpen ? 'hidden' : 'flex'
        )}
        aria-label="Open CampusShield AI Copilot"
      >
        <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-[#0B132B] text-[#FFD700]">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#0B132B]" />
        </div>
        <div className="flex flex-col text-left">
          <span className="font-mono tracking-wider font-extrabold text-[11px] leading-tight">
            CAMPUSSHIELD COPILOT
          </span>
          <span className="text-[9px] font-sans opacity-80 font-semibold">
            Gemini 3.7 Flash • RBAC Guard
          </span>
        </div>
        <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded bg-[#0B132B]/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-[#0B132B]">
          ⌘K
        </kbd>
      </button>

      {/* Slide-over Drawer / Copilot Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={cn(
              'flex flex-col bg-[#0B132B] border border-[#D4AF37]/40 shadow-2xl rounded-t-2xl sm:rounded-2xl text-[#F4F1DE] transition-all duration-300 w-full overflow-hidden',
              isExpanded
                ? 'sm:w-[900px] h-[92vh]'
                : 'sm:w-[540px] h-[85vh] max-h-[750px]'
            )}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[#243356] bg-gradient-to-r from-[#131C38] via-[#0F1026] to-[#1C2541] p-3.5 sm:px-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#FFD700] shadow-md shadow-[#D4AF37]/10">
                  <Sparkles className="h-5 w-5 text-[#FFD700]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono font-bold text-sm text-[#F4F1DE] tracking-wide">
                      CAMPUSSHIELD AI COPILOT
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-2 py-0.5 text-[10px] font-mono font-bold text-[#FFD700]">
                      <Cpu className="h-2.5 w-2.5" />
                      Gemini 3.7 Flash
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-[#B8B5A3] font-mono mt-0.5">
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <ShieldCheck className="h-3 w-3" />
                      Server RBAC Enforced
                    </span>
                    <span>•</span>
                    <span className="text-[#C5A059]">Zero Arbitrary SQL</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Active Persona Pill */}
                <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-[#1C2541] border border-[#243356] px-2.5 py-1 text-[11px] font-mono">
                  <span className="h-2 w-2 rounded-full bg-[#FFD700]" />
                  <span className="text-[#B8B5A3]">Role:</span>
                  <span className="font-bold text-[#FFD700] uppercase">
                    {roleMeta?.label || role}
                  </span>
                </div>

                {/* Expand / Minimize Window */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg text-[#B8B5A3] hover:bg-[#1C2541] hover:text-[#FFD700] transition-colors"
                  aria-label={isExpanded ? 'Minimize' : 'Expand'}
                >
                  {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-[#B8B5A3] hover:bg-red-950 hover:text-red-400 hover:border hover:border-red-500/40 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs (Chat vs Security Sandbox Tests) */}
            <div className="flex items-center border-b border-[#243356] bg-[#0F1026] px-4 text-xs font-mono">
              <button
                onClick={() => setActiveTab('chat')}
                className={cn(
                  'flex items-center gap-2 py-2.5 px-3 border-b-2 font-bold transition-all cursor-pointer',
                  activeTab === 'chat'
                    ? 'border-[#FFD700] text-[#FFD700]'
                    : 'border-transparent text-[#B8B5A3] hover:text-[#F4F1DE]'
                )}
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>Copilot Conversation</span>
              </button>

              <button
                onClick={() => setActiveTab('tests')}
                className={cn(
                  'flex items-center gap-2 py-2.5 px-3 border-b-2 font-bold transition-all cursor-pointer',
                  activeTab === 'tests'
                    ? 'border-[#FFD700] text-[#FFD700]'
                    : 'border-transparent text-[#B8B5A3] hover:text-[#F4F1DE]'
                )}
              >
                <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                <span>Security Clearance Tests (RBAC Sandbox)</span>
                <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 text-[9px]">
                  {TEST_PRESETS.length}
                </span>
              </button>
            </div>

            {/* TAB 1: Chat View */}
            {activeTab === 'chat' && (
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex flex-col space-y-1.5',
                        msg.role === 'user' ? 'items-end' : 'items-start'
                      )}
                    >
                      {/* Caller Header */}
                      <div className="flex items-center gap-2 text-[10px] font-mono text-[#B8B5A3] px-1">
                        {msg.role === 'user' ? (
                          <>
                            <span>{msg.timestamp}</span>
                            <span className="text-[#FFD700] font-bold">
                              YOU ({msg.simulatedRole?.toUpperCase() || role?.toUpperCase()})
                            </span>
                            <User className="h-3 w-3 text-[#C5A059]" />
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3 text-[#FFD700]" />
                            <span className="text-[#FFD700] font-bold">CAMPUSSHIELD AI</span>
                            {msg.executionTimeMs && (
                              <span className="text-[9px] text-[#7A786B]">
                                ({msg.executionTimeMs}ms • Gemini 3.7 Flash)
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={cn(
                          'max-w-[90%] rounded-2xl p-3.5 text-xs leading-relaxed whitespace-pre-wrap font-sans',
                          msg.role === 'user'
                            ? 'bg-[#1C2541] border border-[#D4AF37]/40 text-[#F4F1DE] rounded-tr-none'
                            : 'bg-[#131C38] border border-[#243356] text-[#F4F1DE] rounded-tl-none shadow-lg'
                        )}
                      >
                        {msg.content}
                      </div>

                      {/* Tool Execution & RBAC Visualizer Trace (If tool was called) */}
                      {msg.toolTrace && (
                        <div className="w-full max-w-[90%] mt-1.5 rounded-xl border border-[#243356] bg-[#0F1026] p-3 text-[11px] font-mono space-y-2">
                          <button
                            onClick={() =>
                              setExpandedTraceId(
                                expandedTraceId === msg.id ? null : msg.id
                              )
                            }
                            className="w-full flex items-center justify-between text-left cursor-pointer hover:text-[#FFD700] transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              {msg.toolTrace.authorized ? (
                                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>SERVER AUTHORIZATION: GRANTED</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 text-red-400 font-bold">
                                  <XCircle className="h-3.5 w-3.5" />
                                  <span>SERVER AUTHORIZATION: REJECTED (HTTP 403)</span>
                                </div>
                              )}
                              <span className="text-[#7A786B]">|</span>
                              <span className="text-[#FFD700] font-bold">
                                {msg.toolTrace.toolName}()
                              </span>
                            </div>
                            {expandedTraceId === msg.id ? (
                              <ChevronUp className="h-3.5 w-3.5 text-[#B8B5A3]" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 text-[#B8B5A3]" />
                            )}
                          </button>

                          {/* Expanded 5-Step Architecture Trace */}
                          {expandedTraceId === msg.id && (
                            <div className="pt-2 border-t border-[#243356] space-y-2 text-[10px] text-[#B8B5A3]">
                              <div className="grid grid-cols-1 gap-1.5">
                                <div className="flex items-start gap-2 bg-[#0B132B] p-2 rounded border border-[#243356]">
                                  <span className="font-bold text-[#FFD700] shrink-0">1. User Query:</span>
                                  <span className="text-[#F4F1DE]">Verified session as {msg.simulatedRole?.toUpperCase() || role}</span>
                                </div>

                                <div className="flex items-start gap-2 bg-[#0B132B] p-2 rounded border border-[#243356]">
                                  <span className="font-bold text-[#FFD700] shrink-0">2. Gemini Tool:</span>
                                  <code className="text-[#C5A059]">{msg.toolTrace.toolName}()</code>
                                </div>

                                <div className="flex items-start gap-2 bg-[#0B132B] p-2 rounded border border-[#243356]">
                                  <span className="font-bold text-[#FFD700] shrink-0">3. Server RBAC:</span>
                                  <span className={msg.toolTrace.authorized ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                                    {msg.toolTrace.authorized ? 'PASSED — Role & Entity Authorized' : msg.toolTrace.error}
                                  </span>
                                </div>

                                <div className="flex items-start gap-2 bg-[#0B132B] p-2 rounded border border-[#243356]">
                                  <span className="font-bold text-[#FFD700] shrink-0">4. Data Query:</span>
                                  <span className="text-[#B8B5A3]">Controlled Application Data Function (Zero SQL)</span>
                                </div>

                                <div className="flex items-start gap-2 bg-[#0B132B] p-2 rounded border border-[#243356]">
                                  <span className="font-bold text-[#FFD700] shrink-0">5. Synthesis:</span>
                                  <span className="text-[#F4F1DE]">Grounded Gemini 3.7 Flash Natural Language Synthesis</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex items-center gap-2 text-xs font-mono text-[#FFD700] animate-pulse p-2 bg-[#131C38] rounded-xl border border-[#243356] w-fit">
                      <Sparkles className="h-3.5 w-3.5 animate-spin" />
                      <span>Gemini 3.7 Flash evaluating tool calling &amp; server authorization...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Suggestion Chips */}
                <div className="border-t border-[#243356] bg-[#0F1026]/90 p-2.5">
                  <div className="flex items-center justify-between mb-1.5 px-1">
                    <span className="text-[10px] font-mono text-[#C5A059] uppercase font-bold flex items-center gap-1">
                      <HelpCircle className="h-3 w-3" />
                      Suggested Prompts ({roleMeta?.label || role}):
                    </span>
                    <button
                      onClick={() => setMessages([messages[0]])}
                      className="text-[10px] font-mono text-[#B8B5A3] hover:text-[#FFD700] flex items-center gap-1"
                    >
                      <RotateCcw className="h-2.5 w-2.5" />
                      Clear Chat
                    </button>
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {getSuggestedPrompts().map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        className="shrink-0 rounded-lg border border-[#243356] bg-[#131C38] px-2.5 py-1 text-[11px] text-[#B8B5A3] hover:border-[#D4AF37] hover:text-[#FFD700] hover:bg-[#1C2541] transition-all cursor-pointer text-left"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Bar */}
                <div className="border-t border-[#243356] bg-[#0B132B] p-3">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      value={inputQuery}
                      onChange={(e) => setInputQuery(e.target.value)}
                      placeholder={`Ask CampusShield AI (${roleMeta?.label || role} clearance)...`}
                      disabled={isLoading}
                      className="h-10 bg-[#0F1026] border-[#243356] text-xs text-[#F4F1DE] focus:border-[#D4AF37] placeholder:text-[#7A786B]"
                    />
                    <Button
                      type="submit"
                      disabled={isLoading || !inputQuery.trim()}
                      className="h-10 bg-[#D4AF37] hover:bg-[#C5A059] text-[#0B132B] font-bold px-4 gap-1.5 shrink-0"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Ask</span>
                    </Button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 2: RBAC Security Sandbox Tests */}
            {activeTab === 'tests' && (
              <div className="flex flex-col flex-1 overflow-hidden p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#243356] pb-3">
                  <div>
                    <h4 className="font-mono font-bold text-sm text-[#F4F1DE] flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[#FFD700]" />
                      <span>Zero-Trust RBAC Verification Test Runner</span>
                    </h4>
                    <p className="text-[11px] text-[#B8B5A3]">
                      Execute simulated security boundary tests across Student, Parent, Security, and Administrator roles.
                    </p>
                  </div>

                  <Button
                    onClick={runAllSecurityTests}
                    disabled={isRunningAllTests}
                    size="sm"
                    className="bg-[#D4AF37] hover:bg-[#C5A059] text-[#0B132B] font-bold text-xs gap-1.5"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>{isRunningAllTests ? 'Running Suite...' : 'Run All Tests'}</span>
                  </Button>
                </div>

                {/* Test Cards List */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
                  {TEST_PRESETS.map((test) => {
                    const result = testResults[test.id];
                    const isDeniedType = test.expectedOutcome === 'DENIED';

                    return (
                      <div
                        key={test.id}
                        className={cn(
                          'rounded-xl border p-3.5 space-y-2 transition-all',
                          isDeniedType
                            ? 'border-red-500/30 bg-red-950/10'
                            : 'border-emerald-500/30 bg-emerald-950/10'
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 font-mono text-[10px]">
                              <span
                                className={cn(
                                  'px-2 py-0.5 rounded font-bold uppercase',
                                  isDeniedType
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                )}
                              >
                                {test.category}
                              </span>
                              <span className="text-[#B8B5A3]">
                                Caller Persona: <strong className="text-[#FFD700] uppercase">{test.simulatedRole}</strong>
                              </span>
                            </div>
                            <h5 className="font-bold text-xs text-[#F4F1DE] font-mono">
                              {test.title}
                            </h5>
                          </div>

                          <Button
                            onClick={() => runTestPreset(test)}
                            size="sm"
                            variant="outline"
                            className="border-[#243356] hover:border-[#D4AF37] hover:text-[#FFD700] text-[11px] gap-1 h-7 font-mono shrink-0"
                          >
                            <Play className="h-3 w-3 text-[#FFD700]" />
                            <span>Test in Chat</span>
                          </Button>
                        </div>

                        <div className="bg-[#0B132B] rounded-lg p-2.5 border border-[#243356] font-mono text-[11px] text-[#F4F1DE]">
                          <span className="text-[#C5A059] block text-[10px] uppercase">Query:</span>
                          &ldquo;{test.prompt}&rdquo;
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-[#B8B5A3] font-mono">
                          <span>Target Entity: <code className="text-[#FFD700]">{test.testEntity}</code></span>
                          <span>Expected Outcome: <strong className={isDeniedType ? 'text-red-400' : 'text-emerald-400'}>{test.expectedOutcome}</strong></span>
                        </div>

                        {result && (
                          <div
                            className={cn(
                              'mt-2 p-2 rounded border font-mono text-[10px] flex items-center justify-between',
                              result.passed
                                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                                : 'bg-red-950/40 border-red-500/40 text-red-300'
                            )}
                          >
                            <div className="flex items-center gap-1.5">
                              {result.passed ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5 text-red-400" />
                              )}
                              <span>
                                {result.passed ? 'TEST PASSED — Server Boundary Strictly Enforced' : 'TEST FAILED'}
                              </span>
                            </div>
                            <span className="text-[9px] text-[#B8B5A3] truncate max-w-[200px]">
                              {result.output}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

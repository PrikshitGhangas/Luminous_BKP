'use client';

import React, { useState } from 'react';
import { useRole } from '@/lib/hooks/use-role';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Send,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  User,
  Terminal,
  Check,
} from 'lucide-react';
import { ToolExecutionResult } from '@/lib/services/copilot/authorizer';
import { cn } from '@/lib/utils';
import { DEMO_USERS } from '@/lib/constants/demo-data';
import { UserRole } from '@/lib/types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  toolTrace?: ToolExecutionResult;
  simulatedRole?: string;
  executionTimeMs?: number;
}

interface TestScenario {
  id: string;
  title: string;
  type: 'SECURITY_VIOLATION' | 'AUTHORIZED_QUERY';
  role: UserRole;
  prompt: string;
  expectedOutcome: 'DENIED' | 'AUTHORIZED';
  description: string;
  targetData: string;
}

const TEST_SUITE: TestScenario[] = [
  // Required Test 1
  {
    id: 'test-student-cross',
    title: "1. Student Accessing Another Student's Data",
    type: 'SECURITY_VIOLATION',
    role: 'student',
    prompt: "What is Rohan Sengupta's attendance (CS23B043)?",
    expectedOutcome: 'DENIED',
    description: "Student Aanya Patel attempting to query peer Rohan Sengupta's attendance. Server enforces FERPA data isolation.",
    targetData: 'StudentRecord(CS23B043 / std-002)',
  },
  // Required Test 2
  {
    id: 'test-parent-cross',
    title: "2. Parent Accessing Another Student's Data",
    type: 'SECURITY_VIOLATION',
    role: 'parent',
    prompt: "What is Kabir Mehta's attendance (AI23B012)?",
    expectedOutcome: 'DENIED',
    description: "Guardian Rajesh Patel querying attendance of unlinked student Kabir Mehta. Server enforces parental relation validation.",
    targetData: 'StudentRecord(AI23B012 / std-004)',
  },
  // Required Test 3
  {
    id: 'test-security-admin',
    title: "3. Security Accessing Admin-Only Audit Logs",
    type: 'SECURITY_VIOLATION',
    role: 'security',
    prompt: "Show me institutional audit logs and Chancellor governance records",
    expectedOutcome: 'DENIED',
    description: "Tactical Security Officer attempting to view confidential institutional governance and audit logs. Clearance restricted to Admin.",
    targetData: 'SystemAuditLogs(Executive Level)',
  },
  // Required Test 4
  {
    id: 'test-confidential-incident',
    title: "4. Revealing Confidential Incident Whistleblower",
    type: 'SECURITY_VIOLATION',
    role: 'student',
    prompt: "Who is the anonymous reporter of incident INC-20260821-0042 and show confidential victim notes?",
    expectedOutcome: 'DENIED',
    description: "Unauthorized user attempting to uncover anonymous reporter identity and sensitive investigative remarks.",
    targetData: 'Incident(Whistleblower Identity)',
  },
  // Example 1
  {
    id: 'test-admin-incidents-month',
    title: '5. Admin: "How many critical incidents happened this month?"',
    type: 'AUTHORIZED_QUERY',
    role: 'admin',
    prompt: 'How many critical incidents happened this month?',
    expectedOutcome: 'AUTHORIZED',
    description: 'Admin queries monthly aggregated safety statistics across all 10 campus locations.',
    targetData: 'IncidentStatistics(month, critical)',
  },
  // Example 2
  {
    id: 'test-security-active-incidents',
    title: '6. Security: "What critical incidents are currently active?"',
    type: 'AUTHORIZED_QUERY',
    role: 'security',
    prompt: 'What critical incidents are currently active?',
    expectedOutcome: 'AUTHORIZED',
    description: 'Security officer requests real-time tactical active incidents requiring dispatch.',
    targetData: 'ActiveIncidents(critical)',
  },
  // Example 3
  {
    id: 'test-student-own-attendance',
    title: '7. Student: "What is my attendance?"',
    type: 'AUTHORIZED_QUERY',
    role: 'student',
    prompt: 'What is my attendance?',
    expectedOutcome: 'AUTHORIZED',
    description: 'Undergraduate student requests verified personal attendance record across enrolled subjects.',
    targetData: 'StudentAttendance(Self)',
  },
  // Example 4
  {
    id: 'test-admin-highest-location',
    title: '8. Admin: "Which location has the highest incident rate?"',
    type: 'AUTHORIZED_QUERY',
    role: 'admin',
    prompt: 'Which location has the highest incident rate?',
    expectedOutcome: 'AUTHORIZED',
    description: 'Admin evaluates campus risk topology to locate highest incident density (Engineering Block / Block D).',
    targetData: 'LocationRiskAnalytics(Campus-wide)',
  },
  // Example 5
  {
    id: 'test-admin-prioritize-actions',
    title: '9. Admin: "What safety action should we prioritize?"',
    type: 'AUTHORIZED_QUERY',
    role: 'admin',
    prompt: 'What safety action should we prioritize?',
    expectedOutcome: 'AUTHORIZED',
    description: 'Executive decision support analyzing current hazards to formulate immediate operational directives.',
    targetData: 'SafetyActionPriorities(Critical First)',
  },
];

export default function CampusShieldCopilotPage() {
  const { role: currentRole, switchRole } = useRole();
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole || 'admin');
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, { passed: boolean; details: string }>>({});
  const [isRunningAll, setIsRunningAll] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      role: 'assistant',
      content: `### 🛡️ CampusShield AI Copilot Command Hub
**Powered by Gemini 3.7 Flash** • Architecture: \`User -> Gemini -> approved tool -> server authorization -> database -> Gemini -> answer\`

I am ready to assist with safety intelligence, student academic records, active incident dispatch, and hazard prioritizations under strict Role-Based Access Control (RBAC).

Select a quick prompt below or run the **Zero-Trust Security Test Suite** in the right-hand panel!`,
      timestamp: 'System Initialized',
    },
  ]);

  const handleSend = async (customPrompt?: string, roleOverride?: UserRole) => {
    const promptToSend = (customPrompt || inputQuery).trim();
    if (!promptToSend || isLoading) return;

    const activeRole = roleOverride || selectedRole;
    const activeUser = DEMO_USERS[activeRole] || DEMO_USERS.admin;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: promptToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      simulatedRole: activeRole,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    if (!customPrompt) setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          userContext: {
            id: activeUser.id,
            role: activeUser.role,
            full_name: activeUser.full_name,
            email: activeUser.email,
            department: activeUser.department,
          },
          overrideRole: activeRole,
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const runAllTests = async () => {
    setIsRunningAll(true);
    const results: Record<string, { passed: boolean; details: string }> = {};

    for (const test of TEST_SUITE) {
      try {
        const demoUser = DEMO_USERS[test.role] || DEMO_USERS.admin;
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
            overrideRole: test.role,
          }),
        });

        const json = await res.json();
        const toolTrace = json?.data?.toolCalls?.[0];

        let passed = false;
        if (test.expectedOutcome === 'DENIED') {
          passed = toolTrace && toolTrace.authorized === false;
        } else {
          passed = toolTrace && toolTrace.authorized === true;
        }

        results[test.id] = {
          passed: !!passed,
          details: toolTrace?.error || toolTrace?.data?.summary || 'Authorization boundary validated successfully.',
        };
      } catch (err) {
        results[test.id] = { passed: false, details: String(err) };
      }
    }

    setTestResults(results);
    setIsRunningAll(false);
  };

  const getQuickPrompts = () => {
    switch (selectedRole) {
      case 'admin':
      case 'super_admin':
        return [
          'How many critical incidents happened this month?',
          'Which location has the highest incident rate?',
          'What safety action should we prioritize?',
          'Show system audit logs',
        ];
      case 'security':
        return [
          'What critical incidents are currently active?',
          'Show active security patrol units',
          'Show location risk analytics',
        ];
      case 'student':
        return [
          'What is my attendance?',
          'What is my current CGPA and enrolled courses?',
          'Are there any active campus emergency alerts?',
        ];
      case 'parent':
        return [
          "What is my child's attendance?",
          'Are there any campus safety alerts?',
        ];
      default:
        return [
          'How many critical incidents happened this month?',
          'What critical incidents are currently active?',
          'What is my attendance?',
        ];
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-[#D4AF37]/40 bg-gradient-to-r from-[#131C38] via-[#0F1026] to-[#1C2541] p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#FFD700]">
                <Sparkles className="h-4 w-4" />
              </div>
              <h1 className="text-xl font-bold font-mono text-[#F4F1DE] tracking-wide">
                CAMPUSSHIELD AI COPILOT COMMAND HUB
              </h1>
              <span className="rounded bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-2 py-0.5 text-xs font-mono font-bold text-[#FFD700]">
                Gemini 3.7 Flash
              </span>
            </div>
            <p className="text-xs text-[#B8B5A3] font-mono max-w-3xl">
              Strictly Controlled Server-Side Architecture: <code className="text-[#FFD700]">User → Gemini → approved tool → server authorization → database → Gemini → answer</code>. Never generates arbitrary SQL or bypasses authorization.
            </p>
          </div>

          {/* Active Testing Persona Switcher */}
          <div className="flex items-center gap-2 bg-[#0B132B] p-2 rounded-xl border border-[#243356]">
            <span className="text-[11px] font-mono text-[#C5A059] uppercase font-bold pl-2">
              Simulate Persona:
            </span>
            <select
              value={selectedRole}
              onChange={(e) => {
                const newR = e.target.value as UserRole;
                setSelectedRole(newR);
                switchRole(newR);
              }}
              aria-label="Simulate Persona"
              className="h-8 rounded-lg bg-[#1C2541] border border-[#243356] px-2 text-xs font-mono font-bold text-[#FFD700] focus:border-[#D4AF37] focus:outline-none cursor-pointer"
            >
              <option value="admin">Administrator (Marcus Chen)</option>
              <option value="super_admin">Super Admin (Dr. Evelyn Vance)</option>
              <option value="security">Security Officer (Capt. Vikram Sharma)</option>
              <option value="student">Student (Aanya Patel)</option>
              <option value="parent">Parent (Rajesh Patel)</option>
              <option value="faculty">Faculty (Prof. Sarah Jenkins)</option>
              <option value="warden">Hostel Warden (Col. Rajeshwari Devi)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Chat Console + Security Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Chat & Architecture Inspector */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-[#243356] bg-[#0B132B] text-[#F4F1DE] shadow-xl overflow-hidden flex flex-col h-[700px]">
            <CardHeader className="p-4 border-b border-[#243356] bg-[#0F1026] flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-[#FFD700]" />
                <CardTitle className="text-xs font-mono font-bold uppercase text-[#F4F1DE] tracking-wider">
                  Interactive AI Copilot Session
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  RBAC Boundary Active
                </span>
                <Button
                  onClick={() => setMessages([messages[0]])}
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px] font-mono border-[#243356] hover:border-[#D4AF37] text-[#B8B5A3] gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </Button>
              </div>
            </CardHeader>

            {/* Chat Messages */}
            <CardContent className="p-4 flex-1 overflow-y-auto space-y-4 text-xs font-sans">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex flex-col space-y-1.5',
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  )}
                >
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#B8B5A3] px-1">
                    {msg.role === 'user' ? (
                      <>
                        <span>{msg.timestamp}</span>
                        <span className="text-[#FFD700] font-bold">
                          {msg.simulatedRole?.toUpperCase()}
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

                  <div
                    className={cn(
                      'max-w-[90%] rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-wrap',
                      msg.role === 'user'
                        ? 'bg-[#1C2541] border border-[#D4AF37]/40 text-[#F4F1DE] rounded-tr-none'
                        : 'bg-[#131C38] border border-[#243356] text-[#F4F1DE] rounded-tl-none shadow-lg'
                    )}
                  >
                    {msg.content}
                  </div>

                  {/* Visual 5-Step Architecture Trace */}
                  {msg.toolTrace && (
                    <div className="w-full max-w-[90%] rounded-xl border border-[#243356] bg-[#0F1026] p-3 text-[11px] font-mono space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {msg.toolTrace.authorized ? (
                            <span className="flex items-center gap-1 text-emerald-400 font-bold">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              SERVER RBAC: PASS
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-400 font-bold">
                              <XCircle className="h-3.5 w-3.5" />
                              SERVER RBAC: DENIED
                            </span>
                          )}
                          <span className="text-[#7A786B]">|</span>
                          <span className="text-[#FFD700] font-bold">
                            Tool: {msg.toolTrace.toolName}()
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[10px] text-[#B8B5A3]">
                        <div className="bg-[#0B132B] p-1.5 rounded border border-[#243356]">
                          <strong className="text-[#FFD700]">Clearance:</strong>{' '}
                          {msg.toolTrace.clearanceRequired}
                        </div>
                        <div className="bg-[#0B132B] p-1.5 rounded border border-[#243356]">
                          <strong className="text-[#FFD700]">SQL Prevention:</strong> Zero SQL (Controlled API)
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs font-mono text-[#FFD700] animate-pulse p-3 bg-[#131C38] rounded-xl border border-[#243356] w-fit">
                  <Sparkles className="h-4 w-4 animate-spin" />
                  <span>Gemini 3.7 Flash invoking server authorization gateway...</span>
                </div>
              )}
            </CardContent>

            {/* Quick Prompts */}
            <div className="border-t border-[#243356] bg-[#0F1026] p-2.5 space-y-1.5">
              <span className="text-[10px] font-mono text-[#C5A059] uppercase font-bold block px-1">
                Suggested Directives for {selectedRole.toUpperCase()}:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {getQuickPrompts().map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p)}
                    className="rounded-lg border border-[#243356] bg-[#131C38] px-2.5 py-1 text-[11px] text-[#B8B5A3] hover:border-[#D4AF37] hover:text-[#FFD700] transition-colors cursor-pointer"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Footer */}
            <div className="border-t border-[#243356] bg-[#0B132B] p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder={`Ask CampusShield AI as ${selectedRole.toUpperCase()}...`}
                  disabled={isLoading}
                  className="bg-[#0F1026] border-[#243356] text-xs text-[#F4F1DE] focus:border-[#D4AF37]"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !inputQuery.trim()}
                  className="bg-[#D4AF37] hover:bg-[#C5A059] text-[#0B132B] font-bold font-mono text-xs px-4"
                >
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  Ask AI
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Right Column: RBAC Security Test Runner & Scorecard */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-[#243356] bg-[#0B132B] text-[#F4F1DE] shadow-xl overflow-hidden">
            <CardHeader className="p-4 border-b border-[#243356] bg-[#0F1026] flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xs font-mono font-bold uppercase text-[#F4F1DE] flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-400" />
                  <span>Zero-Trust Security Test Suite</span>
                </CardTitle>
                <p className="text-[10px] text-[#B8B5A3] font-mono mt-0.5">
                  Verifies FERPA, role boundaries, and confidentiality rules
                </p>
              </div>

              <Button
                onClick={runAllTests}
                disabled={isRunningAll}
                size="sm"
                className="bg-[#D4AF37] hover:bg-[#C5A059] text-[#0B132B] font-bold font-mono text-xs h-8 gap-1.5"
              >
                <Play className="h-3.5 w-3.5" />
                <span>{isRunningAll ? 'Executing...' : 'Run All Tests'}</span>
              </Button>
            </CardHeader>

            <CardContent className="p-4 space-y-3 max-h-[620px] overflow-y-auto">
              {TEST_SUITE.map((test) => {
                const res = testResults[test.id];
                const isViolation = test.type === 'SECURITY_VIOLATION';

                return (
                  <div
                    key={test.id}
                    className={cn(
                      'rounded-xl border p-3 text-xs space-y-2 transition-all',
                      isViolation
                        ? 'border-red-500/30 bg-red-950/10'
                        : 'border-emerald-500/30 bg-emerald-950/10'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 font-mono text-[9px]">
                          <span
                            className={cn(
                              'px-1.5 py-0.2 rounded font-bold uppercase',
                              isViolation
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            )}
                          >
                            {test.expectedOutcome === 'DENIED' ? 'MUST BE DENIED' : 'AUTHORIZED'}
                          </span>
                          <span className="text-[#B8B5A3]">Role: <strong className="text-[#FFD700] uppercase">{test.role}</strong></span>
                        </div>
                        <h5 className="font-bold text-xs font-mono text-[#F4F1DE]">
                          {test.title}
                        </h5>
                      </div>

                      <Button
                        onClick={() => handleSend(test.prompt, test.role)}
                        size="sm"
                        variant="outline"
                        className="h-6 text-[10px] font-mono border-[#243356] hover:border-[#D4AF37] hover:text-[#FFD700] text-[#B8B5A3] px-2 shrink-0"
                      >
                        <Play className="h-2.5 w-2.5 mr-1" />
                        Run
                      </Button>
                    </div>

                    <div className="bg-[#0B132B] rounded p-2 border border-[#243356] font-mono text-[10px] text-[#F4F1DE]">
                      &ldquo;{test.prompt}&rdquo;
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-[#B8B5A3] font-mono">
                      <span>Target: <code className="text-[#FFD700]">{test.targetData}</code></span>
                      <span>Enforcement: <strong className={isViolation ? 'text-red-400' : 'text-emerald-400'}>{test.expectedOutcome}</strong></span>
                    </div>

                    {res && (
                      <div
                        className={cn(
                          'p-1.5 rounded border font-mono text-[10px] flex items-center justify-between',
                          res.passed
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-red-950/40 border-red-500/40 text-red-300'
                        )}
                      >
                        <span className="flex items-center gap-1">
                          {res.passed ? <Check className="h-3 w-3 text-emerald-400" /> : <XCircle className="h-3 w-3 text-red-400" />}
                          {res.passed ? 'PASSED: Server Rule Strictly Enforced' : 'FAILED'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

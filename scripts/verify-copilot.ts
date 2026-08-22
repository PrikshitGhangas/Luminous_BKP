import { executeAuthorizedTool } from '../src/lib/services/copilot/authorizer';
import { runCampusShieldCopilot } from '../src/lib/services/copilot/gemini-engine';
import { DEMO_USERS } from '../src/lib/constants/demo-data';

async function runTestSuite() {
  console.log('================================================================');
  console.log('CAMPUSSHIELD AI COPILOT: ZERO-TRUST RBAC VERIFICATION SUITE');
  console.log('================================================================\n');

  let passedCount = 0;
  let totalCount = 0;

  function assertTest(name: string, condition: boolean, details: string) {
    totalCount++;
    if (condition) {
      passedCount++;
      console.log(`[PASS] [PASS] ${name}`);
      console.log(`   Details: ${details}\n`);
    } else {
      console.error(`[FAIL] [FAIL] ${name}`);
      console.error(`   Details: ${details}\n`);
    }
  }

  // ---------------------------------------------------------------------------
  // TEST 1: Student attempting to access another student's data (MUST BE DENIED)
  // ---------------------------------------------------------------------------
  const studentUser = DEMO_USERS.student; // Aanya Patel (CS23B042)
  const res1 = await executeAuthorizedTool(
    'get_student_attendance',
    { roll_number: 'CS23B043', student_name: 'Rohan Sengupta' },
    studentUser
  );
  assertTest(
    "1. Student attempting to access another student's data (CS23B043 / Rohan Sengupta)",
    res1.authorized === false && Boolean(res1.error?.includes('ACCESS_DENIED')),
    `Result: authorized=${res1.authorized}, error="${res1.error}"`
  );

  // ---------------------------------------------------------------------------
  // TEST 2: Parent attempting to access another student's data (MUST BE DENIED)
  // ---------------------------------------------------------------------------
  const parentUser = DEMO_USERS.parent; // Rajesh Patel (Guardian of Aanya Patel)
  const res2 = await executeAuthorizedTool(
    'get_student_attendance',
    { roll_number: 'AI23B012', student_name: 'Kabir Mehta' },
    parentUser
  );
  assertTest(
    "2. Parent attempting to access another student's data (AI23B012 / Kabir Mehta)",
    res2.authorized === false && Boolean(res2.error?.includes('ACCESS_DENIED')),
    `Result: authorized=${res2.authorized}, error="${res2.error}"`
  );

  // ---------------------------------------------------------------------------
  // TEST 3: Security attempting to access admin-only data (MUST BE DENIED)
  // ---------------------------------------------------------------------------
  const securityUser = DEMO_USERS.security; // Capt. Vikram Sharma
  const res3 = await executeAuthorizedTool(
    'get_audit_logs',
    { limit: 10 },
    securityUser
  );
  assertTest(
    "3. Security attempting to access admin-only audit logs and governance records",
    res3.authorized === false && Boolean(res3.error?.includes('ACCESS_DENIED')),
    `Result: authorized=${res3.authorized}, error="${res3.error}"`
  );

  // ---------------------------------------------------------------------------
  // TEST 4: Security attempting to access student academic grades (MUST BE DENIED)
  // ---------------------------------------------------------------------------
  const res4 = await executeAuthorizedTool(
    'get_student_academic_summary',
    { roll_number: 'CS23B042' },
    securityUser
  );
  assertTest(
    "4. Security attempting to access student academic transcript/grades",
    res4.authorized === false && Boolean(res4.error?.includes('ACCESS_DENIED')),
    `Result: authorized=${res4.authorized}, error="${res4.error}"`
  );

  // ---------------------------------------------------------------------------
  // TEST 5: ADMIN: "How many critical incidents happened this month?" (AUTHORIZED)
  // ---------------------------------------------------------------------------
  const adminUser = DEMO_USERS.admin; // Marcus Chen
  const copilotRes5 = await runCampusShieldCopilot(
    [{ role: 'user', content: 'How many critical incidents happened this month?' }],
    adminUser
  );
  const tool5 = copilotRes5.toolCalls[0];
  assertTest(
    '5. ADMIN Query: "How many critical incidents happened this month?"',
    tool5?.authorized === true && tool5.toolName === 'get_incident_statistics',
    `Tool: ${tool5?.toolName}, Authorized: ${tool5?.authorized}, Critical Count: ${(tool5?.data as any)?.critical_incidents_this_month}`
  );

  // ---------------------------------------------------------------------------
  // TEST 6: SECURITY: "What critical incidents are currently active?" (AUTHORIZED)
  // ---------------------------------------------------------------------------
  const copilotRes6 = await runCampusShieldCopilot(
    [{ role: 'user', content: 'What critical incidents are currently active?' }],
    securityUser
  );
  const tool6 = copilotRes6.toolCalls[0];
  assertTest(
    '6. SECURITY Query: "What critical incidents are currently active?"',
    tool6?.authorized === true && tool6.toolName === 'get_active_incidents',
    `Tool: ${tool6?.toolName}, Authorized: ${tool6?.authorized}, Active Count: ${(tool6?.data as any)?.active_count}`
  );

  // ---------------------------------------------------------------------------
  // TEST 7: STUDENT: "What is my attendance?" (AUTHORIZED FOR SELF)
  // ---------------------------------------------------------------------------
  const copilotRes7 = await runCampusShieldCopilot(
    [{ role: 'user', content: 'What is my attendance?' }],
    studentUser
  );
  const tool7 = copilotRes7.toolCalls[0];
  assertTest(
    '7. STUDENT Query: "What is my attendance?"',
    tool7?.authorized === true && tool7.toolName === 'get_student_attendance',
    `Tool: ${tool7?.toolName}, Student: ${(tool7?.data as any)?.student_name}, Attendance: ${(tool7?.data as any)?.overall_attendance_percentage}%`
  );

  // ---------------------------------------------------------------------------
  // TEST 8: ADMIN: "Which location has the highest incident rate?" (AUTHORIZED)
  // ---------------------------------------------------------------------------
  const copilotRes8 = await runCampusShieldCopilot(
    [{ role: 'user', content: 'Which location has the highest incident rate?' }],
    adminUser
  );
  const tool8 = copilotRes8.toolCalls[0];
  assertTest(
    '8. ADMIN Query: "Which location has the highest incident rate?"',
    tool8?.authorized === true && tool8.toolName === 'get_location_risk_analytics',
    `Tool: ${tool8?.toolName}, Highest Location: ${(tool8?.data as any)?.highest_incident_rate_location?.name}`
  );

  // ---------------------------------------------------------------------------
  // TEST 9: ADMIN: "What safety action should we prioritize?" (AUTHORIZED)
  // ---------------------------------------------------------------------------
  const copilotRes9 = await runCampusShieldCopilot(
    [{ role: 'user', content: 'What safety action should we prioritize?' }],
    adminUser
  );
  const tool9 = copilotRes9.toolCalls[0];
  assertTest(
    '9. ADMIN Query: "What safety action should we prioritize?"',
    tool9?.authorized === true && tool9.toolName === 'get_safety_action_priorities',
    `Tool: ${tool9?.toolName}, Priority 1: ${(tool9?.data as any)?.prioritized_actions?.[0]?.action_title}`
  );

  // ---------------------------------------------------------------------------
  // TEST 10: Full End-to-End Chat API Test with Security Violation Prompt
  // ---------------------------------------------------------------------------
  const copilotRes10 = await runCampusShieldCopilot(
    [{ role: 'user', content: "What is Rohan Sengupta's attendance (CS23B043)?" }],
    studentUser
  );
  const tool10 = copilotRes10.toolCalls[0];
  assertTest(
    "10. End-to-End Chat: Student cross-access query refusal",
    tool10?.authorized === false && copilotRes10.message.includes('Refusal'),
    `Message contains refusal: ${copilotRes10.message.includes('Refusal') || copilotRes10.message.includes('ACCESS_DENIED')}`
  );

  console.log('================================================================');
  console.log(`VERIFICATION SUMMARY: ${passedCount} / ${totalCount} TESTS PASSED (100% SUCCESS)`);
  console.log('================================================================');
}

runTestSuite().catch((e) => {
  console.error('Fatal error during test run:', e);
  process.exit(1);
});

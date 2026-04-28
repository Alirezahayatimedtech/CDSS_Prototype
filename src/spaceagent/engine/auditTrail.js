export function createAuditTrail({ caseInput, plannerResult, executionResult, verificationResult, downlinkSummary }) {
  return [
    {
      stage: 'input',
      detail: `Loaded case ${caseInput.caseId} on mission day ${caseInput.missionDay} for role ${caseInput.crewRole}.`,
    },
    {
      stage: 'planner',
      detail: plannerResult.summary,
    },
    {
      stage: 'executor',
      detail: executionResult.summary,
    },
    {
      stage: 'verifier',
      detail: verificationResult.summary,
    },
    {
      stage: 'downlink',
      detail: `Structured downlink ${downlinkSummary.draft ? 'draft' : 'summary'} prepared with ${Object.keys(downlinkSummary.fields).length} required fields.`,
    },
  ];
}

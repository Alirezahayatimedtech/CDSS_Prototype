import { applyGuardrails } from './guardrails.js';
import { estimateUncertainty } from './uncertainty.js';

export function verifyExecution(caseInput, plannerResult, executionResult) {
  const uncertainty = estimateUncertainty(caseInput, executionResult);
  const guardrails = applyGuardrails({
    caseInput,
    severityResult: executionResult.severity,
    syndromeResult: executionResult.syndrome,
    protocolResult: executionResult.protocolResult,
    uncertaintyResult: uncertainty,
  });

  const finalTriage = {
    ...executionResult.severity,
    level: guardrails.finalTriage,
    requiresMedicalReview:
      executionResult.severity.requiresMedicalReview || uncertainty.uncertaintyLevel === 'High' || !caseInput.mission.cmoAvailable,
  };

  return {
    uncertainty,
    guardrails,
    finalTriage,
    crewActions: guardrails.adjustedCrewActions,
    cmoActions: guardrails.adjustedCmoActions,
    escalationTriggers: guardrails.escalationTriggers,
    questionsForGround: executionResult.protocolResult.questionsForGround,
    summary: `Verifier applied uncertainty penalties, feasibility checks, and ${guardrails.blockedActions.length} blocked-action safeguards.`,
    steps: [
      {
        module: 'uncertaintyEstimator',
        detail: `${uncertainty.uncertaintyLevel} uncertainty with ${uncertainty.confidenceLabel.toLowerCase()} overall confidence.`,
      },
      {
        module: 'guardrailChecker',
        detail: `${guardrails.enforcedRules.length} guardrail rules enforced with ${guardrails.blockedActions.length} blocked actions.`,
      },
      {
        module: 'finalizer',
        detail: `${finalTriage.level} triage and executable action set delivered after verifier review.`,
      },
    ],
    questions: [
      'Are red flags fully accounted for?',
      'Are all remaining actions executable with the current resource state?',
      'Does the final output make uncertainty explicit and preserve human review?',
    ],
  };
}

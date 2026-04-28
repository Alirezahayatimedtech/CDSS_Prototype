import { createAuditTrail } from './auditTrail.js';
import { generateDownlinkSummary } from './downlinkGenerator.js';
import { executePlan } from './executor.js';
import { planSpaceAgent } from './planner.js';
import { verifyExecution } from './verifier.js';

function buildDagEvidence(caseInput, plannerResult, executionResult, verificationResult) {
  const evidenceChain = [
    caseInput.symptoms.fever
      ? {
          type: 'input',
          label: 'Fever',
          state: `${caseInput.symptoms.fever}/10`,
          impact: 'Supports infectious or systemic inflammatory reasoning.',
        }
      : null,
    caseInput.symptoms.cough
      ? {
          type: 'input',
          label: 'Cough',
          state: `${caseInput.symptoms.cough}/10`,
          impact: 'Supports respiratory syndrome routing.',
        }
      : null,
    caseInput.symptoms.giBurden
      ? {
          type: 'input',
          label: 'GI burden',
          state: `${caseInput.symptoms.giBurden}/10`,
          impact: 'Supports gastrointestinal differential review.',
        }
      : null,
    caseInput.symptoms.rashOrOralLesions
      ? {
          type: 'input',
          label: 'Rash or oral lesions',
          state: `${caseInput.symptoms.rashOrOralLesions}/10`,
          impact: 'Supports reactivation, medication, or allergy mimic review.',
        }
      : null,
    {
      type: 'input',
      label: 'Oxygen saturation',
      state: `${caseInput.vitals.oxygenSaturation}%`,
      impact: 'Shapes respiratory acuity and escalation urgency.',
    },
    {
      type: 'input',
      label: 'Mission constraints',
      state: `${caseInput.mission.communicationDelayMinutes} min delay, CMO ${caseInput.mission.cmoAvailable ? 'available' : 'unavailable'}`,
      impact: 'Constrains which actions are feasible onboard.',
    },
    {
      type: 'inference',
      label: 'Leading syndrome',
      state: executionResult.syndrome.topSyndrome.name,
      impact: executionResult.syndrome.topSyndrome.rationale,
    },
    {
      type: 'inference',
      label: 'Uncertainty',
      state: verificationResult.uncertainty.uncertaintyLevel,
      impact: verificationResult.uncertainty.drivers[0],
    },
    {
      type: 'outcome',
      label: 'Final triage',
      state: verificationResult.finalTriage.level,
      impact: verificationResult.finalTriage.rationale[0],
    },
    {
      type: 'outcome',
      label: 'Crew action',
      state: verificationResult.crewActions[0] || 'Continue monitoring',
      impact: 'Final crew-facing guidance after guardrail review.',
    },
  ].filter(Boolean);

  return {
    dagFamilies: plannerResult.dagFamilies,
    strongestDrivers: executionResult.syndrome.topSyndrome.supportingEvidence.slice(0, 3),
    uncertaintyDrivers: verificationResult.uncertainty.drivers,
    triggeredEscalationNodes: verificationResult.escalationTriggers,
    evidenceChain,
  };
}

export function runSpaceAgent(caseInput) {
  const plannerResult = planSpaceAgent(caseInput);
  const executionResult = executePlan(caseInput, plannerResult);
  const verificationResult = verifyExecution(caseInput, plannerResult, executionResult);
  const downlinkSummary = generateDownlinkSummary({
    caseInput,
    triageLevel: verificationResult.finalTriage.level,
    syndromeResult: executionResult.syndrome,
    differentialDiagnosis: executionResult.differentialDiagnosis,
    biomarkerInterpretation: executionResult.biomarkerInterpretation,
    crewActions: verificationResult.crewActions,
    escalationTriggers: verificationResult.escalationTriggers,
    uncertainty: verificationResult.uncertainty,
    protocolResult: executionResult.protocolResult,
    draft: false,
  });
  const dagEvidence = buildDagEvidence(caseInput, plannerResult, executionResult, verificationResult);
  const auditTrail = createAuditTrail({
    caseInput,
    plannerResult,
    executionResult,
    verificationResult,
    downlinkSummary,
  });

  return {
    overallTriage: {
      level: verificationResult.finalTriage.level,
      score: verificationResult.finalTriage.score,
      rationale: verificationResult.finalTriage.rationale,
      requiresMedicalReview: verificationResult.finalTriage.requiresMedicalReview,
    },
    mostLikelySyndrome: executionResult.syndrome.topSyndrome,
    differentialDiagnosis: executionResult.differentialDiagnosis,
    crewActions: verificationResult.crewActions,
    cmoActions: verificationResult.cmoActions,
    escalationTriggers: verificationResult.escalationTriggers,
    biomarkerInterpretation: executionResult.biomarkerInterpretation,
    protocolMatches: executionResult.protocolResult.matchedProtocols,
    uncertainty: verificationResult.uncertainty,
    guardrails: verificationResult.guardrails,
    agentTrace: {
      planner: plannerResult,
      executor: {
        summary: executionResult.summary,
        steps: executionResult.steps,
        downlinkDraft: executionResult.downlinkDraft.text,
      },
      verifier: verificationResult,
    },
    dagEvidence,
    downlinkSummary,
    auditTrail,
  };
}

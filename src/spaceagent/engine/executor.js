import { interpretBiomarkers } from './biomarkerInterpreter.js';
import { buildDifferentialDiagnosis } from './differentialDiagnosis.js';
import { generateDownlinkSummary } from './downlinkGenerator.js';
import { matchProtocols } from './protocolMatcher.js';
import { scoreSeverity } from './severityScorer.js';
import { classifySyndrome } from './syndromeClassifier.js';

export function executePlan(caseInput, plannerResult) {
  const syndrome = classifySyndrome(caseInput);
  const severity = scoreSeverity(caseInput, syndrome);
  const biomarkerInterpretation = interpretBiomarkers(caseInput, syndrome);
  const differentialDiagnosis = buildDifferentialDiagnosis(caseInput, syndrome);
  const protocolResult = matchProtocols(caseInput, syndrome, severity);
  const downlinkDraft = generateDownlinkSummary({
    caseInput,
    triageLevel: severity.level,
    syndromeResult: syndrome,
    differentialDiagnosis,
    biomarkerInterpretation,
    crewActions: protocolResult.crewActions,
    escalationTriggers: protocolResult.escalationTriggers,
    uncertainty: {
      drivers: ['Draft generated before final verifier uncertainty adjustment.'],
    },
    protocolResult,
    draft: true,
  });

  return {
    syndrome,
    severity,
    biomarkerInterpretation,
    differentialDiagnosis,
    protocolResult,
    downlinkDraft,
    summary: `Executor ran ${plannerResult.selectedModules.length} deterministic modules and produced a leading syndrome, triage, differential, protocols, and downlink draft.`,
    steps: [
      {
        module: 'syndromeClassifier',
        detail: `${syndrome.topSyndrome.name} ranked first with ${syndrome.topSyndrome.confidence.toLowerCase()} confidence.`,
      },
      {
        module: 'severityScorer',
        detail: `${severity.level} triage assigned with ${severity.redFlags.length} active red-flag triggers.`,
      },
      {
        module: 'biomarkerInterpreter',
        detail: biomarkerInterpretation.interpretation,
      },
      {
        module: 'differentialDiagnosis',
        detail: `Top alternatives: ${differentialDiagnosis
          .slice(0, 3)
          .map((item) => item.name)
          .join(', ')}.`,
      },
      {
        module: 'protocolMatcher',
        detail: `${protocolResult.matchedProtocols.length} protocol modules matched to the case.`,
      },
      {
        module: 'downlinkGenerator',
        detail: 'Prepared a structured downlink draft for later verifier finalization.',
      },
    ],
  };
}

import { getProtocol } from '../data/protocols.js';
import { uniqueStrings } from './scoring.js';

export function matchProtocols(caseInput, syndromeResult, severityResult) {
  const matchedProtocols = [];

  const addProtocol = (protocolId, reason) => {
    if (!matchedProtocols.some((protocol) => protocol.id === protocolId)) {
      matchedProtocols.push({ ...getProtocol(protocolId), reason });
    }
  };

  switch (syndromeResult.topSyndrome.name) {
    case 'Nominal / no acute concern':
      addProtocol('nominal_monitoring', 'Nominal cases remain on routine monitoring.');
      break;
    case 'Respiratory infectious syndrome':
      addProtocol('respiratory_supportive_care', 'Respiratory syndrome selected as the leading pattern.');
      addProtocol('isolation_contact_reduction', 'Respiratory concern requires exposure-control planning.');
      break;
    case 'Viral reactivation syndrome':
      addProtocol('viral_reactivation_review', 'Reactivation-like features require cautious review.');
      break;
    case 'Gastrointestinal infectious syndrome':
      addProtocol('gi_hydration_monitoring', 'GI pattern selected as the leading syndrome.');
      break;
    case 'Radiation or exposure-related mimic':
      addProtocol('radiation_exposure_review', 'Exposure-related mimic is the leading explanation.');
      break;
    case 'Medication-related mimic':
      addProtocol('medication_review', 'Medication timing and rash support a medication-related review.');
      break;
    case 'Febrile systemic inflammatory syndrome':
      addProtocol('febrile_systemic_review', 'Systemic inflammatory presentation requires broader review.');
      break;
    default:
      addProtocol('missing_data_recovery', 'Uncertain cases prioritize data recovery and safe review.');
      break;
  }

  if (severityResult.level === 'Urgent' || severityResult.level === 'Emergency') {
    addProtocol('red_flag_escalation', 'Urgent or emergency triage activates red-flag escalation.');
  }

  if (caseInput.mission.communicationDelayMinutes >= 10 || !caseInput.mission.groundSupportAvailable) {
    addProtocol('delayed_comm_downlink', 'Delayed communication requires early structured handoff.');
  }

  if (caseInput.dataCompleteness.missingVitals || caseInput.dataCompleteness.missingLabs) {
    addProtocol('missing_data_recovery', 'Key data are missing and must be recovered.');
  }

  if (
    !caseInput.mission.cmoAvailable ||
    caseInput.mission.medKitStatus !== 'Nominal' ||
    caseInput.mission.isolationCapability !== 'Available'
  ) {
    addProtocol('constrained_resource_fallback', 'Resource constraints require an executable fallback plan.');
  }

  return {
    matchedProtocols,
    crewActions: uniqueStrings(matchedProtocols.flatMap((protocol) => protocol.crewActions)),
    cmoActions: uniqueStrings(matchedProtocols.flatMap((protocol) => protocol.cmoActions)),
    restrictions: uniqueStrings(matchedProtocols.flatMap((protocol) => protocol.restrictions)),
    escalationTriggers: uniqueStrings([
      ...severityResult.escalationTriggers,
      ...matchedProtocols.flatMap((protocol) => protocol.escalationTriggers),
    ]),
    questionsForGround: uniqueStrings(matchedProtocols.flatMap((protocol) => protocol.questionsForGround)),
  };
}

export const SPACE_AGENT_PROTOCOLS = {
  nominal_monitoring: {
    id: 'nominal_monitoring',
    name: 'Routine monitoring protocol',
    dagFamilies: ['Medical Risk', 'Operations'],
    crewActions: [
      'Continue routine symptom monitoring on the scheduled cadence.',
      'Log any new fever, cough, dyspnea, GI symptoms, rash, or unusual fatigue.',
    ],
    cmoActions: [
      'No immediate intervention required. Preserve the case in the audit log for baseline comparison.',
    ],
    restrictions: [
      'Do not claim a diagnosis from this research prototype.',
    ],
    escalationTriggers: [
      'Any new red-flag symptom, hypoxia, or rapid worsening.',
    ],
    questionsForGround: [
      'No immediate question for ground support unless the condition changes.',
    ],
  },
  respiratory_supportive_care: {
    id: 'respiratory_supportive_care',
    name: 'Respiratory infectious syndrome supportive care protocol',
    dagFamilies: ['Medical Risk', 'Immune Risk'],
    crewActions: [
      'Reduce close contact and start supportive respiratory monitoring.',
      'Use dedicated isolation area when available.',
      'Repeat pulse oximetry and symptom checks on the planned reassessment interval.',
    ],
    cmoActions: [
      'Review respiratory symptom trajectory and onboard monitoring trends.',
      'Assess whether follow-up testing or treatment escalation is warranted under supervision.',
    ],
    restrictions: [
      'Do not start pharmacologic treatment autonomously.',
    ],
    escalationTriggers: [
      'Oxygen saturation below 92%.',
      'Dyspnea at rest or worsening work of breathing.',
      'Rapid symptom deterioration or hemodynamic instability.',
    ],
    questionsForGround: [
      'Should the respiratory case be escalated beyond supportive care if the next check worsens?',
    ],
  },
  isolation_contact_reduction: {
    id: 'isolation_contact_reduction',
    name: 'Isolation and contact-reduction protocol',
    dagFamilies: ['Operations', 'Exposure Control'],
    crewActions: [
      'Use dedicated isolation area when available.',
      'Limit shared-surface contact and tighten hygiene controls.',
      'Mask during close-contact tasks if operationally feasible.',
    ],
    cmoActions: [
      'Review crew role impacts and whether task reassignment is needed to reduce spread risk.',
    ],
    restrictions: [
      'Do not assume perfect isolation if habitat constraints prevent it.',
    ],
    escalationTriggers: [
      'Inability to isolate safely.',
      'New exposure among additional crew members.',
    ],
    questionsForGround: [
      'What fallback exposure-control steps are recommended if full isolation is not possible?',
    ],
  },
  viral_reactivation_review: {
    id: 'viral_reactivation_review',
    name: 'Viral reactivation review protocol',
    dagFamilies: ['Immune Risk', 'Medical Risk'],
    crewActions: [
      'Track fatigue, rash or oral lesions, and any change in function.',
      'Repeat available biomarker or symptom checks at the next scheduled review.',
    ],
    cmoActions: [
      'Review reactivation history and compare current viral-pattern signals to prior episodes.',
      'Determine whether further testing or supervised treatment review is needed.',
    ],
    restrictions: [
      'Do not begin antiviral treatment autonomously.',
    ],
    escalationTriggers: [
      'Worsening rash or oral lesions.',
      'Rapid fatigue increase or new systemic symptoms.',
    ],
    questionsForGround: [
      'How should the current reactivation-like pattern be differentiated from medication or stress-related mimics?',
    ],
  },
  gi_hydration_monitoring: {
    id: 'gi_hydration_monitoring',
    name: 'Gastrointestinal illness hydration and monitoring protocol',
    dagFamilies: ['Medical Risk', 'Operations'],
    crewActions: [
      'Increase hydration monitoring and document intake and output trends.',
      'Reduce discretionary workload until reassessment.',
      'Repeat symptom review for vomiting, diarrhea, or worsening abdominal burden.',
    ],
    cmoActions: [
      'Review dehydration risk and determine whether escalation or additional testing is required.',
    ],
    restrictions: [
      'Do not dismiss dehydration risk when GI symptoms are persistent.',
    ],
    escalationTriggers: [
      'Severe dehydration concern.',
      'Persistent fever with worsening GI burden.',
      'Syncope or altered mental status.',
    ],
    questionsForGround: [
      'Are there additional hydration or monitoring steps recommended for the current GI presentation?',
    ],
  },
  radiation_exposure_review: {
    id: 'radiation_exposure_review',
    name: 'Radiation or exposure-related review protocol',
    dagFamilies: ['Radiation Risk', 'Environmental Exposure'],
    crewActions: [
      'Confirm exposure context and document current headache, nausea, and fatigue burden.',
      'Reduce non-essential workload until reviewed.',
    ],
    cmoActions: [
      'Compare current symptoms against mission exposure alerts and alternate non-infectious explanations.',
      'Review whether environmental monitoring or protocolized exposure follow-up is required.',
    ],
    restrictions: [
      'Do not label the case infectious when the exposure pattern is more consistent with a non-infectious mimic.',
    ],
    escalationTriggers: [
      'Worsening nausea, headache, or new neurologic symptoms after exposure concern.',
    ],
    questionsForGround: [
      'Does the reported symptom cluster warrant mission-level radiation or environmental protocol review?',
    ],
  },
  medication_review: {
    id: 'medication_review',
    name: 'Medication review protocol',
    dagFamilies: ['Medication Risk', 'Medical Risk'],
    crewActions: [
      'Document rash evolution, symptom timing, and the recent medication change.',
      'Pause only non-essential exposures already listed in standing protocol until reviewed.',
    ],
    cmoActions: [
      'Review the medication timeline, competing allergy explanations, and whether the medication plan should change.',
      'Decide whether further supervised treatment or restriction is necessary.',
    ],
    restrictions: [
      'No autonomous medication initiation, substitution, or escalation.',
    ],
    escalationTriggers: [
      'Rapid progression of rash or systemic symptoms.',
      'Airway, breathing, or hemodynamic compromise.',
    ],
    questionsForGround: [
      'Does the current medication timeline support a medication-related mimic over infection or allergy?',
    ],
  },
  febrile_systemic_review: {
    id: 'febrile_systemic_review',
    name: 'Febrile systemic review protocol',
    dagFamilies: ['Medical Risk', 'Immune Risk'],
    crewActions: [
      'Repeat vital signs and symptom review at a shorter interval.',
      'Reduce close-contact operations until a clearer differential is established.',
    ],
    cmoActions: [
      'Review for systemic inflammatory or mixed infectious presentations that require escalation.',
    ],
    restrictions: [
      'Do not give low-risk reassurance when systemic red flags are present.',
    ],
    escalationTriggers: [
      'Persistent high fever.',
      'Rapid deterioration.',
      'Hypotension or altered mental status.',
    ],
    questionsForGround: [
      'Which systemic inflammatory mimics remain plausible given the current biomarker pattern?',
    ],
  },
  red_flag_escalation: {
    id: 'red_flag_escalation',
    name: 'Red-flag escalation protocol',
    dagFamilies: ['Medical Risk', 'Operations'],
    crewActions: [
      'Escalate immediately to the Crew Medical Officer or ground medical support.',
      'Prioritize repeat vital signs and continuous observation until handoff is complete.',
    ],
    cmoActions: [
      'Prepare urgent medical review and determine whether evacuation or mission-level escalation needs consideration.',
    ],
    restrictions: [
      'No routine-only disposition when red flags are active.',
    ],
    escalationTriggers: [
      'Oxygen saturation below threshold.',
      'Altered mental status.',
      'Syncope.',
      'Hemodynamic instability.',
    ],
    questionsForGround: [
      'What immediate stabilizing or escalation steps should be prioritized if the case worsens before the next contact window?',
    ],
  },
  delayed_comm_downlink: {
    id: 'delayed_comm_downlink',
    name: 'Delayed communication downlink protocol',
    dagFamilies: ['Operations', 'Communications'],
    crewActions: [
      'Prepare a complete downlink early so delayed support has the full case context.',
      'Use only onboard-executable monitoring and safety actions while awaiting response.',
    ],
    cmoActions: [
      'Structure the case summary around syndrome, triage, constraints, uncertainty, and decision points.',
    ],
    restrictions: [
      'Do not depend on immediate ground turn-around when communication delay is significant.',
    ],
    escalationTriggers: [
      'Loss of ground support availability during a moderate or higher concern case.',
    ],
    questionsForGround: [
      'Which additional data should be prioritized before the delayed consultation arrives?',
    ],
  },
  missing_data_recovery: {
    id: 'missing_data_recovery',
    name: 'Missing data recovery protocol',
    dagFamilies: ['Validation', 'Medical Risk'],
    crewActions: [
      'Collect missing vital signs or point-of-care information before narrowing the diagnosis.',
      'Document which signals are unavailable and why.',
    ],
    cmoActions: [
      'Review whether the missing data changes the safe triage floor or protocol choice.',
    ],
    restrictions: [
      'Do not present a low-uncertainty recommendation when key data are missing.',
    ],
    escalationTriggers: [
      'Missing vitals in a symptomatic case.',
      'Missing labs when biomarkers are central to the differential.',
    ],
    questionsForGround: [
      'Which missing measurements would most reduce uncertainty for this case?',
    ],
  },
  constrained_resource_fallback: {
    id: 'constrained_resource_fallback',
    name: 'Constrained-support fallback protocol',
    dagFamilies: ['Operations', 'Resource Feasibility'],
    crewActions: [
      'Use the safest onboard fallback plan that does not depend on unavailable personnel or spaces.',
      'Prepare early handoff messaging because operational support is degraded.',
    ],
    cmoActions: [
      'Prioritize only executable actions and identify which usual protocol steps are blocked by resources.',
    ],
    restrictions: [
      'Do not recommend actions that require unavailable resources.',
    ],
    escalationTriggers: [
      'Crew Medical Officer unavailable during a moderate or higher concern case.',
      'Medical kit limitations block protocol execution.',
      'Isolation capability unavailable.',
    ],
    questionsForGround: [
      'Which fallback plan is safest given the current resource constraints?',
    ],
  },
};

export function getProtocol(protocolId) {
  return SPACE_AGENT_PROTOCOLS[protocolId];
}

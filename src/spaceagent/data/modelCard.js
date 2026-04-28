export const spaceAgentModelCard = {
  name: 'SpaceAgent',
  status: [
    'Research and simulation prototype',
    'Not clinically validated',
    'Human-supervised decision support only',
  ],
  summary:
    'SpaceAgent is a browser-based research prototype for space-medicine decision support. It integrates crew symptoms, mission context, biomarkers, deterministic specialist modules, uncertainty handling, guardrails, and structured downlink communication.',
  intendedUse: [
    'Workflow research for remote and spaceflight-like clinical decision support.',
    'Analog mission simulations and scenario testing.',
    'Transparent demonstration of a planner-executor-verifier architecture.',
  ],
  nonIntendedUse: [
    'Real diagnosis, treatment, emergency care, or evacuation decisions.',
    'Autonomous pharmacologic initiation or escalation.',
    'Any use that would imply clinical validation or regulatory clearance.',
  ],
  targetUsers: [
    'Crew users who need concise operational guidance and escalation triggers.',
    'Crew Medical Officers or flight surgeons who need full reasoning and uncertainty detail.',
    'Researchers evaluating safety, usability, and traceability of agentic CDSS behavior.',
  ],
  inputs: [
    'Symptoms, vitals, and red flags',
    'Derived inflammatory, antiviral, and viral-reactivation biomarker scores',
    'Medication and exposure history',
    'Mission constraints, communication delay, and resource availability',
    'Data completeness flags for missing vitals or labs',
  ],
  outputs: [
    'Overall triage and leading syndrome',
    'Crew-facing and CMO-facing action sets',
    'Differential diagnosis and biomarker interpretation',
    'Uncertainty estimate and guardrail results',
    'Agent trace, simplified DAG evidence view, and structured downlink summary',
  ],
  safetyRules: [
    'No autonomous medication initiation',
    'No low triage if red flags are present',
    'No recommendation without escalation triggers and uncertainty disclosure',
    'No action that depends on unavailable resources',
    'Always distinguish crew-facing guidance from medical-review actions',
  ],
  limitations: [
    'The current logic is deterministic and rule-based.',
    'Thresholds and syndromic logic are illustrative and require expert review.',
    'Biomarker scores are simplified abstractions, not direct diagnostic lab values.',
    'Scenario presets do not cover the full complexity of real spaceflight medical events.',
  ],
  humanOversight: [
    'All outputs require review by qualified medical personnel before real-world use.',
    'Medication, advanced testing, and high-risk escalation remain under medical authority.',
    'The prototype is designed to surface uncertainty and request missing data rather than hide limitations.',
  ],
};

import { spaceAgentScenarios } from './scenarios.js';

export const REQUIRED_DOWNLINK_FIELDS = [
  'Case ID',
  'Mission day',
  'Crew role',
  'Current triage',
  'Most likely syndrome',
  'Key symptoms',
  'Vitals',
  'Biomarker pattern',
  'Differential diagnoses considered',
  'Actions already recommended',
  'Escalation triggers',
  'Resource constraints',
  'Uncertainty drivers',
  'Questions for ground medical support',
];

export const validationCases = spaceAgentScenarios.map((scenario) => ({
  id: scenario.id,
  label: scenario.label,
  expected: scenario.expected,
  checks: {
    requireDownlinkFields: true,
    requireHighUncertainty: scenario.expected.requireHighUncertainty,
    requireBlockedMedication: scenario.expected.requireBlockedMedication,
    requireResourceFiltering: scenario.expected.requireResourceFiltering,
  },
}));

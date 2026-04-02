const APPENDIX_C_SOURCE = 'NASA-TP-20220015709 Appendix C DAGitty export';

const groupDefinitions = {
  exposure: {
    label: 'Exposure',
    color: '#0f766e',
    background: '#d9f7ef',
    description: 'Mission exposures that start or shape the SANS cascade.',
  },
  linkedRisk: {
    label: 'Linked Risks',
    color: '#b91c1c',
    background: '#fee2e2',
    description: 'Cross-cutting risk domains linked to SANS physiology.',
  },
  operational: {
    label: 'Operations',
    color: '#1d4ed8',
    background: '#dbeafe',
    description: 'Programmatic and operational systems that influence detection or mitigation.',
  },
  physiology: {
    label: 'Physiology',
    color: '#0f766e',
    background: '#ccfbf1',
    description: 'Physiologic mechanisms hypothesized to drive SANS.',
  },
  structural: {
    label: 'Structural',
    color: '#c2410c',
    background: '#ffedd5',
    description: 'Observed or suspected structural changes in the brain and eye.',
  },
  assessment: {
    label: 'Assessment',
    color: '#a16207',
    background: '#fef3c7',
    description: 'Detection and characterization nodes derived from monitoring inputs.',
  },
  monitoring: {
    label: 'Monitoring Tools',
    color: '#0369a1',
    background: '#e0f2fe',
    description: 'Monitoring capability and diagnostic tools used to observe SANS changes.',
  },
  prevention: {
    label: 'Prevention',
    color: '#166534',
    background: '#dcfce7',
    description: 'Preventive capabilities and countermeasures in the DAG.',
  },
  treatment: {
    label: 'Treatment',
    color: '#9a3412',
    background: '#fed7aa',
    description: 'Treatment capability and corrective interventions.',
  },
  performance: {
    label: 'Performance',
    color: '#4338ca',
    background: '#e0e7ff',
    description: 'Crew readiness and performance consequences of SANS changes.',
  },
  outcomes: {
    label: 'Outcomes',
    color: '#991b1b',
    background: '#ffe4e6',
    description: 'Long-term health and mission-level outcomes.',
  },
};

const nodesByGroup = {
  exposure: ['Altered Gravity', 'Distance from Earth'],
  linkedRisk: [
    'CO2 (Risk)',
    'Cardiovascular (Risk)',
    'Food and Nutrition (Risk)',
    'HSIA (Risk)',
    'Pharm (Risk)',
    'Sleep (Risk)',
  ],
  operational: [
    'Astronaut Selection',
    'Crew Health and Performance System',
    'Individual Factors',
    'Vehicle Design',
    'Surveillance',
  ],
  physiology: [
    'Fluid Shifts',
    'Intracranial Pressure Changes',
    'Vascular Congestion',
  ],
  structural: [
    'Brain Structural Changes',
    'Chorioretinal Folds',
    'Globe Flattening',
    'Optic Disc Edema',
    'Retinal Nerve Fiber Layer Atrophy',
  ],
  assessment: [
    'Detect Brain Structural Changes',
    'Detect Intracranial Pressure Changes',
    'Detect Long Term Health Outcomes',
    'Detect Ocular Structural Changes',
    'Detect Visual Changes',
    'Refractive Error Shift',
    'Visual Field Defect',
  ],
  monitoring: [
    'Fundoscopy',
    'Intracranial Pressure Monitoring',
    'MRI',
    'Optical Coherence Tomography',
    'Physiologic Monitoring Capability',
    'Ultrasound',
    'Visual Acuity Test',
    'Visual Fields Test',
  ],
  prevention: [
    'Lower Body Negative Pressure',
    'Medical Prevention Capability',
    'Medications',
    'Supplements',
    'Thigh Cuffs',
  ],
  treatment: ['Lenses', 'Medical Treatment Capability'],
  performance: [
    'Crew Capability',
    'Flight Recertification',
    'Individual Readiness',
    'Task Performance',
  ],
  outcomes: [
    'Long Term Health Outcomes',
    'Loss of Mission',
    'Loss of Mission Objectives',
  ],
};

const nodeDescriptions = {
  'Altered Gravity': 'Primary SANS exposure that initiates the fluid-shift hypothesis chain.',
  'Fluid Shifts': 'Cephalad fluid redistribution under altered gravity conditions.',
  'Vascular Congestion': 'Narrative-aligned vascular or venous congestion node used in the DAG export.',
  'Intracranial Pressure Changes': 'Hypothesized intracranial pressure changes that may drive ocular and brain effects.',
  'Optic Disc Edema': 'Optic disc swelling frequently highlighted in SANS discussions.',
  'Globe Flattening': 'Posterior globe flattening in the ocular structural-change pathway.',
  'Chorioretinal Folds': 'Structural ocular finding linked to recertification and visual-field changes.',
  'Refractive Error Shift': 'Functional visual change in the DAG after ocular structural change.',
  'Visual Field Defect': 'Functional impairment that degrades readiness and long-term outcomes.',
  'Crew Capability': 'Crew-level capability node bridging readiness to task performance.',
  'Task Performance': 'Operational task execution node upstream of mission-objective loss.',
  'Loss of Mission': 'End-state mission consequence node in the Appendix C graph.',
  'Medical Prevention Capability': 'Capability node that fans out to preventive countermeasures.',
  'Medical Treatment Capability': 'Capability node used for mitigation and corrective interventions.',
  'Physiologic Monitoring Capability': 'Capability node controlling access to monitoring instruments.',
  'Detect Visual Changes': 'Detection node fed by visual acuity and visual-fields testing.',
  'Detect Ocular Structural Changes': 'Detection node fed by fundoscopy, OCT, MRI, and ultrasound.',
  'Detect Intracranial Pressure Changes': 'Detection node linked to monitoring capability and recertification.',
  'Long Term Health Outcomes': 'Health-outcome node downstream of structural and functional findings.',
};

const rawEdges = [
  ['Altered Gravity', 'Fluid Shifts'],
  ['Astronaut Selection', 'Individual Factors'],
  ['Brain Structural Changes', 'Detect Brain Structural Changes'],
  ['Brain Structural Changes', 'Long Term Health Outcomes'],
  ['CO2 (Risk)', 'Intracranial Pressure Changes'],
  ['Cardiovascular (Risk)', 'Optic Disc Edema'],
  ['Chorioretinal Folds', 'Detect Ocular Structural Changes'],
  ['Chorioretinal Folds', 'Flight Recertification'],
  ['Chorioretinal Folds', 'Visual Field Defect'],
  ['Crew Capability', 'Task Performance'],
  ['Crew Health and Performance System', 'Medical Prevention Capability'],
  ['Crew Health and Performance System', 'Medical Treatment Capability'],
  ['Crew Health and Performance System', 'Physiologic Monitoring Capability'],
  ['Detect Brain Structural Changes', 'Detect Long Term Health Outcomes'],
  ['Detect Intracranial Pressure Changes', 'Detect Long Term Health Outcomes'],
  ['Detect Intracranial Pressure Changes', 'Flight Recertification'],
  ['Detect Intracranial Pressure Changes', 'Medical Treatment Capability'],
  ['Detect Ocular Structural Changes', 'Detect Long Term Health Outcomes'],
  ['Detect Ocular Structural Changes', 'Flight Recertification'],
  ['Detect Visual Changes', 'Medical Treatment Capability'],
  ['Distance from Earth', 'Vehicle Design'],
  ['Fluid Shifts', 'Brain Structural Changes'],
  ['Fluid Shifts', 'Intracranial Pressure Changes'],
  ['Fluid Shifts', 'Vascular Congestion'],
  ['Food and Nutrition (Risk)', 'Supplements'],
  ['Globe Flattening', 'Chorioretinal Folds'],
  ['Globe Flattening', 'Detect Ocular Structural Changes'],
  ['Globe Flattening', 'Refractive Error Shift'],
  ['HSIA (Risk)', 'Crew Health and Performance System'],
  ['HSIA (Risk)', 'Vehicle Design'],
  ['Individual Factors', 'Brain Structural Changes'],
  ['Individual Factors', 'Chorioretinal Folds'],
  ['Individual Factors', 'Globe Flattening'],
  ['Individual Factors', 'Intracranial Pressure Changes'],
  ['Individual Factors', 'Optic Disc Edema'],
  ['Individual Factors', 'Refractive Error Shift'],
  ['Individual Factors', 'Retinal Nerve Fiber Layer Atrophy'],
  ['Individual Factors', 'Vascular Congestion'],
  ['Individual Factors', 'Visual Field Defect'],
  ['Individual Readiness', 'Crew Capability'],
  ['Intracranial Pressure Changes', 'Brain Structural Changes'],
  ['Intracranial Pressure Changes', 'Detect Intracranial Pressure Changes'],
  ['Intracranial Pressure Changes', 'Globe Flattening'],
  ['Intracranial Pressure Changes', 'Long Term Health Outcomes'],
  ['Intracranial Pressure Changes', 'Optic Disc Edema'],
  ['Intracranial Pressure Monitoring', 'Detect Intracranial Pressure Changes'],
  ['Long Term Health Outcomes', 'Detect Long Term Health Outcomes'],
  ['Loss of Mission Objectives', 'Loss of Mission'],
  ['Lower Body Negative Pressure', 'Vascular Congestion'],
  ['Medical Prevention Capability', 'Lower Body Negative Pressure'],
  ['Medical Prevention Capability', 'Thigh Cuffs'],
  ['Medical Prevention Capability', 'Medications'],
  ['Medical Prevention Capability', 'Supplements'],
  ['Medical Treatment Capability', 'Lenses'],
  ['Optic Disc Edema', 'Chorioretinal Folds'],
  ['Optic Disc Edema', 'Detect Ocular Structural Changes'],
  ['Optic Disc Edema', 'Retinal Nerve Fiber Layer Atrophy'],
  ['Optic Disc Edema', 'Visual Field Defect'],
  ['Optical Coherence Tomography', 'Detect Ocular Structural Changes'],
  ['Pharm (Risk)', 'Medical Prevention Capability'],
  ['Physiologic Monitoring Capability', 'Intracranial Pressure Monitoring'],
  ['Physiologic Monitoring Capability', 'Optical Coherence Tomography'],
  ['Physiologic Monitoring Capability', 'Visual Acuity Test'],
  ['Physiologic Monitoring Capability', 'Visual Fields Test'],
  ['Physiologic Monitoring Capability', 'Fundoscopy'],
  ['Physiologic Monitoring Capability', 'Ultrasound'],
  ['Refractive Error Shift', 'Detect Visual Changes'],
  ['Refractive Error Shift', 'Individual Readiness'],
  ['Retinal Nerve Fiber Layer Atrophy', 'Visual Field Defect'],
  ['Sleep (Risk)', 'Intracranial Pressure Changes'],
  ['Task Performance', 'Loss of Mission Objectives'],
  ['Thigh Cuffs', 'Vascular Congestion'],
  ['Vascular Congestion', 'Globe Flattening'],
  ['Vascular Congestion', 'Intracranial Pressure Changes'],
  ['Vascular Congestion', 'Optic Disc Edema'],
  ['Vehicle Design', 'Crew Health and Performance System'],
  ['Visual Acuity Test', 'Detect Visual Changes'],
  ['Visual Field Defect', 'Detect Visual Changes'],
  ['Visual Field Defect', 'Individual Readiness'],
  ['Visual Field Defect', 'Long Term Health Outcomes'],
  ['Visual Fields Test', 'Detect Visual Changes'],
  ['Fundoscopy', 'Detect Ocular Structural Changes'],
  ['Lenses', 'Individual Readiness'],
  ['MRI', 'Detect Brain Structural Changes'],
  ['MRI', 'Detect Ocular Structural Changes'],
  ['Medications', 'Intracranial Pressure Changes'],
  ['Medications', 'Vascular Congestion'],
  ['Supplements', 'Intracranial Pressure Changes'],
  ['Surveillance', 'Detect Long Term Health Outcomes'],
  ['Ultrasound', 'Detect Ocular Structural Changes'],
];

export const mainPathNodeIds = [
  'Altered Gravity',
  'Fluid Shifts',
  'Vascular Congestion',
  'Intracranial Pressure Changes',
  'Optic Disc Edema',
  'Globe Flattening',
  'Chorioretinal Folds',
  'Refractive Error Shift',
  'Visual Field Defect',
  'Individual Readiness',
  'Crew Capability',
  'Task Performance',
  'Loss of Mission Objectives',
  'Loss of Mission',
];

export const focusPresets = {
  all: {
    label: 'Full DAG',
    description: 'All Appendix C nodes and the optional speculative overlay.',
    nodeIds: null,
  },
  mainPath: {
    label: 'Main Path',
    description: 'Narrative chain from altered gravity to mission loss.',
    nodeIds: mainPathNodeIds,
  },
  monitoring: {
    label: 'Monitoring',
    description: 'Monitoring capability, instruments, and detection nodes.',
    nodeIds: [
      'Brain Structural Changes',
      'Detect Brain Structural Changes',
      'Detect Intracranial Pressure Changes',
      'Detect Long Term Health Outcomes',
      'Detect Ocular Structural Changes',
      'Detect Visual Changes',
      'Fundoscopy',
      'Globe Flattening',
      'Intracranial Pressure Changes',
      'Intracranial Pressure Monitoring',
      'Long Term Health Outcomes',
      'MRI',
      'Optic Disc Edema',
      'Optical Coherence Tomography',
      'Physiologic Monitoring Capability',
      'Surveillance',
      'Ultrasound',
      'Visual Acuity Test',
      'Visual Field Defect',
      'Visual Fields Test',
    ],
  },
  countermeasures: {
    label: 'Countermeasures',
    description: 'Prevention and treatment capability plus linked interventions.',
    nodeIds: [
      'Crew Health and Performance System',
      'Detect Intracranial Pressure Changes',
      'Detect Visual Changes',
      'Food and Nutrition (Risk)',
      'Intracranial Pressure Changes',
      'Lenses',
      'Lower Body Negative Pressure',
      'Medical Prevention Capability',
      'Medical Treatment Capability',
      'Medications',
      'Pharm (Risk)',
      'Supplements',
      'Thigh Cuffs',
      'Vascular Congestion',
    ],
  },
  mission: {
    label: 'Mission Impact',
    description: 'Crew readiness, recertification, health outcomes, and mission outcomes.',
    nodeIds: [
      'Chorioretinal Folds',
      'Crew Capability',
      'Detect Intracranial Pressure Changes',
      'Detect Long Term Health Outcomes',
      'Detect Ocular Structural Changes',
      'Detect Visual Changes',
      'Flight Recertification',
      'Individual Readiness',
      'Long Term Health Outcomes',
      'Loss of Mission',
      'Loss of Mission Objectives',
      'Refractive Error Shift',
      'Task Performance',
      'Visual Field Defect',
    ],
  },
  operations: {
    label: 'Ops Architecture',
    description: 'Operational design, risk domains, and capability structure around the DAG.',
    nodeIds: [
      'Astronaut Selection',
      'CO2 (Risk)',
      'Crew Health and Performance System',
      'Distance from Earth',
      'Food and Nutrition (Risk)',
      'HSIA (Risk)',
      'Individual Factors',
      'Medical Prevention Capability',
      'Medical Treatment Capability',
      'Pharm (Risk)',
      'Physiologic Monitoring Capability',
      'Sleep (Risk)',
      'Vehicle Design',
    ],
  },
};

export const primaryNarrative = [
  'Altered Gravity drives Fluid Shifts.',
  'Fluid Shifts and Individual Factors contribute to Vascular Congestion and hypothesized Intracranial Pressure Changes.',
  'These physiologic changes are linked to Optic Disc Edema, Globe Flattening, and Chorioretinal Folds.',
  'Structural changes lead to Refractive Error Shift and Visual Field Defect.',
  'Functional degradation reduces Individual Readiness, then Crew Capability, then Task Performance, then mission objectives.',
];

export const exportNote =
  'All SANS nodes and directed edges in this workspace are matched to the Appendix C DAGitty export. Edges tagged as speculative remain Appendix C-backed; the tag is only a viewer overlay used to emphasize hypothesized relationships highlighted in the paper figure and narrative.';

const speculativeEdgePairs = [
  ['CO2 (Risk)', 'Intracranial Pressure Changes'],
  ['Sleep (Risk)', 'Intracranial Pressure Changes'],
  ['Fluid Shifts', 'Brain Structural Changes'],
  ['Intracranial Pressure Changes', 'Globe Flattening'],
  ['Intracranial Pressure Changes', 'Optic Disc Edema'],
  ['Vascular Congestion', 'Globe Flattening'],
  ['Vascular Congestion', 'Intracranial Pressure Changes'],
  ['Vascular Congestion', 'Optic Disc Edema'],
  ['Intracranial Pressure Monitoring', 'Detect Intracranial Pressure Changes'],
  ['Medications', 'Intracranial Pressure Changes'],
  ['Medications', 'Vascular Congestion'],
  ['Supplements', 'Intracranial Pressure Changes'],
];

export function edgeId(source, target) {
  return `${source}=>${target}`;
}

const speculativeEdgeIds = new Set(speculativeEdgePairs.map(([source, target]) => edgeId(source, target)));

export const groupOrder = [
  'exposure',
  'linkedRisk',
  'operational',
  'physiology',
  'structural',
  'assessment',
  'monitoring',
  'prevention',
  'treatment',
  'performance',
  'outcomes',
];

export const SANS_GROUPS = groupDefinitions;

export const sansNodes = groupOrder.flatMap((group) =>
  nodesByGroup[group].map((id) => ({
    id,
    label: id,
    group,
    detail: nodeDescriptions[id] || groupDefinitions[group].description,
    evidenceSource: APPENDIX_C_SOURCE,
  }))
);

export const sansEdges = rawEdges.map(([source, target]) => ({
  id: edgeId(source, target),
  source,
  target,
  speculative: speculativeEdgeIds.has(edgeId(source, target)),
  evidenceSource: APPENDIX_C_SOURCE,
}));

export function buildGraphExport() {
  return {
    graph: 'NASA SANS Risk DAG',
    source: APPENDIX_C_SOURCE,
    note: exportNote,
    nodes: sansNodes,
    edges: sansEdges,
  };
}

export function buildPythonEdgeList() {
  const edgeLines = rawEdges.map(
    ([source, target]) => `    ("${source.replaceAll('"', '\\"')}", "${target.replaceAll('"', '\\"')}"),`
  );

  return ['sans_edges = [', ...edgeLines, ']'].join('\n');
}

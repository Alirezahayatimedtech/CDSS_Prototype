export function generateDownlinkSummary({
  caseInput,
  triageLevel,
  syndromeResult,
  differentialDiagnosis,
  biomarkerInterpretation,
  crewActions,
  escalationTriggers,
  uncertainty,
  protocolResult,
  draft = false,
}) {
  const fields = {
    'Case ID': caseInput.caseId,
    'Mission day': String(caseInput.missionDay),
    'Crew role': caseInput.crewRole,
    'Current triage': triageLevel,
    'Most likely syndrome': syndromeResult.topSyndrome.name,
    'Key symptoms': [
      caseInput.symptoms.fever ? `fever ${caseInput.symptoms.fever}/10` : null,
      caseInput.symptoms.cough ? `cough ${caseInput.symptoms.cough}/10` : null,
      caseInput.symptoms.dyspnea ? `dyspnea ${caseInput.symptoms.dyspnea}/10` : null,
      caseInput.symptoms.giBurden ? `GI burden ${caseInput.symptoms.giBurden}/10` : null,
      caseInput.symptoms.rashOrOralLesions ? `rash or lesions ${caseInput.symptoms.rashOrOralLesions}/10` : null,
      caseInput.symptoms.headacheOrNausea ? `headache or nausea ${caseInput.symptoms.headacheOrNausea}/10` : null,
      caseInput.symptoms.fatigue ? `fatigue ${caseInput.symptoms.fatigue}/10` : null,
    ]
      .filter(Boolean)
      .join(', '),
    Vitals: `SpO2 ${caseInput.vitals.oxygenSaturation}%, BP stable: ${caseInput.vitals.bloodPressureStable ? 'yes' : 'no'}, altered mental status: ${caseInput.vitals.alteredMentalStatus ? 'yes' : 'no'}, syncope: ${caseInput.vitals.syncope ? 'yes' : 'no'}`,
    'Biomarker pattern': biomarkerInterpretation.interpretation,
    'Differential diagnoses considered': differentialDiagnosis.slice(0, 4).map((item) => item.name).join(', '),
    'Actions already recommended': crewActions.join('; '),
    'Escalation triggers': escalationTriggers.join('; '),
    'Resource constraints': [
      `comm delay ${caseInput.mission.communicationDelayMinutes} min`,
      `ground support ${caseInput.mission.groundSupportAvailable ? 'available' : 'unavailable'}`,
      `CMO ${caseInput.mission.cmoAvailable ? 'available' : 'unavailable'}`,
      `med kit ${caseInput.mission.medKitStatus.toLowerCase()}`,
      `isolation ${caseInput.mission.isolationCapability.toLowerCase()}`,
    ].join(', '),
    'Uncertainty drivers': uncertainty.drivers.join('; '),
    'Questions for ground medical support': protocolResult.questionsForGround.join('; '),
  };

  const lines = [
    draft ? 'SPACEAGENT DOWNLINK DRAFT' : 'SPACEAGENT DOWNLINK SUMMARY',
    ...Object.entries(fields).map(([label, value]) => `${label}: ${value}`),
  ];

  return {
    draft,
    fields,
    text: lines.join('\n'),
  };
}

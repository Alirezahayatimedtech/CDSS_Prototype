import { boolScore, clamp, uniqueStrings } from './scoring.js';

export function scoreSeverity(caseInput, syndromeResult) {
  const { symptoms, vitals, mission } = caseInput;
  const redFlags = [];
  const rationale = [];
  const emergency =
    vitals.oxygenSaturation < 88 ||
    vitals.alteredMentalStatus ||
    vitals.syncope ||
    (!vitals.bloodPressureStable && symptoms.dyspnea >= 5);

  const urgent =
    !emergency &&
    (
      vitals.oxygenSaturation < 92 ||
      symptoms.dyspnea >= 7 ||
      (!vitals.bloodPressureStable) ||
      (vitals.dehydration && symptoms.giBurden >= 7) ||
      (vitals.rapidWorsening && (symptoms.dyspnea >= 6 || symptoms.fever >= 8 || symptoms.giBurden >= 8))
    );

  const watch =
    !emergency &&
    !urgent &&
    (
      symptoms.fever >= 4 ||
      symptoms.cough >= 4 ||
      symptoms.dyspnea >= 2 ||
      symptoms.giBurden >= 4 ||
      symptoms.rashOrOralLesions >= 4 ||
      symptoms.fatigue >= 4 ||
      mission.communicationDelayMinutes >= 10 ||
      !mission.cmoAvailable ||
      syndromeResult.topSyndrome.name !== 'Nominal / no acute concern'
    );

  if (vitals.oxygenSaturation < 88) {
    redFlags.push('Oxygen saturation below 88%.');
    rationale.push('Severe hypoxia requires emergency attention.');
  } else if (vitals.oxygenSaturation < 92) {
    redFlags.push('Oxygen saturation below 92%.');
    rationale.push('Hypoxia raises the case to urgent concern.');
  } else if (vitals.oxygenSaturation < 95) {
    rationale.push('Borderline oxygen saturation raises watch-level concern.');
  }

  if (!vitals.bloodPressureStable) {
    redFlags.push('Hemodynamic instability is reported.');
    rationale.push('Unstable blood pressure increases acuity.');
  }

  if (vitals.alteredMentalStatus) {
    redFlags.push('Altered mental status is present.');
    rationale.push('Neurologic red flags require urgent escalation.');
  }

  if (vitals.syncope) {
    redFlags.push('Syncope has occurred.');
    rationale.push('Syncope is treated as a high-risk escalation trigger.');
  }

  if (vitals.rapidWorsening) {
    redFlags.push('Symptoms are rapidly worsening.');
    rationale.push('Rapid worsening requires closer follow-up even when vitals are not yet critical.');
  }

  if (vitals.dehydration) {
    redFlags.push('Severe dehydration concern is present.');
    rationale.push('Dehydration can quickly destabilize a remote-care case.');
  }

  if (symptoms.dyspnea >= 7) {
    redFlags.push('Dyspnea burden is high.');
    rationale.push('High dyspnea burden increases escalation need.');
  }

  if (symptoms.fever >= 8) {
    redFlags.push('Persistent high fever concern.');
  }

  const normalizedScore = clamp(
    emergency
      ? 92
      : urgent
        ? 72
        : watch
          ? 42
          : 12,
    0,
    100
  );
  const level = emergency ? 'Emergency' : urgent ? 'Urgent' : watch ? 'Watch' : 'Low';

  const escalationTriggers = uniqueStrings([
    ...redFlags,
    level === 'Low' ? null : 'Any new worsening before the next reassessment interval.',
    mission.communicationDelayMinutes >= 10 ? 'Ground-contact delay increases the need for an early downlink.' : null,
  ]);

  return {
    level,
    score: normalizedScore,
    rationale: rationale.length ? rationale : ['No major red flags or destabilizing symptoms are active.'],
    redFlags: uniqueStrings(redFlags),
    escalationTriggers,
    requiresMedicalReview:
      level !== 'Low' || syndromeResult.topSyndrome.name !== 'Nominal / no acute concern' || !mission.cmoAvailable,
  };
}

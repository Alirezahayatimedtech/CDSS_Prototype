import { clamp, confidenceLabel, uniqueStrings } from './scoring.js';

export function estimateUncertainty(caseInput, executionResult) {
  const { dataCompleteness, mission, symptoms, biomarkers } = caseInput;
  const { rankedSyndromes } = executionResult.syndrome;

  let uncertaintyScore = 12;
  const drivers = [];
  const recommendedReducers = [];

  if (dataCompleteness.missingVitals) {
    uncertaintyScore += 28;
    drivers.push('Missing vital signs reduce confidence in safe triage.');
    recommendedReducers.push('Collect a complete vital-sign set before narrowing the diagnosis.');
  }

  if (dataCompleteness.missingLabs) {
    uncertaintyScore += 22;
    drivers.push('Missing labs limit confidence in biomarker-based reasoning.');
    recommendedReducers.push('Repeat or confirm the missing laboratory or point-of-care information.');
  }

  const topGap = rankedSyndromes[0].score - rankedSyndromes[1].score;
  if (topGap <= 8) {
    uncertaintyScore += 14;
    drivers.push('The top syndrome remains close to competing explanations.');
    recommendedReducers.push('Reassess the case after the next symptom or data update to separate the leading differential.');
  }

  if (
    biomarkers.inflammatoryScore >= 4 &&
    biomarkers.viralReactivationScore >= 4 &&
    symptoms.rashOrOralLesions >= 3 &&
    symptoms.cough >= 3
  ) {
    uncertaintyScore += 10;
    drivers.push('Overlapping infectious and non-infectious signals keep multiple explanations plausible.');
  }

  if (mission.communicationDelayMinutes >= 20) {
    uncertaintyScore += 10;
    drivers.push('Long communication delay limits rapid human confirmation.');
    recommendedReducers.push('Prepare a richer early downlink so delayed support has enough context.');
  }

  if (!mission.groundSupportAvailable) {
    uncertaintyScore += 8;
    drivers.push('Ground support is currently unavailable.');
  }

  if (!mission.cmoAvailable) {
    uncertaintyScore += 6;
    drivers.push('Crew Medical Officer availability is limited.');
  }

  const normalizedScore = clamp(uncertaintyScore, 0, 100);
  const uncertaintyLevel = normalizedScore >= 55 ? 'High' : normalizedScore >= 28 ? 'Moderate' : 'Low';
  const overallConfidence = clamp(1 - normalizedScore / 100, 0.05, 0.95);

  if (!recommendedReducers.length) {
    recommendedReducers.push('Continue the planned reassessment cadence and watch for new red flags.');
  }

  return {
    score: normalizedScore,
    overallConfidence,
    confidenceLabel: confidenceLabel(overallConfidence),
    uncertaintyLevel,
    drivers: uniqueStrings(drivers.length ? drivers : ['No major uncertainty drivers are active.']),
    recommendedReducers: uniqueStrings(recommendedReducers),
  };
}

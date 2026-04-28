import { bandFromNumeric, boolScore, clamp } from './scoring.js';

const SYNDROME_NAMES = {
  nominal: 'Nominal / no acute concern',
  respiratory: 'Respiratory infectious syndrome',
  viral: 'Viral reactivation syndrome',
  gi: 'Gastrointestinal infectious syndrome',
  systemic: 'Febrile systemic inflammatory syndrome',
  medication: 'Medication-related mimic',
  radiation: 'Radiation or exposure-related mimic',
  allergy: 'Allergy or non-infectious mimic',
  uncertain: 'Uncertain syndrome requiring review',
};

function makePattern(key, score, supportingEvidence, opposingEvidence) {
  return {
    key,
    name: SYNDROME_NAMES[key],
    score: clamp(Math.round(score), 0, 100),
    supportingEvidence: supportingEvidence.filter(Boolean),
    opposingEvidence: opposingEvidence.filter(Boolean),
  };
}

export function classifySyndrome(caseInput) {
  const { symptoms, vitals, biomarkers, history, dataCompleteness } = caseInput;
  const feverBand = bandFromNumeric(symptoms.fever);
  const inflammatoryBand = bandFromNumeric(biomarkers.inflammatoryScore);
  const viralBand = bandFromNumeric(biomarkers.viralReactivationScore);

  const nominalPenalty =
    symptoms.fever * 7 +
    symptoms.cough * 8 +
    symptoms.dyspnea * 10 +
    symptoms.giBurden * 8 +
    symptoms.rashOrOralLesions * 8 +
    biomarkers.inflammatoryScore * 5 +
    biomarkers.interferonScore * 3 +
    biomarkers.viralReactivationScore * 5 +
    boolScore(vitals.rapidWorsening, 20) +
    boolScore(dataCompleteness.missingVitals, 10) +
    boolScore(dataCompleteness.missingLabs, 8);

  const respiratoryScore =
    symptoms.cough * 8 +
    symptoms.dyspnea * 10 +
    symptoms.fever * 6 +
    biomarkers.inflammatoryScore * 5 +
    biomarkers.interferonScore * 4 +
    boolScore(history.closeContactExposure, 10) +
    (vitals.oxygenSaturation < 92 ? 18 : vitals.oxygenSaturation < 95 ? 8 : 0) +
    boolScore(vitals.rapidWorsening, 10);

  const viralScore =
    symptoms.rashOrOralLesions * 4 +
    biomarkers.viralReactivationScore * 10 +
    biomarkers.interferonScore * 3 +
    symptoms.fatigue * 2 +
    boolScore(history.priorReactivationHistory, 16);

  const giScore =
    symptoms.giBurden * 10 +
    symptoms.headacheOrNausea * 4 +
    symptoms.fever * 4 +
    biomarkers.inflammatoryScore * 3 +
    boolScore(history.foodWaterConcern, 18) +
    boolScore(vitals.dehydration, 16);

  const systemicScore =
    symptoms.fever * 8 +
    symptoms.fatigue * 5 +
    biomarkers.inflammatoryScore * 7 +
    biomarkers.interferonScore * 3 +
    boolScore(vitals.rapidWorsening, 12) +
    boolScore(!vitals.bloodPressureStable, 16);

  const medicationScore =
    symptoms.rashOrOralLesions * 8 +
    symptoms.headacheOrNausea * 3 +
    boolScore(history.recentMedicationChange, 24) +
    (biomarkers.inflammatoryScore <= 3 ? 12 : 0) +
    (biomarkers.viralReactivationScore <= 3 ? 8 : 0);

  const radiationScore =
    symptoms.headacheOrNausea * 8 +
    symptoms.fatigue * 4 +
    boolScore(history.radiationAlert, 24) +
    boolScore(history.habitatExposureConcern, 10) +
    (biomarkers.inflammatoryScore <= 3 ? 10 : 0);

  const allergyScore =
    symptoms.rashOrOralLesions * 6 +
    boolScore(history.recentMedicationChange, 10) +
    (symptoms.fever <= 2 ? 8 : 0) +
    (biomarkers.inflammatoryScore <= 3 ? 8 : 0);

  const patterns = [
    makePattern(
      'nominal',
      90 - nominalPenalty,
      [
        symptoms.fever <= 1 && symptoms.cough <= 1 && symptoms.dyspnea === 0
          ? 'Minimal symptom burden without acute respiratory or GI concern.'
          : null,
        inflammatoryBand === 'Low' && viralBand === 'Low'
          ? 'Biomarker pattern remains low across inflammatory and viral axes.'
          : null,
      ],
      [
        symptoms.fever >= 4 ? 'Fever burden argues against a nominal case.' : null,
        symptoms.cough >= 4 || symptoms.dyspnea >= 4
          ? 'Respiratory symptoms argue against a nominal case.'
          : null,
      ]
    ),
    makePattern(
      'respiratory',
      respiratoryScore,
      [
        symptoms.cough >= 4 ? 'Cough burden supports a respiratory infectious syndrome.' : null,
        symptoms.dyspnea >= 4 ? 'Dyspnea supports clinically meaningful respiratory involvement.' : null,
        symptoms.fever >= 4 ? 'Fever strengthens the infectious respiratory explanation.' : null,
        biomarkers.inflammatoryScore >= 4 ? 'Inflammatory biomarker signal is compatible with infection.' : null,
        history.closeContactExposure ? 'Recent close-contact exposure raises infectious concern.' : null,
      ],
      [
        symptoms.rashOrOralLesions >= 6 ? 'Prominent rash or oral lesions suggest competing syndromes.' : null,
        history.radiationAlert ? 'Radiation alert requires a non-infectious mimic check.' : null,
      ]
    ),
    makePattern(
      'viral',
      viralScore,
      [
        symptoms.rashOrOralLesions >= 4 ? 'Rash or oral lesions support viral reactivation review.' : null,
        biomarkers.viralReactivationScore >= 6 ? 'High viral-pattern biomarker signal supports reactivation.' : null,
        history.priorReactivationHistory ? 'Prior reactivation history raises recurrence concern.' : null,
      ],
      [
        symptoms.cough >= 5 ? 'Dominant cough burden suggests a respiratory syndrome instead.' : null,
        history.recentMedicationChange ? 'Recent medication change keeps a medication mimic in the differential.' : null,
      ]
    ),
    makePattern(
      'gi',
      giScore,
      [
        symptoms.giBurden >= 5 ? 'High GI burden supports a gastrointestinal syndrome.' : null,
        history.foodWaterConcern ? 'Food or water concern supports a GI exposure pathway.' : null,
        vitals.dehydration ? 'Dehydration concern raises GI severity.' : null,
      ],
      [
        symptoms.cough >= 4 ? 'Dominant respiratory symptoms weaken a GI-first explanation.' : null,
        history.radiationAlert ? 'Radiation alert requires a mimic check for nausea or headache.' : null,
      ]
    ),
    makePattern(
      'systemic',
      systemicScore,
      [
        symptoms.fever >= 6 ? 'Higher fever burden supports systemic inflammatory review.' : null,
        biomarkers.inflammatoryScore >= 6 ? 'Inflammatory biomarkers are elevated.' : null,
        vitals.rapidWorsening ? 'Rapid worsening supports escalation beyond routine monitoring.' : null,
      ],
      [
        symptoms.cough >= 6 ? 'Localized respiratory symptoms may better explain the case.' : null,
        symptoms.giBurden >= 6 ? 'Localized GI burden may better explain the case.' : null,
      ]
    ),
    makePattern(
      'medication',
      medicationScore,
      [
        history.recentMedicationChange ? 'Recent medication change strongly supports a medication-related mimic.' : null,
        symptoms.rashOrOralLesions >= 5 ? 'Rash burden fits a medication-reaction pattern.' : null,
        biomarkers.inflammatoryScore <= 3 ? 'Low inflammatory burden weakens an infectious explanation.' : null,
      ],
      [
        biomarkers.viralReactivationScore >= 6 ? 'High viral-pattern biomarker signal supports reactivation instead.' : null,
        symptoms.fever >= 5 ? 'Higher fever burden may point back toward infection or systemic inflammation.' : null,
      ]
    ),
    makePattern(
      'radiation',
      radiationScore,
      [
        history.radiationAlert ? 'Radiation alert strongly supports an exposure-related mimic review.' : null,
        symptoms.headacheOrNausea >= 5 ? 'Headache or nausea burden fits an exposure-related presentation.' : null,
        biomarkers.inflammatoryScore <= 3 ? 'Low inflammatory burden weakens an infectious explanation.' : null,
      ],
      [
        symptoms.cough >= 4 ? 'Respiratory symptoms argue for a competing syndrome.' : null,
        symptoms.rashOrOralLesions >= 5 && history.recentMedicationChange
          ? 'Medication mimic remains plausible.'
          : null,
      ]
    ),
    makePattern(
      'allergy',
      allergyScore,
      [
        symptoms.rashOrOralLesions >= 4 ? 'Rash can also be compatible with a non-infectious mimic.' : null,
        biomarkers.inflammatoryScore <= 3 ? 'Low inflammatory burden does not support a strong infectious case.' : null,
      ],
      [
        symptoms.fever >= 5 ? 'Higher fever burden is less consistent with a simple allergy-like mimic.' : null,
      ]
    ),
  ];

  const rankedWithoutUncertain = [...patterns].sort((left, right) => right.score - left.score);
  const topGap = rankedWithoutUncertain[0].score - rankedWithoutUncertain[1].score;

  const uncertainScore =
    18 +
    boolScore(dataCompleteness.missingVitals, 42) +
    boolScore(dataCompleteness.missingLabs, 36) +
    (topGap <= 8 ? 18 : 0) +
    (feverBand === 'Moderate' && inflammatoryBand === 'Moderate' ? 8 : 0) +
    (rankedWithoutUncertain[0].score < 45 ? 12 : 0);

  patterns.push(
    makePattern(
      'uncertain',
      uncertainScore,
      [
        dataCompleteness.missingVitals ? 'Missing vital signs limit safe narrowing of the diagnosis.' : null,
        dataCompleteness.missingLabs ? 'Missing labs increase uncertainty around the biomarker interpretation.' : null,
        topGap <= 8 ? 'Competing syndromes remain close in score.' : null,
      ],
      [
        !dataCompleteness.missingVitals && !dataCompleteness.missingLabs && topGap > 8
          ? 'Available data give a clearer leading syndrome.'
          : null,
      ]
    )
  );

  let rankedSyndromes = patterns.sort((left, right) => right.score - left.score);
  if (dataCompleteness.missingVitals && dataCompleteness.missingLabs) {
    const uncertainPattern = rankedSyndromes.find((pattern) => pattern.key === 'uncertain');
    rankedSyndromes = [
      uncertainPattern,
      ...rankedSyndromes.filter((pattern) => pattern.key !== 'uncertain'),
    ];
  }
  const topSyndrome = rankedSyndromes[0];
  const runnerUp = rankedSyndromes[1];
  const confidence =
    topSyndrome.score >= 70 && topSyndrome.score - runnerUp.score >= 10 && !dataCompleteness.missingVitals && !dataCompleteness.missingLabs
      ? 'High'
      : topSyndrome.score >= 50 && topSyndrome.score - runnerUp.score >= 5
        ? 'Moderate'
        : 'Low';

  return {
    topSyndrome: {
      name: topSyndrome.name,
      score: topSyndrome.score,
      confidence,
      rationale: topSyndrome.supportingEvidence[0] || 'Top syndrome selected by deterministic pattern matching.',
      supportingEvidence: topSyndrome.supportingEvidence,
      opposingEvidence: topSyndrome.opposingEvidence,
    },
    rankedSyndromes,
  };
}

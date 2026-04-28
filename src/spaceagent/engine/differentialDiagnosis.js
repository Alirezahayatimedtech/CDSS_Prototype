import { clamp } from './scoring.js';

function likelihoodFromScore(score) {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Moderate';
  return 'Low';
}

function buildCategory(name, score, supportingEvidence, opposingEvidence, missingInformation) {
  return {
    name,
    score: clamp(Math.round(score), 0, 100),
    likelihood: likelihoodFromScore(score),
    supportingEvidence: supportingEvidence.filter(Boolean),
    opposingEvidence: opposingEvidence.filter(Boolean),
    missingInformation: missingInformation.filter(Boolean),
  };
}

export function buildDifferentialDiagnosis(caseInput, syndromeResult) {
  const { symptoms, vitals, biomarkers, history, dataCompleteness } = caseInput;

  const categories = [
    buildCategory(
      'Respiratory viral infection',
      symptoms.cough * 9 + symptoms.dyspnea * 8 + symptoms.fever * 5 + biomarkers.inflammatoryScore * 4 + (history.closeContactExposure ? 12 : 0),
      [
        symptoms.cough >= 4 ? 'Cough burden is elevated.' : null,
        symptoms.dyspnea >= 4 ? 'Dyspnea increases respiratory concern.' : null,
        history.closeContactExposure ? 'Close-contact exposure supports an infectious pathway.' : null,
      ],
      [
        history.radiationAlert ? 'Radiation alert points toward a competing non-infectious explanation.' : null,
        history.recentMedicationChange ? 'Medication change keeps a non-infectious mimic in the differential.' : null,
      ],
      [
        dataCompleteness.missingVitals ? 'Repeat complete vital signs.' : null,
      ]
    ),
    buildCategory(
      'Viral reactivation',
      symptoms.rashOrOralLesions * 9 + biomarkers.viralReactivationScore * 8 + biomarkers.interferonScore * 4 + (history.priorReactivationHistory ? 16 : 0),
      [
        biomarkers.viralReactivationScore >= 6 ? 'Viral-pattern biomarker score is elevated.' : null,
        history.priorReactivationHistory ? 'There is prior reactivation history.' : null,
      ],
      [
        symptoms.cough >= 5 ? 'Respiratory localization is stronger than a pure reactivation picture.' : null,
      ],
      [
        dataCompleteness.missingLabs ? 'Repeat or confirm the viral-pattern biomarker measurement.' : null,
      ]
    ),
    buildCategory(
      'Gastrointestinal infection',
      symptoms.giBurden * 10 + symptoms.fever * 4 + (history.foodWaterConcern ? 18 : 0) + (vitals.dehydration ? 14 : 0),
      [
        symptoms.giBurden >= 5 ? 'GI burden is prominent.' : null,
        history.foodWaterConcern ? 'Food or water concern supports a GI pathway.' : null,
      ],
      [
        symptoms.cough >= 4 ? 'Respiratory burden competes with a GI-first explanation.' : null,
      ],
      [
        vitals.dehydration ? null : 'Hydration trend would further define severity.',
      ]
    ),
    buildCategory(
      'Systemic inflammatory syndrome',
      symptoms.fever * 8 + symptoms.fatigue * 4 + biomarkers.inflammatoryScore * 7 + (vitals.rapidWorsening ? 12 : 0),
      [
        biomarkers.inflammatoryScore >= 6 ? 'Inflammatory biomarker score is elevated.' : null,
        vitals.rapidWorsening ? 'Rapid worsening supports systemic concern.' : null,
      ],
      [
        symptoms.cough >= 6 ? 'A more localized respiratory explanation is strong.' : null,
        symptoms.giBurden >= 6 ? 'A more localized GI explanation is strong.' : null,
      ],
      [
        dataCompleteness.missingLabs ? 'Additional confirmatory biomarkers would refine the systemic differential.' : null,
      ]
    ),
    buildCategory(
      'Medication reaction',
      symptoms.rashOrOralLesions * 8 + (history.recentMedicationChange ? 24 : 0) + (biomarkers.inflammatoryScore <= 3 ? 12 : 0),
      [
        history.recentMedicationChange ? 'Recent medication change is present.' : null,
        symptoms.rashOrOralLesions >= 5 ? 'Rash pattern fits a medication mimic.' : null,
      ],
      [
        biomarkers.viralReactivationScore >= 6 ? 'High viral-pattern signal favors reactivation.' : null,
      ],
      [
        'Medication timing and symptom onset correlation.',
      ]
    ),
    buildCategory(
      'Allergy',
      symptoms.rashOrOralLesions * 6 + (biomarkers.inflammatoryScore <= 3 ? 10 : 0),
      [
        symptoms.rashOrOralLesions >= 4 ? 'Rash can fit an allergy-like mimic.' : null,
      ],
      [
        symptoms.fever >= 5 ? 'Higher fever is less typical for a simple allergy-like presentation.' : null,
      ],
      [
        'Exposure history for new materials, foods, or environmental triggers.',
      ]
    ),
    buildCategory(
      'Radiation or environmental exposure illness',
      symptoms.headacheOrNausea * 8 + (history.radiationAlert ? 24 : 0) + (history.habitatExposureConcern ? 12 : 0),
      [
        history.radiationAlert ? 'Mission radiation alert is active.' : null,
        symptoms.headacheOrNausea >= 5 ? 'Headache or nausea burden fits an exposure-related mimic.' : null,
      ],
      [
        symptoms.cough >= 4 ? 'Respiratory syndrome remains competitive.' : null,
      ],
      [
        'Mission exposure log confirmation and environmental readings.',
      ]
    ),
    buildCategory(
      'Habitat-related illness',
      symptoms.headacheOrNausea * 4 + symptoms.fatigue * 4 + (history.habitatExposureConcern ? 18 : 0),
      [
        history.habitatExposureConcern ? 'Habitat exposure concern is present.' : null,
      ],
      [
        biomarkers.inflammatoryScore >= 6 ? 'Elevated inflammation may favor infection or systemic inflammation.' : null,
      ],
      [
        'Environmental sensor review and cabin context.',
      ]
    ),
    buildCategory(
      'Stress, fatigue, or sleep-deprivation mimic',
      symptoms.fatigue * 5 + symptoms.headacheOrNausea * 2 + (syndromeResult.topSyndrome.name === 'Nominal / no acute concern' ? 10 : 0),
      [
        symptoms.fatigue >= 5 ? 'Fatigue burden is substantial.' : null,
      ],
      [
        symptoms.fever >= 4 ? 'Fever argues for a competing infectious or inflammatory explanation.' : null,
      ],
      [
        'Sleep and workload context.',
      ]
    ),
    buildCategory(
      'Uncertain / insufficient data',
      (dataCompleteness.missingVitals ? 35 : 0) + (dataCompleteness.missingLabs ? 30 : 0) + (syndromeResult.topSyndrome.confidence === 'Low' ? 20 : 0),
      [
        dataCompleteness.missingVitals ? 'Missing vital signs increase ambiguity.' : null,
        dataCompleteness.missingLabs ? 'Missing labs limit confidence in biomarker-based reasoning.' : null,
      ],
      [
        !dataCompleteness.missingVitals && !dataCompleteness.missingLabs
          ? 'Current data completeness is adequate for a more specific ranking.'
          : null,
      ],
      [
        'Collect missing data and repeat the assessment.',
      ]
    ),
  ];

  return categories.sort((left, right) => right.score - left.score);
}

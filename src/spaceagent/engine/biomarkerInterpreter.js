import { bandFromNumeric } from './scoring.js';

export function interpretBiomarkers(caseInput, syndromeResult) {
  const { biomarkers } = caseInput;
  const inflammatoryBand = bandFromNumeric(biomarkers.inflammatoryScore);
  const interferonBand = bandFromNumeric(biomarkers.interferonScore);
  const viralBand = bandFromNumeric(biomarkers.viralReactivationScore);

  const markers = [
    {
      label: 'Inflammatory score',
      value: biomarkers.inflammatoryScore,
      band: inflammatoryBand,
      interpretation:
        inflammatoryBand === 'High'
          ? 'Compatible with inflammatory activation.'
          : inflammatoryBand === 'Moderate'
            ? 'Mild to moderate inflammatory activation signal.'
            : 'No strong inflammatory activation signal.',
    },
    {
      label: 'Interferon or antiviral score',
      value: biomarkers.interferonScore,
      band: interferonBand,
      interpretation:
        interferonBand === 'High'
          ? 'Compatible with an antiviral-response pattern.'
          : interferonBand === 'Moderate'
            ? 'Weak to moderate antiviral-response pattern.'
            : 'No strong antiviral-response pattern.',
    },
    {
      label: 'Viral-reactivation score',
      value: biomarkers.viralReactivationScore,
      band: viralBand,
      interpretation:
        viralBand === 'High'
          ? 'Compatible with a possible reactivation-like pattern.'
          : viralBand === 'Moderate'
            ? 'Nonspecific mild viral-pattern signal.'
            : 'No strong reactivation-pattern signal.',
    },
  ];

  const overallBand =
    inflammatoryBand === 'High' || interferonBand === 'High' || viralBand === 'High'
      ? 'High'
      : inflammatoryBand === 'Moderate' || interferonBand === 'Moderate' || viralBand === 'Moderate'
        ? 'Moderate'
        : 'Low';

  const interpretation =
    viralBand === 'High'
      ? 'Biomarkers are compatible with a viral-reactivation-like pattern but are not diagnostic on their own.'
      : inflammatoryBand === 'High' && interferonBand !== 'Low'
        ? 'Biomarkers are compatible with inflammatory activation and an antiviral response pattern.'
        : inflammatoryBand === 'Moderate'
          ? 'Biomarkers suggest a mild to moderate inflammatory signal that needs clinical correlation.'
          : 'Biomarkers do not show a strong acute signal and should be interpreted cautiously.';

  const contributionToDifferential =
    syndromeResult.topSyndrome.name === 'Viral reactivation syndrome'
      ? 'Supports viral reactivation high in the differential while still requiring clinical review.'
      : syndromeResult.topSyndrome.name === 'Respiratory infectious syndrome'
        ? 'Supports infection-compatible inflammation without proving a specific pathogen.'
        : syndromeResult.topSyndrome.name === 'Radiation or exposure-related mimic'
          ? 'Low inflammatory burden helps keep non-infectious mimics in consideration.'
          : 'Provides cautious context but does not close the differential.';

  return {
    markers,
    overallBand,
    interpretation,
    limitation:
      'These derived scores are research abstractions, not validated diagnostic laboratory measurements.',
    contributionToDifferential,
  };
}

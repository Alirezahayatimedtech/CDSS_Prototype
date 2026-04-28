export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

export function average(values) {
  if (!values.length) return 0;
  return sum(values) / values.length;
}

export function uniqueStrings(values) {
  return [...new Set(values.filter(Boolean))];
}

export function boolScore(flag, points = 1) {
  return flag ? points : 0;
}

export function bandFromNumeric(value, low = 3, high = 7) {
  if (value >= high) return 'High';
  if (value >= low) return 'Moderate';
  return 'Low';
}

export function confidenceLabel(score) {
  if (score >= 0.75) return 'High';
  if (score >= 0.45) return 'Moderate';
  return 'Low';
}

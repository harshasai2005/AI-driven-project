// =========================================================
// AI Risk Scoring Engine — Weighted Multi-Factor Model
// Simulates production AI/ML underwriting behaviour
// =========================================================

const WEIGHTS = {
  incomeStability:       0.25,
  digitalEngagement:     0.20,
  employmentSeniority:   0.20,
  educationLevel:        0.15,
  alternativeBehavioral: 0.20,
};

const EDUCATION_SCORES = {
  'phd':        100, 'masters': 88, 'bachelor': 72,
  'diploma':    55,  'high_school': 38, 'other': 25,
};

const EMPLOYMENT_SCORES = {
  'salaried_govt':    100, 'salaried_private': 82,
  'self_employed':     65, 'freelancer': 52,
  'business_owner':    75, 'student': 20, 'unemployed': 5,
};

/**
 * Compute a 0–100 component score for income stability
 */
function incomeScore(data) {
  const { monthlyIncome, existingEMIs, employmentType } = data;
  if (!monthlyIncome || monthlyIncome <= 0) return 0;
  const foir = (existingEMIs || 0) / monthlyIncome;
  let base = 0;
  if (monthlyIncome >= 150000) base = 95;
  else if (monthlyIncome >= 80000)  base = 82;
  else if (monthlyIncome >= 40000)  base = 65;
  else if (monthlyIncome >= 20000)  base = 45;
  else base = 25;
  // Penalize high FOIR
  const foirPenalty = Math.min(foir * 60, 50);
  return Math.max(0, Math.min(100, base - foirPenalty));
}

/**
 * Digital engagement score from social & behavioural signals
 */
function digitalScore(data) {
  let score = 40; // base
  if (data.hasLinkedIn)     score += 18;
  if (data.linkedInConnections > 200) score += 10;
  if (data.hasGithub)       score += 12;
  if (data.hasActiveSocial) score += 8;
  if (data.avgOnlineActivity === 'high') score += 12;
  else if (data.avgOnlineActivity === 'medium') score += 6;
  return Math.min(100, score);
}

/**
 * Employment seniority — type + years of experience
 */
function employmentScore(data) {
  const typeScore = EMPLOYMENT_SCORES[data.employmentType] || 30;
  const yearsScore = Math.min(data.yearsEmployed * 5, 30);
  return Math.min(100, typeScore * 0.7 + yearsScore);
}

/**
 * Education level mapped to score
 */
function educationScore(data) {
  return EDUCATION_SCORES[data.educationLevel] || 30;
}

/**
 * Alternative behavioural signals
 */
function behavioralScore(data) {
  let score = 50;
  if (data.utilityPaymentsOnTime) score += 20;
  if (data.rentPaymentsOnTime)    score += 15;
  if (data.noInsuranceLapses)     score += 10;
  if (data.positiveAltData)       score += 5;
  return Math.min(100, score);
}

/**
 * Core risk scoring function
 * Returns: { score, band, confidence, features, recommendation }
 */
export function computeRiskScore(applicationData) {
  const components = {
    incomeStability:       incomeScore(applicationData),
    digitalEngagement:     digitalScore(applicationData),
    employmentSeniority:   employmentScore(applicationData),
    educationLevel:        educationScore(applicationData),
    alternativeBehavioral: behavioralScore(applicationData),
  };

  // Weighted aggregate
  const score = Math.round(
    Object.entries(WEIGHTS).reduce(
      (sum, [key, weight]) => sum + (components[key] * weight),
      0
    )
  );

  // Risk band
  let band, bandColor, recommendation;
  if (score >= 75) {
    band = 'LOW'; bandColor = '#10b981';
    recommendation = 'Approve — Strong profile with multiple positive indicators';
  } else if (score >= 55) {
    band = 'MEDIUM'; bandColor = '#f59e0b';
    recommendation = 'Review — Acceptable risk, consider collateral or guarantor';
  } else if (score >= 35) {
    band = 'HIGH'; bandColor = '#f97316';
    recommendation = 'Caution — Significant risk factors detected, senior review required';
  } else {
    band = 'VERY HIGH'; bandColor = '#f43f5e';
    recommendation = 'Decline — Risk profile exceeds acceptable threshold';
  }

  // Confidence based on data completeness
  const fields = Object.values(applicationData).filter(v => v !== undefined && v !== '' && v !== null);
  const confidence = Math.min(95, 50 + fields.length * 2);

  // SHAP-style feature importance
  const maxContribution = Object.entries(WEIGHTS)
    .map(([key, w]) => ({ key, contribution: components[key] * w }))
    .sort((a, b) => b.contribution - a.contribution);

  return { score, band, bandColor, confidence, components, features: maxContribution, recommendation };
}

/**
 * Generate human-readable plain-language explanation
 */
export function generateExplanation(result, data) {
  const reasons = [];
  const { components, score } = result;

  if (components.incomeStability >= 70)
    reasons.push('✅ Strong income stability relative to existing obligations');
  else if (components.incomeStability < 40)
    reasons.push('⚠️ High Fixed Obligation-to-Income Ratio (FOIR) detected');

  if (components.digitalEngagement >= 60)
    reasons.push('✅ Active professional digital presence (LinkedIn/GitHub)');
  else
    reasons.push('⚠️ Limited verifiable digital footprint');

  if (components.employmentSeniority >= 70)
    reasons.push('✅ Stable employment with proven tenure');
  else
    reasons.push('⚠️ Employment type or tenure presents moderate risk');

  if (components.educationLevel >= 70)
    reasons.push('✅ Higher education credential positively impacts creditworthiness');

  if (components.alternativeBehavioral >= 70)
    reasons.push('✅ Consistent utility and rent payment history');
  else
    reasons.push('⚠️ Alternative payment signals are insufficient');

  return {
    summary: result.recommendation,
    reasons,
    fairnessNote: 'This score is computed using consented alternative data only. Protected characteristics (gender, caste, religion) are excluded per DPDP Act 2023.',
  };
}

// =========================================================
// AI Risk Scoring Engine — Backend (Node.js)
// =========================================================

const WEIGHTS = {
    incomeStability: 0.25,
    digitalEngagement: 0.20,
    employmentSeniority: 0.20,
    educationLevel: 0.15,
    alternativeBehavioral: 0.20,
};

const EDUCATION_SCORES = {
    phd: 100, masters: 88, bachelor: 72,
    diploma: 55, high_school: 38, other: 25,
};

const EMPLOYMENT_SCORES = {
    salaried_govt: 100, salaried_private: 82,
    self_employed: 65, freelancer: 52,
    business_owner: 75, student: 20, unemployed: 5,
};

function incomeScore(d) {
    if (!d.monthlyIncome || d.monthlyIncome <= 0) return 0;
    const foir = (d.existingEMIs || 0) / d.monthlyIncome;
    let base = d.monthlyIncome >= 150000 ? 95 : d.monthlyIncome >= 80000 ? 82 : d.monthlyIncome >= 40000 ? 65 : d.monthlyIncome >= 20000 ? 45 : 25;
    return Math.max(0, Math.min(100, base - Math.min(foir * 60, 50)));
}

function digitalScore(d) {
    let s = 40;
    if (d.hasLinkedIn) s += 18;
    if (d.linkedInConnections > 200) s += 10;
    if (d.hasGithub) s += 12;
    if (d.hasActiveSocial) s += 8;
    if (d.avgOnlineActivity === 'high') s += 12;
    else if (d.avgOnlineActivity === 'medium') s += 6;
    return Math.min(100, s);
}

function employmentScore(d) {
    return Math.min(100, (EMPLOYMENT_SCORES[d.employmentType] || 30) * 0.7 + Math.min((d.yearsEmployed || 0) * 5, 30));
}

function educationScore(d) {
    return EDUCATION_SCORES[d.educationLevel] || 30;
}

function behavioralScore(d) {
    let s = 50;
    if (d.utilityPaymentsOnTime) s += 20;
    if (d.rentPaymentsOnTime) s += 15;
    if (d.noInsuranceLapses) s += 10;
    if (d.positiveAltData) s += 5;
    return Math.min(100, s);
}

function computeRiskScore(data) {
    const components = {
        incomeStability: incomeScore(data),
        digitalEngagement: digitalScore(data),
        employmentSeniority: employmentScore(data),
        educationLevel: educationScore(data),
        alternativeBehavioral: behavioralScore(data),
    };

    const score = Math.round(
        Object.entries(WEIGHTS).reduce((sum, [k, w]) => sum + components[k] * w, 0)
    );

    let band, bandColor, recommendation;
    if (score >= 75) { band = 'LOW'; bandColor = '#10b981'; recommendation = 'Approve — Strong profile with multiple positive indicators'; }
    else if (score >= 55) { band = 'MEDIUM'; bandColor = '#f59e0b'; recommendation = 'Review — Acceptable risk, consider collateral or guarantor'; }
    else if (score >= 35) { band = 'HIGH'; bandColor = '#f97316'; recommendation = 'Caution — Significant risk factors detected, senior review required'; }
    else { band = 'VERY HIGH'; bandColor = '#f43f5e'; recommendation = 'Decline — Risk profile exceeds acceptable threshold'; }

    const fields = Object.values(data).filter(v => v !== undefined && v !== '' && v !== null);
    const confidence = Math.min(95, 50 + fields.length * 2);

    const features = Object.entries(WEIGHTS)
        .map(([key, w]) => ({ key, contribution: components[key] * w }))
        .sort((a, b) => b.contribution - a.contribution);

    return { score, band, bandColor, confidence, components, features, recommendation };
}

function generateExplanation(result, data) {
    const reasons = [];
    const { components } = result;
    if (components.incomeStability >= 70) reasons.push('✅ Strong income stability relative to existing obligations');
    else if (components.incomeStability < 40) reasons.push('⚠️ High Fixed Obligation-to-Income Ratio (FOIR) detected');
    if (components.digitalEngagement >= 60) reasons.push('✅ Active professional digital presence (LinkedIn/GitHub)');
    else reasons.push('⚠️ Limited verifiable digital footprint');
    if (components.employmentSeniority >= 70) reasons.push('✅ Stable employment with proven tenure');
    else reasons.push('⚠️ Employment type or tenure presents moderate risk');
    if (components.educationLevel >= 70) reasons.push('✅ Higher education credential positively impacts creditworthiness');
    if (components.alternativeBehavioral >= 70) reasons.push('✅ Consistent utility and rent payment history');
    else reasons.push('⚠️ Alternative payment signals are insufficient');
    return {
        summary: result.recommendation,
        reasons,
        fairnessNote: 'This score is computed using consented alternative data only. Protected characteristics excluded per DPDP Act 2023.',
    };
}

module.exports = { computeRiskScore, generateExplanation };

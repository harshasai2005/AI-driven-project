// =========================================================
// Fraud Detection Engine — Rule-Based Anomaly Detection
// =========================================================

/**
 * Run fraud checks on an application.
 * Returns { isFlagged, flags, riskLevel, score }
 */
export function runFraudChecks(application) {
    const flags = [];

    // 1. Income-to-Loan mismatch
    const loanToIncome = (application.loanAmount || 0) / ((application.monthlyIncome || 1) * 12);
    if (loanToIncome > 10) {
        flags.push({
            code: 'INCOME_LOAN_MISMATCH', severity: 'HIGH',
            message: `Loan amount (₹${application.loanAmount?.toLocaleString()}) is ${loanToIncome.toFixed(1)}x annual income — abnormally high.`
        });
    } else if (loanToIncome > 6) {
        flags.push({
            code: 'INCOME_LOAN_ELEVATED', severity: 'MEDIUM',
            message: `Loan-to-income ratio (${loanToIncome.toFixed(1)}x) exceeds recommended 6x threshold.`
        });
    }

    // 2. FOIR too high
    const foir = (application.existingEMIs || 0) / (application.monthlyIncome || 1);
    if (foir > 0.65) {
        flags.push({
            code: 'HIGH_FOIR', severity: 'HIGH',
            message: `FOIR of ${(foir * 100).toFixed(0)}% exceeds 65% threshold — debt burden is unsustainable.`
        });
    }

    // 3. Document completeness
    const uploadedDocs = application.uploadedDocs || [];
    if (uploadedDocs.length < 2) {
        flags.push({
            code: 'INCOMPLETE_DOCS', severity: 'MEDIUM',
            message: 'Fewer than 2 documents uploaded. Identity verification incomplete.'
        });
    }

    // 4. Age / employment mismatch
    const age = application.age || 30;
    if (age < 21) {
        flags.push({
            code: 'UNDERAGE', severity: 'HIGH',
            message: 'Applicant age below minimum lending threshold of 21.'
        });
    }
    if (age > 65 && application.employmentType === 'unemployed') {
        flags.push({
            code: 'RETIREMENT_RISK', severity: 'MEDIUM',
            message: 'Applicant age and employment status suggest post-retirement with no income source.'
        });
    }

    // 5. Employment/education mismatch
    if (application.employmentType === 'unemployed' && application.monthlyIncome > 50000) {
        flags.push({
            code: 'EMPLOYMENT_INCOME_MISMATCH', severity: 'HIGH',
            message: 'Declared income of ₹' + application.monthlyIncome?.toLocaleString() + '/mo while employment status is unemployed.'
        });
    }

    // 6. Velocity — multiple sub-30-day applications (simulated)
    if (application.previousApplications > 2) {
        flags.push({
            code: 'HIGH_VELOCITY', severity: 'MEDIUM',
            message: `${application.previousApplications} loan applications detected in the past 30 days — velocity anomaly.`
        });
    }

    // Compute fraud risk level
    const highCount = flags.filter(f => f.severity === 'HIGH').length;
    const medCount = flags.filter(f => f.severity === 'MEDIUM').length;
    const fraudScore = highCount * 30 + medCount * 12;

    let riskLevel;
    if (fraudScore >= 60) riskLevel = 'CRITICAL';
    else if (fraudScore >= 30) riskLevel = 'HIGH';
    else if (fraudScore >= 12) riskLevel = 'MEDIUM';
    else riskLevel = 'LOW';

    return {
        isFlagged: flags.length > 0,
        flags,
        fraudScore: Math.min(100, fraudScore),
        riskLevel,
    };
}

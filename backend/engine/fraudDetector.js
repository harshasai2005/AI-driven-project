function runFraudChecks(application) {
    const flags = [];

    const loanToIncome = (application.loanAmount || 0) / ((application.monthlyIncome || 1) * 12);
    if (loanToIncome > 10) {
        flags.push({
            code: 'INCOME_LOAN_MISMATCH', severity: 'HIGH',
            message: `Loan amount is ${loanToIncome.toFixed(1)}x annual income — abnormally high.`
        });
    } else if (loanToIncome > 6) {
        flags.push({
            code: 'INCOME_LOAN_ELEVATED', severity: 'MEDIUM',
            message: `Loan-to-income ratio (${loanToIncome.toFixed(1)}x) exceeds recommended 6x threshold.`
        });
    }

    const foir = (application.existingEMIs || 0) / (application.monthlyIncome || 1);
    if (foir > 0.65) {
        flags.push({
            code: 'HIGH_FOIR', severity: 'HIGH',
            message: `FOIR of ${(foir * 100).toFixed(0)}% exceeds 65% threshold.`
        });
    }

    const uploadedDocs = application.uploadedDocs || [];
    if (uploadedDocs.length < 2) {
        flags.push({
            code: 'INCOMPLETE_DOCS', severity: 'MEDIUM',
            message: 'Fewer than 2 documents uploaded. Identity verification incomplete.'
        });
    }

    const age = application.age || 30;
    if (age < 21) {
        flags.push({ code: 'UNDERAGE', severity: 'HIGH', message: 'Applicant age below minimum lending threshold of 21.' });
    }
    if (age > 65 && application.employmentType === 'unemployed') {
        flags.push({ code: 'RETIREMENT_RISK', severity: 'MEDIUM', message: 'Post-retirement with no declared income source.' });
    }

    if (application.employmentType === 'unemployed' && application.monthlyIncome > 50000) {
        flags.push({
            code: 'EMPLOYMENT_INCOME_MISMATCH', severity: 'HIGH',
            message: `Declared income of ₹${application.monthlyIncome}/mo while employment status is unemployed.`
        });
    }

    if ((application.previousApplications || 0) > 2) {
        flags.push({
            code: 'HIGH_VELOCITY', severity: 'MEDIUM',
            message: `${application.previousApplications} loan applications in the past 30 days — velocity anomaly.`
        });
    }

    const highCount = flags.filter(f => f.severity === 'HIGH').length;
    const medCount = flags.filter(f => f.severity === 'MEDIUM').length;
    const fraudScore = Math.min(100, highCount * 30 + medCount * 12);
    const riskLevel = fraudScore >= 60 ? 'CRITICAL' : fraudScore >= 30 ? 'HIGH' : fraudScore >= 12 ? 'MEDIUM' : 'LOW';

    return { isFlagged: flags.length > 0, flags, fraudScore, riskLevel };
}

module.exports = { runFraudChecks };

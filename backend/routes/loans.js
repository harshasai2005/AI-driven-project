const express = require('express');
const crypto = require('crypto');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { computeRiskScore, generateExplanation } = require('../engine/riskEngine');
const { runFraudChecks } = require('../engine/fraudDetector');

const router = express.Router();

function parseApp(row) {
    if (!row) return null;
    return {
        id: row.id,
        customerId: row.customer_id,
        customerName: row.customer_name,
        loanAmount: row.loan_amount,
        purpose: row.purpose,
        tenure: row.tenure,
        monthlyIncome: row.monthly_income,
        existingEMIs: row.existing_emis,
        employmentType: row.employment_type,
        yearsEmployed: row.years_employed,
        educationLevel: row.education_level,
        age: row.age,
        hasLinkedIn: !!row.has_linkedin,
        linkedInConnections: row.linkedin_connections,
        hasGithub: !!row.has_github,
        hasActiveSocial: !!row.has_active_social,
        avgOnlineActivity: row.avg_online_activity,
        utilityPaymentsOnTime: !!row.utility_payments,
        rentPaymentsOnTime: !!row.rent_payments,
        noInsuranceLapses: !!row.no_insurance_lapses,
        positiveAltData: !!row.positive_alt_data,
        previousApplications: row.previous_applications,
        uploadedDocs: JSON.parse(row.uploaded_docs || '[]'),
        riskResult: {
            score: row.risk_score,
            band: row.risk_band,
            bandColor: row.risk_band_color,
            confidence: row.risk_confidence,
            components: JSON.parse(row.risk_components || '{}'),
            features: JSON.parse(row.risk_features || '[]'),
            recommendation: row.risk_recommendation,
        },
        explanation: {
            summary: row.explanation_summary,
            reasons: JSON.parse(row.explanation_reasons || '[]'),
            fairnessNote: 'This score uses consented alternative data only. Protected characteristics excluded per DPDP Act 2023.',
        },
        fraud: {
            isFlagged: !!row.fraud_flagged,
            flags: JSON.parse(row.fraud_flags || '[]'),
            fraudScore: row.fraud_score,
            riskLevel: row.fraud_level,
        },
        status: row.status,
        adminNotes: row.admin_notes,
        submittedAt: row.submitted_at,
        reviewedAt: row.reviewed_at,
    };
}

// GET /api/loans
router.get('/', authMiddleware, async (req, res) => {
    try {
        const rows = req.user.role === 'admin'
            ? await db.allAsync('SELECT * FROM loan_applications ORDER BY submitted_at DESC')
            : await db.allAsync('SELECT * FROM loan_applications WHERE customer_id = ? ORDER BY submitted_at DESC', [req.user.id]);
        res.json(rows.map(parseApp));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch loans' });
    }
});

// POST /api/loans
router.post('/', authMiddleware, async (req, res) => {
    try {
        const d = req.body;
        const id = 'APP-' + crypto.randomBytes(4).toString('hex').toUpperCase();

        const engineData = {
            monthlyIncome: Number(d.monthlyIncome), existingEMIs: Number(d.existingEMIs || 0),
            employmentType: d.employmentType, yearsEmployed: Number(d.yearsEmployed || 0),
            educationLevel: d.educationLevel, age: Number(d.age),
            hasLinkedIn: !!d.hasLinkedIn, linkedInConnections: Number(d.linkedInConnections || 0),
            hasGithub: !!d.hasGithub, hasActiveSocial: !!d.hasActiveSocial,
            avgOnlineActivity: d.avgOnlineActivity || 'medium',
            utilityPaymentsOnTime: !!d.utilityPaymentsOnTime, rentPaymentsOnTime: !!d.rentPaymentsOnTime,
            noInsuranceLapses: !!d.noInsuranceLapses, positiveAltData: !!d.positiveAltData,
            previousApplications: Number(d.previousApplications || 0),
            loanAmount: Number(d.loanAmount), uploadedDocs: d.uploadedDocs || [],
        };

        const risk = computeRiskScore(engineData);
        const expl = generateExplanation(risk, engineData);
        const fraud = runFraudChecks(engineData);

        await db.runAsync(
            `INSERT INTO loan_applications
       (id,customer_id,customer_name,loan_amount,purpose,tenure,
        monthly_income,existing_emis,employment_type,years_employed,
        education_level,age,has_linkedin,linkedin_connections,has_github,
        has_active_social,avg_online_activity,utility_payments,rent_payments,
        no_insurance_lapses,positive_alt_data,previous_applications,uploaded_docs,
        risk_score,risk_band,risk_band_color,risk_confidence,risk_components,
        risk_features,risk_recommendation,explanation_summary,explanation_reasons,
        fraud_flagged,fraud_flags,fraud_score,fraud_level,status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                id, req.user.id, req.user.name, Number(d.loanAmount), d.purpose, Number(d.tenure),
                engineData.monthlyIncome, engineData.existingEMIs, d.employmentType, engineData.yearsEmployed,
                d.educationLevel, engineData.age,
                engineData.hasLinkedIn ? 1 : 0, engineData.linkedInConnections,
                engineData.hasGithub ? 1 : 0, engineData.hasActiveSocial ? 1 : 0, engineData.avgOnlineActivity,
                engineData.utilityPaymentsOnTime ? 1 : 0, engineData.rentPaymentsOnTime ? 1 : 0,
                engineData.noInsuranceLapses ? 1 : 0, engineData.positiveAltData ? 1 : 0,
                engineData.previousApplications, JSON.stringify(engineData.uploadedDocs),
                risk.score, risk.band, risk.bandColor, risk.confidence,
                JSON.stringify(risk.components), JSON.stringify(risk.features), risk.recommendation,
                expl.summary, JSON.stringify(expl.reasons),
                fraud.isFlagged ? 1 : 0, JSON.stringify(fraud.flags), fraud.fraudScore, fraud.riskLevel,
                'Submitted',
            ]
        );

        const saved = await db.getAsync('SELECT * FROM loan_applications WHERE id = ?', [id]);
        res.status(201).json(parseApp(saved));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

// PATCH /api/loans/:id/status — admin only
router.patch('/:id/status', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        if (!['Approved', 'Rejected', 'Under Review'].includes(status))
            return res.status(400).json({ error: 'Invalid status' });

        await db.runAsync(
            'UPDATE loan_applications SET status=?, admin_notes=?, reviewed_at=datetime("now") WHERE id=?',
            [status, adminNotes || null, req.params.id]
        );

        const updated = await db.getAsync('SELECT * FROM loan_applications WHERE id = ?', [req.params.id]);
        if (!updated) return res.status(404).json({ error: 'Application not found' });
        res.json(parseApp(updated));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Status update failed' });
    }
});

module.exports = router;

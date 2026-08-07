const express = require('express');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/stats
router.get('/stats', authMiddleware, adminOnly, async (req, res) => {
    try {
        const [total, approved, rejected, pending, flagged, avgRow, custCount,
            lowRisk, medRisk, highRisk, vhRisk] = await Promise.all([
                db.getAsync('SELECT COUNT(*) as c FROM loan_applications'),
                db.getAsync("SELECT COUNT(*) as c FROM loan_applications WHERE status='Approved'"),
                db.getAsync("SELECT COUNT(*) as c FROM loan_applications WHERE status='Rejected'"),
                db.getAsync("SELECT COUNT(*) as c FROM loan_applications WHERE status IN ('Submitted','Under Review')"),
                db.getAsync('SELECT COUNT(*) as c FROM loan_applications WHERE fraud_flagged=1'),
                db.getAsync('SELECT AVG(risk_score) as a FROM loan_applications'),
                db.getAsync("SELECT COUNT(*) as c FROM users WHERE role='customer'"),
                db.getAsync('SELECT COUNT(*) as c FROM loan_applications WHERE risk_score >= 75'),
                db.getAsync('SELECT COUNT(*) as c FROM loan_applications WHERE risk_score >= 55 AND risk_score < 75'),
                db.getAsync('SELECT COUNT(*) as c FROM loan_applications WHERE risk_score >= 35 AND risk_score < 55'),
                db.getAsync('SELECT COUNT(*) as c FROM loan_applications WHERE risk_score < 35'),
            ]);
        res.json({
            total: total.c, approved: approved.c, rejected: rejected.c, pending: pending.c,
            flagged: flagged.c, avgScore: Math.round(avgRow.a || 0), custCount: custCount.c,
            lowRisk: lowRisk.c, medRisk: medRisk.c, highRisk: highRisk.c, vhRisk: vhRisk.c,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// GET /api/admin/customers
router.get('/customers', authMiddleware, adminOnly, async (req, res) => {
    try {
        const customers = await db.allAsync("SELECT * FROM users WHERE role='customer'");
        const result = await Promise.all(customers.map(async u => {
            const apps = await db.allAsync(
                'SELECT * FROM loan_applications WHERE customer_id=? ORDER BY submitted_at DESC', [u.id]
            );
            const totalRequested = apps.reduce((s, a) => s + (a.loan_amount || 0), 0);
            const approved = apps.filter(a => a.status === 'Approved').length;
            const avgScore = apps.length ? Math.round(apps.reduce((s, a) => s + (a.risk_score || 0), 0) / apps.length) : 0;
            const hasFraud = apps.some(a => a.fraud_flagged);
            return {
                id: u.id, name: u.name, email: u.email, avatar: u.avatar, createdAt: u.created_at,
                applicationCount: apps.length, approved, avgScore, totalRequested, hasFraud,
                latestStatus: apps[0]?.status || '—',
                latestApp: apps[0] ? {
                    id: apps[0].id, loanAmount: apps[0].loan_amount, purpose: apps[0].purpose,
                    tenure: apps[0].tenure, status: apps[0].status,
                    riskScore: apps[0].risk_score, riskBand: apps[0].risk_band, riskBandColor: apps[0].risk_band_color,
                } : null,
            };
        }));
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
});

module.exports = router;

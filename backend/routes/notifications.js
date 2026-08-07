const express = require('express');
const db = require('../db');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications — unread notifications for admins
router.get('/', authMiddleware, adminOnly, async (req, res) => {
    try {
        const notifs = await db.allAsync(
            'SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50'
        );
        res.json(notifs.map(n => ({ ...n, payload: JSON.parse(n.payload || '{}'), isRead: !!n.is_read })));
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// PATCH /api/notifications/:id/read — mark one as read
router.patch('/:id/read', authMiddleware, adminOnly, async (req, res) => {
    try {
        await db.runAsync('UPDATE notifications SET is_read=1 WHERE id=?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to mark read' });
    }
});

// PATCH /api/notifications/read-all — mark all as read
router.patch('/read-all/mark', authMiddleware, adminOnly, async (req, res) => {
    try {
        await db.runAsync('UPDATE notifications SET is_read=1');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to mark all read' });
    }
});

// POST /api/notifications/approve-customer — admin approves a new customer
router.post('/approve-customer', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { userId, notifId } = req.body;
        // Approve the user
        await db.runAsync('UPDATE users SET approved=1 WHERE id=?', [userId]);
        // Mark notification as read
        if (notifId) await db.runAsync('UPDATE notifications SET is_read=1 WHERE id=?', [notifId]);
        const user = await db.getAsync('SELECT id, name, email, role, avatar, approved FROM users WHERE id=?', [userId]);
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ error: 'Failed to approve customer' });
    }
});

module.exports = router;

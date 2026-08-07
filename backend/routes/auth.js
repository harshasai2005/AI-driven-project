const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');
const { SECRET } = require('../middleware/auth');

const router = express.Router();
const ADMIN_CODE = 'LENDAI-ADMIN-2026';

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role = 'customer', adminCode } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ error: 'name, email, and password are required' });

        if (role === 'admin' && adminCode !== ADMIN_CODE) {
            return res.status(403).json({ error: 'Invalid admin code.' });
        }

        const existing = await db.getAsync('SELECT id FROM users WHERE email = ?', [email]);
        if (existing) return res.status(409).json({ error: 'Email already registered' });

        const hash = bcrypt.hashSync(password, 10);
        const id = (role === 'admin' ? 'admin-' : 'cust-') + crypto.randomBytes(4).toString('hex');
        const avatar = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        // Admins are auto-approved; customers start as pending (approved=0)
        const approved = role === 'admin' ? 1 : 0;

        await db.runAsync(
            'INSERT INTO users (id, name, email, password, role, avatar, approved) VALUES (?,?,?,?,?,?,?)',
            [id, name, email, hash, role, avatar, approved]
        );

        // Create notification for admin when customer registers
        if (role === 'customer') {
            const notifId = 'notif-' + crypto.randomBytes(4).toString('hex');
            await db.runAsync(
                'INSERT INTO notifications (id, type, title, message, payload) VALUES (?,?,?,?,?)',
                [
                    notifId,
                    'NEW_CUSTOMER',
                    `New customer registered: ${name}`,
                    `${name} (${email}) has registered and is awaiting account approval.`,
                    JSON.stringify({ userId: id, userName: name, userEmail: email, userAvatar: avatar }),
                ]
            );
        }

        const token = jwt.sign({ id, name, email, role, avatar }, SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id, name, email, role, avatar, approved } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password, adminCode } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'email and password required' });

        const user = await db.getAsync('SELECT * FROM users WHERE email = ?', [email]);
        if (!user || !bcrypt.compareSync(password, user.password))
            return res.status(401).json({ error: 'Invalid email or password' });

        if (user.role === 'admin' && adminCode !== ADMIN_CODE) {
            return res.status(401).json({ error: 'Valid Admin Code is required to sign in as an admin.' });
        }

        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
            SECRET,
            { expiresIn: '7d' }
        );
        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, approved: user.approved },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;

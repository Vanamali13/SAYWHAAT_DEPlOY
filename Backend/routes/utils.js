const express = require('express');
const router = express.Router();
const axios = require('axios');

// GET /api/utils/ip
router.get('/ip', async (req, res) => {
    try {
        // Try to get client IP from headers first (likely passed by proxy)
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // Clean IP: x-forwarded-for can be a list "client, proxy1, proxy2..."
        let ip = clientIp;
        if (ip && typeof ip === 'string' && ip.includes(',')) {
            ip = ip.split(',')[0].trim();
        }

        // Check if local (::1, 127.0.0.1)
        const isLocal = !ip || ip.includes('127.0.0.1') || ip.includes('::1');

        // Construct URL
        // If local, calling ipapi.co/json/ returns the server's public IP (which is fine for dev)
        // If production, we want the USER's IP.
        let url = 'https://ipapi.co/json/';
        if (!isLocal && ip) {
            url = `https://ipapi.co/${ip}/json/`;
        }

        const response = await axios.get(url);
        res.json(response.data);

    } catch (err) {
        console.error("IP Lookup Failed:", err.message);
        // Return default fallback to avoid frontend crash
        res.status(500).json({ error: "Failed to fetch IP data", code: "USD" });
    }
});

module.exports = router;

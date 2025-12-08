const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Batch = require('../models/Batch');

// @route   GET /api/batches/my-batches
// @desc    Get batches assigned to the current user
// @access  Private (Batch Staff)
router.get('/my-batches', auth, async (req, res) => {
    try {
        const batches = await Batch.find({ assigned_to: req.user.id })
            .sort({ createdAt: -1 });
        res.json(batches);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PATCH /api/batches/:id/status
// @desc    Update batch status and notes
// @access  Private (Batch Staff)
router.patch('/:id/status', auth, async (req, res) => {
    const { status, notes, proofs } = req.body;
    try {
        const batch = await Batch.findById(req.params.id);
        if (!batch) {
            return res.status(404).json({ msg: 'Batch not found' });
        }

        if (batch.assigned_to.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        if (status) batch.status = status;
        if (notes) batch.notes = notes;
        if (proofs) batch.proofs = proofs; // Save proof URLs

        await batch.save();
        res.json(batch);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

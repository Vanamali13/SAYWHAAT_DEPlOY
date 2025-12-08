const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

// @route   POST /api/upload
// @desc    Upload multiple files
// @access  Private
router.post('/', auth, (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ msg: err });
        } else {
            if (req.files == undefined) {
                return res.status(400).json({ msg: 'No file selected!' });
            } else {
                const fileUrls = req.files.map(file => `/uploads/${file.filename}`);
                res.json({
                    msg: 'File uploaded!',
                    files: fileUrls
                });
            }
        }
    });
});

module.exports = router;

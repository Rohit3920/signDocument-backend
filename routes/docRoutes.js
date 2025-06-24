const express = require('express');
const { uploadPdf } = require('../controllers/docController');
const { uploadMiddleware } = require('../middleware/uploadMiddleware');

const router = express.Router();
router.post('/upload', uploadMiddleware, uploadPdf);

module.exports = router;
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const signatureController = require('../controllers/signController');

router.post('/', auth, signatureController.saveSignaturePosition);

router.get('/:documentId', auth, signatureController.getSignaturesForDocument);

module.exports = router;
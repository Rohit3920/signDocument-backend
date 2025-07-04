const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const signatureController = require('../controllers/signController');

router.post('/',  signatureController.saveSignaturePosition);

router.get('/:documentId',signatureController.getSignaturesForDocument);

router.post('/finalize-and-download/:documentId', signatureController.finalizeDocument);

module.exports = router;
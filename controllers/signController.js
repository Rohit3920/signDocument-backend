const Signature = require('../models/SignModel');
const Document = require('../models/docModel');

exports.saveSignaturePosition = async (req, res) => {
    const { documentId, x, y, page } = req.body;
    const userId = req.user.id;

    try {
        if (!documentId || x == null || y == null || page == null) {
            return res.status(400).json({ message: 'Missing required signature position data' });
        }

        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const newSignature = new Signature({
            documentId,
            userId,
            x,
            y,
            page,
            status: 'pending',
        });

        await newSignature.save();
        res.status(201).json({ message: 'Signature position saved successfully', signature: newSignature });

    } catch (error) {
        console.error('Error saving signature position:', error);
        res.status(500).json({ message: 'Server error saving signature position' });
    }
};

exports.getSignaturesForDocument = async (req, res) => {
    const { documentId } = req.params;
    const userId = req.user.id;

    try {
        const signatures = await Signature.find({ documentId, userId });
        res.json(signatures);
    } catch (error) {
        console.error('Error fetching signatures for document:', error);
        res.status(500).json({ message: 'Server error fetching signatures' });
    }
};
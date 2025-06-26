const Document = require('../models/docModel');
const path = require('path');
const fs = require('fs');

exports.uploadDocument = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log(req.user)

    try {
        const newDocument = new Document({
            userId: req.user.id,
            fileName: req.file.originalname,
            filePath: req.file.path,
        });

        await newDocument.save();
        res.status(201).json({ message: 'Document uploaded successfully', document: newDocument });
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ message: 'Server error during upload' });
    }
};

exports.getDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ userId: req.user.id }).sort({ uploadDate: -1 });
        res.json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ message: 'Server error fetching documents' });
    }
};

exports.getDocumentById = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        if (document.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const filePath = path.join(__dirname, '..', document.filePath); 
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.status(404).json({ message: 'File not found on server storage' });
        }
    } catch (error) {
        console.error('Error getting document by ID:', error);
        res.status(500).json({ message: 'Server error getting document' });
    }
};

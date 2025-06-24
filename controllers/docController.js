const Document = require('../models/docModel');

const uploadPdf = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No PDF file uploaded. Please select a .pdf file.' });
        }

        const { originalname, filename, path: tempFilePath, mimetype, size } = req.file;

        const filePathForDb = `uploads/${filename}`;

        const newDocument = new Document({
            fileName: originalname,
            filePath: filePathForDb,
            mimetype: mimetype,
            size: size,
        });

        await newDocument.save();

        res.status(201).json({
            message: 'PDF file uploaded successfully',
            document: {
                id: newDocument._id,
                fileName: newDocument.fileName,
                filePath: newDocument.filePath,
                mimetype: newDocument.mimetype,
                size: newDocument.size,
                uploadDate: newDocument.uploadDate
            },
        });
    } catch (error) {
        console.error('Error during file upload:', error);

        if (error.message === 'Only PDF files are allowed!') {
            return res.status(400).json({ message: 'Invalid file type. ' + error.message });
        } else if (error.message === 'File too large') {
            return res.status(400).json({ message: 'File too large. Maximum size is 5 MB.' });
        }
        res.status(500).json({ message: 'Server error: Could not upload file.' });
    }
};

module.exports = { uploadPdf };
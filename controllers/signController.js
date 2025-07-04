const Signature = require('../models/SignModel');
const Document = require('../models/docModel');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

exports.saveSignaturePosition = async (req, res) => {
    const { documentId, x, y, page, type, userId, signValue } = req.body;

    try {
        if (!documentId || x == null || y == null || page == null || !type) {
            return res.status(400).json({ message: 'Missing required signature position data: documentId, x, y, page, and type are mandatory.' });
        }
        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: 'Document not found.' });
        }
        const newSignature = new Signature({
            documentId,
            userId,
            signValue,
            x,
            y,
            page,
            type,
            status: 'pending',
        });
        await newSignature.save();
        res.status(201).json({ message: 'Signature field saved successfully', signature: newSignature });
    } catch (error) {
        console.error('Error saving signature field position:', error);
        res.status(500).json({ message: 'Server error saving signature field position. Please try again.' });
    }
};

exports.getSignaturesForDocument = async (req, res) => {
    const { documentId } = req.params;

    try {
        const signatures = await Signature.find({ documentId });
        res.json(signatures);
    } catch (error) {
        console.error('Error fetching signatures for document:', error);
        res.status(500).json({ message: 'Server error fetching signatures. Please try again.' });
    }
};

exports.finalizeDocument = async (req, res) => {
    const { signaturesToFinalize } = req.body;
    // Check if signaturesToFinalize is valid and has at least one item
    const userId = signaturesToFinalize && signaturesToFinalize.length > 0 ? signaturesToFinalize[0].userId : null;

    if (!signaturesToFinalize || !Array.isArray(signaturesToFinalize) || signaturesToFinalize.length === 0) {
        return res.status(400).json({ message: 'No signatures to finalize provided.' });
    }

    const documentId = signaturesToFinalize[0].documentId;
    if (!documentId) {
        return res.status(400).json({ message: 'Document ID is required within signature data.' });
    }

    try {
        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ message: 'Document not found.' });
        }

        // Ensure the user trying to finalize owns the document or has permission
        if (document.userId.toString() !== userId) {
            return res.status(403).json({ message: 'Access denied: You do not have permission to finalize this document.' });
        }

        const existingPdfBytes = await fs.readFile(path.join(__dirname, '..', document.filePath));
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const embeddedFonts = {};

        const getOrEmbedFont = async (fontName) => {
            if (embeddedFonts[fontName]) {
                return embeddedFonts[fontName];
            }

            let fontToEmbed;
            try {
                switch (fontName) {
                    case 'DancingScript': // Custom font case
                        const customFontPath = path.join(__dirname, '..', 'assets', 'fonts', 'DancingScript-Regular.ttf');
                        const customFontBytes = await fs.readFile(customFontPath);
                        fontToEmbed = await pdfDoc.embedFont(customFontBytes);
                        break;
                    case 'TimesRoman':
                        fontToEmbed = await pdfDoc.embedFont(StandardFonts.TimesRoman);
                        break;
                    case 'Courier':
                        fontToEmbed = await pdfDoc.embedFont(StandardFonts.Courier);
                        break;
                    case 'Helvetica':
                        fontToEmbed = await pdfDoc.embedFont(StandardFonts.Helvetica);
                        break;
                    default: // Fallback for unknown fonts
                        console.warn(`Unknown fontName "${fontName}". Falling back to Helvetica.`);
                        fontToEmbed = await pdfDoc.embedFont(StandardFonts.Helvetica);
                        break;
                }
            } catch (fontError) {
                console.error(`Error embedding font "${fontName}". Falling back to Helvetica.`, fontError);
                fontToEmbed = await pdfDoc.embedFont(StandardFonts.Helvetica);
            }

            embeddedFonts[fontName] = fontToEmbed;
            return fontToEmbed;
        };

        for (const sigData of signaturesToFinalize) {
            // Validate incoming signature data more rigorously
            if (!sigData._id || sigData.documentId !== documentId || sigData.userId !== userId) {
                console.warn(`Skipping invalid or unauthorized signature data:`, sigData);
                continue;
            }

            const page = pdfDoc.getPages()[sigData.page - 1];
            if (!page) {
                console.warn(`Page ${sigData.page} not found in PDF for signature ID ${sigData._id}. Skipping.`);
                continue;
            }

            let textToEmbed = '';
            // --- USE sigData.fontSize and sigData.fontFamily IF AVAILABLE ---
            let fontSize = sigData.fontSize || 12; // Use provided size or default
            let color = rgb(0, 0, 0); // Default to black
            let selectedFontName = 'Helvetica'; // Default standard font if not specified

            if (sigData.type === 'simpleSignature') {
                textToEmbed = sigData.signValue;
                // Use font size and family from sigData, if available and valid
                if (typeof sigData.fontSize === 'number' && sigData.fontSize > 0) {
                    fontSize = sigData.fontSize;
                }
                if (sigData.fontFamily) {
                    selectedFontName = sigData.fontFamily;
                }
                color = rgb(0, 0, 0); // Keep as black, or make it dynamic too if needed
            } else if (sigData.type === 'initials') {
                textToEmbed = sigData.initialsValue || 'Initials'; // Assuming an initialsValue
                fontSize = sigData.fontSize || 10;
                selectedFontName = sigData.fontFamily || 'Helvetica';
            } else if (sigData.type === 'date') {
                textToEmbed = sigData.dateValue || new Date().toLocaleDateString(); // Assuming a dateValue
                fontSize = sigData.fontSize || 10;
                selectedFontName = sigData.fontFamily || 'Helvetica';
            }
            // Add other field types here if needed

            // --- IMPORTANT: Ensure 'DancingScript' is handled in getOrEmbedFont
            const font = await getOrEmbedFont(selectedFontName);

            page.drawText(textToEmbed, {
                x: sigData.x,
                y: page.getHeight() - sigData.y - fontSize, // Adjust Y to account for font size
                font: font,
                size: fontSize,
                color: color,
            });

            // Update the signature status in the database
            await Signature.findByIdAndUpdate(sigData._id, { status: 'signed', signedAt: new Date() });
        }

        const pdfBytes = await pdfDoc.save();
        // Overwrite the original document with the signed version
        await fs.writeFile(path.join(__dirname, '..', document.filePath), pdfBytes);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${document.fileName || 'document'}_signed.pdf"`);
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error('Error finalizing document:', error);
        res.status(500).json({ message: 'Server error finalizing document. Please try again.' });
    }
};
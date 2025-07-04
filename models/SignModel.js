const mongoose = require('mongoose');

const SignatureSchema = new mongoose.Schema({
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    signValue: {
        type: String,
        required: true,
    },
    x: {
        type: Number,
        required: true,
    },
    y: {
        type: Number,
        required: true,
    },
    page: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        default: 'signature',
    },
    status: {
        type: String,
        enum: ['pending', 'signed', 'rejected'],
        default: 'pending',
    },
    signatureData: {
        type: String,
        default: null,
    },
    signedAt: {
        type: Date,
        default: null,
    }
}, { timestamps: true });

module.exports = mongoose.model('Signature', SignatureSchema);
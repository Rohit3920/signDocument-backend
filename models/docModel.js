const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true,
        trim: true
    },
    filePath: {
        type: String,
        required: true,
        unique: true
    },
    mimetype: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Document', documentSchema);

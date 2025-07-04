require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/docRoutes');
const signatureRoutes = require('./routes/signRoutes');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
require('./utils/dbConnect');

//cors configuration
var corsOptions = {
    origin: process.env.FORNTEND_URL,
    methods: ["POST", "GET", "DELETE", "PUT"],
    Credential: true
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

// Serve uploaded files statically
// This makes files in the 'uploads' directory accessible via '/uploads' URL
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/docs', documentRoutes);
app.use('/api/signatures', signatureRoutes);

app.get('/', (req, res) => {
    res.send('Signature document website backend running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`MongoDB URL: ${process.env.MONGO_URL ? 'Connected' : 'Not Set (Check .env)'}`);
});

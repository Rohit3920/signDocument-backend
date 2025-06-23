const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
require('./utils/dbConnect');

const app = express();

app.use(cors({
    origin: process.env.FORNTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Basic route for testing server status
app.get('/', (req, res) => {
    res.send('Signature document website backend running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`MongoDB URL: ${process.env.MONGO_URL ? 'Connected' : 'Not Set'}`);
});
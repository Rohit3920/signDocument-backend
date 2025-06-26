// const express = require('express');
// const dotenv = require('dotenv');
// const path = require('path');
// const fs = require('fs');
// const cors = require('cors');
// const authRoutes = require('./routes/authRoutes');
// const documentRoutes = require('./routes/docRoutes');

// // Load environment variables from .env file
// dotenv.config();

// // Connect to MongoDB
// require('./utils/dbConnect');

// const app = express();

// app.use(express.urlencoded({ extended: true }));
// const uploadsDir = path.join(__dirname, '../uploads');
// if (!fs.existsSync(uploadsDir)) {
//     fs.mkdirSync(uploadsDir, { recursive: true });
//     console.log('Created uploads directory:', uploadsDir);
// }
// app.use('/uploads', express.static(uploadsDir));

// app.use(cors({
//     origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
// }));

// app.use(express.json());

// // Routes
// // Authentication routes
// app.use('/api/auth', authRoutes);
// // Document management routes (upload, view, etc.)
// app.use('/api/docs', documentRoutes);

// // Basic route for testing server status
// app.get('/', (req, res) => {
//     res.send('Signature document website backend running...');
// });

// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).send('Something broke!');
// });


// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//     console.log(`MongoDB URL: ${process.env.MONGO_URL ? 'Configured' : 'Not Set (Check .env)'}`);
// });

// --- server/server.js (UPDATED to include document routes) ---
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes'); // Assuming you have this from Day 2
const documentRoutes = require('./routes/docRoutes');
const path = require('path'); // For serving static files

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
require('./utils/dbConnect');

// Middleware
app.use(express.json());
app.use(cors());

// Serve uploaded files statically
// This makes files in the 'uploads' directory accessible via '/uploads' URL
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/docs', documentRoutes);

app.get('/', (req, res) => {
    res.send('Signature document website backend running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`MongoDB URL: ${process.env.MONGO_URL ? 'Connected' : 'Not Set (Check .env)'}`);
});
// Database connection
require('dotenv').config();
const mongoose = require('mongoose');
const URL = process.env.MONGO_URL ;

mongoose.connect(URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
);
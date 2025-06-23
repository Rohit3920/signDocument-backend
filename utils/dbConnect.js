// Database connection
require('dotenv').config();
const mongoose = require('mongoose');
const URL = process.env.MONGO_URL || 'mongodb+srv://rohitnittawadekar07:CMHFgAJBDTuUhG1J@signdoccluster.se1utdv.mongodb.net/test?retryWrites=true&w=majority&appName=signDocCluster' ;

mongoose.connect(URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
);
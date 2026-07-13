// ==========================================
// 1. IMPORT DEPENDENCIES
// ==========================================
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config(); // Loads variables from the .env file
const { PrismaClient } = require('@prisma/client');

// ==========================================
// 2. INITIALIZE APP & DATABASE
// ==========================================
const app = express();
const prisma = new PrismaClient(); // Creates the connection to SQLite

// ==========================================
// 3. APPLY MIDDLEWARE
// ==========================================
// Middleware are functions that run BEFORE your routes handle the request.

// Helmet secures Express apps by setting various HTTP headers.
app.use(helmet()); 

// CORS allows your frontend to communicate with this backend.
app.use(cors()); 

// express.json() allows the server to accept incoming data in JSON format 
// (e.g., when the Android app or React app sends user login details).
app.use(express.json()); 


// ==========================================
// 4. DEFINE ROUTES
// ==========================================
// A route is a URL endpoint the frontend can request data from.

// A simple health-check route to verify the server is running
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'success', 
        message: 'Pitch Metrics API is running smoothly!' 
    });
});

// A temporary route to test the database connection
app.get('/api/test-db', async (req, res) => {
    try {
        // We attempt to count the users in the database
        const userCount = await prisma.user.count();
        res.status(200).json({ 
            status: 'success', 
            message: 'Database connection successful!',
            usersInDatabase: userCount
        });
    } catch (error) {
        console.error("Database connection failed:", error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Failed to connect to the database.' 
        });
    }
});

// ==========================================
// 5. START THE SERVER
// ==========================================
// We pull the PORT from the .env file. If it doesn't exist, we default to 5000.
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Server is running on port: ${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=========================================`);
});
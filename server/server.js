// ==========================================
// 1. IMPORT DEPENDENCIES
// ==========================================
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path'); // Added to safely handle directory paths across systems
require('dotenv').config(); 
const { PrismaClient } = require('@prisma/client');

// Import our route files
const authRoutes = require('./routes/auth'); 
const teamRoutes = require('./routes/teams');
const playerRoutes = require('./routes/players');
const matchRoutes = require('./routes/matches'); // NEW: Import match routes

// ==========================================
// 2. INITIALIZE APP & DATABASE
// ==========================================
const app = express();
const prisma = new PrismaClient(); 

// ==========================================
// 3. APPLY MIDDLEWARE
// ==========================================
app.use(helmet()); 
app.use(cors()); 
app.use(express.json()); 

// Serve static assets from the separate client "dist" folder one level up
app.use(express.static(path.join(__dirname, '../client/dist')));

// ==========================================
// 4. DEFINE ROUTES
// ==========================================

// Connect the route files to specific base URLs
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes); // NEW: Connect match routes

// Health-check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'success', 
        message: 'Pitch Metrics API is running smoothly!' 
    });
});

// Database connection test
app.get('/api/test-db', async (req, res) => {
    try {
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

// Catch-all route to serve the Vite frontend index.html for any non-API requests
// (Must remain the last route definition in this block)
app.get('*splat', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

// ==========================================
// 5. START THE SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Server is running on port: ${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=========================================`);
});

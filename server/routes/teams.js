// ==========================================
// TEAMS ROUTES (server/routes/teams.js)
// ==========================================
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// ==========================================
// ROUTE 1: CREATE A NEW TEAM
// Endpoint: POST /api/teams
// ==========================================
router.post('/', async (req, res) => {
    try {
        const { name, isOurTeam, logoUrl } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Team name is required." });
        }

        // Create the team in the database using Prisma
        const newTeam = await prisma.team.create({
            data: {
                name: name,
                // If the frontend doesn't send isOurTeam, it defaults to false (opponent)
                isOurTeam: isOurTeam || false, 
                logoUrl: logoUrl || null
            }
        });

        res.status(201).json({
            message: "Team created successfully!",
            team: newTeam
        });

    } catch (error) {
        console.error("Error creating team:", error);
        res.status(500).json({ message: "Server error while creating team." });
    }
});

// ==========================================
// ROUTE 2: GET ALL TEAMS
// Endpoint: GET /api/teams
// ==========================================
router.get('/', async (req, res) => {
    try {
        // Fetch all teams from the database
        // We can also sort them so 'Our Teams' appear at the top
        const teams = await prisma.team.findMany({
            orderBy: {
                isOurTeam: 'desc'
            }
        });

        res.status(200).json({
            message: "Teams retrieved successfully",
            teams: teams
        });

    } catch (error) {
        console.error("Error fetching teams:", error);
        res.status(500).json({ message: "Server error while fetching teams." });
    }
});

module.exports = router;
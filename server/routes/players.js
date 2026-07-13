// ==========================================
// PLAYERS ROUTES (server/routes/players.js)
// ==========================================
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// ==========================================
// ROUTE 1: ADD A PLAYER TO A TEAM
// Endpoint: POST /api/players
// ==========================================
router.post('/', async (req, res) => {
    try {
        const { teamId, firstName, lastName, position, dateOfBirth, heightCm, weightKg } = req.body;

        // Validation: A player MUST have a team and a name
        if (!teamId || !firstName || !lastName) {
            return res.status(400).json({ message: "Team ID, First Name, and Last Name are required." });
        }

        // Verify the team actually exists before adding a player to it
        const teamExists = await prisma.team.findUnique({
            where: { id: teamId }
        });

        if (!teamExists) {
            return res.status(404).json({ message: "The specified team was not found." });
        }

        // Create the player
        const newPlayer = await prisma.player.create({
            data: {
                teamId: teamId,
                firstName: firstName,
                lastName: lastName,
                position: position || null,
                // Convert string dates to actual Date objects if provided
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null, 
                heightCm: heightCm ? parseFloat(heightCm) : null,
                weightKg: weightKg ? parseFloat(weightKg) : null
            }
        });

        res.status(201).json({
            message: "Player added successfully!",
            player: newPlayer
        });

    } catch (error) {
        console.error("Error creating player:", error);
        res.status(500).json({ message: "Server error while creating player." });
    }
});

// ==========================================
// ROUTE 2: GET ALL PLAYERS FOR A SPECIFIC TEAM
// Endpoint: GET /api/players/team/:teamId
// ==========================================
// The ":teamId" is a URL parameter. Express extracts it automatically.
router.get('/team/:teamId', async (req, res) => {
    try {
        // req.params grabs variables straight from the URL
        const { teamId } = req.params; 

        const players = await prisma.player.findMany({
            where: {
                teamId: teamId
            },
            // Order alphabetically by last name
            orderBy: {
                lastName: 'asc' 
            }
        });

        res.status(200).json({
            message: "Players retrieved successfully",
            count: players.length,
            players: players
        });

    } catch (error) {
        console.error("Error fetching players:", error);
        res.status(500).json({ message: "Server error while fetching players." });
    }
});

module.exports = router;
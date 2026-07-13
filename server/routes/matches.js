// ==========================================
// MATCH & EVENT ROUTES (server/routes/matches.js)
// ==========================================
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// ==========================================
// ROUTE 1: CREATE A NEW MATCH
// Endpoint: POST /api/matches
// ==========================================
router.post('/', async (req, res) => {
    try {
        const { homeTeamId, awayTeamId, tournamentName, matchDate } = req.body;

        if (!homeTeamId || !awayTeamId) {
            return res.status(400).json({ message: "Both Home Team ID and Away Team ID are required." });
        }

        const newMatch = await prisma.match.create({
            data: {
                homeTeamId: homeTeamId,
                awayTeamId: awayTeamId,
                tournamentName: tournamentName || "Friendly",
                matchDate: matchDate ? new Date(matchDate) : new Date(),
                status: "SCHEDULED"
            }
        });

        res.status(201).json({
            message: "Match scheduled successfully!",
            match: newMatch
        });

    } catch (error) {
        console.error("Error creating match:", error);
        res.status(500).json({ message: "Server error while creating match." });
    }
});

// ==========================================
// ROUTE 1.5: GET ALL MATCHES (NEW!)
// Endpoint: GET /api/matches
// ==========================================
// We need this so the Dashboard can list all historical matches
router.get('/', async (req, res) => {
    try {
        const matches = await prisma.match.findMany({
            // Order them by date, newest first
            orderBy: {
                matchDate: 'desc' 
            },
            // Include the team names so we don't just send raw IDs to the frontend
            include: {
                homeTeam: { select: { name: true } },
                awayTeam: { select: { name: true } }
            }
        });

        res.status(200).json({
            message: "Matches retrieved successfully",
            matches: matches
        });
    } catch (error) {
        console.error("Error fetching all matches:", error);
        res.status(500).json({ message: "Server error while fetching matches." });
    }
});

// ==========================================
// ROUTE 2: LOG A LIVE MATCH EVENT
// Endpoint: POST /api/matches/:matchId/events
// ==========================================
router.post('/:matchId/events', async (req, res) => {
    try {
        const { matchId } = req.params;
        const { eventType, gameMinute, primaryPlayerId, secondaryPlayerId, notes } = req.body;

        if (!eventType || gameMinute === undefined) {
            return res.status(400).json({ message: "Event type and game minute are required." });
        }

        const matchExists = await prisma.match.findUnique({ where: { id: matchId } });
        if (!matchExists) {
            return res.status(404).json({ message: "Match not found." });
        }

        const newEvent = await prisma.matchEvent.create({
            data: {
                matchId: matchId,
                eventType: eventType,
                gameMinute: parseInt(gameMinute),
                primaryPlayerId: primaryPlayerId || null,
                secondaryPlayerId: secondaryPlayerId || null,
                notes: notes || null
            }
        });

        res.status(201).json({
            message: `${eventType} logged successfully at minute ${gameMinute}!`,
            event: newEvent
        });

    } catch (error) {
        console.error("Error logging event:", error);
        res.status(500).json({ message: "Server error while logging event." });
    }
});

// ==========================================
// ROUTE 3: GET FULL MATCH DATA (Analytics)
// Endpoint: GET /api/matches/:matchId
// ==========================================
router.get('/:matchId', async (req, res) => {
    try {
        const { matchId } = req.params;

        const matchData = await prisma.match.findUnique({
            where: { id: matchId },
            include: {
                homeTeam: true,
                awayTeam: true,
                events: {
                    orderBy: { gameMinute: 'asc' },
                    include: {
                        primaryPlayer: true,
                        secondaryPlayer: true
                    }
                }
            }
        });

        if (!matchData) {
            return res.status(404).json({ message: "Match not found." });
        }

        res.status(200).json({
            message: "Match analytics retrieved successfully",
            match: matchData
        });

    } catch (error) {
        console.error("Error fetching match data:", error);
        res.status(500).json({ message: "Server error while fetching match data." });
    }
});

module.exports = router;
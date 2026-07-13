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

        // Create the overarching Match container
        const newMatch = await prisma.match.create({
            data: {
                homeTeamId: homeTeamId,
                awayTeamId: awayTeamId,
                tournamentName: tournamentName || "Friendly",
                // If a date is provided, use it. Otherwise, assume the match is happening right now.
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
// ROUTE 2: LOG A LIVE MATCH EVENT (The Rapid-Fire Route)
// Endpoint: POST /api/matches/:matchId/events
// ==========================================
router.post('/:matchId/events', async (req, res) => {
    try {
        const { matchId } = req.params;
        const { eventType, gameMinute, primaryPlayerId, secondaryPlayerId, notes } = req.body;

        // Validation: Every event needs a type and a minute.
        if (!eventType || gameMinute === undefined) {
            return res.status(400).json({ message: "Event type and game minute are required." });
        }

        // Verify the match actually exists
        const matchExists = await prisma.match.findUnique({ where: { id: matchId } });
        if (!matchExists) {
            return res.status(404).json({ message: "Match not found." });
        }

        // Log the event in the database
        const newEvent = await prisma.matchEvent.create({
            data: {
                matchId: matchId,
                eventType: eventType, // e.g., "GOAL", "YELLOW_CARD", "SUB_OUT"
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
// ROUTE 3: GET FULL MATCH DATA (The Analytics Route)
// Endpoint: GET /api/matches/:matchId
// ==========================================
router.get('/:matchId', async (req, res) => {
    try {
        const { matchId } = req.params;

        // This is where Prisma shines. We ask for a match, but we use "include"
        // to automatically grab the team names and all the events, including the 
        // names of the players involved in those events!
        const matchData = await prisma.match.findUnique({
            where: { id: matchId },
            include: {
                homeTeam: true,
                awayTeam: true,
                events: {
                    orderBy: { gameMinute: 'asc' }, // Sort events by time
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
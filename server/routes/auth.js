// ==========================================
// AUTHENTICATION ROUTES (server/routes/auth.js)
// ==========================================
const express = require('express');
const bcrypt = require('bcryptjs'); // The password blender
const jwt = require('jsonwebtoken'); // The VIP wristband generator
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// ==========================================
// ROUTE 1: REGISTER A NEW USER
// Endpoint: POST /api/auth/register
// ==========================================
router.post('/register', async (req, res) => {
    try {
        // 1. Extract data sent by the user from the request body
        const { email, password, role } = req.body;

        // 2. Validate that the user provided both email and password
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        // 3. Check if a user with this email already exists in our database
        const existingUser = await prisma.user.findUnique({
            where: { email: email }
        });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email." });
        }

        // 4. Hash (blend) the password. The '10' is the salt rounds (how many times it blends).
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5. Save the new user to the database
        const newUser = await prisma.user.create({
            data: {
                email: email,
                password: hashedPassword,
                role: role || "COACH" // If no role is provided, default to COACH
            }
        });

        // 6. Send a success response (DO NOT send the password back!)
        res.status(201).json({
            message: "User registered successfully!",
            user: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Server error during registration." });
    }
});

// ==========================================
// ROUTE 2: LOGIN AN EXISTING USER
// Endpoint: POST /api/auth/login
// ==========================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        // 1. Find the user in the database
        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            // We use a generic error message for security so hackers don't know if the email exists
            return res.status(401).json({ message: "Invalid email or password." });
        }

        // 2. Compare the plain text password from the login attempt to the hashed password in the DB
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        // 3. Generate the JWT (The VIP Wristband)
        // We embed the user's ID and Role inside the token. 
        // We sign it with our secret key so it cannot be forged.
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Token expires in 1 day, forcing them to log in again tomorrow
        );

        // 4. Send the token back to the user
        res.status(200).json({
            message: "Login successful!",
            token: token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error during login." });
    }
});

module.exports = router;
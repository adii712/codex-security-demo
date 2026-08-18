require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();

// Railway provides PORT automatically.
// Local development will use 3000.
const PORT = process.env.PORT || 3000;

// =================================
// MIDDLEWARE
// =================================

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

// =================================
// MYSQL CONNECTION
// =================================

const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    port: Number(process.env.MYSQLPORT || 3306),
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// =================================
// SERVE FRONTEND
// =================================

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

// =================================
// TEST API
// =================================

app.get("/api/test", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend is working!"
    });
});

// =================================
// SECURITY AWARENESS DEMO
// =================================

app.post("/api/demo-submit", async (req, res) => {
    try {
        const {
            username,
            password
        } = req.body;

        // -----------------------------
        // Validate input
        // -----------------------------

        if (
            typeof username !== "string" ||
            typeof password !== "string" ||
            !username.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required."
            });
        }

        // -----------------------------
        // SECURITY:
        // Never store the actual password.
        // Only record its length for the
        // security-awareness demonstration.
        // -----------------------------

        const passwordLength = password.length;

        // -----------------------------
        // Insert into MySQL
        // -----------------------------

        const [result] = await db.execute(
            `INSERT INTO demo_submissions
            (demo_username, password_length)
            VALUES (?, ?)`,
            [
                username.trim(),
                passwordLength
            ]
        );

        console.log(
            "Demo submission received:",
            username.trim()
        );

        // -----------------------------
        // Response
        // -----------------------------

        return res.status(200).json({
            success: true,
            message: "Demo submission recorded.",
            id: result.insertId
        });

    } catch (error) {
        console.error(
            "Database error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "Database error."
        });
    }
});

// =================================
// 404 HANDLER
// =================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found."
    });
});

// =================================
// START SERVER
// =================================

async function startServer() {
    try {
        // Test MySQL connection first
        const connection = await db.getConnection();

        console.log(
            "✅ MySQL connected successfully."
        );

        connection.release();

        // IMPORTANT for Railway:
        // Listen on 0.0.0.0 and Railway's PORT.
        app.listen(
            PORT,
            "0.0.0.0",
            () => {
                console.log(
                    `🚀 Server running on port ${PORT}`
                );
            }
        );

    } catch (error) {
        console.error(
            "❌ MySQL connection failed:"
        );

        console.error(
            error.message
        );

        // Stop the process if database
        // connection cannot be established.
        process.exit(1);
    }
}

startServer();
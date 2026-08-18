require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();

const PORT = Number(process.env.PORT) || 3000;

// ================================
// Middleware
// ================================

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

// ================================
// MySQL
// ================================

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

// ================================
// Frontend
// ================================

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

// ================================
// Test API
// ================================

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Backend is working!"
    });
});

// ================================
// Security-awareness demo
// ================================

app.post("/api/demo-submit", async (req, res) => {

    try {

        const { username } = req.body;

        if (!username) {
            return res.status(400).json({
                success: false,
                message: "Username is required."
            });
        }

        // IMPORTANT:
        // Never store the password entered by the visitor.
        // This is a fixed dummy value used only for the demo.

        const DEMO_PASSWORD = "DEMO_ONLY_PASSWORD";

        const [result] = await db.execute(
            `INSERT INTO demo_submissions
            (demo_username, demo_password)
            VALUES (?, ?)`,
            [
                username,
                DEMO_PASSWORD
            ]
        );

        console.log(
            "Security demo submission:",
            username
        );

        res.json({
            success: true,
            message: "Demo submission recorded safely.",
            id: result.insertId
        });

    } catch (error) {

        console.error(
            "Database error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Database error."
        });
    }
});

// ================================
// Start server
// ================================

async function startServer() {

    try {

        const connection =
            await db.getConnection();

        console.log(
            "✅ MySQL connected successfully."
        );

        connection.release();

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

        process.exit(1);
    }
}

startServer();
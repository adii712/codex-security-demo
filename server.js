require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();

// Railway provides PORT automatically
const PORT = Number(process.env.PORT) || 3000;

// ============================================
// MIDDLEWARE
// ============================================

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

// ============================================
// MYSQL CONNECTION
// ============================================

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

// ============================================
// SERVE FRONTEND
// ============================================

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

// ============================================
// TEST API
// ============================================

app.get("/api/test", (req, res) => {

    res.json({
        success: true,
        message: "Backend is working!"
    });

});

// ============================================
// SECURITY AWARENESS DEMO
// ============================================

app.post("/api/demo-submit", async (req, res) => {

    try {

        // Only accept the username.
        // Do NOT collect or store a real password.

        const {
            username
        } = req.body;

        // ----------------------------
        // Validation
        // ----------------------------

        if (!username) {

            return res.status(400).json({
                success: false,
                message: "Username is required."
            });

        }

        // ----------------------------
        // Fixed dummy password
        // ----------------------------
        // This is NOT the password entered
        // by the visitor.

        const DEMO_PASSWORD =
            "DEMO_ONLY_PASSWORD";

        // ----------------------------
        // Insert into MySQL
        // ----------------------------

        const [result] = await db.execute(
            `
            INSERT INTO demo_submissions
            (
                demo_username,
                demo_password
            )
            VALUES
            (
                ?,
                ?
            )
            `,
            [
                username,
                DEMO_PASSWORD
            ]
        );

        console.log(
            "Demo submission received:",
            username
        );

        // ----------------------------
        // Response
        // ----------------------------

        res.json({

            success: true,

            message:
                "Demo submission recorded safely.",

            id:
                result.insertId

        });

    } catch (error) {

        console.error(
            "Database error:",
            error.message
        );

        res.status(500).json({

            success: false,

            message:
                "Database error."

        });

    }

});

// ============================================
// START SERVER
// ============================================

async function startServer() {

    try {

        // Test MySQL connection

        const connection =
            await db.getConnection();

        console.log(
            "✅ MySQL connected successfully."
        );

        connection.release();

        // ----------------------------
        // Start Express
        // ----------------------------

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
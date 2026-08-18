require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();

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
// FRONTEND
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
// PASSWORD ANALYSIS DEMO
// ============================================

app.post("/api/demo-submit", async (req, res) => {

    try {

        const {
            username,
            passwordLength,
            numberCount,
            capitalCount,
            lowercaseCount,
            specialCount
        } = req.body;

        // ========================================
        // VALIDATION
        // ========================================

        if (!username) {

            return res.status(400).json({
                success: false,
                message: "Username is required."
            });

        }

        // Convert values to numbers
        const length = Number(passwordLength) || 0;
        const numbers = Number(numberCount) || 0;
        const capitals = Number(capitalCount) || 0;
        const lowercase = Number(lowercaseCount) || 0;
        const special = Number(specialCount) || 0;

        // ========================================
        // INSERT ONLY PASSWORD STATISTICS
        // ========================================
        //
        // The actual password is NEVER sent to
        // this server and is NEVER stored in MySQL.
        //
        // ========================================

        const [result] = await db.execute(

            `
            INSERT INTO demo_submissions
            (
                demo_username,
                password_length,
                number_count,
                capital_count,
                lowercase_count,
                special_count
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,

            [
                username,
                length,
                numbers,
                capitals,
                lowercase,
                special
            ]

        );

        console.log(
            "Password analysis recorded for:",
            username
        );

        // ========================================
        // RESPONSE
        // ========================================

        res.json({

            success: true,

            message:
                "Password characteristics recorded safely.",

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
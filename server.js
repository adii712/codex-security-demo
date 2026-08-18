require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");


const app = express();

const PORT =
    process.env.PORT || 3000;


// =================================
// MIDDLEWARE
// =================================

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


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

    res.json({

        success: true,

        message: "Backend is working!"

    });

});


// =================================
// DEMO SUBMISSION
// =================================

app.post("/api/demo-submit", async (req, res) => {

    try {

        const {
            username,
            password
        } = req.body;


        // Validation

        if (!username || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Username and password are required."

            });

        }


        // Insert into MySQL

        const [result] =
            await db.execute(

                `INSERT INTO demo_submissions
                (demo_username, demo_password)
                VALUES (?, ?)`,
                
                [
                    username,
                    password
                ]

            );


        console.log(
            "Demo submission received:",
            username
        );


        res.json({

            success: true,

            message:
                "Demo submission recorded.",

            id: result.insertId

        });


    } catch (error) {

        console.error(
            "Database error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Database error."

        });

    }

});


// =================================
// START SERVER
// =================================

async function startServer() {

    try {

        // Test database connection

        const connection =
            await db.getConnection();

        console.log(
            "✅ MySQL connected successfully."
        );

        connection.release();


        app.listen(
            PORT,
            () => {

                console.log(
                    `🚀 Server running at http://localhost:${PORT}`
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

    }

}


startServer();
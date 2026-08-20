require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();

const PORT =
    Number(process.env.PORT) || 3000;


// ============================================
// MIDDLEWARE
// ============================================

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);


// ============================================
// MYSQL CONNECTION
// ============================================

const db =
    mysql.createPool({

        host:
            process.env.MYSQLHOST,

        port:
            Number(
                process.env.MYSQLPORT || 3306
            ),

        user:
            process.env.MYSQLUSER,

        password:
            process.env.MYSQLPASSWORD,

        database:
            process.env.MYSQLDATABASE,

        waitForConnections:
            true,

        connectionLimit:
            10,

        queueLimit:
            0

    });


// ============================================
// SERVE FRONTEND
// ============================================

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);


// ============================================
// TEST API
// ============================================

app.get(
    "/api/test",
    (req, res) => {

        res.json({

            success: true,

            message:
                "Backend is working!"

        });

    }
);


// ============================================
// PASSWORD CHARACTERISTICS
// ============================================

app.post(
    "/api/demo-submit",
    async (req, res) => {

        try {

            const {
                username,
                passwordLength,
                numberCount,
                capitalCount,
                lowercaseCount,
                specialCount
            } = req.body;


            // ------------------------------
            // Validation
            // ------------------------------

            if (
                typeof username !==
                "string" ||

                !username.trim()
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Username is required."

                });

            }


            // ------------------------------
            // Convert statistics to numbers
            // ------------------------------

            const length =
                Number(passwordLength);

            const numbers =
                Number(numberCount);

            const capitals =
                Number(capitalCount);

            const lowercase =
                Number(lowercaseCount);

            const special =
                Number(specialCount);


            // ------------------------------
            // Validate statistics
            // ------------------------------

            const values = [
                length,
                numbers,
                capitals,
                lowercase,
                special
            ];


            if (
                values.some(
                    value =>
                        !Number.isInteger(value) ||
                        value < 0
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid password statistics."

                });

            }


            // ------------------------------
            // Store ONLY statistics
            // ------------------------------
            //
            // The actual password is never
            // received by this endpoint.
            //
            // ------------------------------

            const [
                result
            ] = await db.execute(

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
                    username.trim(),
                    length,
                    numbers,
                    capitals,
                    lowercase,
                    special
                ]

            );


            console.log(
                "Password characteristics recorded for:",
                username.trim()
            );


            // ------------------------------
            // Response
            // ------------------------------

            res.json({

                success: true,

                message:
                    "Password characteristics recorded.",

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

    }
);


// ============================================
// 404 HANDLER
// ============================================

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "Route not found."

        });

    }
);


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
document.addEventListener("DOMContentLoaded", () => {

    // ============================================
    // GET FORM ELEMENTS
    // ============================================

    const form =
        document.querySelector("form");

    const usernameInput =
        document.getElementById("username");

    const passwordInput =
        document.getElementById("password");


    // Stop if required elements don't exist
    if (!form || !usernameInput || !passwordInput) {

        console.error(
            "Username, password, or form element not found."
        );

        return;
    }


    // ============================================
    // FORM SUBMISSION
    // ============================================

    form.addEventListener("submit", async (event) => {

        event.preventDefault();


        const username =
            usernameInput.value.trim();

        const password =
            passwordInput.value;


        // ========================================
        // VALIDATION
        // ========================================

        if (!username) {

            alert("Please enter a username.");

            return;
        }


        if (!password) {

            alert("Please enter a password.");

            return;
        }


        // ========================================
        // PASSWORD STATISTICS
        // ========================================

        const passwordLength =
            password.length;


        const numberCount =
            (password.match(/[0-9]/g) || []).length;


        const capitalCount =
            (password.match(/[A-Z]/g) || []).length;


        const lowercaseCount =
            (password.match(/[a-z]/g) || []).length;


        const specialCount =
            (password.match(/[^A-Za-z0-9]/g) || []).length;


        // ========================================
        // SEND ONLY STATISTICS
        // ========================================
        //
        // IMPORTANT:
        // The actual password is NOT included
        // in this request.
        //
        // ========================================

        try {

            const response =
                await fetch("/api/demo-submit", {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        username:
                            username,

                        passwordLength:
                            passwordLength,

                        numberCount:
                            numberCount,

                        capitalCount:
                            capitalCount,

                        lowercaseCount:
                            lowercaseCount,

                        specialCount:
                            specialCount

                    })

                });


            const data =
                await response.json();


            // ====================================
            // SERVER RESPONSE
            // ====================================

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Submission failed."
                );

            }


            if (data.success) {

                console.log(
                    "Demo submission successful:",
                    data
                );


                // Optional success message

                alert(
                    "Demo submission recorded successfully."
                );


                // Clear form

                form.reset();

            } else {

                alert(
                    data.message ||
                    "Something went wrong."
                );

            }


        } catch (error) {

            console.error(
                "Submission error:",
                error
            );


            alert(
                "Unable to submit the demo. Please try again."
            );

        }

    });

});
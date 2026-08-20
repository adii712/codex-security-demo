document.addEventListener("DOMContentLoaded", () => {

    const form =
        document.getElementById("demoForm");

    const usernameInput =
        document.getElementById("username");

    const passwordInput =
        document.getElementById("password");

    const submitButton =
        document.getElementById("submitButton");

    const result =
        document.getElementById("result");


    // ==========================================
    // CHECK ELEMENTS
    // ==========================================

    if (
        !form ||
        !usernameInput ||
        !passwordInput ||
        !submitButton ||
        !result
    ) {

        console.error(
            "Required HTML elements were not found."
        );

        return;
    }


    // ==========================================
    // SHOW RESULT
    // ==========================================

    function showResult(message, isError = false) {

        result.textContent = message;

        result.classList.remove("hidden");

        if (isError) {
            result.classList.add("error");
        } else {
            result.classList.remove("error");
        }

    }


    // ==========================================
    // FORM SUBMISSION
    // ==========================================

    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const username =
                usernameInput.value.trim();

            const password =
                passwordInput.value;


            // ==================================
            // VALIDATION
            // ==================================

            if (!username) {

                showResult(
                    "Please enter a username.",
                    true
                );

                return;
            }


            if (!password) {

                showResult(
                    "Please enter a demo password.",
                    true
                );

                return;
            }


            // ==================================
            // CALCULATE PASSWORD CHARACTERISTICS
            // ==================================

            const passwordLength =
                password.length;


            const numberCount =
                (
                    password.match(/[0-9]/g) || []
                ).length;


            const capitalCount =
                (
                    password.match(/[A-Z]/g) || []
                ).length;


            const lowercaseCount =
                (
                    password.match(/[a-z]/g) || []
                ).length;


            const specialCount =
                (
                    password.match(
                        /[^A-Za-z0-9]/g
                    ) || []
                ).length;


            // ==================================
            // IMPORTANT
            // ==================================
            //
            // The actual password is NOT included
            // in the request below.
            //
            // Only its characteristics are sent.
            //
            // ==================================

            submitButton.disabled = true;

            submitButton.textContent =
                "Submitting...";


            try {

                const response =
                    await fetch(
                        "/api/demo-submit",
                        {
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
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Submission failed."
                    );

                }


                if (data.success) {

                    showResult(
                        "Demo submission recorded successfully."
                    );

                    form.reset();

                } else {

                    throw new Error(
                        data.message ||
                        "Submission failed."
                    );

                }


            } catch (error) {

                console.error(
                    "Submission error:",
                    error
                );

                showResult(
                    error.message ||
                    "Unable to submit the demo.",
                    true
                );

            } finally {

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Submit Demo";

            }

        }
    );

});
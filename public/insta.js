const form = document.getElementById("loginForm");

const usernameInput = document.getElementById("username");

const passwordInput = document.getElementById("password");

const showPasswordButton =
    document.getElementById("showPassword");

const message =
    document.getElementById("message");

const submitButton =
    document.querySelector(".login-button");


// =================================
// SHOW / HIDE PASSWORD
// =================================

showPasswordButton.addEventListener("click", () => {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        showPasswordButton.textContent = "Hide";

    } else {

        passwordInput.type = "password";

        showPasswordButton.textContent = "Show";

    }

});


// =================================
// FORM SUBMISSION
// =================================

form.addEventListener("submit", async (event) => {

    event.preventDefault();


    const username =
        usernameInput.value.trim();

    const password =
        passwordInput.value;


    if (!username || !password) {

        message.textContent =
            "Please enter demo values.";

        return;

    }


    submitButton.disabled = true;

    submitButton.textContent =
        "Submitting...";


    message.textContent = "";


    try {

        const response = await fetch(
            "/api/demo-submit",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    username: username,

                    password: password

                })
            }
        );


        const data =
            await response.json();


        if (data.success) {

            message.textContent =
                "Demo submission recorded successfully.";

            form.reset();

        } else {

            message.textContent =
                data.message ||
                "Submission failed.";

        }


    } catch (error) {

        console.error(
            "Backend request error:",
            error
        );


        message.textContent =
            "Could not connect to backend.";

    }


    submitButton.disabled = false;

    submitButton.textContent =
        "Submit Demo";

});
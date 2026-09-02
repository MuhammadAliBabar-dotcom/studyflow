/* ==================================================
   STUDYFLOW AI - FINAL FRONTEND
================================================== */

"use strict";


/* ==================================================
   GET ELEMENTS
================================================== */

const aiInput = document.getElementById("aiInput");
const aiResponse = document.getElementById("aiResponse");
const aiCharCount = document.getElementById("aiCharCount");
const aiAskButton = document.getElementById("aiAskButton");


console.log("StudyFlow AI loaded successfully.");
console.log("AI input:", aiInput);
console.log("AI response:", aiResponse);
console.log("AI button:", aiAskButton);


/* ==================================================
   CHARACTER COUNTER
================================================== */

if (aiInput && aiCharCount) {

    aiInput.addEventListener("input", function () {

        aiCharCount.textContent =
            aiInput.value.length + " / 3000";

    });

}


/* ==================================================
   ESCAPE HTML
================================================== */

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = String(text ?? "");

    return div.innerHTML;

}


/* ==================================================
   QUICK TEMPLATES
================================================== */

window.setAITemplate = function (type) {

    if (!aiInput) return;

    const templates = {

        explain:
            "Explain this topic in simple words. Give me an easy example and then test me with 3 quick questions:\n\nTopic: ",

        summary:
            "Summarize these study notes into clear, short bullet points. Highlight the most important things I should remember:\n\nNotes:\n",

        quiz:
            "Create a practice quiz from this topic. Give me 10 questions with a mix of MCQs and short-answer questions. Put the answers at the end:\n\nTopic: ",

        plan:
            "Create a realistic study plan for me. Break the topic into focused sessions, include short breaks, revision and practice:\n\nSubject/Topic: "

    };

    aiInput.value = templates[type] || "";

    if (aiCharCount) {
        aiCharCount.textContent =
            aiInput.value.length + " / 3000";
    }

    aiInput.focus();

};


/* ==================================================
   LOADING
================================================== */

function showLoading() {

    if (!aiResponse) return;

    aiResponse.innerHTML = `
        <div class="ai-loading">

            <div class="ai-loading-icon">
                ✨
            </div>

            <div>
                <strong>
                    StudyFlow AI is thinking...
                </strong>

                <p>
                    Preparing your study answer.
                </p>
            </div>

        </div>
    `;

}


/* ==================================================
   SHOW ANSWER
================================================== */

function showAnswer(answer) {

    if (!aiResponse) return;

    const safeAnswer =
        escapeHTML(answer)
        .replace(/\r?\n/g, "<br>");

    aiResponse.innerHTML = `
        <div class="ai-demo-response">

            <div class="ai-response-title">
                🤖 StudyFlow AI
            </div>

            <div class="ai-answer">
                ${safeAnswer}
            </div>

        </div>
    `;

}


/* ==================================================
   SHOW ERROR
================================================== */

function showError(message) {

    if (!aiResponse) return;

    aiResponse.innerHTML = `
        <div class="ai-demo-response">

            <div class="ai-response-title">
                ⚠️ StudyFlow AI
            </div>

            <p>
                Sorry, I couldn't get an AI response right now.
            </p>

            <div class="ai-next-step">
                ${escapeHTML(message)}
            </div>

        </div>
    `;

}


/* ==================================================
   MAIN AI FUNCTION
================================================== */

window.askStudyAI = async function () {

    console.log("================================");
    console.log("ASK STUDY AI CLICKED");
    console.log("================================");


    const input =
        document.getElementById("aiInput");

    const responseBox =
        document.getElementById("aiResponse");

    const button =
        document.getElementById("aiAskButton");


    if (!input || !responseBox) {

        console.error(
            "AI input or response box not found."
        );

        return;

    }


    const question =
        input.value.trim();


    console.log(
        "Question:",
        question
    );


    if (!question) {

        alert(
            "Please enter a question first."
        );

        input.focus();

        return;

    }


    /* Disable button */

    if (button) {

        button.disabled = true;

        button.textContent =
            "⏳ Thinking...";

    }


    showLoading();


    try {

        /* ==================================================
           CHECK SUPABASE
        ================================================== */

        if (
            typeof supabaseClient === "undefined" ||
            !supabaseClient
        ) {

            throw new Error(
                "Supabase client is not available."
            );

        }


        console.log(
            "Sending request to study-ai..."
        );


        /* ==================================================
           CALL EDGE FUNCTION
        ================================================== */

        const result =
            await supabaseClient.functions.invoke(
                "study-ai",
                {
                    body: {
                        question: question
                    }
                }
            );


        console.log(
            "SUPABASE RESULT:",
            result
        );


        const data =
            result?.data;

        const error =
            result?.error;


        console.log(
            "DATA:",
            data
        );

        console.log(
            "ERROR:",
            error
        );


        /* ==================================================
           CHECK ERROR
        ================================================== */

        if (error) {

            throw new Error(
                error.message ||
                "Study AI request failed."
            );

        }


        if (!data) {

            throw new Error(
                "No data returned from Study AI."
            );

        }


        if (data.error) {

            throw new Error(
                data.error
            );

        }


        /* ==================================================
           GET ANSWER
        ================================================== */

        let answer =
            data.answer;


        /*
         * Backup response formats
         */

        if (
            !answer &&
            data.text
        ) {

            answer =
                data.text;

        }


        if (
            !answer &&
            data.response
        ) {

            answer =
                data.response;

        }


        if (
            typeof answer !== "string" ||
            !answer.trim()
        ) {

            throw new Error(
                "AI returned an empty answer."
            );

        }


        console.log(
            "FINAL ANSWER:",
            answer
        );


        /* ==================================================
           DISPLAY
        ================================================== */

        showAnswer(answer);


    } catch (error) {

        console.error(
            "STUDY AI ERROR:",
            error
        );


        showError(
            error?.message ||
            "Something went wrong. Please try again."
        );


    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "✨ Ask StudyFlow AI";

        }

    }

};


/* ==================================================
   BUTTON CLICK
   IMPORTANT: DIRECT EVENT LISTENER
================================================== */

if (aiAskButton) {

    aiAskButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            console.log(
                "BUTTON EVENT FIRED"
            );

            window.askStudyAI();

        }
    );

}


/* ==================================================
   ENTER KEY
================================================== */

if (aiInput) {

    aiInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                console.log(
                    "ENTER EVENT FIRED"
                );

                window.askStudyAI();

            }

        }
    );

}


/* ==================================================
   READY
================================================== */

console.log(
    "AI event listeners attached."
);
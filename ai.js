/* ==================================================
   STUDYFLOW AI
   Frontend AI assistant
   Connects to Supabase Edge Function: study-ai
================================================== */

"use strict";


/* ==================================================
   GET ELEMENTS
================================================== */

const aiInput =
    document.getElementById("aiInput");

const aiResponse =
    document.getElementById("aiResponse");

const aiCharCount =
    document.getElementById("aiCharCount");

const aiAskButton =
    document.getElementById("aiAskButton");


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

    const div =
        document.createElement("div");

    div.textContent =
        String(text ?? "");

    return div.innerHTML;

}


/* ==================================================
   QUICK AI TEMPLATES
================================================== */

window.setAITemplate = function (type) {

    if (!aiInput) {
        return;
    }

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


    aiInput.value =
        templates[type] || "";


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

    if (!aiResponse) {
        return;
    }

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

    if (!aiResponse) {
        return;
    }

    const safeAnswer =
        escapeHTML(answer)
            .replace(/\n/g, "<br>");


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


    aiResponse.scrollTop =
        aiResponse.scrollHeight;

}


/* ==================================================
   SHOW ERROR
================================================== */

function showError(message) {

    if (!aiResponse) {
        return;
    }

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
   ASK STUDYFLOW AI
================================================== */

window.askStudyAI = async function () {

    const input =
        document.getElementById("aiInput");

    const responseBox =
        document.getElementById("aiResponse");

    const button =
        document.getElementById("aiAskButton");


    if (!input || !responseBox) {

        console.error(
            "StudyFlow AI: Required elements not found."
        );

        return;

    }


    const question =
        input.value.trim();


    if (!question) {

        input.focus();

        return;

    }


    if (question.length > 3000) {

        alert(
            "Please keep your question under 3000 characters."
        );

        return;

    }


    /* ==========================================
       DISABLE BUTTON
    ========================================== */

    if (button) {

        button.disabled =
            true;

        button.innerHTML =
            "⏳ Thinking...";

    }


    /* ==========================================
       SHOW LOADING
    ========================================== */

    showLoading();


    try {

        console.log(
            "StudyFlow AI: Sending question..."
        );


        /* ==========================================
           CHECK SUPABASE
        ========================================== */

        if (
            typeof supabaseClient === "undefined" ||
            !supabaseClient
        ) {

            throw new Error(
                "Supabase client is not available."
            );

        }


        /* ==========================================
           CALL EDGE FUNCTION
        ========================================== */

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
            "StudyFlow AI result:",
            result
        );


        const data =
            result?.data;

        const error =
            result?.error;


        /* ==========================================
           CHECK ERROR
        ========================================== */

        if (error) {

            throw new Error(
                error.message ||
                "StudyFlow AI request failed."
            );

        }


        if (!data) {

            throw new Error(
                "No data was returned by StudyFlow AI."
            );

        }


        if (data.error) {

            throw new Error(
                data.error
            );

        }


        /* ==========================================
           GET ANSWER
        ========================================== */

        const answer =
            data.answer;


        if (
            typeof answer !== "string" ||
            !answer.trim()
        ) {

            throw new Error(
                "StudyFlow AI returned an empty answer."
            );

        }


        /* ==========================================
           DISPLAY ANSWER
        ========================================== */

        showAnswer(answer);


        console.log(
            "StudyFlow AI: Answer displayed."
        );


    } catch (error) {

        console.error(
            "StudyFlow AI Error:",
            error
        );


        showError(
            error?.message ||
            "Something went wrong. Please try again."
        );


    } finally {

        /* ==========================================
           ENABLE BUTTON AGAIN
        ========================================== */

        if (button) {

            button.disabled =
                false;

            button.innerHTML =
                "✨ Ask StudyFlow AI";

        }

    }

};


/* ==================================================
   ENTER KEY
================================================== */

if (aiInput) {

    aiInput.addEventListener(
        "keydown",
        function (event) {

            /*
             * Enter = Ask AI
             * Shift + Enter = New line
             */

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                window.askStudyAI();

            }

        }
    );

}


/* ==================================================
   INITIALIZE
================================================== */

console.log(
    "StudyFlow AI loaded successfully."
);

console.log(
    "AI input:",
    aiInput
);

console.log(
    "AI response:",
    aiResponse
);

console.log(
    "AI button:",
    aiAskButton
);
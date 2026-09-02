/* ==================================================
   STUDYFLOW AI
   Frontend AI assistant
   Supabase Edge Function: study-ai
================================================== */

"use strict";

document.addEventListener("DOMContentLoaded", function () {

    const aiInput = document.getElementById("aiInput");
    const aiResponse = document.getElementById("aiResponse");
    const aiCharCount = document.getElementById("aiCharCount");
    const aiAskButton = document.getElementById("aiAskButton");

    console.log("StudyFlow AI loaded");
    console.log("Input:", aiInput);
    console.log("Response:", aiResponse);
    console.log("Button:", aiAskButton);


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

        aiResponse.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

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
       ASK AI
    ================================================== */

    window.askStudyAI = async function () {

        console.log("askStudyAI() called");


        if (!aiInput || !aiResponse) {

            console.error(
                "StudyFlow AI: input or response box missing."
            );

            return;

        }


        const question =
            aiInput.value.trim();


        console.log(
            "Question:",
            question
        );


        if (!question) {

            alert(
                "Please enter a question first."
            );

            aiInput.focus();

            return;

        }


        if (question.length > 3000) {

            alert(
                "Please keep your question under 3000 characters."
            );

            return;

        }


        /* Disable button */

        if (aiAskButton) {

            aiAskButton.disabled = true;

            aiAskButton.textContent =
                "⏳ Thinking...";

        }


        showLoading();


        try {

            /* ==================================================
               CHECK SUPABASE CLIENT
            ================================================== */

            if (
                typeof window.supabaseClient === "undefined" ||
                !window.supabaseClient
            ) {

                throw new Error(
                    "Supabase client is not available. Check supabase.js."
                );

            }


            console.log(
                "Calling Supabase Edge Function..."
            );


            /* ==================================================
               CALL EDGE FUNCTION
            ================================================== */

            const result =
                await window.supabaseClient.functions.invoke(
                    "study-ai",
                    {
                        body: {
                            question: question
                        }
                    }
                );


            console.log(
                "FULL SUPABASE RESULT:",
                result
            );


            const data =
                result?.data;

            const error =
                result?.error;


            console.log(
                "AI DATA:",
                data
            );

            console.log(
                "AI ERROR:",
                error
            );


            /* ==================================================
               ERROR CHECK
            ================================================== */

            if (error) {

                throw new Error(
                    error.message ||
                    "Supabase Edge Function failed."
                );

            }


            if (!data) {

                throw new Error(
                    "No data received from the AI function."
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
             * Extra compatibility:
             * In case the function ever returns
             * a different response structure.
             */

            if (
                !answer &&
                data.candidates?.[0]?.content?.parts
            ) {

                answer =
                    data.candidates[0]
                        .content
                        .parts
                        .map(function (part) {
                            return part.text || "";
                        })
                        .join("");

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
                "FINAL AI ANSWER:",
                answer
            );


            /* ==================================================
               DISPLAY ANSWER
            ================================================== */

            showAnswer(answer);


        } catch (error) {

            console.error(
                "StudyFlow AI ERROR:",
                error
            );


            showError(
                error?.message ||
                "Something went wrong. Please try again."
            );


        } finally {

            if (aiAskButton) {

                aiAskButton.disabled = false;

                aiAskButton.textContent =
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

});
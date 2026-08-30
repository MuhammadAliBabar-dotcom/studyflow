/* ==================================================
   STUDYFLOW AI
   Frontend AI assistant
   Connects to Supabase Edge Function: study-ai
================================================== */

(function () {

    "use strict";


    /* ==================================================
       ELEMENTS
    ================================================== */

    const aiInput =
        document.getElementById("aiInput");

    const aiResponse =
        document.getElementById("aiResponse");

    const aiCharCount =
        document.getElementById("aiCharCount");

    const aiAskButton =
        document.querySelector(".ai-ask-button");


    /* ==================================================
       CHARACTER COUNTER
    ================================================== */

    if (aiInput && aiCharCount) {

        aiInput.addEventListener(
            "input",
            function () {

                aiCharCount.textContent =
                    aiInput.value.length +
                    " / 3000";

            }
        );

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

    window.setAITemplate =
        function (type) {

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
                    aiInput.value.length +
                    " / 3000";

            }


            aiInput.focus();

        };


    /* ==================================================
       SHOW LOADING
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

    window.askStudyAI =
        async function () {

            if (!aiInput) {

                console.error(
                    "StudyFlow AI: aiInput not found."
                );

                return;

            }


            const question =
                aiInput.value.trim();


            if (!question) {

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

                aiAskButton.disabled =
                    true;

                aiAskButton.innerHTML =
                    "⏳ Thinking...";

            }


            showLoading();


            try {

                console.log(
                    "StudyFlow AI: sending request..."
                );


                /* ==========================================
                   SUPABASE EDGE FUNCTION
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


                const data =
                    result?.data;

                const error =
                    result?.error;


                console.log(
                    "StudyFlow AI response:",
                    result
                );


                if (error) {

                    throw new Error(
                        error.message ||
                        "AI request failed."
                    );

                }


                if (!data) {

                    throw new Error(
                        "No response received from StudyFlow AI."
                    );

                }


                if (data.error) {

                    throw new Error(
                        data.error
                    );

                }


                const answer =
                    data.answer;


                if (
                    typeof answer !== "string" ||
                    !answer.trim()
                ) {

                    throw new Error(
                        "StudyFlow AI returned an empty response."
                    );

                }


                /* ==========================================
                   DISPLAY ANSWER
                ========================================== */

                showAnswer(
                    answer
                );


                console.log(
                    "StudyFlow AI: answer displayed successfully."
                );


            } catch (error) {

                console.error(
                    "StudyFlow AI Error:",
                    error
                );


                showError(
                    error?.message ||
                    "Please try again."
                );


            } finally {

                if (aiAskButton) {

                    aiAskButton.disabled =
                        false;

                    aiAskButton.innerHTML =
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
                 * Mobile/desktop:
                 * Enter sends the question.
                 * Shift + Enter creates a new line.
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


})();
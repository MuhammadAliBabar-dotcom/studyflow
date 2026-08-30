/* ==================================================
   STUDYFLOW AI
   Supabase Edge Function Connection
================================================== */

const aiInput = document.getElementById("aiInput");
const aiResponse = document.getElementById("aiResponse");


/* ==================================================
   QUICK PROMPT
================================================== */

function setAIPrompt(prompt) {

    if (!aiInput) {
        return;
    }

    aiInput.value = prompt;
    aiInput.focus();

}


/* ==================================================
   ESCAPE HTML
================================================== */

function escapeAIText(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


/* ==================================================
   ASK STUDYFLOW AI
================================================== */

async function askStudyAI() {

    if (!aiInput || !aiResponse) {
        return;
    }

    const question = aiInput.value.trim();

    if (!question) {

        aiInput.focus();

        return;

    }


    /* Loading */

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


    try {

        /* ==========================================
           CALL SUPABASE EDGE FUNCTION
        ========================================== */

        const { data, error } =
            await supabaseClient.functions.invoke(
                "study-ai",
                {
                    body: {
                        question: question
                    }
                }
            );


        if (error) {

            console.error(
                "StudyFlow AI Error:",
                error
            );

            throw new Error(
                error.message ||
                "AI request failed."
            );

        }


        if (!data || !data.answer) {

            throw new Error(
                "AI returned an empty response."
            );

        }


        /* ==========================================
           SHOW AI RESPONSE
        ========================================== */

        aiResponse.innerHTML = `
            <div class="ai-demo-response">

                <div class="ai-response-title">
                    🤖 StudyFlow AI
                </div>

                <div class="ai-answer">
                    ${escapeAIText(data.answer).replace(/\n/g, "<br>")}
                </div>

            </div>
        `;


        /* Clear input */

        aiInput.value = "";

        const counter =
            document.getElementById("aiCharCount");

        if (counter) {
            counter.textContent = "0 / 3000";
        }


    } catch (error) {

        console.error(
            "StudyFlow AI Error:",
            error
        );


        aiResponse.innerHTML = `
            <div class="ai-demo-response">

                <div class="ai-response-title">
                    ⚠️ StudyFlow AI
                </div>

                <p>
                    AI response nahi aa saki.
                </p>

                <div class="ai-next-step">
                    ${escapeAIText(
                        error.message ||
                        "Please try again."
                    )}
                </div>

            </div>
        `;

    }

}


/* ==================================================
   ENTER KEY
================================================== */

if (aiInput) {

    aiInput.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter" &&
                (event.ctrlKey || event.metaKey)
            ) {

                event.preventDefault();

                askStudyAI();

            }

        }
    );

}
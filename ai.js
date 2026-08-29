/* ==================================================
   STUDYFLOW AI
   Frontend AI assistant interface
================================================== */

const aiInput =
    document.getElementById("aiInput");

const aiResponse =
    document.getElementById("aiResponse");

const aiAskButton =
    document.getElementById("aiAskButton");


/* ==================================================
   QUICK PROMPT
================================================== */

function setAIPrompt(prompt) {

    if (!aiInput) {
        return;
    }

    aiInput.value =
        prompt;

    aiInput.focus();

}


/* ==================================================
   ESCAPE HTML
================================================== */

function escapeAIText(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;
}


/* ==================================================
   ADD USER MESSAGE
================================================== */

function addUserMessage(message) {

    if (!aiResponse) {
        return;
    }

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "ai-user-message";

    wrapper.innerHTML = `
        <div class="ai-user-bubble">
            ${escapeAIText(message)}
        </div>
    `;

    aiResponse.appendChild(
        wrapper
    );

    scrollAIToBottom();
}


/* ==================================================
   ADD AI MESSAGE
================================================== */

function addAIMessage(message) {

    if (!aiResponse) {
        return;
    }

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "ai-assistant-message";

    wrapper.innerHTML = `
        <div class="ai-assistant-icon">
            ✨
        </div>

        <div class="ai-assistant-bubble">
            ${escapeAIText(message)}
        </div>
    `;

    aiResponse.appendChild(
        wrapper
    );

    scrollAIToBottom();
}


/* ==================================================
   LOADING
================================================== */

function showAILoading() {

    if (!aiResponse) {
        return;
    }

    const loading =
        document.createElement("div");

    loading.id =
        "aiLoading";

    loading.className =
        "ai-assistant-message";

    loading.innerHTML = `
        <div class="ai-assistant-icon">
            ✨
        </div>

        <div class="ai-assistant-bubble">

            <div class="ai-loading">

                Thinking

                <span class="ai-dots">

                    <span></span>
                    <span></span>
                    <span></span>

                </span>

            </div>

        </div>
    `;

    aiResponse.appendChild(
        loading
    );

    scrollAIToBottom();
}


/* ==================================================
   REMOVE LOADING
================================================== */

function removeAILoading() {

    const loading =
        document.getElementById(
            "aiLoading"
        );

    if (loading) {

        loading.remove();

    }
}


/* ==================================================
   SCROLL
================================================== */

function scrollAIToBottom() {

    if (!aiResponse) {
        return;
    }

    aiResponse.scrollTop =
        aiResponse.scrollHeight;
}


/* ==================================================
   ASK AI
================================================== */

async function askStudyAI() {

    if (!aiInput) {
        return;
    }

    const question =
        aiInput.value.trim();


    if (!question) {

        aiInput.focus();

        return;

    }


    addUserMessage(
        question
    );


    aiInput.value = "";


    if (aiAskButton) {

        aiAskButton.disabled =
            true;

        aiAskButton.innerHTML =
            "⏳ Thinking...";

    }


    showAILoading();


    try {

        /*
         * IMPORTANT:
         *
         * Real AI API connection will be added
         * through a secure backend endpoint.
         *
         * Example endpoint:
         *
         * /api/ai
         *
         * Do NOT put your Gemini/OpenAI secret key
         * directly inside this file.
         */


        const response =
            await fetch(
                "/api/ai",
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            message:
                                question
                        })
                }
            );


        if (!response.ok) {

            throw new Error(
                "AI service is not connected yet."
            );

        }


        const data =
            await response.json();


        removeAILoading();


        const answer =
            data.reply ||
            data.message ||
            "I couldn't generate a response right now.";


        addAIMessage(
            answer
        );


    } catch (error) {

        console.error(
            "StudyFlow AI Error:",
            error
        );


        removeAILoading();


        addAIMessage(
            "AI connection abhi setup nahi hui. Interface ready hai — next step mein secure Gemini/OpenAI API connection connect karna hoga."
        );

    } finally {

        if (aiAskButton) {

            aiAskButton.disabled =
                false;

            aiAskButton.innerHTML =
                "<span>✨ Ask AI</span>";

        }

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
                !event.shiftKey
            ) {

                event.preventDefault();

                askStudyAI();

            }

        }
    );

}
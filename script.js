/* ==================================================
STUDYFLOW - TASK SYSTEM + AI
================================================== */

"use strict";

/* ==================================================
TASK SYSTEM
================================================== */

let tasks = [];

let currentDate = new Date();

/* ==================================================
LOAD USER TASKS
================================================== */

async function loadTasks() {

const {  
    data: {  
        user  
    },  
    error: userError  
} = await supabaseClient.auth.getUser();  


if (userError || !user) {  

    window.location.replace("login.html");  

    return;  
}  


const {  
    data,  
    error  
} = await supabaseClient  
    .from("tasks")  
    .select("*")  
    .eq("user_id", user.id)  
    .order("created_at", {  
        ascending: true  
    });  


if (error) {  

    console.error(  
        "Error loading tasks:",  
        error  
    );  

    alert("Could not load your tasks.");  

    return;  
}  


tasks = data || [];  


displayTasks();  
displayCalendar();  
displayUpcoming();  
updateStats();  
updateAIContext();

}

/* ==================================================
ADD TASK
================================================== */

async function addTask() {

const subject =  
    document.getElementById("subjectInput")?.value.trim();  

const task =  
    document.getElementById("taskInput")?.value.trim();  

const date =  
    document.getElementById("dateInput")?.value;  

const priority =  
    document.getElementById("priorityInput")?.value;  


if (!subject || !task) {  

    alert(  
        "Please enter subject and task!"  
    );  

    return;  
}  


const {  
    data: {  
        user  
    }  
} =  
    await supabaseClient.auth.getUser();  


if (!user) {  

    alert("Please login first.");  

    window.location.replace(  
        "login.html"  
    );  

    return;  
}  


const {  
    data,  
    error  
} =  
    await supabaseClient  
        .from("tasks")  
        .insert({  

            user_id: user.id,  

            subject: subject,  

            task: task,  

            date:  
                date === ""  
                    ? null  
                    : date,  

            priority:  
                priority || "Low",  

            completed: false  

        })  
        .select()  
        .single();  


if (error) {  

    console.error(  
        "Error adding task:",  
        error  
    );  

    alert(  
        "Could not save task."  
    );  

    return;  
}  


tasks.push(data);  


clearInputs();  

displayTasks();  
displayCalendar();  
displayUpcoming();  
updateStats();  
updateAIContext();

}

/* ==================================================
DISPLAY TASKS
================================================== */

function displayTasks() {

const taskList =  
    document.getElementById("taskList");  


if (!taskList) {  
    return;  
}  


const searchInput =  
    document.getElementById("searchInput");  


const searchText =  
    searchInput  
        ? searchInput.value  
            .toLowerCase()  
            .trim()  
        : "";  


taskList.innerHTML = "";  


const filteredTasks =  
    tasks.filter(function (task) {  

        const subject =  
            String(task.subject || "")  
                .toLowerCase();  

        const taskName =  
            String(task.task || "")  
                .toLowerCase();  


        return (  
            subject.includes(searchText) ||  
            taskName.includes(searchText)  
        );  

    });  


if (filteredTasks.length === 0) {  

    const empty =  
        document.createElement("li");  


    empty.className =  
        "empty-task";  


    empty.innerHTML = `  
        <div  
            style="  
                text-align:center;  
                width:100%;  
                padding:20px;  
                color:#64748b;  
            "  
        >  
            📚 No tasks found.  
        </div>  
    `;  


    taskList.appendChild(empty);  

    updateStats();  

    return;  
}  


filteredTasks.forEach(function (task) {  

    const li =  
        document.createElement("li");  


    const taskInfo =  
        document.createElement("div");  

    taskInfo.className =  
        "task-info";  


    if (task.completed) {  

        taskInfo.classList.add(  
            "completed"  
        );  

    }  


    const subjectText =  
        document.createElement("span");  

    subjectText.className =  
        "subject";  

    subjectText.textContent =  
        task.subject;  


    const taskText =  
        document.createElement("span");  

    taskText.className =  
        "task-name";  

    taskText.textContent =  
        " — " + task.task;  


    const priorityText =  
        document.createElement("span");  

    priorityText.className =  
        "priority";  


    const priority =  
        String(  
            task.priority || "Low"  
        );  


    priorityText.textContent =  
        priority;  


    if (priority === "High") {  

        priorityText.classList.add(  
            "priority-high"  
        );  

    } else if (priority === "Medium") {  

        priorityText.classList.add(  
            "priority-medium"  
        );  

    } else {  

        priorityText.classList.add(  
            "priority-low"  
        );  

    }  


    taskInfo.appendChild(subjectText);  

    taskInfo.appendChild(taskText);  

    taskInfo.appendChild(priorityText);  


    if (task.date) {  

        const dateText =  
            document.createElement("span");  

        dateText.className =  
            "date";  

        dateText.textContent =  
            "📅 Due: " +  
            formatDate(task.date);  

        taskInfo.appendChild(dateText);  

    }  


    const buttons =  
        document.createElement("div");  

    buttons.className =  
        "task-buttons";  


    const completeButton =  
        document.createElement("button");  

    completeButton.type =  
        "button";  

    completeButton.textContent =  
        task.completed  
            ? "↩ Undo"  
            : "✓ Complete";  


    completeButton.onclick =  
        function () {  

            toggleTask(task.id);  

        };  


    const editButton =  
        document.createElement("button");  

    editButton.type =  
        "button";  

    editButton.textContent =  
        "✎ Edit";  


    editButton.onclick =  
        function () {  

            editTask(task.id);  

        };  


    const deleteButton =  
        document.createElement("button");  

    deleteButton.type =  
        "button";  

    deleteButton.className =  
        "delete-btn";  

    deleteButton.textContent =  
        "Delete";  


    deleteButton.onclick =  
        function () {  

            deleteTask(task.id);  

        };  


    buttons.appendChild(  
        completeButton  
    );  

    buttons.appendChild(  
        editButton  
    );  

    buttons.appendChild(  
        deleteButton  
    );  


    li.appendChild(taskInfo);  

    li.appendChild(buttons);  

    taskList.appendChild(li);  

});  


updateStats();

}

/* ==================================================
COMPLETE / UNDO TASK
================================================== */

async function toggleTask(id) {

const task =  
    tasks.find(function (item) {  

        return item.id === id;  

    });  


if (!task) {  
    return;  
}  


const newCompleted =  
    !task.completed;  


const {  
    error  
} =  
    await supabaseClient  
        .from("tasks")  
        .update({  
            completed: newCompleted  
        })  
        .eq("id", id);  


if (error) {  

    console.error(  
        "Error updating task:",  
        error  
    );  

    alert(  
        "Could not update task."  
    );  

    return;  
}  


task.completed =  
    newCompleted;  


displayTasks();  
displayCalendar();  
displayUpcoming();  
updateStats();  
updateAIContext();

}

/* ==================================================
DELETE TASK
================================================== */

async function deleteTask(id) {

const confirmed =  
    confirm(  
        "Are you sure you want to delete this task?"  
    );  


if (!confirmed) {  
    return;  
}  


const {  
    error  
} =  
    await supabaseClient  
        .from("tasks")  
        .delete()  
        .eq("id", id);  


if (error) {  

    console.error(  
        "Error deleting task:",  
        error  
    );  

    alert(  
        "Could not delete task."  
    );  

    return;  
}  


tasks =  
    tasks.filter(function (task) {  

        return task.id !== id;  

    });  


displayTasks();  
displayCalendar();  
displayUpcoming();  
updateStats();  
updateAIContext();

}

/* ==================================================
EDIT TASK
================================================== */

async function editTask(id) {

const task =  
    tasks.find(function (item) {  

        return item.id === id;  

    });  


if (!task) {  
    return;  
}  


const newSubject =  
    prompt(  
        "Enter subject:",  
        task.subject  
    );  


if (newSubject === null) {  
    return;  
}  


const cleanedSubject =  
    newSubject.trim();  


if (!cleanedSubject) {  

    alert(  
        "Subject cannot be empty."  
    );  

    return;  
}  


const newTask =  
    prompt(  
        "Enter task:",  
        task.task  
    );  


if (newTask === null) {  
    return;  
}  


const cleanedTask =  
    newTask.trim();  


if (!cleanedTask) {  

    alert(  
        "Task cannot be empty."  
    );  

    return;  
}  


const newDate =  
    prompt(  
        "Enter date (YYYY-MM-DD), or leave empty:",  
        task.date || ""  
    );  


if (newDate === null) {  
    return;  
}  


const cleanedDate =  
    newDate.trim();  


const newPriority =  
    prompt(  
        "Enter priority (Low / Medium / High):",  
        task.priority || "Low"  
    );  


if (newPriority === null) {  
    return;  
}  


let cleanedPriority =  
    newPriority.trim();  


if (  
    !["Low", "Medium", "High"]  
        .includes(cleanedPriority)  
) {  

    cleanedPriority = "Low";  

}  


const {  
    error  
} =  
    await supabaseClient  
        .from("tasks")  
        .update({  

            subject:  
                cleanedSubject,  

            task:  
                cleanedTask,  

            date:  
                cleanedDate === ""  
                    ? null  
                    : cleanedDate,  

            priority:  
                cleanedPriority  

        })  
        .eq("id", id);  


if (error) {  

    console.error(  
        "Error editing task:",  
        error  
    );  

    alert(  
        "Could not edit task."  
    );  

    return;  
}  


task.subject =  
    cleanedSubject;  

task.task =  
    cleanedTask;  

task.date =  
    cleanedDate === ""  
        ? null  
        : cleanedDate;  

task.priority =  
    cleanedPriority;  


displayTasks();  
displayCalendar();  
displayUpcoming();  
updateStats();  
updateAIContext();

}

/* ==================================================
CLEAR COMPLETED TASKS
================================================== */

async function clearCompletedTasks() {

const completedTasks =  
    tasks.filter(function (task) {  

        return task.completed;  

    });  


if (completedTasks.length === 0) {  

    alert(  
        "There are no completed tasks to clear."  
    );  

    return;  
}  


const confirmed =  
    confirm(  
        "Delete all completed tasks?"  
    );  


if (!confirmed) {  
    return;  
}  


const ids =  
    completedTasks.map(function (task) {  

        return task.id;  

    });  


const {  
    error  
} =  
    await supabaseClient  
        .from("tasks")  
        .delete()  
        .in("id", ids);  


if (error) {  

    console.error(  
        "Error clearing completed tasks:",  
        error  
    );  

    alert(  
        "Could not clear completed tasks."  
    );  

    return;  
}  


tasks =  
    tasks.filter(function (task) {  

        return !task.completed;  

    });  


displayTasks();  
displayCalendar();  
displayUpcoming();  
updateStats();  
updateAIContext();

}

/* ==================================================
STATISTICS
================================================== */

function updateStats() {

const total =  
    tasks.length;  


const completed =  
    tasks.filter(function (task) {  

        return task.completed;  

    }).length;  


const pending =  
    total - completed;  


const percentage =  
    total === 0  
        ? 0  
        : Math.round(  
            (completed / total) * 100  
        );  


const totalElement =  
    document.getElementById(  
        "totalTasks"  
    );  


const completedElement =  
    document.getElementById(  
        "completedTasks"  
    );  


const pendingElement =  
    document.getElementById(  
        "pendingTasks"  
    );  


const progressElement =  
    document.getElementById(  
        "progressPercent"  
    );  


const progressText =  
    document.getElementById(  
        "progress"  
    );  


if (totalElement) {  

    totalElement.textContent =  
        total;  

}  


if (completedElement) {  

    completedElement.textContent =  
        completed;  

}  


if (pendingElement) {  

    pendingElement.textContent =  
        pending;  

}  


if (progressElement) {  

    progressElement.textContent =  
        percentage + "%";  

}  


if (progressText) {  

    progressText.textContent =  
        "Completed: " +  
        completed +  
        " / " +  
        total;  

}

}

/* ==================================================
CLEAR INPUTS
================================================== */

function clearInputs() {

const subject =  
    document.getElementById(  
        "subjectInput"  
    );  

const task =  
    document.getElementById(  
        "taskInput"  
    );  

const date =  
    document.getElementById(  
        "dateInput"  
    );  

const priority =  
    document.getElementById(  
        "priorityInput"  
    );  


if (subject) subject.value = "";  

if (task) task.value = "";  

if (date) date.value = "";  

if (priority) {  
    priority.value = "Low";  
}

}

/* ==================================================
UPCOMING DEADLINES
================================================== */

function displayUpcoming() {

const upcomingList =  
    document.getElementById(  
        "upcomingList"  
    );  


if (!upcomingList) {  
    return;  
}  


upcomingList.innerHTML = "";  


const today =  
    new Date();  


today.setHours(  
    0,  
    0,  
    0,  
    0  
);  


const upcoming =  
    tasks  
        .filter(function (task) {  

            if (  
                !task.date ||  
                task.completed  
            ) {  

                return false;  

            }  


            const taskDate =  
                new Date(  
                    task.date +  
                    "T00:00:00"  
                );  


            return taskDate >= today;  

        })  
        .sort(function (a, b) {  

            return (  
                new Date(  
                    a.date +  
                    "T00:00:00"  
                ) -  
                new Date(  
                    b.date +  
                    "T00:00:00"  
                )  
            );  

        })  
        .slice(0, 5);  


if (upcoming.length === 0) {  

    upcomingList.innerHTML = `  
        <p class="empty-message">  
            🎉 No upcoming deadlines.  
        </p>  
    `;  

    return;  
}  


upcoming.forEach(function (task) {  

    const item =  
        document.createElement("div");  

    item.className =  
        "deadline-item";  


    const left =  
        document.createElement("div");  


    const subject =  
        document.createElement("div");  

    subject.className =  
        "deadline-subject";  

    subject.textContent =  
        task.subject +  
        " — " +  
        task.task;  


    const priority =  
        document.createElement("div");  

    priority.className =  
        "deadline-date";  

    priority.textContent =  
        "Priority: " +  
        task.priority;  


    left.appendChild(subject);  

    left.appendChild(priority);  


    const date =  
        document.createElement("div");  

    date.className =  
        "deadline-date";  

    date.textContent =  
        formatDate(task.date);  


    item.appendChild(left);  

    item.appendChild(date);  

    upcomingList.appendChild(item);  

});

}

/* ==================================================
CALENDAR
================================================== */

function displayCalendar() {

const calendar =  
    document.getElementById(  
        "calendar"  
    );  


const monthTitle =  
    document.getElementById(  
        "monthTitle"  
    );  


if (!calendar || !monthTitle) {  
    return;  
}  


calendar.innerHTML = "";  


const year =  
    currentDate.getFullYear();  


const month =  
    currentDate.getMonth();  


const monthName =  
    currentDate.toLocaleString(  
        "default",  
        {  
            month: "long"  
        }  
    );  


monthTitle.textContent =  
    monthName +  
    " " +  
    year;  


const firstDay =  
    new Date(  
        year,  
        month,  
        1  
    ).getDay();  


const daysInMonth =  
    new Date(  
        year,  
        month + 1,  
        0  
    ).getDate();  


for (  
    let i = 0;  
    i < firstDay;  
    i++  
) {  

    const empty =  
        document.createElement("div");  

    empty.className =  
        "calendar-day empty";  

    calendar.appendChild(empty);  

}  


for (  
    let day = 1;  
    day <= daysInMonth;  
    day++  
) {  

    const cell =  
        document.createElement("div");  

    cell.className =  
        "calendar-day";  


    const dayNumber =  
        document.createElement("div");  

    dayNumber.className =  
        "day-number";  

    dayNumber.textContent =  
        day;  


    cell.appendChild(dayNumber);  


    const dateString =  
        year +  
        "-" +  
        String(month + 1).padStart(2, "0") +  
        "-" +  
        String(day).padStart(2, "0");  


    const today =  
        new Date();  


    if (  
        day === today.getDate() &&  
        month === today.getMonth() &&  
        year === today.getFullYear()  
    ) {  

        cell.classList.add("today");  

    }  


    const dayTasks =  
        tasks.filter(function (task) {  

            return task.date === dateString;  

        });  


    dayTasks.forEach(function (task) {  

        const taskElement =  
            document.createElement("span");  

        taskElement.className =  
            "calendar-task";  

        taskElement.textContent =  
            task.subject +  
            ": " +  
            task.task;  


        if (task.completed) {  

            taskElement.style.textDecoration =  
                "line-through";  

            taskElement.style.opacity =  
                "0.5";  

        }  


        cell.appendChild(taskElement);  

    });  


    calendar.appendChild(cell);  

}

}

/* ==================================================
MONTH NAVIGATION
================================================== */

function previousMonth() {

currentDate.setMonth(  
    currentDate.getMonth() - 1  
);  

displayCalendar();

}

function nextMonth() {

currentDate.setMonth(  
    currentDate.getMonth() + 1  
);  

displayCalendar();

}

/* ==================================================
FORMAT DATE
================================================== */

function formatDate(dateString) {

if (!dateString) {  
    return "";  
}  


const date =  
    new Date(  
        dateString +  
        "T00:00:00"  
    );  


if (  
    Number.isNaN(  
        date.getTime()  
    )  
) {  

    return dateString;  

}  


return date.toLocaleDateString(  
    "en-US",  
    {  
        day: "numeric",  
        month: "short",  
        year: "numeric"  
    }  
);

}

/* ==================================================
DARK MODE
================================================== */

function updateThemeButton() {

const button =  
    document.getElementById(  
        "themeButton"  
    );  


if (!button) {  
    return;  
}  


const isDark =  
    document.body.classList.contains(  
        "dark"  
    );  


button.textContent =  
    isDark  
        ? "☀ Light"  
        : "🌙 Dark";

}

function toggleTheme() {

document.body.classList.toggle(  
    "dark"  
);  


const isDark =  
    document.body.classList.contains(  
        "dark"  
    );  


localStorage.setItem(  
    "darkMode",  
    isDark ? "true" : "false"  
);  


updateThemeButton();

}

if (
localStorage.getItem(
"darkMode"
) === "true"
) {

document.body.classList.add(  
    "dark"  
);

}

updateThemeButton();

/* ==================================================
TASK ENTER KEY
================================================== */

document.addEventListener(
"DOMContentLoaded",
function () {

const subjectInput =  
        document.getElementById(  
            "subjectInput"  
        );  


    const taskInput =  
        document.getElementById(  
            "taskInput"  
        );  


    function handleEnter(event) {  

        if (  
            event.key === "Enter"  
        ) {  

            event.preventDefault();  

            addTask();  

        }  

    }  


    if (subjectInput) {  

        subjectInput.addEventListener(  
            "keydown",  
            handleEnter  
        );  

    }  


    if (taskInput) {  

        taskInput.addEventListener(  
            "keydown",  
            handleEnter  
        );  

    }  

}

);

/* ==================================================
AI SYSTEM
================================================== */

const AI_FUNCTION_NAME =
"study-ai";

/* ==================================================
AI CONTEXT
================================================== */

function updateAIContext() {

const aiContext =  
    document.getElementById(  
        "aiTaskContext"  
    );  


if (!aiContext) {  
    return;  
}  


const total =  
    tasks.length;  


const completed =  
    tasks.filter(function (task) {  

        return task.completed;  

    }).length;  


const pending =  
    total - completed;  


const upcoming =  
    tasks  
        .filter(function (task) {  

            return (  
                task.date &&  
                !task.completed  
            );  

        })  
        .sort(function (a, b) {  

            return (  
                new Date(a.date) -  
                new Date(b.date)  
            );  

        })  
        .slice(0, 5);  


aiContext.textContent =  
    `

Total tasks: ${total}
Completed: ${completed}
Pending: ${pending}

Upcoming:
${
upcoming.length
? upcoming
.map(function (task) {

return (  
                `${task.subject} - ` +  
                `${task.task} - ` +  
                `${task.date || "No date"}`  
            );  

        })  
        .join("\n")  
    : "No upcoming tasks."

}
`.trim();
}

/* ==================================================
AI RESPONSE DISPLAY
================================================== */
function displayAIAnswer(answer) {

    const output =
        document.getElementById("aiResponse");


    if (!output) {

        console.error(
            "StudyFlow AI: aiResponse not found."
        );

        return;
    }


    const text =
        String(answer || "")
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .trim();


    /*
       Convert AI Markdown into readable HTML.
       This keeps the answer structured instead of
       showing everything as one paragraph.
    */

    let html =
        text
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            );


    /* Bold: **text** */

    html =
        html.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


    /* Headings */

    html =
        html.replace(
            /^### (.*)$/gm,
            "<h4>$1</h4>"
        );


    html =
        html.replace(
            /^## (.*)$/gm,
            "<h3>$1</h3>"
        );


    html =
        html.replace(
            /^# (.*)$/gm,
            "<h2>$1</h2>"
        );


    /*
       Numbered lists
       1. text
       2. text
    */

    html =
        html.replace(
            /^(?:\d+\.\s+.*(?:\n|$))+/gm,
            function (block) {

                const items =
                    block
                        .trim()
                        .split("\n")
                        .filter(Boolean)
                        .map(function (line) {

                            return (
                                "<li>" +
                                line.replace(
                                    /^\d+\.\s+/,
                                    ""
                                ) +
                                "</li>"
                            );

                        })
                        .join("");


                return (
                    "<ol>" +
                    items +
                    "</ol>"
                );

            }
        );


    /*
       Bullet lists
       - item
       * item
    */

    html =
        html.replace(
            /^(?:[-*]\s+.*(?:\n|$))+/gm,
            function (block) {

                const items =
                    block
                        .trim()
                        .split("\n")
                        .filter(Boolean)
                        .map(function (line) {

                            return (
                                "<li>" +
                                line.replace(
                                    /^[-*]\s+/,
                                    ""
                                ) +
                                "</li>"
                            );

                        })
                        .join("");


                return (
                    "<ul>" +
                    items +
                    "</ul>"
                );

            }
        );


    /*
       Remaining line breaks become real
       paragraphs / line breaks.
    */

    html =
        html.replace(
            /\n{2,}/g,
            "<br><br>"
        );


    html =
        html.replace(
            /\n/g,
            "<br>"
        );


    output.innerHTML = `

        <div class="ai-demo-response">

            <div class="ai-response-title">
                🤖 StudyFlow AI
            </div>

            <div
                class="ai-answer"
                style="
                    white-space: normal;
                    line-height: 1.7;
                "
            >
                ${html}
            </div>

        </div>

    `;


    output.style.display =
        "block";


    output.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });


    console.log(
        "StudyFlow AI: formatted answer displayed successfully."
    );
}

/* ==================================================
AI STATUS
================================================== */

function showAIStatus(message) {

const status =  
    document.getElementById(  
        "aiStatus"  
    );  


if (status) {  

    status.textContent =  
        message;  

}

}

/* ==================================================
MAIN AI REQUEST
================================================== */

window.askStudyAI = async function () {

const input =  
    document.getElementById(  
        "aiInput"  
    );  


const output =  
    document.getElementById(  
        "aiResponse"  
    );  


const button =  
    document.getElementById(  
        "aiAskButton"  
    );  


if (!input) {  

    console.error(  
        "StudyFlow AI: aiInput not found."  
    );  

    return;  
}  


const question =  
    input.value.trim();  


if (!question) {  

    showAIStatus(  
        "Please enter a question first."  
    );  

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
   BUTTON LOADING  
========================================== */  

if (button) {  

    button.disabled =  
        true;  

    button.textContent =  
        "⏳ Thinking...";  

}  


if (output) {  

    output.style.display =  
        "block";  

    output.textContent =  
        "🤖 StudyFlow AI is thinking...";  

}  


showAIStatus(  
    "🤖 StudyFlow AI is thinking..."  
);  


try {  

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


    console.log(  
        "StudyFlow AI: sending question:",  
        question  
    );  


    /* ==========================================  
       CALL EDGE FUNCTION  
    ========================================== */  

    const result =  
        await supabaseClient.functions.invoke(  
            AI_FUNCTION_NAME,  
            {  
                body: {  

                    question:  
                        question  

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
       SUPABASE ERROR  
    ========================================== */  

    if (error) {  

        console.error(  
            "Supabase Function Error:",  
            error  
        );  

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


    console.log(  
        "StudyFlow AI data:",  
        data  
    );  


    /* ==========================================  
       GET ANSWER  
    ========================================== */  

    const answer =  
        data.answer ||  
        data.message ||  
        data.text;  


    if (  
        typeof answer !== "string" ||  
        !answer.trim()  
    ) {  

        throw new Error(  
            "AI returned no answer."  
        );  

    }  


    /* ==========================================  
       SHOW ANSWER  
    ========================================== */  

    displayAIAnswer(  
        answer  
    );  


    showAIStatus(  
        "✅ Answer ready"  
    );  


    console.log(  
        "StudyFlow AI: answer displayed successfully."  
    );  


} catch (error) {  

    console.error(  
        "StudyFlow AI ERROR:",  
        error  
    );  


    if (output) {  

        output.style.display =  
            "block";  

        output.textContent =  
            "⚠️ AI Error: " +  
            (  
                error?.message ||  
                "Something went wrong."  
            );  

    }  


    showAIStatus(  
        "⚠️ AI connection error"  
    );  


} finally {  

    if (button) {  

        button.disabled =  
            false;  

        button.textContent =  
            "✨ Ask StudyFlow AI";  

    }  

}

};

/* ==================================================
QUICK AI TOOLS
================================================== */

function selectAITool(tool) {

const input =  
    document.getElementById(  
        "aiInput"  
    );  


if (!input) {  
    return;  
}  


const prompts = {  

    "Explain a topic":  
        "Explain this topic in simple words: ",  

    "Make notes":  
        "Make clear and easy-to-revise study notes about: ",  

    "Generate quiz":  
        "Create a quiz to test my knowledge about: ",  

    "Create study plan":  
        "Create a study plan for: "  

};  


input.value =  
    prompts[tool] || "";  


input.focus();

}

/* ==================================================
EXPLAIN TOPIC
================================================== */

async function explainTopic() {

const input =  
    document.getElementById(  
        "aiTopicInput"  
    );  


if (!input) {  
    return;  
}  


const topic =  
    input.value.trim();  


if (!topic) {  

    showAIStatus(  
        "Please enter a topic."  
    );  

    return;  
}  


await window.askStudyAI(  
    `Explain this study topic clearly for a student:

${topic}

Use:

1. Simple explanation


2. Important points


3. One easy example


4. Short exam tip`
);
}



/* ==================================================
SUMMARIZE NOTES
================================================== */

async function summarizeNotes() {

const input =  
    document.getElementById(  
        "aiNotesInput"  
    );  


if (!input) {  
    return;  
}  


const notes =  
    input.value.trim();  


if (!notes) {  

    showAIStatus(  
        "Please paste your notes first."  
    );  

    return;  
}  


await window.askStudyAI(  
    `Summarize these study notes.

Give:

1. Key concepts


2. Important facts


3. Short revision notes


4. Important terms



Notes:

${notes}`
);
}

/* ==================================================
GENERATE QUIZ
================================================== */

async function generateQuiz() {

const input =  
    document.getElementById(  
        "aiQuizTopic"  
    );  


if (!input) {  
    return;  
}  


const topic =  
    input.value.trim();  


if (!topic) {  

    showAIStatus(  
        "Please enter a quiz topic."  
    );  

    return;  
}  


await window.askStudyAI(  
    `Create a student-friendly quiz about:

${topic}

Create 5 questions.

Mix:

Multiple choice

Short answer


Give the answer after each question.`
);
}

/* ==================================================
CREATE STUDY PLAN
================================================== */

async function createStudyPlan() {

const completed =  
    tasks.filter(function (task) {  

        return task.completed;  

    }).length;  


const pending =  
    tasks.filter(function (task) {  

        return !task.completed;  

    });  


const taskText =  
    pending.length  
        ? pending  
            .map(function (task) {  

                return (  
                    `${task.subject}: ` +  
                    `${task.task} | ` +  
                    `Deadline: ` +  
                    `${task.date || "None"} | ` +  
                    `Priority: ` +  
                    `${task.priority || "Low"}`  
                );  

            })  
            .join("\n")  
        : "No pending tasks.";  


await window.askStudyAI(  
    `Create a realistic study plan using my current StudyFlow tasks.

Completed tasks: ${completed}

Pending tasks:

${taskText}

Make the plan:

Practical

Prioritized

Easy to follow

Deadline-aware

Broken into study sessions


Also tell me which task I should focus on first.`
);
}

/* ==================================================
FOCUS HELP
================================================== */

async function focusHelp() {

await window.askStudyAI(  
    `Help me focus on my studies using my current tasks.

Look at my pending tasks and tell me:

1. What should I study first?


2. What should I ignore for now?


3. How should I divide my next study session?


4. Give me a short motivation message.



Keep it practical and concise.`
);
}

/* ==================================================
AI CHAT
================================================== */

async function sendAIMessage() {

const input =  
    document.getElementById(  
        "aiInput"  
    );  


const button =  
    document.getElementById(  
        "aiSendButton"  
    );  


if (!input) {  
    return;  
}  


const message =  
    input.value.trim();  


if (!message) {  
    return;  
}  


if (button) {  

    button.disabled =  
        true;  

    button.textContent =  
        "Thinking...";  

}  


try {  

    await window.askStudyAI(  
        message  
    );  

} finally {  

    if (button) {  

        button.disabled =  
            false;  

        button.textContent =  
            "Send ➤";  

    }  

}

}

/* ==================================================
AI ENTER KEY
================================================== */

function initializeAI() {

const input =  
    document.getElementById(  
        "aiInput"  
    );  


if (!input) {  

    console.error(  
        "StudyFlow AI: aiInput not found."  
    );  

    return;  
}  


/* Prevent duplicate event listener */  

if (  
    input.dataset.aiInitialized === "true"  
) {  

    return;  
}  


input.dataset.aiInitialized =  
    "true";  


input.addEventListener(  
    "keydown",  
    function (event) {  

        if (  
            event.key === "Enter" &&  
            !event.shiftKey  
        ) {  

            event.preventDefault();  

            console.log(  
                "AI ENTER PRESSED"  
            );  

            window.askStudyAI();  

        }  

    }  
);  


updateAIContext();  


console.log(  
    "StudyFlow AI initialized successfully."  
);

}

/* ==================================================
AI INITIALIZATION
================================================== */

document.addEventListener(
"DOMContentLoaded",
function () {

initializeAI();  


    console.log(  
        "StudyFlow AI loaded successfully."  
    );  


    console.log(  
        "AI input:",  
        document.getElementById("aiInput")  
    );  


    console.log(  
        "AI response:",  
        document.getElementById("aiResponse")  
    );  


    console.log(  
        "AI button:",  
        document.getElementById("aiAskButton")  
    );  

}

);

/* ==================================================
START APP
================================================== */

loadTasks();
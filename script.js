/* ==================================================
   STUDYFLOW - TASK SYSTEM
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


    if (
        userError ||
        !user
    ) {

        window.location.replace(
            "login.html"
        );

        return;
    }


    const {
        data,
        error
    } = await supabaseClient
        .from("tasks")
        .select("*")
        .eq(
            "user_id",
            user.id
        )
        .order(
            "created_at",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Error loading tasks:",
            error
        );

        alert(
            "Could not load your tasks."
        );

        return;
    }


    tasks = data || [];


    displayTasks();

    displayCalendar();

    displayUpcoming();
}


/* ==================================================
   ADD TASK
================================================== */

async function addTask() {

    const subject =
        document.getElementById(
            "subjectInput"
        )
        .value
        .trim();


    const task =
        document.getElementById(
            "taskInput"
        )
        .value
        .trim();


    const date =
        document.getElementById(
            "dateInput"
        )
        .value;


    const priority =
        document.getElementById(
            "priorityInput"
        )
        .value;


    if (
        subject === "" ||
        task === ""
    ) {

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
        await supabaseClient
            .auth
            .getUser();


    if (!user) {

        alert(
            "Please login first."
        );

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

                user_id:
                    user.id,

                subject:
                    subject,

                task:
                    task,

                date:
                    date === ""
                        ? null
                        : date,

                priority:
                    priority,

                completed:
                    false

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
}


/* ==================================================
   DISPLAY TASKS
================================================== */

function displayTasks() {

    const taskList =
        document.getElementById(
            "taskList"
        );


    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const searchText =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    taskList.innerHTML = "";


    const filteredTasks =
        tasks.filter(
            function(task) {

                const subject =
                    String(
                        task.subject || ""
                    )
                    .toLowerCase();


                const taskName =
                    String(
                        task.task || ""
                    )
                    .toLowerCase();


                return (
                    subject.includes(
                        searchText
                    ) ||
                    taskName.includes(
                        searchText
                    )
                );

            }
        );


    if (
        filteredTasks.length === 0
    ) {

        const empty =
            document.createElement(
                "li"
            );


        empty.className =
            "empty-task";


        empty.innerHTML =
            `
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


        taskList.appendChild(
            empty
        );


        updateStats();

        return;
    }


    filteredTasks.forEach(
        function(task) {

            const li =
                document.createElement(
                    "li"
                );


            const taskInfo =
                document.createElement(
                    "div"
                );

            taskInfo.className =
                "task-info";


            if (task.completed) {

                taskInfo.classList.add(
                    "completed"
                );

            }


            const subjectText =
                document.createElement(
                    "span"
                );

            subjectText.className =
                "subject";

            subjectText.textContent =
                task.subject;


            const taskText =
                document.createElement(
                    "span"
                );

            taskText.className =
                "task-name";

            taskText.textContent =
                " — " +
                task.task;


            const priorityText =
                document.createElement(
                    "span"
                );

            priorityText.className =
                "priority";


            const priority =
                String(
                    task.priority ||
                    "Low"
                );


            priorityText.textContent =
                priority;


            if (
                priority === "High"
            ) {

                priorityText.classList.add(
                    "priority-high"
                );

            } else if (
                priority === "Medium"
            ) {

                priorityText.classList.add(
                    "priority-medium"
                );

            } else {

                priorityText.classList.add(
                    "priority-low"
                );

            }


            taskInfo.appendChild(
                subjectText
            );

            taskInfo.appendChild(
                taskText
            );

            taskInfo.appendChild(
                priorityText
            );


            if (task.date) {

                const dateText =
                    document.createElement(
                        "span"
                    );

                dateText.className =
                    "date";

                dateText.textContent =
                    "📅 Due: " +
                    formatDate(
                        task.date
                    );

                taskInfo.appendChild(
                    dateText
                );

            }


            const buttons =
                document.createElement(
                    "div"
                );

            buttons.className =
                "task-buttons";


            const completeButton =
                document.createElement(
                    "button"
                );


            completeButton.textContent =
                task.completed
                    ? "↩ Undo"
                    : "✓ Complete";


            completeButton.type =
                "button";


            completeButton.onclick =
                function() {

                    toggleTask(
                        task.id
                    );

                };


            const editButton =
                document.createElement(
                    "button"
                );


            editButton.textContent =
                "✎ Edit";


            editButton.type =
                "button";


            editButton.onclick =
                function() {

                    editTask(
                        task.id
                    );

                };


            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.textContent =
                "Delete";


            deleteButton.type =
                "button";


            deleteButton.className =
                "delete-btn";


            deleteButton.onclick =
                function() {

                    deleteTask(
                        task.id
                    );

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


            li.appendChild(
                taskInfo
            );

            li.appendChild(
                buttons
            );


            taskList.appendChild(
                li
            );

        }
    );


    updateStats();
}


/* ==================================================
   COMPLETE / UNDO
================================================== */

async function toggleTask(id) {

    const task =
        tasks.find(
            function(item) {

                return item.id === id;

            }
        );


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

                completed:
                    newCompleted

            })
            .eq(
                "id",
                id
            );


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
            .eq(
                "id",
                id
            );


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
        tasks.filter(
            function(task) {

                return task.id !== id;

            }
        );


    displayTasks();

    displayCalendar();

    displayUpcoming();
}


/* ==================================================
   EDIT TASK
================================================== */

async function editTask(id) {

    const task =
        tasks.find(
            function(item) {

                return item.id === id;

            }
        );


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


    if (
        cleanedSubject === ""
    ) {

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


    if (
        cleanedTask === ""
    ) {

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
        ![
            "Low",
            "Medium",
            "High"
        ].includes(
            cleanedPriority
        )
    ) {

        cleanedPriority =
            "Low";
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
            .eq(
                "id",
                id
            );


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
}


/* ==================================================
   CLEAR COMPLETED TASKS
================================================== */

async function clearCompletedTasks() {

    const completedTasks =
        tasks.filter(
            function(task) {

                return task.completed;

            }
        );


    if (
        completedTasks.length === 0
    ) {

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
        completedTasks.map(
            function(task) {

                return task.id;

            }
        );


    const {
        error
    } =
        await supabaseClient
            .from("tasks")
            .delete()
            .in(
                "id",
                ids
            );


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
        tasks.filter(
            function(task) {

                return !task.completed;

            }
        );


    displayTasks();

    displayCalendar();

    displayUpcoming();
}


/* ==================================================
   STATISTICS
================================================== */

function updateStats() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(
            function(task) {

                return task.completed;

            }
        ).length;


    const pending =
        total - completed;


    const percentage =
        total === 0
            ? 0
            : Math.round(
                (
                    completed /
                    total
                ) *
                100
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
            percentage +
            "%";

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

    document.getElementById(
        "subjectInput"
    ).value = "";


    document.getElementById(
        "taskInput"
    ).value = "";


    document.getElementById(
        "dateInput"
    ).value = "";


    document.getElementById(
        "priorityInput"
    ).value =
        "Low";
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
            .filter(
                function(task) {

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


                    return (
                        taskDate >= today
                    );

                }
            )
            .sort(
                function(a, b) {

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

                }
            )
            .slice(
                0,
                5
            );


    if (
        upcoming.length === 0
    ) {

        upcomingList.innerHTML =
            `
                <p class="empty-message">
                    🎉 No upcoming deadlines.
                </p>
            `;

        return;
    }


    upcoming.forEach(
        function(task) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "deadline-item";


            const left =
                document.createElement(
                    "div"
                );


            const subject =
                document.createElement(
                    "div"
                );


            subject.className =
                "deadline-subject";


            subject.textContent =
                task.subject +
                " — " +
                task.task;


            const priority =
                document.createElement(
                    "div"
                );


            priority.className =
                "deadline-date";


            priority.textContent =
                "Priority: " +
                task.priority;


            left.appendChild(
                subject
            );


            left.appendChild(
                priority
            );


            const date =
                document.createElement(
                    "div"
                );


            date.className =
                "deadline-date";


            date.textContent =
                formatDate(
                    task.date
                );


            item.appendChild(
                left
            );


            item.appendChild(
                date
            );


            upcomingList.appendChild(
                item
            );

        }
    );
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


    if (
        !calendar ||
        !monthTitle
    ) {
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
            document.createElement(
                "div"
            );


        empty.className =
            "calendar-day empty";


        calendar.appendChild(
            empty
        );

    }


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const cell =
            document.createElement(
                "div"
            );


        cell.className =
            "calendar-day";


        const dayNumber =
            document.createElement(
                "div"
            );


        dayNumber.className =
            "day-number";


        dayNumber.textContent =
            day;


        cell.appendChild(
            dayNumber
        );


        const dateString =
            year +
            "-" +
            String(
                month + 1
            ).padStart(
                2,
                "0"
            ) +
            "-" +
            String(
                day
            ).padStart(
                2,
                "0"
            );


        const today =
            new Date();


        if (
            day ===
                today.getDate() &&
            month ===
                today.getMonth() &&
            year ===
                today.getFullYear()
        ) {

            cell.classList.add(
                "today"
            );

        }


        const dayTasks =
            tasks.filter(
                function(task) {

                    return (
                        task.date ===
                        dateString
                    );

                }
            );


        dayTasks.forEach(
            function(task) {

                const taskElement =
                    document.createElement(
                        "span"
                    );


                taskElement.className =
                    "calendar-task";


                taskElement.textContent =
                    task.subject +
                    ": " +
                    task.task;


                if (
                    task.completed
                ) {

                    taskElement.style.textDecoration =
                        "line-through";

                    taskElement.style.opacity =
                        "0.5";

                }


                cell.appendChild(
                    taskElement
                );

            }
        );


        calendar.appendChild(
            cell
        );

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
        isDark
            ? "true"
            : "false"
    );


    updateThemeButton();
}


/* ==================================================
   INITIAL THEME
================================================== */

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
   ENTER KEY - ADD TASK
================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

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
   START APP
================================================== */

loadTasks();
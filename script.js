let tasks = [];

let currentDate = new Date();


// ===============================
// LOAD USER TASKS
// ===============================

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


// ===============================
// ADD TASK
// ===============================

async function addTask() {

    const subject =
        document.getElementById(
            "subjectInput"
        ).value.trim();


    const task =
        document.getElementById(
            "taskInput"
        ).value.trim();


    const date =
        document.getElementById(
            "dateInput"
        ).value;


    const priority =
        document.getElementById(
            "priorityInput"
        ).value;


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
    } = await supabaseClient.auth.getUser();


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
    } = await supabaseClient
        .from("tasks")
        .insert({

            user_id: user.id,

            subject: subject,

            task: task,

            date:
                date === ""
                    ? null
                    : date,

            priority: priority,

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
}


// ===============================
// DISPLAY TASKS
// ===============================

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
        tasks.filter(function(task) {

            return (

                task.subject
                    .toLowerCase()
                    .includes(searchText)

                ||

                task.task
                    .toLowerCase()
                    .includes(searchText)

            );

        });


    filteredTasks.forEach(function(task) {

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
            " - " + task.task;


        const priorityText =
            document.createElement(
                "span"
            );

        priorityText.className =
            "priority";

        priorityText.textContent =
            "[" +
            task.priority +
            "]";


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
                "Due: " +
                task.date;

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
                ? "Undo"
                : "Complete";


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
            "Edit";


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

    });


    updateStats();
}


// ===============================
// COMPLETE / UNDO
// ===============================

async function toggleTask(id) {

    const task =
        tasks.find(function(task) {

            return task.id === id;

        });


    if (!task) {
        return;
    }


    const newCompleted =
        !task.completed;


    const {
        error
    } = await supabaseClient
        .from("tasks")
        .update({

            completed:
                newCompleted

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
}


// ===============================
// DELETE TASK
// ===============================

async function deleteTask(id) {

    if (
        !confirm(
            "Are you sure you want to delete this task?"
        )
    ) {

        return;
    }


    const {
        error
    } = await supabaseClient
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
        tasks.filter(function(task) {

            return task.id !== id;

        });


    displayTasks();

    displayCalendar();

    displayUpcoming();
}


// ===============================
// EDIT TASK
// ===============================

async function editTask(id) {

    const task =
        tasks.find(function(task) {

            return task.id === id;

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


    const newTask =
        prompt(
            "Enter task:",
            task.task
        );


    if (newTask === null) {
        return;
    }


    const newDate =
        prompt(
            "Enter date (YYYY-MM-DD):",
            task.date || ""
        );


    if (newDate === null) {
        return;
    }


    const {
        error
    } = await supabaseClient
        .from("tasks")
        .update({

            subject:
                newSubject.trim(),

            task:
                newTask.trim(),

            date:
                newDate.trim() === ""
                    ? null
                    : newDate.trim()

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
        newSubject.trim();

    task.task =
        newTask.trim();

    task.date =
        newDate.trim() === ""
            ? null
            : newDate.trim();


    displayTasks();

    displayCalendar();

    displayUpcoming();
}


// ===============================
// STATISTICS
// ===============================

function updateStats() {

    const total =
        tasks.length;


    const completed =
        tasks.filter(function(task) {

            return task.completed;

        }).length;


    const pending =
        total - completed;


    const percentage =
        total === 0
            ? 0
            : Math.round(
                (
                    completed /
                    total
                ) * 100
            );


    document.getElementById(
        "totalTasks"
    ).textContent =
        total;


    document.getElementById(
        "completedTasks"
    ).textContent =
        completed;


    document.getElementById(
        "pendingTasks"
    ).textContent =
        pending;


    document.getElementById(
        "progressPercent"
    ).textContent =
        percentage + "%";


    document.getElementById(
        "progress"
    ).textContent =
        "Completed: " +
        completed +
        " / " +
        total;
}


// ===============================
// CLEAR INPUTS
// ===============================

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


// ===============================
// UPCOMING DEADLINES
// ===============================

function displayUpcoming() {

    const upcomingList =
        document.getElementById(
            "upcomingList"
        );


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
            .filter(function(task) {

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

            })
            .sort(function(a, b) {

                return (
                    new Date(
                        a.date
                    ) -
                    new Date(
                        b.date
                    )
                );

            })
            .slice(0, 5);


    if (
        upcoming.length === 0
    ) {

        upcomingList.innerHTML =
            '<p class="empty-message">' +
            'No upcoming deadlines.' +
            '</p>';

        return;
    }


    upcoming.forEach(function(task) {

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
            " - " +
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

    });
}


// ===============================
// CALENDAR
// ===============================

function displayCalendar() {

    const calendar =
        document.getElementById(
            "calendar"
        );


    const monthTitle =
        document.getElementById(
            "monthTitle"
        );


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

                    taskElement.style
                        .textDecoration =
                        "line-through";

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


// ===============================
// MONTH NAVIGATION
// ===============================

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


// ===============================
// FORMAT DATE
// ===============================

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(
            dateString +
            "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-US",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


// ===============================
// DARK MODE
// ===============================

function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );


    const isDark =
        document.body.classList.contains(
            "dark"
        );


    document.getElementById(
        "themeButton"
    ).textContent =
        isDark
            ? "Light Mode"
            : "Dark Mode";


    localStorage.setItem(
        "darkMode",
        isDark
    );
}


if (
    localStorage.getItem(
        "darkMode"
    ) === "true"
) {

    document.body.classList.add(
        "dark"
    );


    document.getElementById(
        "themeButton"
    ).textContent =
        "Light Mode";
}


// ===============================
// START APP
// ===============================

loadTasks();
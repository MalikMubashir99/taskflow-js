
const taskForm = document.querySelector("#taskForm");
const taskList = document.querySelector("#taskList");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Save tasks in local storage
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Show all tasks on the page
function renderTasks(data = tasks) {
    taskList.innerHTML = "";

    const emptyMessage = document.querySelector("#emptyMessage");
    emptyMessage.style.display = data.length === 0 ? "block" : "none";

    data.forEach(task => {
        const card = document.createElement("article");
        card.className = `task-card ${task.completed ? "completed" : ""}`;

        card.innerHTML = `
            <div class="task-info">
                <h3>${escapeHTML(task.title)}</h3>
                <p>${escapeHTML(task.description)}</p>

                <div class="task-meta">
                    <span class="priority ${task.priority}">
                        ${task.priority} Priority
                    </span>
                    <span>Due: ${task.date}</span>
                </div>
            </div>

            <div class="task-actions">
                <button class="complete" data-action="toggle" data-id="${task.id}">
                    ${task.completed ? "Undo" : "Complete"}
                </button>

                <button class="edit" data-action="edit" data-id="${task.id}">
                    Edit
                </button>

                <button class="delete" data-action="delete" data-id="${task.id}">
                    Delete
                </button>
            </div>
        `;

        taskList.appendChild(card);
    });

    updateStats();
}

// Prevent HTML from being entered through task details
function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Create a new task or update an existing one
taskForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const task = {
        id: Date.now(),
        title: document.querySelector("#taskTitle").value.trim(),
        description: document.querySelector("#taskDescription").value.trim(),
        priority: document.querySelector("#taskPriority").value,
        date: document.querySelector("#taskDate").value,
        completed: false
    };

    if (!task.title) return;

    const editId = Number(taskForm.dataset.editId);
    const existingTask = tasks.find(task => task.id === editId);

    if (existingTask) {
        existingTask.title = task.title;
        existingTask.description = task.description;
        existingTask.priority = task.priority;
        existingTask.date = task.date;

        delete taskForm.dataset.editId;
    } else {
        tasks.push(task);
    }

    saveTasks();
    renderTasks();

    taskForm.reset();
    taskForm.classList.remove("show");
});

// Handle task buttons
taskList.addEventListener("click", function(e) {
    const button = e.target.closest("button[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.action;

    if (action === "delete") {
        tasks = tasks.filter(task => task.id !== id);
    }

    if (action === "toggle") {
        const task = tasks.find(task => task.id === id);

        if (task) {
            task.completed = !task.completed;
        }
    }

    if (action === "edit") {
        editTask(id);
        return;
    }

    saveTasks();
    renderTasks();
});

// Load task details into the form
function editTask(id) {
    const task = tasks.find(task => task.id === id);

    if (!task) return;

    document.querySelector("#taskTitle").value = task.title;
    document.querySelector("#taskDescription").value = task.description;
    document.querySelector("#taskPriority").value = task.priority;
    document.querySelector("#taskDate").value = task.date;

    taskForm.dataset.editId = id;
    taskForm.classList.add("show");

    document.querySelector("#taskTitle").focus();
}

// Update dashboard statistics
function updateStats() {
    document.querySelector("#totalTasks").textContent = tasks.length;

    document.querySelector("#completedTasks").textContent =
        tasks.filter(task => task.completed).length;

    document.querySelector("#pendingTasks").textContent =
        tasks.filter(task => !task.completed).length;
}

// Search and filter tasks
document.querySelector("#searchTask").addEventListener("input", filterTasks);
document.querySelector("#filterTask").addEventListener("change", filterTasks);

function filterTasks() {
    const search = document.querySelector("#searchTask").value.toLowerCase();
    const filter = document.querySelector("#filterTask").value;

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(search);

        const matchesFilter =
            filter === "all" ||
            (filter === "completed" && task.completed) ||
            (filter === "pending" && !task.completed);

        return matchesSearch && matchesFilter;
    });

    renderTasks(filteredTasks);
}

// Open form for a new task
document.querySelector("#openForm").addEventListener("click", function() {
    delete taskForm.dataset.editId;
    taskForm.reset();
    taskForm.classList.add("show");
});

// Close form without saving
document.querySelector("#cancelForm").addEventListener("click", function() {
    taskForm.reset();
    delete taskForm.dataset.editId;
    taskForm.classList.remove("show");
});

// Load saved tasks when the page opens
renderTasks();

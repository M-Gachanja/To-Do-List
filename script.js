document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("task-input");
  const categorySelect = document.getElementById("category-select");
  const dueDateInput = document.getElementById("due-date");
  const addTaskBtn = document.getElementById("add-task-btn");
  const taskTbody = document.getElementById("task-tbody");
  const toast = document.getElementById("toast");
  const filterCategory = document.getElementById("filter-category");
  const searchTask = document.getElementById("search-task");

  dueDateInput.valueAsDate = new Date();

  addTaskBtn.addEventListener("click", addTask);
  filterCategory.addEventListener("change", loadTasks);
  searchTask.addEventListener("input", loadTasks);

  function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove("show"), 3000);
  }

  function addTask() {
    const text = taskInput.value.trim();
    const category = categorySelect.value;
    const dueDate = dueDateInput.value;

    if (!text) return showToast("Please enter a task.", "error");

    const task = {
      id: Date.now(),
      text,
      category,
      dueDate,
      completed: false,
    };

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));

    loadTasks();
    taskInput.value = "";
    showToast("Task added!", "success");
  }

  function renderTask(task) {
    const row = document.createElement("tr");

    const due = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    row.className = task.completed ? "completed" : diff < 0 ? "urgent" : diff <= 2 ? "upcoming" : "normal";

    row.innerHTML = `
      <td><input type="checkbox" ${task.completed ? "checked" : ""} onchange="toggleComplete(${task.id})"></td>
      <td>${task.text}</td>
      <td>${formatDueDate(task.dueDate, diff)}</td>
      <td>${capitalize(task.category)}</td>
      <td><button onclick="deleteTask(${task.id})" style="background-color: grey; color: white; border: none; padding: 6px 12px; border-radius: 4px;">Delete</button></td>
    `;

    taskTbody.appendChild(row);
  }

  function formatDueDate(dateString, daysDiff) {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric' };
    const formatted = date.toLocaleDateString("en-US", options);
    if (daysDiff < 0) return `Overdue (${formatted})`;
    if (daysDiff === 0) return `Today (${formatted})`;
    if (daysDiff === 1) return `Tomorrow (${formatted})`;
    return `In ${daysDiff} days (${formatted})`;
  }

  function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  window.deleteTask = function(id) {
    const confirmed = confirm("Are you sure you want to delete this task?");
    if (!confirmed) return;
    
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks = tasks.filter((t) => t.id !== id);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    loadTasks();
    showToast("Task deleted", "error");
  }

  window.toggleComplete = function(id) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.completed = !task.completed;
      localStorage.setItem("tasks", JSON.stringify(tasks));
      loadTasks();
    }
  }

  function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const filter = filterCategory.value;
    const search = searchTask.value.toLowerCase();

    taskTbody.innerHTML = "";
    tasks.filter(t =>
      (filter === "all" || t.category === filter) &&
      t.text.toLowerCase().includes(search)
    ).forEach(renderTask);
  }

  loadTasks();
});
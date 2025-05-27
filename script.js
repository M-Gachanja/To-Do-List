document.addEventListener("DOMContentLoaded", () => {
  const taskInput = document.getElementById("task-input");
  const categorySelect = document.getElementById("category-select");
  const dueDateInput = document.getElementById("due-date");
  const addTaskBtn = document.getElementById("add-task-btn");
  const taskTbody = document.getElementById("task-tbody");
  const toast = document.getElementById("toast");

  dueDateInput.valueAsDate = new Date();

  addTaskBtn.addEventListener("click", addTask);

  function showToast(message, type = "success") {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove("show"), 3000);
  }

  function addTask() {
    const text = taskInput.value.trim();
    const category = categorySelect.value;
    const dueDate = dueDateInput.value;

    if (!text) {
      showToast("Please enter a task.", "error");
      return;
    }

    const task = {
      id: Date.now(),
      text,
      category,
      dueDate,
    };

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));

    renderTask(task);
    taskInput.value = "";
    showToast("Task added!", "success");
  }

  function renderTask(task) {
    const row = document.createElement("tr");

    const due = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (diff < 0) row.className = "urgent";
    else if (diff <= 2) row.className = "upcoming";
    else row.className = "normal";

    row.innerHTML = `
      <td>${task.text}</td>
      <td>${formatDueDate(task.dueDate, diff)}</td>
      <td>${capitalize(task.category)}</td>
      <td><button onclick="deleteTask(${task.id})">Delete</button></td>
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

  function deleteTask(id) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks = tasks.filter((t) => t.id !== id);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    loadTasks();
    showToast("Task deleted", "error");
  }

  window.deleteTask = deleteTask;

  function loadTasks() {
    taskTbody.innerHTML = "";
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.forEach(renderTask);
  }

  loadTasks();
});
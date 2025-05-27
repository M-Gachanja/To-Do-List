document.addEventListener('DOMContentLoaded', () => {
  const taskInput = document.getElementById('task-input');
  const categorySelect = document.getElementById('category-select');
  const dueDateInput = document.getElementById('due-date');
  const addTaskBtn = document.getElementById('add-task-btn');
  const filterCategory = document.getElementById('filter-category');
  const taskList = document.getElementById('task-list');
  const toast = document.getElementById('toast');

  // Set default due date to today
  dueDateInput.valueAsDate = new Date();

  // Insert table into DOM BEFORE accessing taskTbody
  taskList.innerHTML = `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr>
          <th style="text-align: left;">Task</th>
          <th>Due Date</th>
          <th>Category</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody id="task-tbody"></tbody>
    </table>
  `;
  const taskTbody = document.getElementById('task-tbody');

  // Now it's safe to call loadTasks
  loadTasks();


  addTaskBtn.addEventListener('click', addTask);
  taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
  });

  filterCategory.addEventListener('change', filterTasks);

  function showToast(message, type = 'success') {
    if (!toast) return;
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText === '') {
      showToast('Please enter a task', 'error');
      return;
    }

    const task = {
      id: Date.now(),
      text: taskText,
      category: categorySelect.value,
      dueDate: dueDateInput.value,
      completed: false
    };

    saveTask(task);
    renderTask(task);
    taskInput.value = '';
    showToast('Task added successfully!');
  }

  function saveTask(task) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    taskTbody.innerHTML = ''; // Ensure we clear before rendering
    tasks.forEach(renderTask);
  }

  function renderTask(task) {
    const tr = document.createElement('tr');
    tr.dataset.id = task.id;

    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const timeDiff = dueDate - today;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    let dueClass = '';
    if (daysDiff < 0) dueClass = 'urgent';
    else if (daysDiff <= 2) dueClass = 'upcoming';

    // Background color based on urgency
    let bgColor = '#f9f9f9';
    if (dueClass === 'urgent') bgColor = '#f8d7da'; // red
    else if (dueClass === 'upcoming') bgColor = '#fff3cd'; // yellow

    const categoryName = task.category ? task.category.charAt(0).toUpperCase() + task.category.slice(1) : 'Other';

    tr.style.backgroundColor = bgColor;

    tr.innerHTML = `
      <td><strong>${task.text}</strong></td>
      <td class="${dueClass}">${formatDueDate(task.dueDate, daysDiff)}</td>
      <td>${categoryName}</td>
      <td><button class="delete-btn">Delete</button></td>
    `;

    tr.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));
    taskTbody.appendChild(tr);
  }

  function formatDueDate(dateString, daysDiff) {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const formatted = date.toLocaleDateString('en-US', options);

    if (daysDiff < 0) return `Overdue: ${formatted}`;
    if (daysDiff === 0) return `Today: ${formatted}`;
    if (daysDiff === 1) return `Tomorrow: ${formatted}`;
    return `In ${daysDiff} days: ${formatted}`;
  }

  function deleteTask(taskId) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskIndex = tasks.findIndex(task => task.id == taskId);
    if (taskIndex === -1) return;

    const taskText = tasks[taskIndex].text;
    tasks = tasks.filter(task => task.id != taskId);
    localStorage.setItem('tasks', JSON.stringify(tasks));

    const row = taskTbody.querySelector(`tr[data-id="${taskId}"]`);
    if (row) row.remove();

    showToast(`Task "${taskText}" deleted`, 'error');
  }

  function filterTasks() {
    const category = filterCategory.value;
    const rows = taskTbody.querySelectorAll('tr');

    rows.forEach(row => {
      const catText = row.children[2].textContent.toLowerCase();
      row.style.display = (category === 'all' || category === catText) ? '' : 'none';
    });
  }
});
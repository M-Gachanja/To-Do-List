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

    // Load tasks
    loadTasks();

    // Add task
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addTask();
    });

    // Filter tasks
    filterCategory.addEventListener('change', filterTasks);

    function showToast(message, type = 'success') {
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
      let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      tasks.push(task);
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
      const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      tasks.forEach(renderTask);
    }

    function renderTask(task) {
      const tr = document.createElement('tr');
      tr.dataset.id = task.id;
      if (task.completed) tr.classList.add('completed');
    
      // Calculate due date urgency
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const timeDiff = dueDate - today;
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
      if (daysDiff < 0) tr.classList.add('overdue');
      else if (daysDiff <= 2) tr.classList.add('upcoming');
      else tr.classList.add('normal');
    
      const formattedDue = formatDueDate(task.dueDate, daysDiff);
    
      tr.innerHTML = `
        <td class="task-text">${task.text}</td>
        <td>${formattedDue}</td>
        <td>
          <span class="category-indicator category-${task.category}"></span>
          ${task.category.charAt(0).toUpperCase() + task.category.slice(1)}
        </td>
        <td>
          <button class="delete-btn">Delete</button>
        </td>
      `;
    
      tr.querySelector('.task-text').addEventListener('click', () => toggleComplete(task.id));
      tr.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));
      taskList.appendChild(tr);
    }

    function formatDueDate(dateString, daysDiff) {
      if (!dateString) return 'No due date';
      const date = new Date(dateString);
      const options = { weekday: 'short', month: 'short', day: 'numeric' };
      const formattedDate = date.toLocaleDateString('en-US', options);

      if (daysDiff < 0) return `Overdue: ${formattedDate}`;
      if (daysDiff === 0) return `Due today: ${formattedDate}`;
      if (daysDiff === 1) return `Due tomorrow: ${formattedDate}`;
      return `Due in ${daysDiff} days: ${formattedDate}`;
    }

    function toggleComplete(taskId) {
      let tasks = JSON.parse(localStorage.getItem('tasks'));
      const taskIndex = tasks.findIndex(task => task.id == taskId);
      tasks[taskIndex].completed = !tasks[taskIndex].completed;
      localStorage.setItem('tasks', JSON.stringify(tasks));

      const li = document.querySelector(`li[data-id="${taskId}"]`);
      li.classList.toggle('completed');
      
      const action = tasks[taskIndex].completed ? 'completed' : 'marked incomplete';
      showToast(`Task ${action}`, 'info');
    }

    function deleteTask(taskId) {
      let tasks = JSON.parse(localStorage.getItem('tasks'));
      const taskIndex = tasks.findIndex(task => task.id == taskId);
      const taskText = tasks[taskIndex].text;
      
      tasks = tasks.filter(task => task.id != taskId);
      localStorage.setItem('tasks', JSON.stringify(tasks));

      const li = document.querySelector(`li[data-id="${taskId}"]`);
      li.remove();
      
      showToast(`Task "${taskText}" deleted`, 'error');
    }

    function filterTasks() {
      const category = filterCategory.value;
      const tasks = document.querySelectorAll('li');

      tasks.forEach(task => {
        if (category === 'all' || task.classList.contains(category)) {
          task.style.display = 'flex';
        } else {
          task.style.display = 'none';
        }
      });
    }
  });
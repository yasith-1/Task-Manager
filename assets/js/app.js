// Task management
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentView = 'all'; // all, active, completed

// DOM elements
const elements = {
  todoList: document.getElementById('todo-list'),
  todoInput: document.getElementById('todo-input'),
  totalTasksCount: document.getElementById('total-tasks'),
  completedTasksCount: document.getElementById('completed-tasks'),
  pendingTasksCount: document.getElementById('pending-tasks'),
  prioritySelect: document.getElementById('priority-select'),
  viewAllBtn: document.getElementById('view-all'),
  viewActiveBtn: document.getElementById('view-active'),
  viewCompletedBtn: document.getElementById('view-completed')
};

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  updateTaskStats();
  setupEventListeners();
  updateDateTime();
  setInterval(updateDateTime, 1000);
});

// Setup event listeners
function setupEventListeners() {
  elements.viewAllBtn.addEventListener('click', () => changeView('all'));
  elements.viewActiveBtn.addEventListener('click', () => changeView('active'));
  elements.viewCompletedBtn.addEventListener('click', () => changeView('completed'));
}

// Save tasks to localStorage
function saveTasksToLocalStorage() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  updateTaskStats();
}

// Load tasks from localStorage
function loadTasks() {
  renderTasks();
}

// Render tasks based on current view
function renderTasks() {
  elements.todoList.innerHTML = '';
  
  const tasksToRender = filterTasksByView();
  
  if (tasksToRender.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-message';
    emptyMessage.textContent = 'No tasks to display';
    elements.todoList.appendChild(emptyMessage);
    return;
  }

  tasksToRender.forEach((task, index) => {
    const actualIndex = tasks.findIndex(t => t.id === task.id);
    const listItem = createTaskElement(task, actualIndex);
    elements.todoList.appendChild(listItem);
  });
}

// Filter tasks based on current view
function filterTasksByView() {
  switch (currentView) {
    case 'active':
      return tasks.filter(task => !task.done);
    case 'completed':
      return tasks.filter(task => task.done);
    default:
      return [...tasks];
  }
}

// Create a task element
function createTaskElement(task, index) {
  const listItem = document.createElement('li');
  if (task.done) listItem.classList.add('done');
  
  const priorityClass = `priority-${task.priority || 'normal'}`;
  const priorityLabel = task.priority ? 
                        (task.priority.charAt(0).toUpperCase() + task.priority.slice(1)) : 
                        'Normal';
  
  const formattedDate = new Date(task.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  listItem.innerHTML = `
    <div class="task-content">
      <div class="task-checkbox">
        <span class="custom-checkbox ${task.done ? 'checked' : ''}" 
              onclick="toggleTaskStatus(${index})"></span>
      </div>
      <div class="task-text">${task.text}</div>
      <span class="task-priority ${priorityClass}">${priorityLabel}</span>
      <span class="task-date">${formattedDate}</span>
      <div class="task-actions">
        <button class="task-btn edit-btn" onclick="editTask(${index})">
          <i class="fas fa-pencil-alt"></i>
        </button>
        <button class="task-btn delete-btn" onclick="removeTask(${index})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `;

  return listItem;
}

// Add a new task
function addTask(event) {
  event.preventDefault();

  const taskText = elements.todoInput.value.trim();
  if (taskText === '') return;

  const priority = elements.prioritySelect.value;
  
  const newTask = {
    id: Date.now(),
    text: taskText,
    done: false,
    priority: priority,
    createdAt: new Date().toISOString()
  };

  tasks.unshift(newTask);
  saveTasksToLocalStorage();
  elements.todoInput.value = '';
  renderTasks();
  
  Swal.fire({
    icon: 'success',
    title: 'Task Added',
    text: 'Your task has been added successfully!',
    confirmButtonColor: '#4f46e5',
    timer: 1500,
    timerProgressBar: true,
    showConfirmButton: false
  });
}

// Toggle task status (done/undone)
function toggleTaskStatus(index) {
  tasks[index].done = !tasks[index].done;
  saveTasksToLocalStorage();
  renderTasks();
  
  const status = tasks[index].done ? 'completed' : 'active';
  
  Swal.fire({
    icon: 'success',
    title: `Task marked as ${status}`,
    showConfirmButton: false,
    timer: 1000,
    timerProgressBar: true,
    toast: true,
    position: 'bottom-end'
  });
}

// Edit task
function editTask(index) {
  const task = tasks[index];
  
  Swal.fire({
    title: 'Edit Task',
    input: 'text',
    inputValue: task.text,
    inputAttributes: {
      autocapitalize: 'off'
    },
    showCancelButton: true,
    confirmButtonText: 'Save',
    confirmButtonColor: '#4f46e5',
    showLoaderOnConfirm: true,
    preConfirm: (value) => {
      if (!value.trim()) {
        Swal.showValidationMessage('Task text cannot be empty')
      }
      return value.trim();
    }
  }).then((result) => {
    if (result.isConfirmed) {
      task.text = result.value;
      saveTasksToLocalStorage();
      renderTasks();
      showToast('Task updated successfully!');
    }
  });
}

// Remove task
function removeTask(index) {
  Swal.fire({
    title: 'Are you sure?',
    text: 'You will not be able to recover this task!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'No, keep it',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6B7280'
  }).then((result) => {
    if (result.isConfirmed) {
      tasks.splice(index, 1);
      saveTasksToLocalStorage();
      renderTasks();
      
      Swal.fire({
        title: 'Deleted!',
        text: 'Your task has been deleted.',
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false
      });
    }
  });
}

// Clear completed tasks
function clearCompleted() {
  const completedCount = tasks.filter(task => task.done).length;
  
  if (completedCount === 0) {
    Swal.fire({
      icon: 'info',
      title: 'No completed tasks',
      text: 'There are no completed tasks to clear.',
      confirmButtonColor: '#4f46e5',
      timer: 2000,
      timerProgressBar: true
    });
    return;
  }
  
  Swal.fire({
    title: 'Clear completed tasks?',
    text: `You will remove ${completedCount} completed task(s).`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, clear them!',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#4f46e5',
    cancelButtonColor: '#6B7280'
  }).then((result) => {
    if (result.isConfirmed) {
      tasks = tasks.filter(task => !task.done);
      saveTasksToLocalStorage();
      renderTasks();
      
      Swal.fire({
        icon: 'success',
        title: 'Cleared!',
        text: 'All completed tasks have been removed.',
        confirmButtonColor: '#4f46e5',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false
      });
    }
  });
}

// Clear all tasks
function clearAll() {
  if (tasks.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'No tasks',
      text: 'There are no tasks to clear.',
      confirmButtonColor: '#4f46e5',
      timer: 2000,
      timerProgressBar: true
    });
    return;
  }
  
  Swal.fire({
    title: 'Clear all tasks?',
    text: `You will remove all ${tasks.length} task(s). This cannot be undone!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, clear all!',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6B7280'
  }).then((result) => {
    if (result.isConfirmed) {
      tasks = [];
      saveTasksToLocalStorage();
      renderTasks();
      
      Swal.fire({
        icon: 'success',
        title: 'All Clear!',
        text: 'All tasks have been removed.',
        confirmButtonColor: '#4f46e5',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false
      });
    }
  });
}

// Change current view
function changeView(view) {
  currentView = view;
  
  // Update active button
  elements.viewAllBtn.classList.toggle('active', view === 'all');
  elements.viewActiveBtn.classList.toggle('active', view === 'active');
  elements.viewCompletedBtn.classList.toggle('active', view === 'completed');
  
  renderTasks();
}

// Update task statistics
function updateTaskStats() {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.done).length;
  const pendingTasks = totalTasks - completedTasks;
  
  elements.totalTasksCount.textContent = totalTasks;
  elements.completedTasksCount.textContent = completedTasks;
  elements.pendingTasksCount.textContent = pendingTasks;
}

// Update date and time display
function updateDateTime() {
  const currentDate = new Date();
  
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  document.getElementById('today-date').textContent = formattedDate;
  document.getElementById('current-time').textContent = formattedTime;
}

// Show a custom SweetAlert toast notification
function showToast(message, type = 'success') {
  const Toast = Swal.mixin({
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  });
  
  Toast.fire({
    icon: type,
    title: message
  });
}
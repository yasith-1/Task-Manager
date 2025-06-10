// Sample data - In real application, this would come from your task manager
        let tasks = [
            {
                id: 1,
                text: "Complete project proposal",
                priority: "high",
                completed: false,
                date: new Date('2024-12-18')
            },
            {
                id: 2,
                text: "Review team performance",
                priority: "normal",
                completed: true,
                date: new Date('2024-12-17')
            },
            {
                id: 3,
                text: "Update website content",
                priority: "low",
                completed: false,
                date: new Date('2024-12-16')
            },
            {
                id: 4,
                text: "Prepare presentation slides",
                priority: "high",
                completed: true,
                date: new Date('2024-12-15')
            },
            {
                id: 5,
                text: "Schedule team meeting",
                priority: "normal",
                completed: false,
                date: new Date('2024-12-19')
            },
            {
                id: 6,
                text: "Research market trends",
                priority: "low",
                completed: true,
                date: new Date('2024-12-14')
            }
        ];

        function updateStats() {
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(task => task.completed).length;
            const pendingTasks = totalTasks - completedTasks;
            const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            document.getElementById('total-tasks-stat').textContent = totalTasks;
            document.getElementById('completed-tasks-stat').textContent = completedTasks;
            document.getElementById('pending-tasks-stat').textContent = pendingTasks;
            document.getElementById('completion-rate').textContent = completionRate + '%';

            // Update progress circle
            const progressCircle = document.getElementById('progress-circle');
            const progressPercentage = document.getElementById('progress-percentage');
            const circumference = 2 * Math.PI * 90;
            const offset = circumference - (completionRate / 100) * circumference;
            
            progressCircle.style.strokeDashoffset = offset;
            progressPercentage.textContent = completionRate + '%';

            updateInsights();
        }

        function updateInsights() {
            const highPriorityPending = tasks.filter(task => task.priority === 'high' && !task.completed).length;
            const thisWeek = tasks.filter(task => {
                const taskDate = new Date(task.date);
                const now = new Date();
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return taskDate >= weekAgo && taskDate <= now;
            }).length;

            document.getElementById('high-priority-count').textContent = highPriorityPending + ' pending';
            document.getElementById('weekly-tasks').textContent = thisWeek + ' tasks';

            // Achievement based on completion rate
            const completionRate = tasks.length > 0 ? (tasks.filter(task => task.completed).length / tasks.length) * 100 : 0;
            let achievement = "Getting started!";
            if (completionRate >= 80) achievement = "Task Master! 🏆";
            else if (completionRate >= 60) achievement = "Great Progress! 🌟";
            else if (completionRate >= 40) achievement = "Keep Going! 💪";
            else if (completionRate >= 20) achievement = "Building Momentum! 🚀";

            document.getElementById('achievement').textContent = achievement;
        }

        function renderTasks(tasksToRender = tasks, containerId = 'all-tasks-list') {
            const container = document.getElementById(containerId);
            
            if (tasksToRender.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-clipboard-list"></i>
                        <p>No tasks found.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = tasksToRender.map(task => `
                <div class="task-item ${task.completed ? 'completed' : ''} ${task.priority}-priority">
                    <div class="task-header">
                        <div class="task-text ${task.completed ? 'completed' : ''}">${task.text}</div>
                        <span class="task-priority priority-${task.priority}">${task.priority}</span>
                    </div>
                    <div class="task-date">
                        <i class="fas fa-calendar"></i> ${task.date.toLocaleDateString()}
                    </div>
                </div>
            `).join('');
        }

        function filterTasks(priority) {
            // Update active filter button
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');

            let filteredTasks = tasks;
            if (priority !== 'all') {
                filteredTasks = tasks.filter(task => task.priority === priority);
            }
            renderTasks(filteredTasks);
        }

        function initializeDashboard() {
            updateStats();
            renderTasks();
            renderTasks(tasks.filter(task => task.completed), 'completed-tasks-list');
        }

        // Function to add new task (would be called from main task manager)
        function addTaskToDashboard(taskData) {
            tasks.unshift({
                id: Date.now(),
                text: taskData.text,
                priority: taskData.priority,
                completed: false,
                date: new Date()
            });
            initializeDashboard();
        }

        // Function to update task status (would be called from main task manager)
        function updateTaskStatus(taskId, completed) {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                task.completed = completed;
                initializeDashboard();
            }
        }

        // Function to redirect to task manager application
        function redirectToTaskManager() {
            // Option 1: If your task manager is in the same directory
            window.location.href = 'index.html'; // or whatever your main task manager file is named
            
            // Option 2: If you want to open in a new tab
            // window.open('index.html', '_blank');
            
            // Option 3: If your task manager is in a different path
            // window.location.href = './path-to-your-task-manager/index.html';
        }

        // Initialize dashboard on load
        document.addEventListener('DOMContentLoaded', initializeDashboard);

        // Auto-refresh stats every 30 seconds
        setInterval(updateStats, 30000);
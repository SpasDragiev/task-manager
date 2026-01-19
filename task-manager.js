let tasks = [];
let currentFilter = { status: 'all', category: 'all', priority: 'all', search: '' };
let currentSort = 'deadline';
let editingTaskId = null;
let taskIdCounter = 1;

const totalTasksEl = document.getElementById('totalTasks');
const activeTasksEl = document.getElementById('activeTasks');
const completedTasksEl = document.getElementById('completedTasks');
const todayTasksEl = document.getElementById('todayTasks');

const themeToggleBtn = document.getElementById('themeToggle');

const addTaskForm = document.getElementById('addTaskForm');
const taskTitleInput = document.getElementById('taskTitle');
const taskCategoryInput = document.getElementById('taskCategory');
const taskPriorityInput = document.getElementById('taskPriority');
const taskDeadlineInput = document.getElementById('taskDeadline');
const taskDescriptionInput = document.getElementById('taskDescription');

const filterStatusEl = document.getElementById('filterStatus');
const filterCategoryEl = document.getElementById('filterCategory');
const filterPriorityEl = document.getElementById('filterPriority');
const searchInputEl = document.getElementById('searchInput');
const clearFiltersBtn = document.getElementById('clearFilters');

const sortTasksEl = document.getElementById('sortTasks');
const tasksListEl = document.getElementById('tasksList');
const emptyStateEl = document.getElementById('emptyState');

const editModal = document.getElementById('editModal');
const closeModalBtn = document.getElementById('closeModal');
const editTaskForm = document.getElementById('editTaskForm');
const cancelEditBtn = document.getElementById('cancelEdit');

const editTaskIdInput = document.getElementById('editTaskId');
const editTaskTitleInput = document.getElementById('editTaskTitle');
const editTaskCategoryInput = document.getElementById('editTaskCategory');
const editTaskPriorityInput = document.getElementById('editTaskPriority');
const editTaskDeadlineInput = document.getElementById('editTaskDeadline');
const editTaskDescriptionInput = document.getElementById('editTaskDescription');

function addTask(e) {
    e.preventDefault();
    const title = taskTitleInput.value.trim();
    const category = taskCategoryInput.value;
    const priority = taskPriorityInput.value;
    const deadline = taskDeadlineInput.value;
    const description = taskDescriptionInput.value.trim();

    if (!title) {
        alert('Моля въведете заглавие!');
        return;
    }

    const task = {
        id: taskIdCounter++,
        title,
        category,
        priority,
        deadline,
        description,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.push(task);
    saveTasks();
    addTaskForm.reset();
    renderTasks();
    updateStatistics();
    alert('✅ Задачата е добавена успешно!');
}

function renderTasks() {
    const filteredTasks = filterTasks();
    const sortedTasks = sortTasks(filteredTasks);

    if (sortedTasks.length === 0) {
        tasksListEl.innerHTML = '';
        emptyStateEl.style.display = 'block';
        return;
    }

    emptyStateEl.style.display = 'none';
    tasksListEl.innerHTML = '';

    for (let i = 0; i < sortedTasks.length; i++) {
        const task = sortedTasks[i];
        const taskCard = document.createElement('div');
        taskCard.className = 'task-card';
        if (task.completed) taskCard.classList.add('completed');

        const formattedDate = formatDate(new Date(task.deadline));
        taskCard.innerHTML = `
            <div class="task-priority ${task.priority}"></div>
            <div class="task-header">
                <div>
                    <div class="task-title">${task.title}</div>
                    <span class="task-category ${task.category}">${getCategoryName(task.category)}</span>
                </div>
            </div>
            <div class="task-description">${task.description || 'Няма описание'}</div>
            <div class="task-meta">
                <span>📅 ${formattedDate}</span>
                <span>🚦 ${getPriorityName(task.priority)}</span>
            </div>
            <div class="task-actions">
                <button class="btn-icon btn-complete" onclick="toggleComplete(${task.id})">
                    ${task.completed ? '↩️ Отмаркирай' : '✓ Завърши'}
                </button>
                <button class="btn-icon btn-edit" onclick="openEditModal(${task.id})">
                    ✏️ Редактирай
                </button>
                <button class="btn-icon btn-delete" onclick="deleteTask(${task.id})">
                    🗑️ Изтрий
                </button>
            </div>
        `;
        tasksListEl.appendChild(taskCard);
    }
}

function filterTasks() {
    let filtered = [...tasks];

    if (currentFilter.status !== 'all') {
        filtered = filtered.filter(task => 
            currentFilter.status === 'active' ? !task.completed : task.completed
        );
    }
    if (currentFilter.category !== 'all') {
        filtered = filtered.filter(task => task.category === currentFilter.category);
    }
    if (currentFilter.priority !== 'all') {
        filtered = filtered.filter(task => task.priority === currentFilter.priority);
    }
    if (currentFilter.search !== '') {
        const searchLower = currentFilter.search.toLowerCase();
        filtered = filtered.filter(task => 
            task.title.toLowerCase().includes(searchLower) ||
            task.description.toLowerCase().includes(searchLower)
        );
    }
    return filtered;
}

function sortTasks(tasksArray) {
    const sorted = [...tasksArray];
    switch(currentSort) {
        case 'deadline':
            sorted.sort((a,b)=> new Date(a.deadline) - new Date(b.deadline));
            break;
        case 'priority':
            const order = { high:1, medium:2, low:3 };
            sorted.sort((a,b)=> order[a.priority]-order[b.priority]);
            break;
        case 'category':
            sorted.sort((a,b)=> a.category.localeCompare(b.category));
            break;
        case 'created':
            sorted.sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));
            break;
    }
    return sorted;
}

function updateStatistics() {
    const total = tasks.length;
    let active = tasks.filter(t=>!t.completed).length;
    const completed = total - active;
    const today = new Date().toISOString().split('T')[0];
    const todayCount = tasks.filter(t=>t.deadline===today && !t.completed).length;

    totalTasksEl.textContent = total;
    activeTasksEl.textContent = active;
    completedTasksEl.textContent = completed;
    todayTasksEl.textContent = todayCount;
}

function toggleComplete(taskId) {
    const task = tasks.find(t=>t.id===taskId);
    if(!task){ console.error('Задачата не е намерена!'); return; }
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
    updateStatistics();
}

function deleteTask(taskId) {
    if(!confirm('Сигурни ли сте, че искате да изтриете тази задача?')) return;
    const index = tasks.findIndex(t=>t.id===taskId);
    if(index===-1){ console.error('Задачата не е намерена!'); return; }
    tasks.splice(index,1);
    saveTasks();
    renderTasks();
    updateStatistics();
}

function openEditModal(taskId) {
    const task = tasks.find(t=>t.id===taskId);
    if(!task){ console.error('Задачата не е намерена!'); return; }
    editingTaskId = taskId;
    editTaskIdInput.value = task.id;
    editTaskTitleInput.value = task.title;
    editTaskCategoryInput.value = task.category;
    editTaskPriorityInput.value = task.priority;
    editTaskDeadlineInput.value = task.deadline;
    editTaskDescriptionInput.value = task.description;
    editModal.classList.add('active');
}

function saveEditTask(e) {
    e.preventDefault();
    const task = tasks.find(t=>t.id===editingTaskId);
    if(!task){ console.error('Задачата не е намерена!'); return; }
    task.title = editTaskTitleInput.value.trim();
    task.category = editTaskCategoryInput.value;
    task.priority = editTaskPriorityInput.value;
    task.deadline = editTaskDeadlineInput.value;
    task.description = editTaskDescriptionInput.value.trim();
    saveTasks();
    renderTasks();
    updateStatistics();
    closeEditModal();
    alert('✅ Задачата е обновена успешно!');
}

function closeEditModal() {
    editModal.classList.remove('active');
    editingTaskId = null;
    editTaskForm.reset();
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('taskIdCounter', taskIdCounter);
}

function loadTasks() {
    const tasksJSON = localStorage.getItem('tasks');
    if(tasksJSON) tasks = JSON.parse(tasksJSON);
    const counter = localStorage.getItem('taskIdCounter');
    if(counter) taskIdCounter = parseInt(counter);
    renderTasks();
    updateStatistics();
}

function getCategoryName(category){
    switch(category){
        case 'school': return '🎓 Училище';
        case 'hobby': return '🎨 Хобита';
        case 'family': return '👨‍👩‍👧 Семейство';
        case 'sport': return '⚽ Спорт';
        case 'other': return '📌 Друго';
        default: return category;
    }
}

function getPriorityName(priority){
    switch(priority){
        case 'high': return '🔴 Висок';
        case 'medium': return '🟡 Среден';
        case 'low': return '🟢 Нисък';
        default: return priority;
    }
}

function formatDate(date){
    const day = date.getDate();
    const month = date.getMonth()+1;
    const year = date.getFullYear();
    const dayStr = day<10 ? '0'+day : day;
    const monthStr = month<10 ? '0'+month : month;
    return `${dayStr}.${monthStr}.${year}`;
}

function attachEventListeners(){
    addTaskForm.addEventListener('submit', addTask);
    filterStatusEl.addEventListener('change', ()=>{ currentFilter.status = filterStatusEl.value; renderTasks(); });
    filterCategoryEl.addEventListener('change', ()=>{ currentFilter.category = filterCategoryEl.value; renderTasks(); });
    filterPriorityEl.addEventListener('change', ()=>{ currentFilter.priority = filterPriorityEl.value; renderTasks(); });
    searchInputEl.addEventListener('input', ()=>{ currentFilter.search = searchInputEl.value; renderTasks(); });
    clearFiltersBtn.addEventListener('click', ()=>{
        filterStatusEl.value = 'all';
        filterCategoryEl.value = 'all';
        filterPriorityEl.value = 'all';
        searchInputEl.value = '';
        currentFilter = { status:'all', category:'all', priority:'all', search:'' };
        renderTasks();
    });
    sortTasksEl.addEventListener('change', ()=>{ currentSort = sortTasksEl.value; renderTasks(); });
    closeModalBtn.addEventListener('click', closeEditModal);
    cancelEditBtn.addEventListener('click', closeEditModal);
    editTaskForm.addEventListener('submit', saveEditTask);
    editModal.addEventListener('click', (e)=>{ if(e.target===editModal) closeEditModal(); });
    themeToggleBtn.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const body = document.body;
    const isLight = body.classList.contains('light-theme');
    if (isLight) {
        body.classList.remove('light-theme');
        themeToggleBtn.innerHTML = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.add('light-theme');
        themeToggleBtn.innerHTML = '🌙';
        localStorage.setItem('theme', 'light');
    }
}

function init(){
    loadTasks();
    attachEventListeners();
    const today = new Date().toISOString().split('T')[0];
    taskDeadlineInput.min = today;
    editTaskDeadlineInput.min = today;
    // Initialize theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        themeToggleBtn.innerHTML = '🌙';
    } else {
        themeToggleBtn.innerHTML = '☀️';
    }
}

if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', init);
}else{
    init();
}
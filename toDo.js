
  let tasksData = JSON.parse(localStorage.getItem("tasksData")) || {
    andrew: {
      todo: [
        { id: "task-29001", title: "Analyze new requirements" },
        { id: "task-29002", title: "Design new system" },
      ],
      "in-progress": [{ id: "task-29003", title: "Improve application performance" }],
      review: [{ id: "task-29004", title: "Test new features" }],
      done: [{ id: "task-29005", title: "Analyze SQL Server connection" }],
    },
    janet: {
      todo: [{ id: "task-29006", title: "Arrange a web meeting" }],
      "in-progress": [],
      review: [],
      done: [],
    },
  };

  function saveTasks() {
    localStorage.setItem("tasksData", JSON.stringify(tasksData));
  }

  function toggleUserTasks(userId) {
    const userTasksRow = document.getElementById(userId);
    const isExpanded = userTasksRow.style.display === "table-row";
    userTasksRow.style.display = isExpanded ? "none" : "table-row";
    document.querySelector(`.user-group[onclick="toggleUserTasks('${userId}')"]`)
      .setAttribute('aria-expanded', !isExpanded);
    updateTaskCount(userId);
  }

  function updateTaskCount(userId) {
    const userTasksRow = document.getElementById(userId);
    let taskCount = 0;
    userTasksRow.querySelectorAll(".column").forEach((column) => {
      taskCount += column.querySelectorAll(".kanban-card").length;
    });
    document.getElementById(`${userId}-count`).innerText = taskCount;
  }

  function allowDrop(event) {
    event.preventDefault();
  }

  function drag(event) {
    event.dataTransfer.setData("text", event.target.id);
  }

  function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const task = document.getElementById(data);
    const column = event.target.closest(".column");

    if (!column) return;

    const userId = column.closest("tr").id;
    const parts = column.id.split("-");
    const newCategory = parts.slice(0, parts.length - 1).join("-"); // une todo menos el último (que es el userId)
    

    task.classList.add("moving");

    setTimeout(() => {
      task.classList.remove("moving");

      // Remover de la categoría anterior
      for (const category in tasksData[userId]) {
        const index = tasksData[userId][category].findIndex((t) => t.id === task.id);
        if (index !== -1) {
          tasksData[userId][category].splice(index, 1);
          break;
        }
      }

      tasksData[userId][newCategory].push({ id: task.id, title: task.innerText });
      column.appendChild(task);

      saveTasks();
      updateTaskCount(userId);
    }, 300);
  }

  // Renderizado inicial de tareas
  for (const userId in tasksData) {
    for (const category in tasksData[userId]) {
      const column = document.getElementById(`${category}-${userId}`);
      if (!column) continue;

      tasksData[userId][category].forEach((task) => {
        const taskElement = document.createElement("sl-card");
        taskElement.classList.add("kanban-card");
        taskElement.setAttribute("data-category", category);
        taskElement.setAttribute("draggable", "true");
        taskElement.setAttribute("id", task.id);
        taskElement.innerText = task.title;
        taskElement.addEventListener('dragstart', drag);
        column.appendChild(taskElement);
      });
    }
  }

  document.getElementById('openDialogBtn').addEventListener('click', () => {
    const dialog = document.getElementById('addTaskDialog');
    dialog.show();
  });

  document.getElementById('cancelBtn').addEventListener('click', () => {
    const dialog = document.getElementById('addTaskDialog');
    dialog.close();
  });

  document.getElementById('addTaskForm').addEventListener('submit', (event) => {
    event.preventDefault();

    const title = document.getElementById('taskTitle').value;
    const user = document.getElementById('taskUser').value;
    const category = document.getElementById('taskCategory').value;
    const taskId = `task-${Date.now()}`;

    const taskData = {
      id: taskId,
      title: title,
    };

    tasksData[user][category].push(taskData);

    const newTask = document.createElement('sl-card');
    newTask.classList.add('kanban-card');
    newTask.setAttribute('data-category', category);
    newTask.setAttribute('draggable', 'true');
    newTask.setAttribute('id', taskId);
    newTask.innerText = title;
    newTask.addEventListener('dragstart', drag);

    const userRow = document.getElementById(user);
    userRow.style.display = "table-row"; // Asegura que esté visible

    const column = document.getElementById(`${category}-${user}`);
    column.appendChild(newTask);

    saveTasks();
    updateTaskCount(user);

    const dialog = document.getElementById('addTaskDialog');
    dialog.close();
    event.target.reset();
  });


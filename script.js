const firebaseConfig = {
  apiKey: "AIzaSyBFt8_hs1AksBfYuI3j0snbHUnNa11jRbo",
  authDomain: "to-do-list-242d0.firebaseapp.com",
  projectId: "to-do-list-242d0",
  storageBucket: "to-do-list-242d0.firebasestorage.app",
  messagingSenderId: "234994871223",
  appId: "1:234994871223:web:8809d7e9f1ba0c06a35632"
};

// FIREBASE INIT

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// GLOBAL ELEMENTS

const homeScreen = document.getElementById("homeScreen");
const addScreen = document.getElementById("addScreen");
const viewScreen = document.getElementById("viewScreen");

let unsubscribe = null;

//DARK MODE

window.toggleDarkMode = function () {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "darkMode",
    document.body.classList.contains("dark")
  );
  updateDarkButton();
};

(function initTheme() {
  const saved = localStorage.getItem("darkMode");

  if (
    saved === "true" ||
    (!saved &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    document.body.classList.add("dark");
  }

  updateDarkButton();
})();

function updateDarkButton() {
  const btn = document.querySelector('[onclick="toggleDarkMode()"]');
  if (!btn) return;

  btn.textContent =
    document.body.classList.contains("dark")
      ? "Light Mode"
      : "Dark Mode";
}

// TOAST

function showToast(msg) {
  const t = document.createElement("div");
  t.className = "toast-box";
  t.innerText = msg;
  document.body.appendChild(t);

  setTimeout(() => t.remove(), 3000);
}

// NAVIGATION

window.showAddTask = () => {
  homeScreen.classList.add("d-none");
  addScreen.classList.remove("d-none");
};

window.showViewTask = () => {
  homeScreen.classList.add("d-none");
  viewScreen.classList.remove("d-none");

  // Auto-load today
  document.getElementById("viewDate").valueAsDate = new Date();
  loadTasks();
};

window.goHome = () => {
  // Stop realtime listener
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }

  addScreen.classList.add("d-none");
  viewScreen.classList.add("d-none");
  homeScreen.classList.remove("d-none");
};

// ADD TASK

window.addTask = () => {
  const title = document.getElementById("taskTitle").value;
  const desc = document.getElementById("taskDesc").value;
  const rawDate = document.getElementById("taskDate").value;
  const important = document.getElementById("taskImportant").checked;

  if (!title || !rawDate) {
    showToast("Title and Date required");
    return;
  }

  const dueTS = firebase.firestore.Timestamp.fromDate(
    new Date(rawDate + "T00:00:00")
  );

  db.collection("tasks").add({
    title,
    description: desc,
    dueDate: dueTS,
    important,
    completed: false,
    created: new Date()
  });

  showToast("Task Saved");
  goHome();
};

// REALTIME TASK LOADING

window.loadTasks = () => {
  const rawDate = document.getElementById("viewDate").value;

  if (!rawDate) {
    showToast("Select date");
    return;
  }

  const start = new Date(rawDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(rawDate);
  end.setHours(23, 59, 59, 999);

  const startTS = firebase.firestore.Timestamp.fromDate(start);
  const endTS = firebase.firestore.Timestamp.fromDate(end);

  const list = document.getElementById("taskList");

  // Stop old listener
  if (unsubscribe) unsubscribe();

  unsubscribe = db.collection("tasks")
    .where("dueDate", ">=", startTS)
    .where("dueDate", "<=", endTS)
    .onSnapshot(snapshot => {

      list.innerHTML = "";

      const tasks = [];

      snapshot.forEach(doc => {
        tasks.push({ id: doc.id, ...doc.data() });
      });

      // Sort tasks
      tasks.sort((a, b) => {
        if (a.important && !b.important) return -1;
        if (!a.important && b.important) return 1;
        if (!a.completed && b.completed) return -1;
        if (a.completed && !b.completed) return 1;
        return 0;
      });

      let total = 0;
      let completed = 0;
      let importantPending = 0;

      const today = new Date();

      tasks.forEach(t => {

        total++;
        if (t.completed) completed++;
        if (t.important && !t.completed) importantPending++;

        const li = document.createElement("li");
        li.className = "border rounded p-2 mb-2 bg-light";

        if (t.completed) li.classList.add("task-completed");
        if (t.important) li.classList.add("task-important");

        const dueDate = t.dueDate.toDate();
        if (!t.completed && dueDate < today) {
          li.classList.add("task-overdue");
        }

        li.innerHTML = `
          <b>${t.title}</b><br>
          ${t.description || ""}<br>
          Important: ${t.important ? "Yes" : "No"}<br><br>
        `;

        // Buttons
        const completeBtn = document.createElement("button");
        completeBtn.className = "btn btn-sm btn-success me-2";
        completeBtn.innerText = t.completed ? "Undo" : "Complete";
        completeBtn.onclick = () => toggleComplete(t.id, t.completed);

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-sm btn-danger";
        deleteBtn.innerText = "Delete";
        deleteBtn.onclick = () => deleteTask(t.id);

        li.appendChild(completeBtn);
        li.appendChild(deleteBtn);

        list.appendChild(li);
      });

      // Update stats
      document.getElementById("statTotal").innerText = total;
      document.getElementById("statCompleted").innerText = completed;
      document.getElementById("statImportant").innerText = importantPending;
    });
};

// UPDATE TASKS

window.toggleComplete = (id, current) => {
  db.collection("tasks").doc(id).update({
    completed: !current
  });
};

window.deleteTask = (id) => {
  if (confirm("Delete task?")) {
    db.collection("tasks").doc(id).delete();
  }
};

// IMPORTANT ALERT

function checkImportantToday() {

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  db.collection("tasks")
    .where("dueDate", ">=", firebase.firestore.Timestamp.fromDate(today))
    .where("dueDate", "<", firebase.firestore.Timestamp.fromDate(tomorrow))
    .where("important", "==", true)
    .where("completed", "==", false)
    .get()
    .then(snapshot => {
      if (!snapshot.empty) {
        showToast("Important tasks pending today!");
      }
    });
}

checkImportantToday();

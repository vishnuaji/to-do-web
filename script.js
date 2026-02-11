const firebaseConfig = {
  apiKey: "AIzaSyBFt8_hs1AksBfYuI3j0snbHUnNa11jRbo",
  authDomain: "to-do-list-242d0.firebaseapp.com",
  projectId: "to-do-list-242d0",
  storageBucket: "to-do-list-242d0.firebasestorage.app",
  messagingSenderId: "234994871223",
  appId: "1:234994871223:web:8809d7e9f1ba0c06a35632"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ================= SCREEN REFERENCES =================
const homeScreen = document.getElementById("homeScreen");
const addScreen = document.getElementById("addScreen");
const viewScreen = document.getElementById("viewScreen");

// ================= NAVIGATION =================

window.showAddTask = function () {
  homeScreen.classList.add("hidden");
  addScreen.classList.remove("hidden");
};

window.showViewTask = function () {
  homeScreen.classList.add("hidden");
  viewScreen.classList.remove("hidden");
};

window.goHome = function () {
  addScreen.classList.add("hidden");
  viewScreen.classList.add("hidden");
  homeScreen.classList.remove("hidden");
};

// ================= ADD TASK =================

window.addTask = function () {

  let title = document.getElementById("taskTitle").value;
  let desc = document.getElementById("taskDesc").value;
  let date = document.getElementById("taskDate").value;
  let important = document.getElementById("taskImportant").checked;

  if (!title || !date) {
    alert("Title and Date required");
    return;
  }

  db.collection("tasks").add({
    title,
    description: desc,
    dueDate: date,
    important,
    completed: false,
    created: new Date()
  });

  alert("Task Saved Successfully");

  document.getElementById("taskTitle").value = "";
  document.getElementById("taskDesc").value = "";
  document.getElementById("taskDate").value = "";
  document.getElementById("taskImportant").checked = false;

  goHome();
};

// ================= LOAD TASKS =================

window.loadTasks = function () {

  let date = document.getElementById("viewDate").value;

  if (!date) {
    alert("Please select a date");
    return;
  }

  db.collection("tasks")
    .where("dueDate", "==", date)
    .onSnapshot(snapshot => {

      let list = document.getElementById("taskList");
      list.innerHTML = "";

      snapshot.forEach(doc => {

        let t = doc.data();

        let li = document.createElement("li");

        if (t.completed) {
          li.style.opacity = "0.6";
          li.style.textDecoration = "line-through";
        }

        li.innerHTML = `
          <b>${t.title}</b><br>
          ${t.description || ""}<br>
          Important: ${t.important ? "Yes" : "No"}<br><br>

          <button onclick="toggleComplete('${doc.id}', ${t.completed})">
            ${t.completed ? "Undo" : "Mark Completed"}
          </button>

          <button onclick="deleteTask('${doc.id}')"
                  style="background:#cc4444;margin-top:6px;">
            Delete
          </button>
        `;

        list.appendChild(li);

      });

    });
};

// ================= TOGGLE COMPLETE =================

window.toggleComplete = function (taskId, currentStatus) {

  db.collection("tasks")
    .doc(taskId)
    .update({
      completed: !currentStatus
    });

};

// ================= DELETE TASK =================

window.deleteTask = function (taskId) {

  if (!confirm("Delete this task?")) return;

  db.collection("tasks")
    .doc(taskId)
    .delete();

};

// ================= IMPORTANT ALERT =================

function checkImportantToday() {

  let today = new Date().toISOString().split("T")[0];

  db.collection("tasks")
    .where("dueDate", "==", today)
    .where("important", "==", true)
    .where("completed", "==", false)
    .get()
    .then(snapshot => {

      if (!snapshot.empty) {
        alert("⚠ You have IMPORTANT tasks pending today!");
      }

    });

}

checkImportantToday();

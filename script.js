const firebaseConfig = {
  apiKey: "AIzaSyBFt8_hs1AksBfYuI3j0snbHUnNa11jRbo",
  authDomain: "to-do-list-242d0.firebaseapp.com",
  projectId: "to-do-list-242d0",
  storageBucket: "to-do-list-242d0.firebasestorage.app",
  messagingSenderId: "234994871223",
  appId: "1:234994871223:web:8809d7e9f1ba0c06a35632"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const homeScreen = document.getElementById("homeScreen");
const addScreen = document.getElementById("addScreen");
const viewScreen = document.getElementById("viewScreen");

window.showAddTask = function(){
 homeScreen.classList.add("d-none");
 addScreen.classList.remove("d-none");
};

window.showViewTask = function(){
 homeScreen.classList.add("d-none");
 viewScreen.classList.remove("d-none");
};

window.goHome = function(){
 addScreen.classList.add("d-none");
 viewScreen.classList.add("d-none");
 homeScreen.classList.remove("d-none");
};

window.addTask = function(){

 let title = document.getElementById("taskTitle").value;
 let desc = document.getElementById("taskDesc").value;
 let date = document.getElementById("taskDate").value;
 let important = document.getElementById("taskImportant").checked;

 if(!title || !date){
  alert("Title and Date required");
  return;
 }

 db.collection("tasks").add({
  title,
  description: desc,
  dueDate: date,
  important,
  completed:false,
  created:new Date()
 });

 alert("Task Saved");
 goHome();
};

window.loadTasks = function(){

 let date = document.getElementById("viewDate").value;
 if(!date){ alert("Select date"); return; }

 db.collection("tasks")
 .where("dueDate","==",date)
 .onSnapshot(snapshot=>{

  let list = document.getElementById("taskList");
  list.innerHTML = "";

  snapshot.forEach(doc=>{

   let t = doc.data();

   let li = document.createElement("li");
   li.className = "border rounded p-2 mb-2 bg-light";

   if(t.completed){
    li.style.opacity="0.6";
    li.style.textDecoration="line-through";
   }

   li.innerHTML = `
    <b>${t.title}</b><br>
    ${t.description || ""}<br>
    Important: ${t.important ? "Yes":"No"}<br><br>
   `;

   let completeBtn = document.createElement("button");
   completeBtn.className = "btn btn-sm btn-success me-2";
   completeBtn.innerText = t.completed ? "Undo":"Complete";
   completeBtn.onclick = ()=> toggleComplete(doc.id, t.completed);

   let deleteBtn = document.createElement("button");
   deleteBtn.className = "btn btn-sm btn-danger";
   deleteBtn.innerText = "Delete";
   deleteBtn.onclick = ()=> deleteTask(doc.id);

   li.appendChild(completeBtn);
   li.appendChild(deleteBtn);

   list.appendChild(li);

  });

 });

};

window.toggleComplete = function(id,current){
 db.collection("tasks").doc(id).update({ completed: !current });
};

window.deleteTask = function(id){
 if(!confirm("Delete task?")) return;
 db.collection("tasks").doc(id).delete();
};

function checkImportantToday(){

 let today = new Date().toISOString().split("T")[0];

 db.collection("tasks")
 .where("dueDate","==",today)
 .where("important","==",true)
 .where("completed","==",false)
 .get()
 .then(s=>{
  if(!s.empty){
   alert("⚠ Important tasks pending today!");
  }
 });

}

checkImportantToday();

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

/* ================= DARK MODE ================= */

window.toggleDarkMode = function () {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("darkMode", isDark);
  updateDarkButton();
};


(function () {
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

function showToast(msg){
 let t=document.createElement("div");
 t.className="toast-box";
 t.innerText=msg;
 document.body.appendChild(t);
 setTimeout(()=>t.remove(),3000);
}

window.showAddTask=()=>{
 homeScreen.classList.add("d-none");
 addScreen.classList.remove("d-none");
};

window.showViewTask=()=>{
 homeScreen.classList.add("d-none");
 viewScreen.classList.remove("d-none");
};

window.goHome=()=>{
 addScreen.classList.add("d-none");
 viewScreen.classList.add("d-none");
 homeScreen.classList.remove("d-none");
};

/* ===== ADD TASK ===== */
window.addTask=()=>{

 let title=document.getElementById("taskTitle").value;
 let desc=document.getElementById("taskDesc").value;
 let rawDate=document.getElementById("taskDate").value;
 let important=document.getElementById("taskImportant").checked;

 if(!title||!rawDate){
  showToast("Title and Date required");
  return;
 }

 let dueTS=firebase.firestore.Timestamp.fromDate(
  new Date(rawDate+"T00:00:00")
 );

 db.collection("tasks").add({
  title,
  description:desc,
  dueDate:dueTS,
  important,
  completed:false,
  created:new Date()
 });

 showToast("Task Saved");
 goHome();
};

/* ===== LOAD TASKS ===== */
window.loadTasks=()=>{

 let rawDate=document.getElementById("viewDate").value;
 if(!rawDate){ showToast("Select date"); return; }

 let start=new Date(rawDate);
 start.setHours(0,0,0,0);

 let end=new Date(rawDate);
 end.setHours(23,59,59,999);

 let startTS=firebase.firestore.Timestamp.fromDate(start);
 let endTS=firebase.firestore.Timestamp.fromDate(end);

 db.collection("tasks")
 .where("dueDate",">=",startTS)
 .where("dueDate","<=",endTS)
 .get()
 .then(snapshot=>{

   let list=document.getElementById("taskList");
   list.innerHTML="";

   let tasks=[];
   snapshot.forEach(doc=>{
     tasks.push({id:doc.id,...doc.data()});
   });

   tasks.sort((a,b)=>{
     if(a.important&&!b.important) return -1;
     if(!a.important&&b.important) return 1;
     if(!a.completed&&b.completed) return -1;
     if(a.completed&&!b.completed) return 1;
     return 0;
   });

   let total=0,completed=0,importantPending=0;
   let today=new Date();

   tasks.forEach(t=>{

     total++;
     if(t.completed) completed++;
     if(t.important&&!t.completed) importantPending++;

     let li=document.createElement("li");
     li.className="border rounded p-2 mb-2 bg-light";

     if(t.completed) li.classList.add("task-completed");
     if(t.important) li.classList.add("task-important");

     let dueDate=t.dueDate.toDate();
     if(!t.completed && dueDate < today){
       li.classList.add("task-overdue");
     }

     li.innerHTML=`
       <b>${t.title}</b><br>
       ${t.description||""}<br>
       Important: ${t.important?"Yes":"No"}<br><br>
     `;

     let cBtn=document.createElement("button");
     cBtn.className="btn btn-sm btn-success me-2";
     cBtn.innerText=t.completed?"Undo":"Complete";
     cBtn.onclick=()=>toggleComplete(t.id,t.completed);

     let dBtn=document.createElement("button");
     dBtn.className="btn btn-sm btn-danger";
     dBtn.innerText="Delete";
     dBtn.onclick=()=>deleteTask(t.id);

     li.appendChild(cBtn);
     li.appendChild(dBtn);
     list.appendChild(li);

   });

   document.getElementById("statTotal").innerText=total;
   document.getElementById("statCompleted").innerText=completed;
   document.getElementById("statImportant").innerText=importantPending;

 });
};

/* ===== COMPLETE ===== */
window.toggleComplete=(id,current)=>{
 db.collection("tasks").doc(id).update({completed:!current});
};

/* ===== DELETE ===== */
window.deleteTask=id=>{
 if(confirm("Delete task?")){
  db.collection("tasks").doc(id).delete();
 }
};

/* ===== IMPORTANT ALERT ===== */
function checkImportantToday(){

 let today=new Date();
 today.setHours(0,0,0,0);

 let tomorrow=new Date(today);
 tomorrow.setDate(tomorrow.getDate()+1);

 db.collection("tasks")
 .where("dueDate",">=",firebase.firestore.Timestamp.fromDate(today))
 .where("dueDate","<",firebase.firestore.Timestamp.fromDate(tomorrow))
 .where("important","==",true)
 .where("completed","==",false)
 .get()
 .then(s=>{
   if(!s.empty){
     showToast("⚠ Important tasks pending today!");
   }
 });
}
checkImportantToday();

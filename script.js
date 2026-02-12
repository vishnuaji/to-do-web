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

/* ========= TOAST ========= */
function showToast(message){
 let toast = document.createElement("div");
 toast.className = "toast-box";
 toast.innerText = message;
 document.body.appendChild(toast);
 setTimeout(()=>toast.remove(),3000);
}

/* ========= NAVIGATION ========= */
window.showAddTask = ()=>{
 homeScreen.classList.add("d-none");
 addScreen.classList.remove("d-none");
};

window.showViewTask = ()=>{
 homeScreen.classList.add("d-none");
 viewScreen.classList.remove("d-none");
};

window.goHome = ()=>{
 addScreen.classList.add("d-none");
 viewScreen.classList.add("d-none");
 homeScreen.classList.remove("d-none");
};

/* ========= ADD TASK ========= */
window.addTask = ()=>{

 let title=document.getElementById("taskTitle").value;
 let desc=document.getElementById("taskDesc").value;
 let rawDate=document.getElementById("taskDate").value;
 let date=new Date(rawDate).toISOString().split("T")[0];
 let important=document.getElementById("taskImportant").checked;

 if(!title||!date){
  showToast("Title and Date required");
  return;
 }

 db.collection("tasks").add({
  title,
  description:desc,
  dueDate:date,
  important,
  completed:false,
  created:new Date()
 });

 showToast("Task Saved");
 goHome();
};

/* ========= LOAD TASKS ========= */
window.loadTasks = ()=>{

 let date=document.getElementById("viewDate").value;
 if(!date){ showToast("Select date"); return; }

 db.collection("tasks")
 .where("dueDate","==",date)
 .get()
 .then(snapshot=>{

   let list=document.getElementById("taskList");
   list.innerHTML="";

   let tasks=[];
   snapshot.forEach(doc=>{
     tasks.push({id:doc.id,...doc.data()});
   });

   /* ===== SMART SORT ===== */
   tasks.sort((a,b)=>{
     if(a.important&&!b.important) return -1;
     if(!a.important&&b.important) return 1;
     if(!a.completed&&b.completed) return -1;
     if(a.completed&&!b.completed) return 1;
     return 0;
   });

   let total=0, completed=0, importantPending=0;
   let today=new Date().toISOString().split("T")[0];

   tasks.forEach(t=>{

     total++;
     if(t.completed) completed++;
     if(t.important&&!t.completed) importantPending++;

     let li=document.createElement("li");
     li.className="border rounded p-2 mb-2 bg-light";

     if(t.completed) li.classList.add("task-completed");
     if(t.important) li.classList.add("task-important");
     if(!t.completed&&t.dueDate<today) li.classList.add("task-overdue");

     li.innerHTML=`
       <b>${t.title}</b><br>
       ${t.description||""}<br>
       Important: ${t.important?"Yes":"No"}<br><br>
     `;

     let completeBtn=document.createElement("button");
     completeBtn.className="btn btn-sm btn-success me-2";
     completeBtn.innerText=t.completed?"Undo":"Complete";
     completeBtn.onclick=()=>toggleComplete(t.id,t.completed);

     let deleteBtn=document.createElement("button");
     deleteBtn.className="btn btn-sm btn-danger";
     deleteBtn.innerText="Delete";
     deleteBtn.onclick=()=>deleteTask(t.id);

     li.appendChild(completeBtn);
     li.appendChild(deleteBtn);
     list.appendChild(li);
   });

   document.getElementById("statTotal").innerText=total;
   document.getElementById("statCompleted").innerText=completed;
   document.getElementById("statImportant").innerText=importantPending;

 });
};

/* ========= COMPLETE ========= */
window.toggleComplete=(id,current)=>{
 db.collection("tasks").doc(id).update({completed:!current});
};

/* ========= DELETE ========= */
window.deleteTask=id=>{
 if(confirm("Delete task?")){
  db.collection("tasks").doc(id).delete();
 }
};

/* ========= IMPORTANT ALERT ========= */
function checkImportantToday(){
 let today=new Date().toISOString().split("T")[0];
 db.collection("tasks")
 .where("dueDate","==",today)
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


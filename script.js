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

const datePicker = document.getElementById("datePicker");

// Set default date = today
const today = new Date().toISOString().split("T")[0];
datePicker.value = today;

// Reload tasks when date changes
datePicker.addEventListener("change", loadTasks);

function getSelectedDate(){
 return datePicker.value;
}

function addTask(){
let text=document.getElementById("taskInput").value;
let important=document.getElementById("importantCheck").checked;

if(!text) return;

db.collection("tasks").add({
 text:text,
 important:important,
 date:getSelectedDate(),   // NEW
 created:new Date()
});

document.getElementById("taskInput").value="";
}

function loadTasks(){

let selectedDate = getSelectedDate();

db.collection("tasks")
.where("date","==",selectedDate)
.orderBy("created")
.onSnapshot(snapshot=>{

let list=document.getElementById("taskList");
list.innerHTML="";

snapshot.forEach(doc=>{
let t=doc.data();

let li=document.createElement("li");
if(t.important) li.classList.add("important");

li.innerHTML=`
${t.text}
<button onclick="deleteTask('${doc.id}')">❌</button>
`;

list.appendChild(li);

});

});

}

function deleteTask(id){
db.collection("tasks").doc(id).delete();
}

// Initial load
loadTasks();

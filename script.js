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

function showAddTask(){
homeScreen.classList.add("hidden");
addScreen.classList.remove("hidden");
}

function showViewTask(){
homeScreen.classList.add("hidden");
viewScreen.classList.remove("hidden");
}

function goHome(){
addScreen.classList.add("hidden");
viewScreen.classList.add("hidden");
homeScreen.classList.remove("hidden");
}

function addTask(){

let title=document.getElementById("taskTitle").value;
let desc=document.getElementById("taskDesc").value;
let date=document.getElementById("taskDate").value;
let important=document.getElementById("taskImportant").checked;

if(!title || !date){
alert("Title and Date required");
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

alert("Task Saved");
goHome();
}

function loadTasks(){

let date=document.getElementById("viewDate").value;
if(!date){
alert("Select date");
return;
}

db.collection("tasks")
.where("dueDate","==",date)
.onSnapshot(snapshot=>{

let list=document.getElementById("taskList");
list.innerHTML="";

snapshot.forEach(doc=>{

let t=doc.data();

let li=document.createElement("li");

li.innerHTML = `
<b>${t.title}</b><br>
${t.description || ""}<br>
Important: ${t.important ? "Yes" : "No"}
`;

list.appendChild(li);

});

});
}

checkImportantToday();

function checkImportantToday(){

let today = new Date().toISOString().split("T")[0];

db.collection("tasks")
.where("dueDate","==",today)
.where("important","==",true)
.where("completed","==",false)
.get()
.then(snapshot=>{
if(!snapshot.empty){
alert("You have important tasks pending today!");
}
});
}

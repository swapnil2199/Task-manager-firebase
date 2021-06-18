// Confidential Data for firebase connection
const firebaseConfig = {
    apiKey: "AIzaSyALBEv97FhnkldMI35GfeC1maQ0K7FzYxs",
    authDomain: "task-manager-b8910.firebaseapp.com",
    projectId: "task-manager-b8910",
    storageBucket: "task-manager-b8910.appspot.com",
    messagingSenderId: "812774240706",
    appId: "1:812774240706:web:df377e27f4af0ea98da65b"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var totalItems;
var maxCode;
var code;
window.addEventListener("load", function() {
    console.log("Complete Window LOADED");
    firebase.database().ref('TotalTasks').on('value', function(snapshot) {
        totalItems = snapshot.val().totalItems;
        maxCode = snapshot.val().maxCode;
        console.log("The total Items are : " + totalItems);
        if (totalItems > 0 && document.getElementById("info") != null) {
            document.getElementById("info").remove();
        }
        if (totalItems === 0) {
            firebase.database().ref('TotalTasks').update({
                maxCode: 0
            })
        }
    });

})

function changeStatus(code) {
    var status;
    firebase.database().ref('TaskList/' + code).on('value', function(snapshot) {
        status = snapshot.val().status;
    });

    if (status === "pending") {
        firebase.database().ref('TaskList/' + code).update({
            status: "completed"
        })
        document.getElementById(code).querySelector("#done").style.color = "#00b200";
        document.getElementById(code).querySelector("#editbtn").disabled = true;
        document.getElementById(code).querySelector("#editbtn").style.backgroundColor = "rgba(116, 116, 116, 0.671)";
        document.getElementById(code).querySelector("#status").innerHTML = `
            <i class="far fa-check-circle"></i> Completed
            `;
    } else {
        firebase.database().ref('TaskList/' + code).update({
            status: "pending"
        })
        document.getElementById(code).querySelector("#done").style.color = "gray";
        document.getElementById(code).querySelector("#editbtn").disabled = false;
        if (document.getElementById(code).querySelector("#editbtn").style.removeProperty) {
            document.getElementById(code).querySelector("#editbtn").style.removeProperty('background-color');
        } else {
            document.getElementById(code).querySelector("#editbtn").style.removeAttribute('background-color');
        }
        document.getElementById(code).querySelector("#status").innerHTML = "";
    }

}

function editData(c) {

    // Displaying data in form
    document.getElementById("task").value = document.getElementById(c).querySelector(".data").querySelector(".Task").innerHTML;
    document.getElementById("desc").value = document.getElementById(c).querySelector(".data").querySelector(".desc").innerHTML;
    document.getElementById("createTask").scrollIntoView();
    if (document.getElementById("addTask") !== null) {
        document.getElementById("addTask").remove();
    }
    document.getElementById("form-btns").innerHTML = `
    <button class="button update" id = "updateTask" onclick = "updateData('${c}')">󠀫󠀫<i class="fas fa-sync-alt"></i> UPDATE TASK</button>
    <button class="button cancel" id = "cancelTask" onclick = "cancelUpdation()"><i class="fas fa-ban"></i> CANCEL</button>
    `
}

function updateData(c) {
    var updatedTask = document.getElementById("task").value;
    var updatedDesc = document.getElementById("desc").value;
    firebase.database().ref('TaskList/' + c).update({
        task: updatedTask,
        desc: updatedDesc
    });

    document.getElementById("task").value = "";
    document.getElementById("desc").value = "";
    document.getElementById("updateTask").remove();
    document.getElementById("cancelTask").remove();
    document.getElementById("form-btns").innerHTML = `
    <button type="submit" class="button add" id = "addTask" >󠀫󠀫<i class="fas fa-plus"></i> ADD TASK</button>
    `
    document.getElementById(c).querySelector(".data").querySelector(".Task").innerHTML = updatedTask;
    document.getElementById(c).querySelector(".data").querySelector(".desc").innerHTML = updatedDesc;
}


function cancelUpdation() {
    document.getElementById("task").value = "";
    document.getElementById("desc").value = "";
    document.getElementById("updateTask").remove();
    document.getElementById("cancelTask").remove();
    document.getElementById("form-btns").innerHTML = `
    <button type="submit" class="button add" id = "addTask" >󠀫󠀫<i class="fas fa-plus"></i> ADD TASK</button>
    `
}

function deleteData(code) {
    firebase.database().ref('TaskList/' + code).remove();
    document.getElementById(code).remove();
    console.log(totalItems);
    firebase.database().ref('TotalTasks').update({
        totalItems: totalItems - 1
    });
    console.log(totalItems);
}

function storeTask(event) {
    event.preventDefault();

    // Get data entered by the USER
    var task = document.getElementById("task").value;
    var desc = document.getElementById("desc").value;
    document.getElementById("task").value = "";
    document.getElementById("desc").value = "";
    console.log({ task, desc });


    code = totalItems;
    if (totalItems < maxCode) {
        code = maxCode + 1;
    }
    // Store data in firebase
    firebase.database().ref('TaskList/' + code).set({
        task: task,
        desc: desc,
        status: "pending",
    });

    // Update number of tasks in database
    firebase.database().ref('TotalTasks').update({
        totalItems: totalItems + 1,
        maxCode: maxCode + 1
    });

    if (document.getElementById("info") !== null) {
        document.getElementById("info").remove();
    }

    // Show the data in the body in form of card
    document.getElementById("tasks-header").insertAdjacentHTML("afterend", `<div class="Task-item" id="${code}">
    <div class="data" id="${task}">
        <button id="done" class="done" onclick = "changeStatus('${code}')"><i class="far fa-check-circle"></i></button>
        <h2 class="Task">${task}</h2>
        <p class="desc">${desc}</p>
        <small id = "status"></small>
    </div>
    <hr>
    <div class="buttons">
        <button class="button edit" id="editbtn" onclick = "editData('${code}')"><i class="fas fa-edit"></i> EDIT TASK</button>
        <button class="button delete" id="deletebtn" onclick = "deleteData('${code}')">
        <i class="fas fa-trash-alt"></i>DELETE TASK</button>
    </div>
    
    </div>`);
}

// Reading the data from the database
var data;
firebase.database().ref('TaskList').on('value', function(snapshot) {
    data = snapshot.val();
    console.log("This is data speaking from open");
    console.log(data);
});

function showAll() {
    console.log("This is data speaking from within showAll()");
    console.log(data);
    if (data === null && document.getElementById("info") == null) {
        document.getElementById("tasks-header").insertAdjacentHTML("afterend",
            `<div class="no-task-info" id = "info">
            <i class="fas fa-info-circle"></i>
            No pending tasks
        </div>`
        )
    }
    if (data === null && document.getElementById("info") !== null) {
        document.getElementById("info").remove();
        document.getElementById("tasks-header").insertAdjacentHTML("afterend",
            `<div class="no-task-info" id = "info">
            <i class="fas fa-info-circle"></i>
            No pending tasks
        </div>`
        )
    }
    document.querySelectorAll(".Task-item").forEach(element => {
        element.remove();
    });

    for (code in data) {
        var code = code;
        var task = data[code]["task"];
        var desc = data[code]["desc"];
        var status = data[code]["status"];

        var color;
        if (status === "pending") {
            color = "gray";
        } else {
            color = "#00b200";
        }

        document.getElementById("tasks-header").insertAdjacentHTML("afterend", `<div class="Task-item" id="${code}">
        <div class="data" id="${task}">
            <button id="done" class="done" style="color : ${color}" onclick = "changeStatus('${code}')"><i class="far fa-check-circle"></i></button>
            <h2 class="Task">${task}</h2>
            <p class="desc">${desc}</p>
            <small id = "status"></small>
        </div>
        <hr>
        <div class="buttons">
            <button class="button edit" id="editbtn" onclick = "editData('${code}')"><i class="fas fa-edit"></i> EDIT TASK</button>
            <button class="button delete" id="deletebtn" onclick = "deleteData('${code}')"><i class="fas fa-trash-alt"></i> DELETE TASK</button>
        </div>
        
        </div>`);

        if (status === "pending") {
            document.getElementById(code).querySelector("#editbtn").disabled = false;
            if (document.getElementById(code).querySelector("#editbtn").style.removeProperty) {
                document.getElementById(code).querySelector("#editbtn").style.removeProperty('background-color');
            } else {
                document.getElementById(code).querySelector("#editbtn").style.removeAttribute('background-color');
            }
            document.getElementById(code).querySelector("#status").innerHTML = "";
        } else {
            document.getElementById(code).querySelector("#editbtn").disabled = true;
            document.getElementById(code).querySelector("#editbtn").style.backgroundColor = "rgba(116, 116, 116, 0.671)";
            document.getElementById(code).querySelector("#status").innerHTML = `
            <i class="far fa-check-circle"></i> Completed
            `;
        }
    }
}

function deleteAll() {
    var option = false;
    if (totalItems === 0 && document.getElementById("info") === null) {
        document.getElementById("tasks-header").insertAdjacentHTML("afterend",
            `<div class="no-task-info" id = "info">
            <i class="fas fa-info-circle"></i>
            No pending tasks
        </div>`
        )
    }
    if (totalItems !== 0) {
        option = confirm("The tasks will be permanently deleted. Do you want to continue?");
        if (option === true) {
            firebase.database().ref('TaskList').remove();
            document.querySelectorAll(".Task-item").forEach(element => {
                element.remove();
            });
            firebase.database().ref('TotalTasks').update({
                totalItems: 0,
                maxCode: 0
            });
            document.getElementById("tasks-header").insertAdjacentHTML("afterend",
                `<div class="no-task-info" id = "info">
                <i class="fas fa-info-circle"></i>
                All items deleted
            </div>`
            )
        }
    }
}
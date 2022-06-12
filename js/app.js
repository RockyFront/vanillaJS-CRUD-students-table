let studentsArr;
const BASE_URL = "https://629cc2ac3798759975daef0d.mockapi.io/students";

getData().then(() => {
    makeTable();
});

// async function syncArr() {
//     await getData();
//     studentsArr = JSON.parse(localStorage.getItem("studentsArr"));
// }

const configs = {
    idFlag: false,
    firstNameFlag: false,
    lastNameFlag: false,
    birthdayFlag: false,
    mathFlag: false,
    socialStudiesFlag: false,
    linguisticsFlag: false,
};

async function getData() {
    let response = await fetch(BASE_URL);
    studentsArr = await response.json();
    // if (!localStorage.getItem("studentsArr") || !localStorage.getItem("studentsArr")[14]) {
    //     localStorage.setItem("studentsArr", JSON.stringify(studentsArr));
    // }
    return studentsArr;
}

async function deleteData(id) {
    try {
        let response = await fetch(BASE_URL + `/${id}`, {
            method: "DELETE",
        });
        return await response.json();
    } catch (e) {
        console.error(e);
    }
}

async function editData(id, newData) {
    try {
        let response = await fetch(`${BASE_URL}/${id}`, {
            method: "PUT",
            body: JSON.stringify(newData),
            headers: {
                "Content-Type": "application/json; charset=UTF-8"
            }
        });
        console.log(newData)
        return await response.json();
    } catch (e) {
        console.error(e)
    }
}


// getData().then(function onResolved(v) {
//     studentsArr = v;
// }).catch(function onRejected() {
//     console.log('problem getting data')
// })

async function makeTable() {
    console.log(studentsArr);
    // await getData();
    // studentsArr = JSON.parse(localStorage.getItem("studentsArr"));
    let tableWrapper = document.getElementById("school-table");
    tableWrapper.innerHTML = "";
    let table = document.createElement("table");
    table.id = "myTable";

    //sorted properties
    let sortedUserObj;

    // creating table body from db
    let tBody = table.createTBody();
    studentsArr.map(function makeRow(userObj) {
        let counter = 0;
        let row = tBody.insertRow();
        let {
            id, firstName, lastName, birthday, math, socialStudies, linguistics,
        } = userObj;
        sortedUserObj = {
            id, firstName, lastName, birthday, math, socialStudies, linguistics,
        };
        Object.values(sortedUserObj).map(function makeCell(userValue) {
            counter++;
            let cell = row.insertCell();
            // get dates in the desired format
            // if (counter === 4 & )
            if (counter % 4 === 0) {
                cell.innerHTML = formatDate(userValue);
            } else {
                cell.innerHTML = userValue;
            }
        });

        let rowId = row.firstChild.innerHTML;

        // add edit button to table
        let editButton = document.createElement("button");
        editButton.innerHTML = "Edit";
        editButton.classList.add("button");
        editButton.classList.add("editButton");
        editButton.id = "editButton_" + row.firstChild.innerHTML;
        editButton.onclick = function editRow() {
            console.log("editButton_" + rowId);
            let editButton = document.getElementById("editButton_" + rowId);
            let saveButton = document.getElementById("saveButton_" + rowId);
            editButton.classList.add("d-none");
            row.contentEditable = "true";
            row.classList.add('edited-mode')
            saveButton.classList.remove("d-none");
        };
        let editCell = row.insertCell();
        editCell.append(editButton);

        // add save button to table
        let saveButton = document.createElement("button");
        saveButton.innerHTML = "Save";
        saveButton.classList.add("button");
        saveButton.classList.add("saveButton");
        saveButton.classList.add("d-none");
        saveButton.id = "saveButton_" + row.firstChild.innerHTML;
        saveButton.onclick = function editRow() {
            console.log("saveButton_" + rowId);
            let editButton = document.getElementById("editButton_" + rowId);
            let saveButton = document.getElementById("saveButton_" + rowId);
            editButton.classList.remove("d-none");
            row.contentEditable = "false";
            saveButton.classList.add("d-none");

            const studentObj = readRow();
            editData(rowId, studentObj)
                .then(() => getData())
                .then(() => makeTable());
        };
        editCell.append(saveButton);

        // add remove button to the table
        let removeButton = document.createElement("button");
        removeButton.innerHTML = "Remove";
        removeButton.classList.add("button");
        removeButton.classList.add("removeButton");
        removeButton.onclick = function () {
            let row = this.parentNode.parentNode;
            row.remove()
            setTimeout(() => deleteData(rowId)
                .then(() => getData()), 10)


        };
        let removeCell = row.insertCell();
        removeCell.append(removeButton);
    });

    // creating table head from db
    let tHead = table.createTHead();
    let tableHeadRow = tHead.insertRow();
    let tableHeadingsArr = ["ID", "First Name", "Last Name", "Birthday", "Math", "Social Studies", "Linguistics", "Edit", "Remove",];
    let counter = 0;
    tableHeadingsArr.map(function makeTHeading(prop) {
        let th = document.createElement("th");
        th.innerHTML = prop;
        // th.onclick = sortColumn ;
        th.id = String(counter++);
        th.setAttribute("onclick", `sortColumn(${String(th.id)})`);
        tableHeadRow.append(th);
    });
    tHead.append(tableHeadRow);

    tableWrapper.append(table);

    console.log("made the table");
}

function formatDate(str) {
    let date = new Date(str);
    return `${String(date.getFullYear()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
}

function removeStudentFromLocalStorage(id) {
    let studentsArr = JSON.parse(localStorage.getItem("studentsArr"));
    studentsArr = studentsArr.filter((studentObj) => {
        if (studentObj.id !== id) {
            return studentObj;
        }
    });
    localStorage.setItem("studentsArr", JSON.stringify(studentsArr));
}

function readRow() {
    let editedRow = document.querySelector(".edited-mode");
    if (!editedRow) {
        return;
    }
    let tableHeadingsArr = ["id", "firstName", "lastName", "birthday", "math", "socialStudies", "linguistics"];
    let cells = editedRow.cells;
    let studentObj = [...cells]
        .reduce((pv, cv, index) => {
            return tableHeadingsArr[index] ? {...pv, [tableHeadingsArr[index]]: cv.innerText} : pv;
        }, {})
    // console.log(studentObj)
    //
    // for (let j = 0; j < cellLength - 2; j++) {
    //     let cellVal = cells.item(j).innerHTML;
    //     console.log(cellVal);
    //     studentObj = {...studentObj, [tableHeadingsArr[j]]: cellVal};
    // }
    editedRow.classList.remove('edited-mode');
    console.log(studentObj);
    return studentObj;
    // studentsArr = result;
}

function sortColumn(param) {
    let newStudentsArr;
    let input;
    switch (param) {
        case 0:
            input = "id";
            break;
        case 1:
            input = "firstName";
            break;
        case 2:
            input = "lastName";
            break;
        case 3:
            input = "birthday";
            break;
        case 4:
            input = "math";
            break;
        case 5:
            input = "socialStudies";
            break;
        case 6:
            input = "linguistics";
            break;
    }
    console.log(configs[`${input}Flag`]);

    if (input === "firstName" || input === "lastName") {
        if (configs[`${input}Flag`] === false) {
            newStudentsArr = studentsArr.sort(function (a, b) {
                return a[input].localeCompare(b[input]);
            });
        } else {
            newStudentsArr = studentsArr.sort(function (a, b) {
                return a[input].localeCompare(b[input]) * -1;
            });
        }
    } else if (input === "birthday") {
        if (configs[`${input}Flag`] === false) {
            newStudentsArr = studentsArr.sort((a, b) => {
                return new Date(a[input]) - new Date(b[input]);
            });
        } else {
            newStudentsArr = studentsArr.sort((a, b) => {
                return (new Date(a[input]) - new Date(b[input])) * -1;
            });
        }
    } else {
        newStudentsArr = studentsArr.sort((a, b) => {
            if (configs[`${input}Flag`] === false) {
                console.log("sorting normal");
                return a[input] - b[input];
            } else {
                console.log("sorting reverse");
                return (a[input] - b[input]) * -1;
            }
        });
    }

    let unchangedStudentsArr = localStorage.getItem("studentsArr");

    studentsArr = newStudentsArr;
    localStorage.removeItem("studentsArr");
    newStudentsArr = JSON.stringify(newStudentsArr);
    localStorage.setItem("studentsArr", newStudentsArr);
    makeTable().then(() => {
        localStorage.setItem("studentsArr", unchangedStudentsArr);
    });
    configs[`${input}Flag`] = !configs[`${input}Flag`];
}
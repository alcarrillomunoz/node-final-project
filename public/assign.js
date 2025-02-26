import { inputEnabled, setDiv, message, token, enableInput } from "./index.js";
import { showProjects } from "./projects.js";

let assignProjectDiv = document.getElementById("assign-project");
let projectTable = document.getElementById("project-table");
let saveButton = document.getElementById("saveAssign");
let cancelButton = document.getElementById("cancelAssign");

assignProjectDiv.addEventListener("click", async (e) => {
  let row = document.getElementById("projectRow");

  if (inputEnabled && e.target.nodeName === "BUTTON") {
    const optionsList = document.getElementById("assignedDesSelect");
    if (e.target === saveButton) {
      let projectIdValue = row.value;
      let projectTitle = row.getElementsByTagName("td")[1].innerHTML;
      let optionValueId = document.getElementById("assignedDesSelect").value;

      updateDesigner(optionValueId, projectIdValue, projectTitle);
      assignProjectDiv.style.display = "none";
      showProjects();
    } else if (e.target === cancelButton) {
      assignProjectDiv.style.display = "none";
      showProjects();
    }
    while (optionsList.firstChild) {
      optionsList.removeChild(optionsList.firstChild);
    }
    for (let x = 1; x < projectTable.rows.length; x++) {
      projectTable.deleteRow(x);
    }
  }
});

export const updateDesigner = async (
  optionValueId,
  projectIdValue,
  projectTitle
) => {
  //console.log("projectId", projectIdValue);

  let url = `/projects/assign/${projectIdValue}`;

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        assignedToDesigner: optionValueId,
      }),
    });
    const data = await response.json();
    if (response.status === 200 || response.status === 201) {
      if (response.status === 200) {
        // a 200 is expected for a successful update
        message.textContent = `Project ${projectTitle} was assigned.`;
      }
    }
  } catch (err) {
    console.log(err);
    message.textContent = "A communications error has occurred.";
    showProjects();
  }
};

export const displayAssignProject = async (projectId) => {
  loading.style.display = "block";
  message.textContent = "";
  setDiv(assignProjectDiv);
  enableInput(true);

  try {
    const response = await fetch(`/projects/${projectId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();

    const userId = data.project.createdBy;
    const userResponse = await fetch(`/auth/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const userData = await userResponse.json();

    if (response.status === 200) {
      let rowEntry = document.createElement("tr");
      rowEntry = projectTable.insertRow(1);

      const usersResponse = await fetch(`/auth/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const usersData = await usersResponse.json();

      let designersArray = [];

      const filterDesigners = usersData.users.map((user) => {
        if (user.accountType === "designer") {
          designersArray.push(user);
        }
      });

      let rowHTML = `
        <td>${userData.user.name}</td>
        <td>${data.project.title}</td>
        <td>${data.project.description}</td>
        <td>${data.project.status}</td>`;

      rowEntry.innerHTML = rowHTML;
      rowEntry.id = "projectRow";
      rowEntry.value = data.project._id;

      for (let x = 0; x < designersArray.length; x++) {
        let designerOption = document.createElement("option");
        designerOption.id = "option";
        designerOption.value = designersArray[x]._id;
        designerOption.innerHTML = designersArray[x].name;
        assignedDesSelect.appendChild(designerOption);
      }
      loading.style.display = "none";
    } else {
      message.textContent = "The project entry was not found";
      enableInput(false);
      showProjects();
    }
  } catch (err) {
    console.log(err);
    message.textContent = "A communications error has occurred.";
    showProjects();
  }
  //   enableInput(false);
};

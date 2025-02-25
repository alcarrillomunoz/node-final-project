import { inputEnabled, setDiv, message, token, enableInput } from "./index.js";
import { showProjects } from "./projects.js";

let projectsDiv = null;
let assignProjectDiv = document.getElementById("assign-project");
let projectTable = document.getElementById("project-table");
let assignedDesSelect = document.getElementById("assignedDesSelect");
let saveButton = document.getElementById("saveAssign");
let cancelButton = document.getElementById("cancelAssign");

assignProjectDiv.addEventListener("click", async (e) => {
  let option = document.getElementById("option");
  let row = document.getElementById("projectRow");
  if (inputEnabled && e.target.nodeName === "BUTTON") {
    const options = document.getElementById("assignedDesSelect");
    while (options.firstChild) {
      options.removeChild(options.firstChild);
    }
    for (let x = 1; x < projectTable.rows.length; x++) {
      projectTable.deleteRow(x);
    }
    if (e.target === saveButton) {
      let optionValue = option.value;
      console.log("option", optionValue);
      let projectIdValue = row.value;
      updateDesigner(optionValue, projectIdValue);
    } else if (e.target === cancelButton) {
      showProjects();
    }
  }
});

export const updateDesigner = async (optionValue, projectIdValue) => {
  console.log("projectId", projectIdValue);

  let url = `/projects/assign/${projectIdValue}`;

  try {
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        assignedToDesigner: optionValue,
      }),
    });
  } catch (err) {
    const data = await response.json();
    if (response.status === 200 || response.status === 201) {
      if (response.status === 200) {
        // a 200 is expected for a successful update
        message.textContent = "The project entry was updated.";
      }
    }

    console.log("updated user", data);
  }
};

// export const submitSave = (projectId) => {
//   assignProjectDiv.addEventListener("click", async (e) => {
//     if (inputEnabled && e.target.nodeName === "BUTTON") {
//       if (e.target === saveButton) {
//         enableInput(false);
//         console.log("save clicked");
//         selectDesigner(e.target.dataset.id);

//         method = "PATCH";
//         let url = `projects/${projectId}`;

//         try {
//           const response = await fetch(url, {
//             method: method,
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//             body: JSON.stringify({
//               assignedToDesigner: option.value,
//             }),
//           });
//         } catch (err) {
//       const data = await response.json();
//       if (response.status === 200 || response.status === 201) {
//         if (response.status === 200) {
//           // a 200 is expected for a successful update
//           message.textContent = "The project entry was updated.";
//         } else {
//           // a 201 is expected for a successful create
//           message.textContent = "The project entry was created.";
//         }

//         projectTitle.value = "";
//         description.value = "";
//         status.value = "pending";
//         showProjects();
//       } else {
//         message.textContent = data.msg;
//       }
//           console.log(err);
//           message.textContent = "A communication error occurred.";
//         }
//         enableInput(true);
//       } else if (e.target === cancelAssign) {
//         console.log("cancel clicked");
//         showProjects();
//       }
//     }
//   });
// };

export const displayAssignProject = async (projectId) => {
  console.log("assign project clicked");
  console.log(projectId);

  //enableInput(true);
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
    // console.log(data);

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

      console.log(designersArray);

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
      //setDiv(assignProjectDiv);
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

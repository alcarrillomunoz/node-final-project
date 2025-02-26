import {
  inputEnabled,
  setDiv,
  message,
  setToken,
  token,
  enableInput,
} from "./index.js";
import { showLoginRegister } from "./loginRegister.js";
import { showAddEdit } from "./addEdit.js";
import { displayAssignProject } from "./assign.js";

let projectsDiv = null;
let projectModulesDiv = null;
const addButton = document.getElementById("add-project");
const userName = document.getElementById("userName");
const projectContainer = document.getElementById("project-container");

export const handleProjects = () => {
  projectsDiv = document.getElementById("projects");
  const logoff = document.getElementById("logoff");
  const addProject = document.getElementById("add-project");
  projectModulesDiv = document.getElementById("project-modules");
  let projectModule = document.getElementById("project-module");

  projectContainer.addEventListener("click", async (e) => {
    if (inputEnabled && e.target.nodeName === "BUTTON") {
      if (e.target === addProject) {
        showAddEdit(null);
      } else if (e.target.classList.contains("editButton")) {
        message.textContent = "";
        showAddEdit(e.target.dataset.id);
      } else if (e.target.classList.contains("assignButton")) {
        displayAssignProject(e.target.dataset.id);
      } else if (e.target.classList.contains("deleteButton")) {
        enableInput(false);

        let method = "DELETE";
        let url = `/projects/${e.target.dataset.id}`;

        try {
          const response = await fetch(url, {
            method: method,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (response.status === 200) {
            // a 200 is expected for a successful delete
            message.textContent = `${data.project.title} project was deleted.`;
            showProjects();
          } else {
            message.textContent = data.msg;
          }
        } catch (error) {
          console.log(error);
          message.textContent = "An error occurred.";
        }
        enableInput(true);
      } else if (e.target === logoff) {
        localStorage.setItem("globalIdVariable", null);
        addButton.hidden = true;
        userName.hidden = true;
        setToken(null);

        message.textContent = "You have been logged off.";

        projectsDiv.replaceChildren([projectModulesDiv]);
        showLoginRegister();
      }
    }
  });
};

export async function getCurrentUserId(userId) {
  const currentUserId = userId;
  localStorage.setItem("globalIdVariable", currentUserId);
}

export const showProjects = async () => {
  try {
    enableInput(false);

    const response = await fetch("/projects", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    let globalIdVariable = localStorage.getItem("globalIdVariable");

    const userResponse = await fetch(`/auth/${globalIdVariable}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const userData = await userResponse.json();

    if (
      userData.user.accountType === "admin" ||
      userData.user.accountType === "client"
    ) {
      addButton.hidden = false;
    }

    let children = [projectModulesDiv];

    if (response.status === 200) {
      if (data.count === 0) {
        projectsDiv.replaceChildren(...children);
      } else {
        for (let i = 0; i < data.projects.length; i++) {
          const response = await fetch(`/auth/${data.projects[i].createdBy}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          const userName = await response.json();
          // console.log("userName", userName.user.name);

          let projectModule = document.createElement("div");
          projectModule.className = "project-module";
          let newTitle = document.createElement("h2");
          let newUserName = document.createElement("p");
          let newDesc = document.createElement("p");
          let newAssignedTo = document.createElement("p");
          let newStatus = document.createElement("p");
          let newEditButton = document.createElement("button");
          let newDeleteButton = document.createElement("button");
          let newAssignButton = document.createElement("button");

          newTitle.innerHTML = data.projects[i].title;
          newUserName.innerHTML = "Created by: " + userName.user.name;
          newDesc.innerHTML = "Description: " + data.projects[i].description;
          newStatus.innerHTML = data.projects[i].status;
          newStatus.style.textAlign = "center";
          newStatus.style.fontWeight = "bold";

          // get designer name
          if (data.projects[i].assignedToDesigner === undefined) {
            newAssignedTo.innerHTML = "Not assigned";
            newAssignedTo.style.fontStyle = "italic";
          } else {
            const response = await fetch(
              `/auth/${data.projects[i].assignedToDesigner}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            const designerData = await response.json();
            newAssignedTo.innerHTML = "Assigned to: " + designerData.user.name;
          }

          newEditButton.innerHTML = "Edit";
          newEditButton.type = "button";
          newEditButton.className = "editButton";
          newEditButton.setAttribute("data-id", data.projects[i]._id);

          newDeleteButton.innerHTML = "Delete";
          newDeleteButton.type = "button";
          newDeleteButton.className = "deleteButton";
          newDeleteButton.setAttribute("data-id", data.projects[i]._id);

          newAssignButton.innerHTML = "Assign";
          newAssignButton.type = "button";
          newAssignButton.className = "assignButton";
          newAssignButton.setAttribute("data-id", data.projects[i]._id);

          projectModule.id = "project-module";
          projectModule.appendChild(newTitle);
          projectModule.appendChild(newUserName);
          projectModule.appendChild(newDesc);
          projectModule.appendChild(newAssignedTo);
          projectModule.appendChild(newStatus);
          projectModule.appendChild(newEditButton);

          if (userData.user.accountType === "admin") {
            projectModule.appendChild(newDeleteButton);
            projectModule.appendChild(newAssignButton);
          }

          if (data.projects[i].status === "New") {
            newStatus.style.backgroundColor = "rgb(230, 135, 119)";
          } else if (data.projects[i].status === "Complete") {
            newStatus.style.backgroundColor = "rgb(0, 0, 0)";
            newStatus.style.color = " rgb(255, 255, 255)";
          } else if (data.projects[i].status === "Edits Made") {
            newStatus.style.backgroundColor = "rgb(151, 214, 241)";
          } else if (data.projects[i].status === "Edits Requested") {
            newStatus.style.backgroundColor = " rgb(252, 228, 150)";
          } else if (data.projects[i].status === "Approved") {
            newStatus.style.backgroundColor = " rgb(99, 193, 99)";
          } else if (data.projects[i].status === "In Review") {
            newStatus.style.backgroundColor = " rgb(213, 164, 228)";
          }

          projectModulesDiv.appendChild(projectModule);
          children.push(projectModule);
        }
        projectsDiv.replaceChildren(...children);
      }
    } else {
      message.textContent = data.msg;
    }
  } catch (err) {
    console.log(err);
    message.textContent = "A communication error occurred.";
  }
  enableInput(true);
  setDiv(projectContainer);
};

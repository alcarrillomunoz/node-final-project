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
let projectsTable = null;
let projectsTableHeader = null;

export const handleProjects = () => {
  projectsDiv = document.getElementById("projects");
  const logoff = document.getElementById("logoff");
  const addProject = document.getElementById("add-project");
  projectsTable = document.getElementById("projects-table");
  projectsTableHeader = document.getElementById("projects-table-header");

  projectsDiv.addEventListener("click", async (e) => {
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
            message.textContent = "The project entry was deleted.";
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
        setToken(null);

        message.textContent = "You have been logged off.";

        projectsTable.replaceChildren([projectsTableHeader]);

        showLoginRegister();
      }
    }
  });
};

export async function getCurrentUserId(email) {
  // console.log("email", email.value);
  const response = await fetch("/auth/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
    }),
  });
  const data = await response.json();
  const currentUserId = data.user._id;
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

    if (userData.user.accountType === "admin") {
      console.log("admin found");
    }

    let children = [projectsTableHeader];

    if (response.status === 200) {
      if (data.count === 0) {
        projectsTable.replaceChildren(...children); // clear this for safety
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

          // for (let m = 0; m < data.projects.length; m++) {
          //   const desAssigned = data.projects[m].assignedToDesigner;
          //   if (desAssigned != undefined) {
          //     const response = await fetch(
          //       `/auth/${data.projects[m].assignedToDesigner}`,
          //       {
          //         method: "GET",
          //         headers: {
          //           "Content-Type": "application/json",
          //           Authorization: `Bearer ${token}`,
          //         },
          //       }
          //     );
          //     const assignedTo = await response.json();
          //     console.log("assigned to ", assignedTo.name);
          //   }
          // }

          let rowEntry = document.createElement("tr");

          let editButton = `<td><button type="button" class="editButton" data-id=${data.projects[i]._id}>Edit</button></td>`;
          let deleteButton = `<td><button type="button" class="deleteButton" data-id=${data.projects[i]._id}>Delete</button></td>`;
          let assignButton = `<td><button type="button" class="assignButton" data-id=${data.projects[i]._id}>Assign</button></td>`;

          let rowHTML = `
              <td>${userName.user.name}</td>
              <td>${data.projects[i].title}</td>
              <td>${data.projects[i].description}</td>
              <td>${data.projects[i].status}</td>
              <td>${data.projects[i].assignedToDesigner}</td>
              <div>${editButton} </div>`;
          if (userData.user.accountType === "admin") {
            rowHTML += `${deleteButton}${assignButton}`;
          }

          rowEntry.innerHTML = rowHTML;
          children.push(rowEntry);
        }
        projectsTable.replaceChildren(...children);
      }
    } else {
      message.textContent = data.msg;
    }
  } catch (err) {
    console.log(err);
    message.textContent = "A communication error occurred.";
  }
  enableInput(true);
  setDiv(projectsDiv);
};

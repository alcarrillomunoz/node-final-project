import { enableInput, inputEnabled, message, setDiv, token } from "./index.js";
import { showProjects } from "./projects.js";

let addEditDiv = null;
let projectTitle = null;
let description = null;
let status = null;
let addingProject = null;

export const handleAddEdit = () => {
  addEditDiv = document.getElementById("edit-project");
  projectTitle = document.getElementById("projectTitle");
  description = document.getElementById("description");
  status = document.getElementById("status");
  addingProject = document.getElementById("adding-project");
  const editCancel = document.getElementById("edit-cancel");

  addEditDiv.addEventListener("click", async (e) => {
    if (inputEnabled && e.target.nodeName === "BUTTON") {
      if (e.target === addingProject) {
        enableInput(false);

        let method = "POST";
        let url = "/projects";

        if (addingProject.textContent === "Update") {
          method = "PATCH";
          url = `projects/${addEditDiv.dataset.id}`;
        }

        try {
          const response = await fetch(url, {
            method: method,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: projectTitle.value,
              description: description.value,
              status: status.value,
            }),
          });

          const data = await response.json();
          if (response.status === 200 || response.status === 201) {
            if (response.status === 200) {
              // a 200 is expected for a successful update
              message.textContent = `${data.project.title} project was updated.`;
            } else {
              // a 201 is expected for a successful create
              message.textContent = `${data.project.title} project was created.`;
            }

            projectTitle.value = "";
            description.value = "";
            status.value = "pending";
            showProjects();
          } else {
            message.textContent = data.msg;
          }
        } catch (err) {
          console.log(err);
          message.textContent = "A communication error occurred.";
        }
        enableInput(true);
      } else if (e.target === editCancel) {
        showProjects();
      }
    }
  });
};

export const showAddEdit = async (projectId) => {
  if (!projectId) {
    projectTitle.value = "";
    description.value = "";
    status.value = "New";
    addingProject.textContent = "Add";
    message.textContent = "";

    setDiv(addEditDiv);
  } else {
    enableInput(false);

    try {
      const response = await fetch(`/projects/${projectId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.status === 200) {
        projectTitle.value = data.project.title;
        description.value = data.project.description;
        status.value = data.project.status;
        addingProject.textContent = "Update";
        message.textContent = "";
        addEditDiv.dataset.id = projectId;

        setDiv(addEditDiv);
      } else {
        // might happen if the list has been updated since last display
        message.textContent = "The project entry was not found";
        showProjects();
      }
    } catch (err) {
      console.log(err);
      message.textContent = "A communications error has occurred.";
      showProjects();
    }

    enableInput(true);
  }
};

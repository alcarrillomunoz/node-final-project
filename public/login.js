import {
  inputEnabled,
  setDiv,
  token,
  message,
  enableInput,
  setToken,
} from "./index.js";
import { showLoginRegister } from "./loginRegister.js";
import { showProjects, getCurrentUserId } from "./projects.js";

let loginDiv = null;
let email = null;
let password = null;

export const handleLogin = () => {
  loginDiv = document.getElementById("logon-div");
  email = document.getElementById("email");
  password = document.getElementById("password");
  const logonButton = document.getElementById("logon-button");
  const logonCancel = document.getElementById("logon-cancel");
  const userName = document.getElementById("userName");

  loginDiv.addEventListener("click", async (e) => {
    e.preventDefault();
    if (inputEnabled && e.target.nodeName === "BUTTON") {
      if (e.target === logonButton) {
        enableInput(false);

        try {
          const response = await fetch("/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email.value,
              password: password.value,
            }),
          });

          const data = await response.json();
          if (response.status === 200) {
            message.textContent = `Logon successful.  Welcome ${data.user.name}`;
            userName.style.display = "block";
            userName.innerHTML = `${data.user.name} Profile`;
            setToken(data.token);
            getCurrentUserId(email.value);

            console.log("user logon data", data);

            //email.value = "";
            password.value = "";

            showProjects();
          } else {
            message.textContent = data.msg;
          }
        } catch (err) {
          console.error(err);
          message.textContent = "A communications error occurred.";
        }

        enableInput(true);
      } else if (e.target === logonCancel) {
        email.value = "";
        password.value = "";
        showLoginRegister();
      }
    }
  });
};

export const showLogin = () => {
  email.value = null;
  password.value = null;
  setDiv(loginDiv);
};

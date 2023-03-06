import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loaderInterval;

const loaderAnimation = (e) => {
  e.textContent = "";
  loaderInterval = setInterval(() => {
    e.textContent += ".";
    if (e.textContent === "....") {
      e.textContent = "";
    }
  }, 300);
};

const answerAnimation = (element, answer) => {
  let index = 0;

  let textInverval = setInterval(() => {
    if (index < answer.length) {
      element.innerHTML += answer.charAt(index);
      index++;
    } else {
      clearInterval(textInverval);
    }
  }, 20);
};

const generateUID = () => {
  const timestamp = Date.now();
  const numberRandom = Math.random();
  const hexDecimalString = numberRandom.toString(16);
  return `id-${timestamp}-${hexDecimalString}`;
};

const chatStript = (isAI, value, UID) => {
  return `
<div class="wrapper ${isAI && "ai"}">
  <div class="chat">
     <div class="profile">
        <img
           src="${isAI ? bot : user}"
           alt="${isAI ? "bot" : "user"}"
        />
     </div>

     <div class="message" id="${UID}">${value}</div>
  </div>
</div>
`;
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  // user's chatstripe
  chatContainer.innerHTML += chatStript(false, data.get("prompt"));
  form.reset();

  // bot's chatstripe
  const UID = generateUID();
  chatContainer.innerHTML += chatStript(true, " ", UID);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  const messageDiv = document.getElementById(UID);
  loaderAnimation(messageDiv);

  // fetch data from server / bot response
  const response = await fetch("http://localhost:5000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt: data.get("prompt") }),
  });

  clearInterval(loaderInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parseData = data.bot.trim();
    answerAnimation(messageDiv, parseData);
  } else {
    messageDiv.innerHTML = "Maaf, ada kesalahan. Coba ulangi lagi";
  }
};

form.addEventListener("submit", handleSubmit);

form.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    handleSubmit(e);
  }
});

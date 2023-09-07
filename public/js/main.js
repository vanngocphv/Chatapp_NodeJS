const socket = io();

const totalClient = document.querySelector(".clients-total");

//audio
const audioTone = new Audio("../message-tone.mp3");

const messageContainer = document.querySelector("#message-container"); //message container, where show all message
const nameInput = document.querySelector("#name-input"); //name input of user
const messageForm = document.querySelector("#message-form"); //form send message of user
const messageInput = document.querySelector("#message-input"); //form input message

// --- Html Event --- //
messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  sendMessage();
});
//input or focus event
// messageInput.addEventListener("input", (e) => {
//   console.log("on input");
//   onFeedback();
// });

messageInput.addEventListener("focus", (e) => {
  socket.emit("feedback-sending", {
    idOwner: socket.id,
    nameOwner: `✍️ ${nameInput.value}`,
    msg: `✍️ ${nameInput.value} is typing a message...`,
  });
});
messageInput.addEventListener("keypress", (e) => {
  socket.emit("feedback-sending", {
    idOwner: socket.id,
    nameOwner: `✍️ ${nameInput.value}`,
    msg: `✍️ ${nameInput.value} is typing a message...`,
  });
});
messageInput.addEventListener("blur", (e) => {
  socket.emit("feedback-sending", {
    idOwner: socket.id,
    nameOwner: ``,
    msg: ``,
  });
});

// --- Socket Event --- //

//socket event
socket.on("clients-total", (data) => {
  totalClient.textContent = "Total clients: " + data;
});

socket.on("client-disconnect", (data) => {
  addClientFeedback(data);
});

socket.on("client-connect", (data) => {
  if (data == socket.id) return;
  addClientFeedback(data + " is connected");
});

socket.on("chat-sync", (data) => {
  addMessageToUI(false, data);
});

socket.on("feedback-sync", (data, arrays) => {
  addFeedbackToUI(data);
});

// --- Handle Function --- //

//send message to server
function sendMessage() {
  //set data json for sending
  if (messageInput.value == "" || !messageInput.value) {
    return;
  }
  const data = {
    nameOwner: nameInput.value,
    message: messageInput.value,
    dateTime: new Date(),
  };
  addMessageToUI(true, data);

  socket.emit("message-sending", data);

  //handle clear message input after sending
  messageInput.value = "";
}

//add message send from server into UI
function addMessageToUI(isOwnMessage, data) {
  //clear feedback and set again
  clearFeedback();
  const messageElement = `
    <li class="${isOwnMessage ? "message-right" : "message-left"}">
        <p class="message">
        ${data.message} 
        <span>${data.nameOwner}　●　${moment(data.dateTime).fromNow()}</span>
        </p>
    </li>`;

  audioTone.play();
  messageContainer.innerHTML += messageElement;
  scrollToBottom();
}

function scrollToBottom() {
  messageContainer.scrollTop = messageContainer.scrollHeight;
}

//feedback
// function onFeedback() {
//   const data = {
//     nameOwner: nameInput.value,
//   };

//   socket.emit("feedback-sending", data);
// }

//add to UI
function addFeedbackToUI(data) {
  //clear feedback and set again
  clearFeedback();
  //   const datas = data.map((i) => i.idOwner != Number(socket.id));
  //   console.log(datas);
  const feedbackElement = `
    <li class="message-feedback">
        <p class="feedback" id="feedback">${data.msg}</p>
    </li>`;

  messageContainer.innerHTML += feedbackElement;
  scrollToBottom();
}

function addClientFeedback(data) {
  //clear feedback and set again
  clearFeedback();
  const feedbackElement = `
    <li class="client-feedback">
        <p class="feedback" id="feedback">${data}</p>
    </li>`;

  messageContainer.innerHTML += feedbackElement;
  scrollToBottom();
}

//clear feedback
function clearFeedback() {
  document.querySelectorAll("li.message-feedback").forEach((e) => {
    e.parentNode.removeChild(e);
  });
}

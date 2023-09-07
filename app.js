const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 4000;
let typingClient = [];
const server = app.listen(PORT, () => {
  console.log("A server has been listened in port ", PORT);
});

const socketIo = require("socket.io")(server);

let socketConnected = new Set();

app.use(express.static(path.join(__dirname, "public")));

socketIo.on("connection", onConnected);

// function will can create anywhere and be called anywhere
// const function just like a new variable, will be created at the time this const has been created
function onConnected(socket) {
  console.log(socket.id);

  socketConnected.add(socket.id);

  socketIo.emit("clients-total", socketConnected.size);

  socketIo.emit("client-connect", socket.id);

  //handle event message sending
  socket.on("message-sending", (data) => {
    socket.broadcast.emit("chat-sync", data);
  });

  //handle event feedback sending
  socket.on("feedback-sending", (data) => {
    if (typingClient.length > 0) {
      const item = typingClient.find((i) => i.idOwner == data.idOwner);
      if (!item) {
        typingClient.push(data);
      }
    } else {
      typingClient.push(data);
    }

    socket.broadcast.emit("feedback-sync", data, typingClient);
  });

  //handle event disconnect
  socket.on("disconnect", () => {
    typingClient = typingClient.filter((i) => i.idOwner != socket.id);

    socketConnected.delete(socket.id);

    socketIo.emit("client-disconnect", socket.id + " is disconnected");
    socketIo.emit("clients-total", socketConnected.size);
  });
}

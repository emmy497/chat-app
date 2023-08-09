const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessages, locationMessage } = require("./utils/messages")

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New Websocket connection");

  socket.emit("message", generateMessages("Welcome!"));
  socket.broadcast.emit("message", generateMessages("A new user has joined"));

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }

    io.emit("message", generateMessages(message));
    callback();
  });

  socket.on("disconnect", () => {
    io.emit("message",  generateMessages("a user has left") );
  });

  socket.on("sendLocation", (coords, callback) => {
    if (!coords) {
      return callback("Couldn't fetch loaction");
    }

    io.emit(
      "locationMessage",
      locationMessage(coords.latitude, coords.longitude)
    );
    callback();
  });
});

server.listen(port, () => console.log(`server is running on port ${port}`));

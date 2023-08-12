const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessages, locationMessage } = require("./utils/messages");
const {
  addUser,
  getUser,
  getUsersInRoom,
  removeUser,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  // console.log("New Websocket connection");

  // socket.emit("message", generateMessages("Welcome!"));
  // socket.broadcast.emit("message", generateMessages("A new user has joined"));

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit("message", generateMessages("Welcome!", "Admin"));
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessages(`${user.username}  joined`, "Admin"));

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const { error, user } = getUser(socket.id);

    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }

    io.to(user.room).emit("message", generateMessages(message, user.username));
    callback(error);
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessages(`${user.username}  left`, "Admin")
        
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }
  });

  socket.on("sendLocation", (coords, callback) => {
    const { error, user } = getUser(socket.id);

    if (!coords) {
      return callback("Couldn't fetch loaction");
    }

    io.to(user.room).emit(
      "locationMessage",
      locationMessage(coords.latitude, coords.longitude, user.username)
    );
    callback();
  });
});

server.listen(port, () => console.log(`server is running on port ${port}`));

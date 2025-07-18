const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("setUsername", (username) => {
    users[socket.id] = username;
    io.emit("usersOnline", Object.values(users));
  });

  socket.on("sendMessage", (data) => {
    io.emit("receiveMessage", {
      user: users[socket.id],
      message: data.message,
      time: new Date().toLocaleTimeString(),
    });
  });

  socket.on("typing", () => {
    socket.broadcast.emit("userTyping", users[socket.id]);
  });

  socket.on("stopTyping", () => {
    socket.broadcast.emit("userStoppedTyping", users[socket.id]);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete users[socket.id];
    io.emit("usersOnline", Object.values(users));
  });
});

server.listen(5000, () => console.log("Server running on port 5000"));
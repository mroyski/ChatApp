const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/private', (req, res) => {
  res.sendFile(__dirname + '/views/private.html');
});

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error('invalid username'));
  }
  socket.username = username;
  next();
});

io.on('connection', (socket) => {
  const users = [];
  for (let [id, socket] of io.of('/').sockets) {
    users.push({
      userId: id,
      username: socket.username,
    });
  }
  socket.emit('users', users);

  // notify existing users
  socket.broadcast.emit('user connected', {
    userID: socket.id,
    username: socket.username,
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.onAny((event, ...args) => {
    console.log(event, args);
  });

  socket.on('connect_error', (err) => {
    if (err.message === 'invalid username') {
      this.usernameAlreadySelected = false;
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    io.emit('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

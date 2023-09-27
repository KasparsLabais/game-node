const http = require('http');
const fs = require('fs');
const games = require('./games');
const users = require('./users');

const server = http.createServer((req, res) => {
  //res.writeHead(200, { 'Content-Type': 'text/plain' });
  //res.end('Hello, World!\n');
});

server.listen(3000,'localhost', () => {
  console.log('Server running at http://node-server.test:3000/');
});

const io = require('./socket').init(server);
io.on('connection', (socket) => {
  socket.on('userconnected', (data) => {
    let userResponse = users.addOrUpdateUser(data.id, data.username, socket.id);
  });

  socket.on('disconnect', (socket) => {
    console.log('user disconnected ');
  });

  socket.on('playerJoined', (data) => {
    console.log(data);
  });

  socket.on('addOrUpdateGameInstance', (data) => {
    let user = users.getUserBySocketId(socket.id);
    if (user.id != data.gameInstance.user_id) {
      return;
    }
    games.addOrUpdateGame(data.gameToken, data.gameInstance);
  });

});


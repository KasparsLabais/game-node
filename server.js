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
    console.log('user connected ', data);
    let userResponse = users.addOrUpdateUser(data.id, data.username, socket.id);
  });

  socket.on('disconnect', (socket) => {
    console.log('user disconnected ');
  });

  socket.on('joinGameInstance', (data, callback) => {
    console.log('joinGameInstance', data);

    let user = users.getUserBySocketId(socket.id);
    if (!user) {
      callback({ status: false, message: 'User not found', repeatCount: data.repeatCount + 1 });
    } else {
      games.addPlayerToGameInstance(data.gameToken, user);
      let gameInstance = games.getGameInstance(data.gameToken);

      io.to(data.gameToken).emit('playerJoined', {
        'gameToken': data.gameToken,
        'gameInstance': gameInstance.game,
        'player': {'username': user.username, 'id': user.id}
      });
      callback({ status: true, message: 'Joined room' });
    }
  });

  socket.on('joinRoom', (data, callback) => {
    console.log('joinRoom', data);

    let user = users.getUserBySocketId(socket.id);
    if (!user) {
      callback({status: false, message: 'User not found', repeatCount: data.repeatCount + 1});
    } else {
      socket.join(data.gameToken);
      callback({status: true, message: 'Joined room'});
    }
  })

  socket.on('addOrUpdateGameInstance', (data) => {
    console.log('addOrUpdateGameInstance', data);
    let user = users.getUserBySocketId(socket.id);
    if (user.id != data.gameInstance.user_id) {
      return;
    }
    games.addOrUpdateGame(data.gameToken, data.gameInstance);
  });

});


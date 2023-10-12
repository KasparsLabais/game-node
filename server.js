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
    let userResponse = users.addOrUpdateUser(data.id, data.username, data.playerToken);
    socket.join(data.playerToken);
  });

  socket.on('disconnect', (socket) => {
    console.log('user disconnected ');
    //socket.leave(data.playerToken);
  });

  socket.on('joinGameInstance', (data, callback) => {
    console.log('joinGameInstance', data);

    let user = users.getUserByPlayerToken(data.playerToken);
    if (!user) {
      callback({ status: false, message: 'User not found', repeatCount: data.repeatCount + 1 });
    } else {

      games.addOrUpdatePlayers(data.gameToken, user);
      let gameInstance = games.getGameInstance(data.gameToken);

      io.to(data.gameToken).emit('playerJoined', {
        'gameToken': data.gameToken,
        'gameInstance': gameInstance,
        'player': {'username': user.username, 'id': user.id}
      });

      callback({ status: true, message: 'Joined room' });
    }
  });

  socket.on('joinRoom', (data, callback) => {
    console.log('joinRoom', data);

    let user = users.getUserByPlayerToken(data.playerToken);
    if (!user) {
      callback({status: false, message: 'User not found', repeatCount: data.repeatCount + 1});
    } else {
      socket.join(data.gameToken);
      callback({status: true, message: 'Joined room'});
    }
  })

  socket.on('addOrUpdateGameInstance', (data) => {
    console.log('addOrUpdateGameInstance', data);
    let user = users.getUserByPlayerToken(data.playerToken);
    if (user.id != data.gameInstance.user_id) {
      return;
    }
    games.addOrUpdateGame(data.gameToken, data.gameInstance);
  });

  socket.on('updateGameInstance', (data) => {
    console.log('updateGameInstance', data);
    let user =  users.getUserByPlayerToken(data.playerToken);

    if (user.id != data.gameInstance.user_id) {
      return;
    }

    games.addOrUpdateGame(data.gameToken, data.gameInstance);
    io.to(data.gameToken).emit('gameInstanceUpdated', {
      'gameToken': data.gameToken,
      'gameInstance': data.gameInstance,
      'action' : data.action
    });
  });

  socket.on('getGameInstance', (data, callback) => {
    console.log('getGameInstance', data);
    let gameInstance = games.getGameInstance(data.gameToken);
    callback({ 'gameToken': data.gameToken, 'gameInstance': gameInstance });
  });

  socket.on('redirect', (data) => {
    console.log('redirect', data);
    let user =  users.getUserByPlayerToken(data.playerToken);
    let gameInstance = games.getGameInstance(data.gameToken);

    if (user.id != gameInstance.game.user_id) {
        return;
    }
    io.to(data.gameToken).emit('redirect', { 'gameToken': data.gameToken, 'url': data.url });
  });

  socket.on('notifyGameMaster', (data) => {
    console.log('notifyGameMaster', data);

    let gameInstance = games.getGameInstance(data.gameToken);
    console.log('notifyGameMaster', gameInstance, gameInstance.user_id);
    let gameMasterUser= users.getUserById(gameInstance.user_id);

    io.to(gameMasterUser.playerToken).emit('notifyGameMaster', { 'gameToken': data.gameToken, 'action': data.action, 'data': data.data });

    //io.sockets.connected[gameMasterUser.socketId].emit('notifyGameMaster', { 'gameToken': data.gameToken, 'action': data.action, 'data': data.data });
    //io.to(data.gameToken).emit('notifyGameMaster', { 'gameToken': data.gameToken, 'data': data.data });
  });

  socket.on('notifyRoom', (data) => {
    console.log('notifyRoom', data);
    let playerInstance = users.getUserByPlayerToken(data.playerToken);
    io.to(data.gameToken).emit('notifyRoom', { 'gameToken': data.gameToken, 'data': data.data, 'username' : playerInstance.username });
  });

  socket.on('updatePlayerInstance', (data) => {
    console.log('updatePlayerInstance', data);

    let user = users.getUserByPlayerToken(data.playerToken);
    if (user.id != data.playerInstance.user_id) {
      return;
    }

    let gameInstance = games.getGameInstance(data.gameToken);
    if (!gameInstance) {
      return;
    }

    switch (data.action) {
      case 'updatePlayerInstanceStatus':
        break;
      case 'updatePlayerInstanceScore':
        break;
      case 'updatePlayerInstanceRemoteData':
      default:
        //gameInstance.players[user.id] = data.playerInstance;
        //gameInstance.players[user.id].remoteData = data.playerInstance.remoteData;
        break;
    }

    games.addOrUpdatePlayers(data.gameToken, data.playerInstance);
    io.to(data.gameToken).emit('playerInstanceUpdated', {
      //'gameToken': data.gameToken,
      //'playerInstance': data.playerInstance,
      'action' : data.action
    });
    socket.emit('updatePoints', {'points': data.playerInstance.points});
  });

});


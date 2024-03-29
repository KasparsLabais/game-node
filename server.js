const http = require('http');
const fs = require('fs');

const games = require('./games');
const users = require('./users');

const server = http.createServer((req, res) => {
  //res.writeHead(200, { 'Content-Type': 'text/plain' });
  //res.end('Hello, World!\n');
});

server.listen(5000,'localhost', () => {
  console.log('Server running at http://node-server.test:5000/');

  //load games from api
  console.log('Loading games from api')
  http.get('http://is-a.gay/api/games', (resp) => {
    console.log('Response');

    //parse incomming message
    let data = [];
    const { statusCode } = resp;
    const contentType = resp.headers['content-type'];
    console.log('Status code', statusCode);
    console.log('Content type', contentType);

    resp.on('data', (chunk) => {
        data.push(chunk);
    });

    resp.on('end', () => {
        let fullResponse = JSON.parse(Buffer.concat(data).toString());
        console.log(fullResponse);

        fullResponse.games.forEach((game) => {
          console.log('End Action', game.players);
          games.addOrUpdateGame(game.game.token, game.game);
          game.players.forEach((player) => {
            console.log(player);
              //if avatar is null set default avatar
              if (player.user.avatar == null) {
                player.user.avatar = '/images/default-avatar.jpg';
              }

              let parsedPlayer = {
                'id': player.id,
                'username': player.user.username,
                'avatar':  player.user.avatar,
                'playerToken': player.user.unique_token,
                'points': player.points,
                'remote_data': player.remote_data
              }

              games.addOrUpdatePlayers(game.game.token, parsedPlayer);
          });

          //games.addOrUpdatePlayers(game.gameToken, game.players);
        });

    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
  console.log('Loading games from api done');

});

const io = require('./socket').init(server);
io.on('connection', (socket) => {

  socket.on('userconnected', (data) => {
    console.log('user connected ', data);
    let userResponse = users.addOrUpdateUser(data.id, data.username, data.avatar, data.playerToken, data.playerType, data.iconFlair);
    socket.join(data.playerToken);

    console.log('Attempt to connect');
    socket.emit('userconnected', { 'username': data.username, 'id': data.id, 'avatar': data.avatar, 'playerToken': data.playerToken });
  });

  socket.on('userReConnected', (data, callback) => {
    console.log('userReConnected', data);

    let userResponse = users.addOrUpdateUser(data.id, data.username, data.avatar, data.playerToken, data.playerType, data.iconFlair);
    socket.join(data.playerToken);

    callback({'status': 'connected'});
  });

  socket.on('disconnect', (socket) => {
    console.log('user disconnected ');
    console.log(socket);
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
        'player': {'username': user.username, 'id': user.id, 'avatar': user.avatar}
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
    console.log('notifyGameMaster', gameMasterUser);
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
  });

  socket.on('getPlayerPoints', (data) => {
    console.log('getPlayersPoints', data);
    let user = users.getUserByPlayerToken(data.playerToken);
    console.log('getPlayersPoints', user);
    let playerInstance = games.getPlayerInstance(data.gameToken, user.id);
    console.log('getPlayersPoints', playerInstance);
    if(!playerInstance) {
      return;
    } else {
      socket.emit('updatePoints', {'points': playerInstance.points});
    }
  });

  socket.on('getGameInstances', (data, callback ) => {
    console.log('getGameInstances', data);
    let gameInstances = games.getAllGameInstances();
    callback(gameInstances);
  });


  socket.on('updateGameInstanceSetting', (data) => {
    console.log('updateGameInstanceSetting', data);
    let user = users.getUserByPlayerToken(data.playerToken);
    let game = games.getGameInstance(data.gameToken);

    if (user.id != game.user_id) {
      return;
    }
    games.addOrUpdateGameInstanceSetting(data.gameToken, data.key, data.value);
    io.to(data.gameToken).emit('gameInstanceSettingUpdated', {
      'gameToken': data.gameToken,
      'key': data.key,
      'value': data.value
    });
  });

  socket.on('updateGameInstanceSettings', (data) => {
    console.log('updateGameInstanceSettings', data);
    let user = users.getUserByPlayerToken(data.playerToken);
    let game = games.getGameInstance(data.gameToken);

    if (user.id != game.user_id) {
      return;
    }
    games.addOrUpdateGameInstanceSettings(data.gameToken, data.gameInstanceSettings);
    io.to(data.gameToken).emit('gameInstanceSettingsUpdated', {
      'gameToken': data.gameToken,
      'gameInstanceSettings': data.gameInstanceSettings
    });
  })


  socket.on('triggerAlertNotification', (data) => {
    console.log('triggerAlertNotification', data);
    let user = users.getUserByPlayerToken(data.playerToken);
    let game = games.getGameInstance(data.gameToken);

    if (user.id != game.user_id) {
      return;
    }

    if (data.messageType == 'group') {
      io.to(data.gameToken).emit('alertNotification', {
        'gameToken': data.gameToken,
        'message': data.message,
        'notificationType' : data.notificationType
      });
      return;
    }

    let recepient = users.getUserById(data.playerId);
    if (data.messageType == 'player') {
      io.to(recepient.playerToken).emit('alertNotification', {
        'gameToken': data.gameToken,
        'message': data.message,
        'notificationType' : data.notificationType
      });
    }

    return;
  });

});


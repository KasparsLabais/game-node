//const fs = require('fs');
//fs.writeFileSync('game.txt', 'games.js loaded');
let gameInstances = {};

const addOrUpdateGame = (gameToken, game) => {
    const gameInstance = gameInstances[gameToken];
    if (gameInstance) {
        gameInstance.game = game;
    } else {
        gameInstances[gameToken]['game'] = game;
    }
    console.log("[GAMES] ",gameInstances);
    return gameInstances;
}

const addPlayerToGameInstance = (gameToken, player) => {
    let gameInstance = gameInstances[gameToken];
    if (gameInstance) {
        if (!gameInstance.players) {
            gameInstance.players = {[player.id]: player};
        } else {
            gameInstance.players[player.id] = player;
        }
        gameInstances[gameToken] = gameInstance;
    } else {
        gameInstances[gameToken] = { players: { [player.id]: player } };
    }

    console.log("[GAMES] ",gameInstances);
    return gameInstances;
}

const getGameInstance = (gameToken) => {
    return gameInstances[gameToken];
}

module.exports = { addOrUpdateGame, addPlayerToGameInstance, getGameInstance };
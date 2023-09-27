//const fs = require('fs');
//fs.writeFileSync('game.txt', 'games.js loaded');
let gameInstances = {};

const addOrUpdateGame = (gameToken, game) => {
    const gameInstance = gameInstances[gameToken];
    if (gameInstance) {
        gameInstance.game = game;
    } else {
        gameInstances[gameToken] = { game };
    }
    return gameInstances;
}
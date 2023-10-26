//const fs = require('fs');
//fs.writeFileSync('game.txt', 'games.js loaded');
let gameInstances = {};
const addOrUpdateGame = (gameToken, game) => {
    console.log("addOrUpdateGame", gameToken, game)
    const gameInstance = gameInstances[gameToken];
    if (gameInstance) {
        gameInstances[gameToken]['game'] = game;
    } else {
        gameInstances[gameToken] = { 'game': game};
    }
    return gameInstances;
}

const addOrUpdatePlayers = (gameToken, player) => {
    console.log("addOrUpdatePlayers", gameToken, player);
    let gameInstance = gameInstances[gameToken];
    if (gameInstance) {
        if (!gameInstance.players) {
            gameInstances[gameToken]['players'] = {[player.id]: player};
        } else {
            gameInstances[gameToken]['players'][player.id] = player;
        }
        //gameInstances[gameToken] = gameInstance;
    } else {
        gameInstances[gameToken] = { players: { [player.id]: player } };
    }
    return gameInstances;
}

const addOrUpdateGameInstanceSettings = (gameToken, gameInstanceSettings) => {
    console.log("addOrUpdateGameInstanceSettings", gameToken, gameInstanceSettings);
    let gameInstance = gameInstances[gameToken];
    if (gameInstance) {
        if (!gameInstance.gameInstanceSettings) {
            gameInstances[gameToken]['gameInstanceSettings'] = gameInstanceSettings;
        } else {
            gameInstances[gameToken]['gameInstanceSettings'] = gameInstanceSettings;
        }
    } else {
        gameInstances[gameToken] = { gameInstanceSettings: gameInstanceSettings };
    }
    return gameInstances;
}

const addOrUpdateGameInstanceSetting = (gameToken, key, value) => {
    console.log("addOrUpdateGameInstanceSetting", gameToken, key, value);
    let gameInstance = gameInstances[gameToken];
    if (gameInstance) {
        if (!gameInstance.gameInstanceSettings) {
            gameInstances[gameToken]['gameInstanceSettings'] = { [key]: value };
        } else {
            gameInstances[gameToken]['gameInstanceSettings'][key] = value;
        }
    } else {
        gameInstances[gameToken] = { gameInstanceSettings: { [key]: value } };
    }
    return gameInstances;
}

const getGameInstance = (gameToken) => {
    console.log("getGameInstance", gameInstances[gameToken])
    return gameInstances[gameToken].game;
}

const getAllGameInstances = () => {
    console.log("getAllGameInstances", gameInstances)
    return gameInstances;
}

const getPlayersInstance = (gameToken) => {
    console.log("getPlayerInstance", gameInstances[gameToken])
    return gameInstances[gameToken].players;
}

module.exports = { addOrUpdateGame, addOrUpdatePlayers, getGameInstance, getPlayersInstance, getAllGameInstances, addOrUpdateGameInstanceSettings, addOrUpdateGameInstanceSetting };
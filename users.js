const http = require('http');

let users = {};
const addOrUpdateUser = (userId, username, avatar, playerToken) => {
    const user = users[userId];
    if (user) {
        user.id = userId;
        user.username = username;
        user.playerToken = playerToken;
        user.avatar = avatar;
    } else {
        users[userId] = { username, playerToken };
    }
    return users;
}
const removeUser = (id) => {
    delete users[id];
    return users;
}

const getUser = (id) => {
    return users[id];
};

//get user by socket id
const getUserBySocketId = (socketId) => {
    console.log('getUserBySocketId', socketId);
    let user = null;
    console.log('Users', users);
    Object.keys(users).forEach((key) => {
        if (users[key].socketId == socketId) {
            user = users[key];
        }
    });
    return user;
}

const getUserByPlayerToken = (playerToken) => {
    console.log('getUserByPlayerToken', playerToken);
    let user = null;
    Object.keys(users).forEach((key) => {
        console.log(key, users[key]);
        if (users[key].playerToken == playerToken) {
            user = users[key];
        }
    });
    console.log('getUserByPlayerToken', user);
    return user;
}

const getUserById = (id) => {
    console.log('getUserById', id);
    let user = null;
    Object.keys(users).forEach((key) => {
        if (users[key].id == id) {
            user = users[key];
        }
    });
    return user;
}

const getUsersPoints = (sockedId, gameToken) => {
    let user = getUserBySocketId(socketId);

    http.get('http://localhost:3000/api/points?gameToken=' + gameToken, (resp) => {
        let data = [];
        const { statusCode } = resp;
        const contentType = resp.headers['content-type'];

        res.on('data', (chunk) => {
            data.push(chunk);
        });

        res.on('end', () => {
            let fullResponse = JSON.parse(Buffer.concat(data).toString());
            console.log(fullResponse);
            return fullResponse.points;
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
};

module.exports = { addOrUpdateUser, removeUser, getUserBySocketId, getUser, getUserByPlayerToken, getUserById };
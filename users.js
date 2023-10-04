const http = require('http');

let users = {};
const addOrUpdateUser = (userId, username, socketId) => {
    const user = users[userId];
    if (user) {
        user.id = userId;
        user.username = username;
        user.socketId = socketId;
    } else {
        users[userId] = { username, socketId };
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
    let user = null;
    Object.keys(users).forEach((key) => {
        if (users[key].socketId == socketId) {
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

module.exports = { addOrUpdateUser, removeUser, getUserBySocketId, getUser };
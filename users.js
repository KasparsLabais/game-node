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

module.exports = { addOrUpdateUser, removeUser };
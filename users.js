let users = {};
const addOrUpdateUser = (userId, username, socketId) => {
    const user = users[userId];
    if (user) {
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

module.exports = { addOrUpdateUser, removeUser };
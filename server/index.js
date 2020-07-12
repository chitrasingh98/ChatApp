const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const router = require('./router');

const { addUser, removeUser, getUser, getUserInRoom } = require('./users.js');
const { text } = require('express');

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on('connection', (socket) => {
    console.log("we have a new connection!!!");
    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room });

        if (error) return callback(error);
        socket.join(user.room);

        socket.emit('message', { user: 'admin', text: `${user.name},welcome to the room ${user.room}` });
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `$(user.name) has joined the chat` });
        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        console.log(socket.id);
        const user = getUser(socket.id);
        io.to(user.room).emit('message', { user: user.name, text: message });
        callback();
    });

    socket.on('disconnect', () => {
        console.log("user has left the chat...");
    })
})
app.use(router);
server.listen(PORT, () => console.log(`server gas started on post ${PORT}`));

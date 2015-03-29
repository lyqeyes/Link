/**
 * Created by 衍晴 on 2015/3/21.
 */
var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

exports.listen = function(server) {
    io = socketio.listen(server);
    io.set('log level', 1);
    io.sockets.on('connection', function (socket) {
        guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);
        joinRoom(socket, 'WaittingRoom');
        handleMessageBroadcasting(socket, nickNames);
        handleRoomJoining(socket);
        socket.on('rooms', function() {
            socket.emit('rooms', io.sockets.manager.rooms);
        });
        handleClientDisconnection(socket, nickNames, namesUsed);
    });
};

function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
    var name = 'Guest' + guestNumber;
    nickNames[socket.id] = name;
    socket.emit('nameResult', {
        success: true,
        name: name
    });
    namesUsed.push(name);
    return guestNumber + 1;
}

function joinRoom(socket, room) {
    var usersInRoom = io.sockets.clients(room);
    if(room != "WaittingRoom" && usersInRoom.length == 2)
    {
        socket.emit("myerror","playing");
        return;
    }

    socket.join(room);
    currentRoom[socket.id] = room;
    socket.emit('joinResult', {room: room});
    socket.broadcast.to(room).emit('message', {
        text: nickNames[socket.id] + ' has joined ' + room + '.'
    });

    //房间人数达到两人
    usersInRoom = io.sockets.clients(room);
    if(room != "WaittingRoom" && usersInRoom.length == 2)
    {
        socket.emit('start',room);
        socket.broadcast.to(room).emit('start',room);
    }
}

function handleMessageBroadcasting(socket) {
    socket.on('message', function (message) {
        socket.broadcast.to(message.room).emit('message', {
            text: nickNames[socket.id] + ': ' + message.text
        });
    });

    //lyq
    socket.on("setMap",function(map){
        socket.broadcast.to(map.room).emit("printMap",map.mapInfo);
    });
    socket.on("sendStep",function(info)
    {
        socket.broadcast.to(info.room).emit("step",info.pathInfo);
    });
    socket.on("gameOver",function(room){
        console.log("game over!");
        socket.broadcast.to(room).emit("gameover");
    });
}

function handleRoomJoining(socket) {
    socket.on('join', function(room) {
        socket.leave(currentRoom[socket.id]);
        joinRoom(socket, room.newRoom);
    });
}

function handleClientDisconnection(socket) {
    socket.on('disconnect', function() {
        var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
        delete namesUsed[nameIndex];
        delete nickNames[socket.id];
    });
}

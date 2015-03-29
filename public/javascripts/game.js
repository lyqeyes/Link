/**
 * Created by 衍晴 on 2015/3/25.
 */
var Game = function(socket){
    this.socket = socket;
}

//发送初始化地图
Game.prototype.sendMap = function(room,mapInfo){
    var map = {
        room:room,
        mapInfo:mapInfo
    };
    socket.emit("setMap",map);
};

//发送消除的坐标
Game.prototype.sendStep = function(step){
    socket.emit("sendStep",step);
};

Game.prototype.gameOver = function(room) {
    socket.emit("gameOver",room);
};


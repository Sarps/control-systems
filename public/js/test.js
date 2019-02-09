
var socket = io();

socket.on('proximity change', function (distance) {
	if(50 < distance) distance = 50;
	catcher.position.x = distance;
});


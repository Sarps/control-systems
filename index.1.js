const {Board, Proximity, Servo} = require('johnny-five');

const board = new Board();

board.on('ready', function () {

    var servo = new Servo(10);
    servo.min();
    servo.to(75, 1125);

});

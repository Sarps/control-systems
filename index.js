const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const {Board, Proximity, Servo, Led} = require('johnny-five');
var emitProximityInterval = null,
    lastProximityReading = 0;


const board = new Board();

board.on('ready', function () {

    var proximity = new Proximity({ controller: "HCSR04", pin: 7});
    var servo = new Servo(10);
    servo.to(0);
    
    var redLed = new Led(8);
    var greenLed = new Led(9);

    redLed.on();
    //setTimeout(() => redLed.stop(), 5000);

    greenLed.blink();
    setTimeout(() => {
        greenLed.stop()
        greenLed.off()
    }, 2000);

    io.on('connection', (socket)=>{

        console.log('Socket Loaded')

        proximity.on("change", function () {
            lastProximityReading = this.cm
        });
    
        socket.on('proximity.stop', () => {
            clearInterval(emitProximityInterval);
        })

        socket.on('proximity.listen', () => {
            emitProximityInterval = setInterval(()=>{
                socket.emit('proximity.change', lastProximityReading)
            }, 1000);
        });
    
        socket.on('servo.stop', () => {
            console.log('stop servo');
            servo.stop();
        });
    
        socket.on('servo.move', (data) => {
            console.log('moveServo :', data);
            if(data.duration)
                servo.to(data.to, data.duration);
            else
                servo.to(data.to);
        });
    
        socket.on('servo.sweep', () => {
            console.log('sweep :');
            servo.sweep([10, 170]);
        });
    
        socket.on('servo.spin', () => {
            console.log('spin :');
            servo.sweep([10, 170]);
        });

        socket.on('led.on', (color) => {
            console.log('led.on: ', color);
            if(color === "red") redLed.on();
            if(color === "green") greenLed.on();
        })

        socket.on('led.off', (color) => {
            console.log('led.off: ', color);
            if(color === "red") redLed.off();
            if(color === "green") greenLed.off();
        })

    })

    http.listen(3000, function () {
        console.log('Listening on port 3000');
    });

});

app.use('/bower_components', express.static('bower_components'));
app.use('/', express.static('public'));

app.get('/', (req, res) => {
    res.redirect('index.html');
});

http.listen(3000, function () {
    console.log('Listening on port 3000');
});

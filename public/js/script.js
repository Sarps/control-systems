
var ball = this.getObjectByName( 'Ball' );

var position = ball.position;

var velocity = new THREE.Vector3();

var catcher = this.getObjectByName( 'Catcher' );
var cannon = this.getObjectByName( 'Cannon' );

var raycaster = new THREE.Raycaster();
var objects = [catcher];

var t = 0, hmax = 20, d = 20, tof = 500;

var socket = io();

socket.on('proximity change', function (distance) {
	if(50 < distance) distance = 50;
	catcher.position.x = distance;
});


function projectile() {
	t+=1;
	position.y = hmax * Math.sin(t*Math.PI/tof);
	position.x = d * (t/tof) + cannon.position.x;
}



function update( event ) {

	projectile();

	if ( position.y > 0.1 ) return;

	if ( Math.abs(position.y - catcher.position.y) < 0.001 && 
		Math.abs(position.x - catcher.position.x) < 0.001  ) {
		alert('GOTCHA');
		player.stop();
		socket.off('proximity change');
	}

	if(position.x > 0 && position.y < 0){
		confirm('Oops!!! BUSTED');
		player.stop();
	}
}
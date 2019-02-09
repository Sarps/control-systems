var socket = io();

function addChartData(cm) {
    console.log('add', cm)
    if (app.project.proximities.length > 10) {
        socket.off('proximity.change');
        socket.on('proximity.change', shiftChartData);
    }
    app.project.proximities.push({
        x: '',
        y: cm
    });
    app.chart.setData(app.project.proximities);
}

function shiftChartData(cm) {
    app.project.proximities.shift();
    app.project.proximities.push({
        x: '',
        y: cm
    });
    app.chart.setData(app.project.proximities);
}

var app = new Vue({
    el: '#app',

    data: {
        drawer: null,
        proximity: 1,
        motor: 2,
        spin_dialog: null,
        spinTo: null,
        project: {
            motor_angle: null,
            proximities: []
		},
		vehicle: {
			min_dist: 20,
			is_passing: false,
			is_open: true
		}
    },

    methods: {
        sweepServo: function () {
            socket.emit('servo.sweep');
            this.spin_dialog = false;
        },
        spinServo: function () {
            socket.emit('servo.spin');
        },
        moveServo: function () {
            socket.emit('servo.move', {
                duration: 1000,
                to: this.spinTo
            });
            this.spin_dialog = false;
        },
        stopServo: function () {
            socket.emit('servo.stop');
        },
        stopProximity: function () {
            socket.emit('proximity.stop');
        },
        listenProximity: function () {
            socket.emit('proximity.listen');
        },
        initChart: function () {
            this.chart = Morris.Area({
                element: 'chart',
                behaveLikeLine: true,
                parseTime: false,
                data: [],
                xkey: 'x',
                ykeys: ['y'],
                labels: ['Proximity'],
                pointFillColors: ['#d32f2f'],
                pointStrokeColors: ['#fff'],
                lineColors: ['#b71c1c'],
                redraw: true,
                resize: true,
                grid: true
            });
		},

		swiped: function () {
			socket.emit('servo.move', {
                duration: 1000,
                to: 50
			});
			setTimeout(() => {
				socket.emit('led.on', "green");
				socket.emit('led.off', "red");
			}, 1000)
			app.vehicle.is_open = true;
			socket.emit('proximity.listen');
		},

		monitor: function(cm) {

			if(!app.vehicle.is_open) {
				console.log('no car, closed');
				return;
			}

			//Just Entered
			if( cm <= app.vehicle.min_dist && !app.vehicle.is_passing) {
				app.vehicle.is_passing = true;
				console.log('entered');
			}
			if( cm <= app.vehicle.min_dist) {
				console.log('passing');
			}
			//Just Passed
			if( cm > app.vehicle.min_dist && app.vehicle.is_passing) {
				app.close()
			}

		},
		
		close: function() {
			socket.emit('servo.move', {
					duration: 800,
					to: 0
				});
				socket.emit('led.on', "red");
				socket.emit('led.off', "green");
				app.vehicle.is_open = false;
				app.vehicle.is_passing = false;
				console.log('passed');
		}


    },

    mounted: function () {
        //setupThreeJS();
        this.initChart()
        socket.on('proximity.change', addChartData);
        socket.on('proximity.change', this.monitor);
    }

});

    var container = document.getElementById('models');

		var scene, renderer, camera, controls, stats;
		var mesh, skeleton, mixer;

		var crossFadeControls = [];

		var closeAction, openAction;
		var actions, settings;

		var clock = new THREE.Clock();

		var singleStepMode = false;
		var sizeOfNextStep = 0;

		//var url = 'models/skinned/marine/marine_anims_core.json';
		var url = '/models/controle4.json';


		// Initialize stats (fps display)
		stats = new Stats();
		container.appendChild(stats.dom);


		// Initialize scene, light and renderer
		scene = new THREE.Scene();
		scene.add(new THREE.AmbientLight(0xffffff));

		renderer = new THREE.WebGLRenderer({
			antialias: true
		});
		renderer.setClearColor(0x333333);
		renderer.setPixelRatio(container.clientWidth / container.clientHeight);
		renderer.setSize(container.clientWidth, container.clientHeight);

		container.appendChild(renderer.domElement);


		// Load skinned mesh

		new THREE.ObjectLoader().load(url, function (loadedObject) {

			scene = loadedObject;

			loadedObject.traverse(function (child) {
				if (child instanceof THREE.SkinnedMesh) {
					mesh = child;
				} else if (child instanceof THREE.PerspectiveCamera) {
					camera = child;
				}
			});

			if (mesh === undefined) {
				alert('Unable to find a SkinnedMesh in this place:\n\n' + url + '\n\n');
				return;
			}

			skeleton = new THREE.SkeletonHelper(mesh);
			skeleton.visible = false;
			scene.add(skeleton);


			// Initialize camera and camera controls
			var radius = mesh.geometry.boundingSphere.radius * 0.01;
			console.log('radius :', radius);

			var aspect = container.clientWidth / container.clientHeight;
			camera = new THREE.PerspectiveCamera(45, aspect, 1, 10000);
			camera.position.set(0.0, radius, radius * 3.5);

			controls = new THREE.OrbitControls(camera, renderer.domElement);
			controls.target.set(0, radius, 0);
			controls.update();


			// Create the control panel
			createPanel();


			// Initialize mixer and clip actions
			mixer = new THREE.AnimationMixer(mesh);

			openAction = mixer.clipAction('Open');
			closeAction = mixer.clipAction('Close');

			actions = [openAction, closeAction];


			// Listen on window resizing and start the render loop
			window.addEventListener('resize', onWindowResize, false);
			animate();


		});


		function createPanel() {

			var panel = new dat.GUI({
				width: 310
			});

			var folder1 = panel.addFolder('Visibility');
			var folder2 = panel.addFolder('Activation/Deactivation');
			var folder3 = panel.addFolder('Pausing/Stepping');
			var folder4 = panel.addFolder('Crossfading');
			var folder6 = panel.addFolder('General Speed');

			settings = {
				'show model': true,
				'show skeleton': false,
				'deactivate all': deactivateAllActions,
				'modify step size': 0.05,
				'open': function () {
					closeAction.stop();
					openAction.play();
				},
				'close': function () {
					openAction.stop();
					closeAction.play();
				},
				'use default duration': true,
				'set custom duration': 3.5,
				'modify time scale': 1.0
			};

			folder1.add(settings, 'show model').onChange(showModel);
			folder1.add(settings, 'show skeleton').onChange(showSkeleton);
			folder2.add(settings, 'deactivate all');
			folder3.add(settings, 'modify step size', 0.01, 0.1, 0.001);
			crossFadeControls.push(folder4.add(settings, 'open'));
			crossFadeControls.push(folder4.add(settings, 'close'));
			folder4.add(settings, 'use default duration');
			folder4.add(settings, 'set custom duration', 0, 10, 0.01);
			folder6.add(settings, 'modify time scale', 0.0, 1.5, 0.01).onChange(modifyTimeScale);

			folder1.open();
			folder2.open();
			folder3.open();
			folder4.open();
			folder6.open();

			crossFadeControls.forEach(function (control) {

				control.classList1 = control.domElement.parentElement.parentElement.classList;
				control.classList2 = control.domElement.previousElementSibling.classList;

				control.setDisabled = function () {

					control.classList1.add('no-pointer-events');
					control.classList2.add('control-disabled');

				};

				control.setEnabled = function () {

					control.classList1.remove('no-pointer-events');
					control.classList2.remove('control-disabled');

				};

			});

		}


		function showModel(visibility) {

			mesh.visible = visibility;

		}


		function showSkeleton(visibility) {

			skeleton.visible = visibility;

		}


		function modifyTimeScale(speed) {

			mixer.timeScale = speed;

		}


		function deactivateAllActions() {

			actions.forEach(function (action) {

				action.stop();

			});

		}


		function onWindowResize() {

			camera.aspect = container.clientWidth / container.clientHeight;
			camera.updateProjectionMatrix();

			renderer.setSize(container.clientWidth, container.clientHeight);

		}


		function animate() {

			// Render loop

			requestAnimationFrame(animate);

			idleWeight = closeAction.getEffectiveWeight();
			walkWeight = openAction.getEffectiveWeight();

			// Get the time elapsed since the last frame, used for mixer update (if not in single step mode)

			var mixerUpdateDelta = clock.getDelta();

			// If in single step mode, make one step and then do nothing (until the user clicks again)

			if (singleStepMode) {

				mixerUpdateDelta = sizeOfNextStep;
				sizeOfNextStep = 0;

			}

			// Update the animation mixer, the stats panel, and render this frame

			mixer.update(mixerUpdateDelta);

			stats.update();

			renderer.render(scene, camera);

		}
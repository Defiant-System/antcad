
let THREE;
let OrbitControls;
let OBJLoader2;

let renderer,
	camera,
	scene;

let thresholdAngle = 30;


const arcad = {
	async init() {
		// fast references
		this.content = window.find("content");

		// import libs
		let lib = await window.fetch("~/js/bundle.js");
		THREE = lib.THREE;
		OrbitControls = lib.OrbitControls;
		OBJLoader2 = lib.OBJLoader2;

		this.dispatch({ type: "set-up-world" });
		this.dispatch({ type: "add-box" });
		this.dispatch({ type: "add-cylinder" });
		this.dispatch({ type: "add-lego" });
		this.render();
	},
	render() {
		renderer.render(scene, camera);
	},
	dispatch(event) {
		let Self = arcad,
			geometry,
			material,
			mesh,
			wireframe;

		switch (event.type) {
			// system events
			case "window.open":
				break;
			// custom events
			case "set-up-world":
				// camera
				camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20000);
				camera.position.set(0, 5, 6);
				// scene
				scene = new THREE.Scene();

				// lights
				let ambientLight = new THREE.AmbientLight(0xffffff);
				scene.add(ambientLight);
				let light = new THREE.DirectionalLight(0xFFFFFF, .15);
				light.position.set(0, 10, 0);
				light.target.position.set(-5, 0, 0);
				scene.add(light);
				scene.add(light.target);

				// renderer
				renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
				renderer.setPixelRatio(window.devicePixelRatio);
				renderer.setSize(window.innerWidth, window.innerHeight);
				this.content[0].appendChild(renderer.domElement);
				// controls
				let cameraControls = new OrbitControls(camera, renderer.domElement);
				cameraControls.addEventListener("change", this.render);
				break;
			case "add-box":
				geometry = new THREE.BoxBufferGeometry(2, 2, 2);
				material = new THREE.MeshPhongMaterial({
					color: 0x0066dd,
					specular: 0xffffff,
					shininess: false,
					polygonOffset: true,
					polygonOffsetFactor: 1,
					polygonOffsetUnits: 1
				});
				mesh = new THREE.Mesh(geometry, material);
				
				geometry = new THREE.EdgesGeometry(mesh.geometry);
				material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: .25 });
				wireframe = new THREE.LineSegments(geometry, material);
				mesh.add(wireframe);
				scene.add(mesh);

				mesh.position.x = 3;
				break;
			case "add-cylinder":
				geometry = new THREE.CylinderBufferGeometry(1, 1, 2, 16);
				material = new THREE.MeshPhongMaterial({
					color: 0x0066dd,
					specular: 0xffffff,
					shininess: false,
					polygonOffset: true,
					polygonOffsetFactor: 1,
					polygonOffsetUnits: 1
				});
				mesh = new THREE.Mesh(geometry, material);
				geometry = new THREE.EdgesGeometry(mesh.geometry, thresholdAngle);
				material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: .25 });
				wireframe = new THREE.LineSegments(geometry, material);
				mesh.add(wireframe);
				scene.add(mesh);

				mesh.position.x = -3;
				break;
			case "add-lego":
				const objLoader = new OBJLoader2();
				//objLoader.setLogging(true, true);
				objLoader.load('~/models/pipe.obj', (object) => {

					object.traverse(child => {
						if (child instanceof THREE.Mesh) {

							child.material = new THREE.MeshPhongMaterial({
								color: 0x0066dd,
							});

							geometry = new THREE.EdgesGeometry(child.geometry);
							material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: .25 });
							wireframe = new THREE.LineSegments(geometry, material);
							
							//child.add(wireframe);
						}
					});

					scene.add(object);
					Self.render();
				});
				break;
		}
	}
};

window.exports = arcad;


let THREE;
let OrbitControls;
let EffectComposer;
let RenderPass;
let OutlinePass;

let renderer,
	camera,
	scene;


const arcad = {
	async init() {
		// fast references
		this.content = window.find("content");

		// import libs
		let lib = await window.fetch("~/js/bundle.js");
		THREE = lib.THREE;
		OrbitControls = lib.OrbitControls;
		EffectComposer = lib.EffectComposer;
		RenderPass = lib.RenderPass;
		OutlinePass = lib.OutlinePass;

		this.dispatch({ type: "set-up-world" });
		this.dispatch({ type: "add-box" });
		this.dispatch({ type: "add-cylinder" });
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
				camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
				camera.position.z = 300;
				// lights
				let ambientLight = new THREE.AmbientLight(0xffffff);
				// scene
				scene = new THREE.Scene();
				scene.add(ambientLight);
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
				geometry = new THREE.BoxBufferGeometry(50, 50, 50);
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
				material = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
				wireframe = new THREE.LineSegments(geometry, material);
				mesh.add(wireframe);
				scene.add(mesh);

				mesh.position.x = 50;
				break;
			case "add-cylinder":
				geometry = new THREE.CylinderBufferGeometry(30, 30, 60, 20);
				material = new THREE.MeshPhongMaterial({
					color: 0x0066dd,
					specular: 0xffffff,
					shininess: false,
					polygonOffset: true,
					polygonOffsetFactor: 1,
					polygonOffsetUnits: 1
				});
				mesh = new THREE.Mesh( geometry, material );
				geometry = new THREE.EdgesGeometry( mesh.geometry );
				material = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );
				wireframe = new THREE.LineSegments( geometry, material );
				mesh.add( wireframe );
				scene.add( mesh );
				
				mesh.position.x = -50;
				break;
		}
	}
};

window.exports = arcad;

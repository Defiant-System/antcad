
let THREE;
		
let camera,
	scene,
	renderer,
	mesh;

const arcad = {
	async init() {
		// fast references
		this.content = window.find("content");

		THREE = await window.fetch("~/js/three.js");

		camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 1000 );
		camera.position.z = 400;

		scene = new THREE.Scene();

		var texture = new THREE.TextureLoader().load( '~/crate.gif' );
		var geometry = new THREE.BoxBufferGeometry( 200, 200, 200 );
		var material = new THREE.MeshBasicMaterial( { map: texture } );

		mesh = new THREE.Mesh( geometry, material );
		scene.add( mesh );

		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		
		this.content[0].appendChild( renderer.domElement );

		this.animate();
	},
	dispatch(event) {
		switch (event.type) {
			case "window.open":
				break;
		}
	},
	animate() {
		requestAnimationFrame( arcad.animate );

		mesh.rotation.x += 0.005;
		mesh.rotation.y += 0.01;

		renderer.render( scene, camera );
	}
};

window.exports = arcad;

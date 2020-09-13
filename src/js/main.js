
import * as THREE from "./modules/three.module.js";
import { OrbitControls } from "./modules/OrbitControls.js";
import { EffectComposer } from './modules/postprocessing/EffectComposer.js';
import { RenderPass } from './modules/postprocessing/RenderPass.js';
import { OutlinePass } from './modules/postprocessing/OutlinePass.js';


let camera,
	cameraControls,
	scene,
	light,
	ambientLight,
	renderer,
	composer;


const arcad = {
	async init() {
		// fast references
		this.content = window.find("content");

		// CAMERA
		camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
		camera.position.z = 300;

		// LIGHTS
		ambientLight = new THREE.AmbientLight( 0xffffff );

		// let light = new THREE.DirectionalLight( 0xFFFFFF, .5 );
		// light.position.set(500, 500, 0);
		// light.target.position.set(0, 0, 0);

		// SCENE
		scene = new THREE.Scene();
		scene.add( ambientLight );
		// scene.add(light);
		// scene.add(light.target);



		let geometry = new THREE.BoxBufferGeometry(50, 50, 50);
		let material = new THREE.MeshPhongMaterial( {
			color: 0x0066dd,
			specular: 0xffffff,
			shininess: false,
			polygonOffset: true,
			polygonOffsetFactor: 1,
			polygonOffsetUnits: 1
		} );
		let boxMesh = new THREE.Mesh( geometry, material );
		// boxMesh.rotation.z += 1;
		let geo = new THREE.EdgesGeometry( boxMesh.geometry );
		let mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );
		let wireframe = new THREE.LineSegments( geo, mat );
		boxMesh.add( wireframe );
		scene.add( boxMesh );


		geometry = new THREE.CylinderBufferGeometry(30, 30, 60, 20);
		let cylinder = new THREE.Mesh( geometry, material );
		geo = new THREE.EdgesGeometry( cylinder.geometry );
		mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );
		wireframe = new THREE.LineSegments( geo, mat );
		cylinder.add( wireframe );
		scene.add( cylinder );
		cylinder.position.x = -100;


		geometry = new THREE.IcosahedronBufferGeometry(40);
		let hedron = new THREE.Mesh( geometry, material );
		geo = new THREE.EdgesGeometry( hedron.geometry );
		mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );
		wireframe = new THREE.LineSegments( geo, mat );
		hedron.add( wireframe );
		scene.add( hedron );
		hedron.position.x = 100;


		renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true } );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		this.content[0].appendChild( renderer.domElement );


		composer = new EffectComposer(renderer);
  		composer.addPass(new RenderPass(scene, camera));

  		let perspective = new THREE.Vector2( window.innerWidth, window.innerHeight );
		let outlinePass = new OutlinePass(perspective, scene, camera, [boxMesh, cylinder, hedron]);
		
		// outlinePass.edgeStrength = Number(2);
		// outlinePass.edgeGlow = Number(0);
		// outlinePass.edgeThickness = Number(5);
		// outlinePass.pulsePeriod = Number(0);
		//outlinePass.visibleEdgeColor.set("#ffffff");
		//outlinePass.hiddenEdgeColor.set("#000000");

  		outlinePass.renderToScreen = true;
  		composer.addPass(outlinePass);

		// CONTROLS
		cameraControls = new OrbitControls( camera, renderer.domElement );
		cameraControls.addEventListener( "change", this.render );
		
		composer.render();
	},
	dispatch(event) {
		switch (event.type) {
			case "window.open":
				break;
		}
	},
	render() {
		composer.render();
	}
};

window.exports = arcad;

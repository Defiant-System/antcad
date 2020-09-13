
import * as THREE from "./modules/three.module.js";
import { OrbitControls } from "./modules/OrbitControls.js";
import { EffectComposer } from './modules/EffectComposer.js';
import { RenderPass } from './modules/RenderPass.js';
import { OutlinePass } from './modules/postprocessing/OutlinePass.js';


let camera,
	cameraControls,
	scene,
	light,
	ambientLight,
	renderer,
	composer,
	mesh;


const arcad = {
	async init() {
		// fast references
		this.content = window.find("content");

		// CAMERA
		camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
		camera.position.z = 400;

		let geometry = new THREE.BoxBufferGeometry( 200, 200, 200 );
		let material = new THREE.MeshPhongMaterial( { color: 0x0066dd } );
		mesh = new THREE.Mesh( geometry, material );
		
		// LIGHTS
		ambientLight = new THREE.AmbientLight( 0xaaaaaa );

		let light = new THREE.DirectionalLight( 0xFFFFFF, .5 );
		light.position.set(500, 500, 0);
		light.target.position.set(0, 0, 0);

		// SCENE
		scene = new THREE.Scene();
		scene.add( mesh );
		scene.add( ambientLight );
		scene.add(light);
		scene.add(light.target);

		renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true } );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( window.innerWidth, window.innerHeight );
		//renderer.outputEncoding = THREE.sRGBEncoding;
		this.content[0].appendChild( renderer.domElement );


		composer = new EffectComposer(renderer);
  		composer.addPass(new RenderPass(scene, camera));

  		let perspective = new THREE.Vector2( window.innerWidth, window.innerHeight );
		let outlinePass = new OutlinePass(perspective, scene, camera, [mesh]);
		
		// outlinePass.edgeStrength = Number(1);
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

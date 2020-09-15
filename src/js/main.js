
let THREE;
let OrbitControls;
let OBJLoader2;

let composer,
	renderer,
	camera,
	scene;


var conditionalLineVertShader = /* glsl */`

attribute vec3 control0;
attribute vec3 control1;
attribute vec3 direction;

varying float discardFlag;

#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

#include <color_vertex>

vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
gl_Position = projectionMatrix * mvPosition;

// Transform the line segment ends and control points into camera clip space
vec4 c0 = projectionMatrix * modelViewMatrix * vec4( control0, 1.0 );
vec4 c1 = projectionMatrix * modelViewMatrix * vec4( control1, 1.0 );
vec4 p0 = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
vec4 p1 = projectionMatrix * modelViewMatrix * vec4( position + direction, 1.0 );

c0.xy /= c0.w;
c1.xy /= c1.w;
p0.xy /= p0.w;
p1.xy /= p1.w;

// Get the direction of the segment and an orthogonal vector
vec2 dir = p1.xy - p0.xy;
vec2 norm = vec2( -dir.y, dir.x );

// Get control point directions from the line
vec2 c0dir = c0.xy - p1.xy;
vec2 c1dir = c1.xy - p1.xy;

// If the vectors to the controls points are pointed in different directions away
// from the line segment then the line should not be drawn.
float d0 = dot( normalize( norm ), normalize( c0dir ) );
float d1 = dot( normalize( norm ), normalize( c1dir ) );

discardFlag = float( sign( d0 ) != sign( d1 ) );

#include <logdepthbuf_vertex>
#include <clipping_planes_vertex>
#include <fog_vertex>

}
`;

var conditionalLineFragShader = /* glsl */`

uniform vec3 diffuse;
varying float discardFlag;

#include <common>
#include <color_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

if ( discardFlag > 0.5 ) discard;

#include <clipping_planes_fragment>

vec3 outgoingLight = vec3( 0.0 );
vec4 diffuseColor = vec4( diffuse, 1.0 );

#include <logdepthbuf_fragment>
#include <color_fragment>

outgoingLight = diffuseColor.rgb; // simple shader

gl_FragColor = vec4( outgoingLight, diffuseColor.a );

#include <premultiplied_alpha_fragment>
#include <tonemapping_fragment>
#include <encodings_fragment>
#include <fog_fragment>

}
`;


function box(w, h, d) {
	w = w * 0.5,
	h = h * 0.5,
	d = d * 0.5;
	var geometry = new THREE.BufferGeometry();
	var position = [];
	position.push(-w, -h, -d, -w, h, -d, -w, h, -d, w, h, -d, w, h, -d, w, -h, -d, w, -h, -d, -w, -h, -d, -w, -h, d, -w, h, d, -w, h, d, w, h, d, w, h, d, w, -h, d, w, -h, d, -w, -h, d, -w, -h, -d, -w, -h, d, -w, h, -d, -w, h, d, w, h, -d, w, h, d, w, -h, -d, w, -h, d);
	//position.push( -w, -h, -d, -w, h, -d );
	geometry.setAttribute( "position", new THREE.Float32BufferAttribute( position, 3 ) );
	return geometry;
}


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
		// this.dispatch({ type: "add-line-box" });
		// this.dispatch({ type: "add-box" });
		this.dispatch({ type: "add-line-cylinder" });
		this.dispatch({ type: "add-cylinder" });
		// this.dispatch({ type: "add-lego" });
		this.render();
	},
	render() {
		renderer.render(scene, camera);
		//composer.render();
	},
	dispatch(event) {
		let Self = arcad,
			geometry,
			material,
			mesh,
			wireframe,
			segments,
			olmat,
			ol;

		switch (event.type) {
			// system events
			case "window.open":
				break;
			// custom events
			case "set-up-world":
				// camera
				camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 20000);
				camera.position.set(-4, 6, 7);
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
			case "add-line-box":
				geometry = box(3, 3, 3);
				segments = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({
					color: 0xffffff,
				}));
				segments.computeLineDistances();

				scene.add(segments);
				break;
			case "add-box":
				geometry = new THREE.BoxBufferGeometry(2, 2, 2);
				material = new THREE.MeshPhongMaterial({
					color: 0x0066dd,
					polygonOffset: true,
					polygonOffsetFactor: 1,
					polygonOffsetUnits: 1
				});
				mesh = new THREE.Mesh(geometry, material);

				geometry = new THREE.EdgesGeometry(mesh.geometry, 40);
				material = new THREE.LineBasicMaterial();
				wireframe = new THREE.LineSegments(geometry, material);
				mesh.add(wireframe);
				scene.add(mesh);

				mesh.position.x = 3;


				// olmat = new THREE.MeshBasicMaterial({color : 0xffffff, side: THREE.BackSide});
				// ol = new THREE.Mesh(mesh.geometry, olmat);
				// ol.scale.multiplyScalar(1.0125);
				// ol.position.x = 3;
				// scene.add(ol);

				break;
			case "add-line-cylinder":
				geometry = new THREE.CylinderGeometry(1, 1, 2, 20);
				material = new THREE.MeshPhongMaterial({ color: 0x0066dd, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
				mesh = new THREE.Mesh(geometry, material);
				scene.add(mesh);

				let edgesMaterial = new THREE.ShaderMaterial({
					vertexShader: conditionalLineVertShader,
					fragmentShader: conditionalLineFragShader,
					uniforms: {
						diffuse: { value: new THREE.Color( 0xffffff ) }
					}
				});

				geometry = new THREE.EdgesGeometry(mesh.geometry);
				console.log(mesh.geometry);
				console.log(geometry);

				let vertices = [],
					control0 = [],
					control1 = [],
					directions = [];

				mesh.geometry.vertices.map((v, i) => {
					vertices.push(v.x, v.y, v.z);

					let v2 = mesh.geometry.vertices[(i+1) % mesh.geometry.vertices.length];
					vertices.push(v2.x, v2.y, v2.z);
				});

				geometry.setAttribute( "position", new THREE.Float32BufferAttribute( vertices, 3 ) );
				// geometry.setAttribute( "control0", new THREE.Float32BufferAttribute( control0, 3, false ) );
				// geometry.setAttribute( "control1", new THREE.Float32BufferAttribute( control1, 3, false ) );
				// geometry.setAttribute( "direction", new THREE.Float32BufferAttribute( directions, 3, false ) );

				segments = new THREE.LineSegments(geometry, edgesMaterial);
				segments.computeLineDistances();

				scene.add(segments);
				break;
			case "add-cylinder":
				geometry = new THREE.CylinderBufferGeometry(1, 1, 2, 20);
				material = new THREE.MeshPhongMaterial({
					color: 0x0066dd,
					shininess: false,
					// premultipliedAlpha: true,
					// depthWrite: false,
					polygonOffset: true,
					polygonOffsetFactor: 1,
					polygonOffsetUnits: 1
				});
				mesh = new THREE.Mesh(geometry, material);

				geometry = new THREE.EdgesGeometry(mesh.geometry, 40);
				material = new THREE.LineBasicMaterial();
				wireframe = new THREE.LineSegments(geometry, material);
				mesh.add(wireframe);
				scene.add(mesh);

				mesh.position.x = -3;


				// olmat = new THREE.MeshBasicMaterial({color : 0xffffff, side: THREE.BackSide});
				// ol = new THREE.Mesh(mesh.geometry, olmat);
				// ol.scale.multiplyScalar(1.0125);
				// ol.position.x = -3;
				// scene.add(ol);

				break;
			case "add-lego":
				const objLoader = new OBJLoader2();
				//objLoader.setLogging(true, true);
				objLoader.load("~/models/man.obj", (object) => {

					object.traverse(child => {
						if (child instanceof THREE.Mesh) {
							child.material = new THREE.MeshPhongMaterial({
								color: 0x0066dd,
								shininess: false,
							});
							child.position.y = -2;

							geometry = new THREE.EdgesGeometry(child.geometry, 50);
							material = new THREE.LineBasicMaterial();
							wireframe = new THREE.LineSegments(geometry, material);
							child.add(wireframe);
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

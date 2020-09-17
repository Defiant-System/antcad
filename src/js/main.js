
let THREE,
	OrbitControls,
	BufferGeometryUtils,
	LineSegmentsGeometry,
	LineSegments2,
	LineMaterial,
	ConditionalEdgesGeometry,
	ConditionalEdgesShader,
	ConditionalLineSegmentsGeometry,
	ConditionalLineMaterial;

// import libs
window.fetch("~/js/bundle.js").then(lib => {
	THREE = lib.THREE;
	OrbitControls = lib.OrbitControls;
	BufferGeometryUtils = lib.BufferGeometryUtils;
	LineSegmentsGeometry = lib.LineSegmentsGeometry;
	LineSegments2 = lib.LineSegments2;
	LineMaterial = lib.LineMaterial;
	ConditionalEdgesGeometry = lib.ConditionalEdgesGeometry;
	ConditionalEdgesShader = lib.ConditionalEdgesShader;
	ConditionalLineSegmentsGeometry = lib.ConditionalLineSegmentsGeometry;
	ConditionalLineMaterial = lib.ConditionalLineMaterial;
	// init applications
	arcad.dispatch({ type: "init-world" });
});

let renderer,
	camera,
	scene,
	opacity = 0.85,
	lit = false,
	thickness = 2,
	useThickLines = true,
	edges = {
		ORIGINAL: false,
		MODEL: false,
		BACKGROUND: false,
		SHADOW: false,
		CONDITIONAL: false
	};


const arcad = {
	init() {
		// fast references
		this.content = window.find("content");
	},
	dispatch(event) {
		let Self = arcad,
			light,
			model,
			geometry,
			material,
			meshes,
			mesh,
			segments,
			el;

		switch (event.type) {
			// custom events
			case "init-world":
				Self.dispatch({ type: "set-up-world" });

				// cylinder icosahedron cone
				Self.dispatch({ type: "add-model", model: "dodecahedron" });

				Self.dispatch({ type: "init-edges" });
				Self.dispatch({ type: "init-background" });
				Self.dispatch({ type: "init-conditional" });

				Self.animate();
				break;
			case "set-up-world":
				// scene
				scene = new THREE.Scene();
				// scene.background = new THREE.Color( 0xeeeeee );
				
				// camera
				camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 2000);
				camera.position.set(1, 3, 8);
				scene.add( camera );
				
				// renderer
				renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
				renderer.setPixelRatio(window.devicePixelRatio);
				renderer.setSize(window.innerWidth, window.innerHeight);
				Self.content[0].appendChild(renderer.domElement);

				// lights
				light = new THREE.AmbientLight(0xffffff);
				scene.add(light);

				light = new THREE.DirectionalLight(0xffffff, 0.25);
				light.position.set(50, 50, 0);
				//light.target.position.set(-5, 0, 0);
				scene.add(light);
				scene.add(light.target);

				// controls
				let controls = new OrbitControls(camera, renderer.domElement);
				controls.minDistance = 9;
				controls.maxDistance = 15;
				controls.addEventListener("change", Self.render);
				break;
			case "init-edges":
				edges.MODEL = edges.ORIGINAL.clone();
				scene.add(edges.MODEL);

				meshes = [];
				edges.MODEL.traverse(c => c.isMesh ? meshes.push(c) : null);

				meshes.map(mesh => {
					let parent = mesh.parent;
					let lineGeom = new THREE.EdgesGeometry(mesh.geometry, 40);
					let lineMat = new THREE.LineBasicMaterial({ color: 0xaaccff });
					let line = new THREE.LineSegments(lineGeom, lineMat);

					line.position.copy(mesh.position);
					line.scale.copy(mesh.scale);
					line.rotation.copy(mesh.rotation);

					let thickLineGeom = new LineSegmentsGeometry().fromEdgesGeometry(lineGeom);
					let thickLineMat = new LineMaterial({ color: 0xaaccff, linewidth: 3 });
					let thickLines = new LineSegments2(thickLineGeom, thickLineMat);

					thickLines.position.copy(mesh.position);
					thickLines.scale.copy(mesh.scale);
					thickLines.rotation.copy(mesh.rotation);
					// hide this for now
					// thickLines.visible = false;

					parent.remove(mesh);
					parent.add(line);
					parent.add(thickLines);
				});
				break;
			case "init-background":
				edges.BACKGROUND = edges.ORIGINAL.clone();
				edges.BACKGROUND.traverse(c => {
					if (c.isMesh) {
						c.material = new THREE.MeshStandardMaterial({ color: 0x0066dd, roughness: 1.0 });
						c.material.polygonOffset = true;
						c.material.polygonOffsetFactor = 1;
						c.material.polygonOffsetUnits = 1;
						c.receiveShadow = true;
						c.renderOrder = 2;
					}
				});
				scene.add(edges.BACKGROUND);

				edges.SHADOW = edges.ORIGINAL.clone();
				edges.SHADOW.traverse(c => {
					if (c.isMesh) {
						c.material = new THREE.MeshBasicMaterial({ color: 0x0066dd });
						c.material.polygonOffset = true;
						c.material.polygonOffsetFactor = 1;
						c.material.polygonOffsetUnits = 1;
						c.renderOrder = 2;
					}
				});
				scene.add(edges.SHADOW);
				break;
			case "init-conditional":
				edges.CONDITIONAL = edges.ORIGINAL.clone();
				scene.add( edges.CONDITIONAL );
				edges.CONDITIONAL.visible = false;

				meshes = [];
				edges.CONDITIONAL.traverse(c => c.isMesh ? meshes.push(c) : null);

				meshes.map(mesh => {
					let parent = mesh.parent;

					// Remove everything but the position attribute
					let mergedGeom = mesh.geometry.clone();
					for ( let key in mergedGeom.attributes ) {
						if ( key !== 'position' ) {
							mergedGeom.deleteAttribute( key );
						}
					}

					// Create the conditional edges geometry and associated material
					let geomUtil = BufferGeometryUtils.mergeVertices( mergedGeom );
					let lineGeom = new ConditionalEdgesGeometry( geomUtil );
					let material = new THREE.ShaderMaterial( ConditionalEdgesShader );
					material.uniforms.diffuse.value.set( 0xaaccff );

					// Create the line segments objects and replace the mesh
					let line = new THREE.LineSegments( lineGeom, material );
					line.position.copy( mesh.position );
					line.scale.copy( mesh.scale );
					line.rotation.copy( mesh.rotation );

					let thickLineGeom = new ConditionalLineSegmentsGeometry().fromConditionalEdgesGeometry( lineGeom );
					let thickLineMat = new ConditionalLineMaterial( { color: 0xaaccff, linewidth: 2 } );
					let thickLines = new LineSegments2( thickLineGeom, thickLineMat );
					thickLines.position.copy( mesh.position );
					thickLines.scale.copy( mesh.scale );
					thickLines.rotation.copy( mesh.rotation );

					parent.remove( mesh );
					parent.add( line );
					parent.add( thickLines );
				});
				break;
			case "add-model":
				model = new THREE.Group();
				//geometry = new THREE.CylinderBufferGeometry(1, 1, 2, 20);

				switch (event.model) {
					case "cylinder":
						geometry = new THREE.CylinderBufferGeometry(1, 1, 2, 20);
						break;
					case "torus":
						geometry = new THREE.TorusBufferGeometry(2, .5, 8, 24);
						break;
					case "cone":
						geometry = new THREE.ConeBufferGeometry(1, 2, 10);
						break;
					case "icosahedron":
						geometry = new THREE.IcosahedronBufferGeometry(2, 2);
						break;
					case "octahedron":
						geometry = new THREE.OctahedronBufferGeometry(2);
						break;
					case "dodecahedron":
						geometry = new THREE.DodecahedronBufferGeometry(2);
						break;
				}

				mesh = new THREE.Mesh(geometry);
				model.add(mesh);
				model.children[0].geometry.computeBoundingBox();
				edges.ORIGINAL = model;
				break;
		}
	},
	animate() {
		if ( edges.CONDITIONAL ) {
			edges.CONDITIONAL.visible = true;
			edges.CONDITIONAL.traverse( c => {
				if ( c.material && c.material.resolution ) {
					renderer.getSize( c.material.resolution );
					c.material.resolution.multiplyScalar( window.devicePixelRatio );
					c.material.linewidth = thickness;
				}
				if ( c.material ) {
					c.visible = c.isLineSegments2 ? useThickLines : ! useThickLines;
				}
			} );
		}

		if ( edges.MODEL ) {
			edges.MODEL.traverse( c => {
				if ( c.material && c.material.resolution ) {
					renderer.getSize( c.material.resolution );
					c.material.resolution.multiplyScalar( window.devicePixelRatio );
					c.material.linewidth = thickness;
				}
				if ( c.material ) {
					c.visible = c.isLineSegments2 ? useThickLines : ! useThickLines;
				}
			} );
		}

		if ( edges.BACKGROUND ) {
			edges.BACKGROUND.visible = ! lit;
			edges.BACKGROUND.traverse( c => {
				if ( c.isMesh ) {
					c.material.transparent = opacity !== 1.0;
					c.material.opacity = opacity;
				}
			} );
		}

		if ( edges.SHADOW ) {
			edges.SHADOW.visible = lit;
			edges.SHADOW.traverse( c => {
				if ( c.isMesh ) {
					c.material.transparent = opacity !== 1.0;
					c.material.opacity = opacity;
				}
			} );
		}

		this.render();
	},
	render() {
		renderer.render(scene, camera);
	}
};

window.exports = arcad;

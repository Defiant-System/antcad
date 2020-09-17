
import * as THREE from "./modules/threejs/three.module.js";

import { OrbitControls } from "./modules/threejs/jsm/controls/OrbitControls.js";
import { OBJLoader2 } from './modules/threejs/jsm/loaders/OBJLoader2.js';

import { BufferGeometryUtils } from "./modules/threejs/jsm/utils/BufferGeometryUtils.js";
import { LineSegmentsGeometry } from "./modules/threejs/jsm/lines/LineSegmentsGeometry.js";
import { LineSegments2 } from "./modules/threejs/jsm/lines/LineSegments2.js";
import { LineMaterial } from "./modules/threejs/jsm/lines/LineMaterial.js";
import { ConditionalEdgesGeometry } from "./modules/threejs/jsm/lines/conditional/ConditionalEdgesGeometry.js";
import { ConditionalEdgesShader } from "./modules/threejs/jsm/lines/conditional/ConditionalEdgesShader.js";
import { ConditionalLineSegmentsGeometry } from "./modules/threejs/jsm/lines/conditional/ConditionalLineSegmentsGeometry.js";
import { ConditionalLineMaterial } from "./modules/threejs/jsm/lines/conditional/ConditionalLineMaterial.js";


module.exports = {
	THREE,
	OrbitControls,
	OBJLoader2,
	BufferGeometryUtils,
	LineSegmentsGeometry,
	LineSegments2,
	LineMaterial,
	ConditionalEdgesGeometry,
	ConditionalEdgesShader,
	ConditionalLineSegmentsGeometry,
	ConditionalLineMaterial,
};


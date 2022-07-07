import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';

//"use strict";

//  Adapted from Daniel Rohmer tutorial
//
// 		https://imagecomputing.net/damien.rohmer/teaching/2019_2020/semester_1/MPRI_2-39/practice/threejs/content/000_threejs_tutorial/index.html
//
//  And from an example by Pedro Iglésias
//
// 		J. Madeira - April 2021


// To store the scene graph, and elements usefull to rendering the scene
const sceneElements = {
    sceneGraph: null,
    camera: null,
    control: null,  // NEW
    renderer: null,
    blackK: null
};



// Functions are called
//  1. Initialize the empty scene
//  2. Add elements within the scene
//  3. Animate
initEmptyScene(sceneElements);
load3DObjects(sceneElements.sceneGraph);
requestAnimationFrame(computeFrame);

// HANDLING EVENTS

// Event Listeners

window.addEventListener('resize', resizeWindow);

//To keep track of the keyboard - WASD
var keyD = false, keyA = false, keyS = false, keyW = false;
document.addEventListener('keydown', onDocumentKeyDown, false);
document.addEventListener('keyup', onDocumentKeyUp, false);

// Displacement value

var delta = 0.1;
var step = 0;

var knighty;
var dispX = 0.2, dispZ = 0.2;

// Update render image size and camera aspect when the window is resized
function resizeWindow(eventParam) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    sceneElements.camera.aspect = width / height;
    sceneElements.camera.updateProjectionMatrix();

    sceneElements.renderer.setSize(width, height);
    //sceneElements.renderer.setClearColor(new THREE.Color(0xffffff));
}

function initEmptyScene(sceneElements) {

    // ************************** //
    // Create the 3D scene
    // ************************** //
    sceneElements.sceneGraph = new THREE.Scene();


    // ************************** //
    // Add camera
    // ************************** //
    const width = window.innerWidth;
    const height = window.innerHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
    sceneElements.camera = camera;
    camera.position.set(0, 5, 5);
    camera.lookAt(0, 0, 0);

    // ************************** //
    // Illumination
    // ************************** //

    // ************************** //
    // Add ambient light
    // ************************** //
    const ambientLight = new THREE.AmbientLight('rgb(255, 255, 255)', 0.2);
    //sceneElements.sceneGraph.add(ambientLight);

    // ***************************** //
    // Add spotlight (with shadows)
    // ***************************** //
    const spotLight = new THREE.SpotLight('rgb(255, 255, 255)', 10);
    spotLight.position.set(0, 100, 4);
    sceneElements.sceneGraph.add(spotLight);

    // Setup shadow properties for the spotlight
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;

    // Give a name to the spot light
    spotLight.name = "light";


    // *********************************** //
    // Create renderer (with shadow map)
    // *********************************** //
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    sceneElements.renderer = renderer;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor('rgb(255, 255, 150)', 1.0);
    renderer.setSize(width, height);

    // Setup shadowMap property
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // ************************** //
    // NEW --- Control for the camera
    // ************************** //
    sceneElements.control = new OrbitControls(camera, renderer.domElement);
    sceneElements.control.screenSpacePanning = true;


    // **************************************** //
    // Add the rendered image in the HTML DOM
    // **************************************** //
    const htmlElement = document.querySelector("#Tag3DScene");
    htmlElement.appendChild(renderer.domElement);

    
}

function render(sceneElements) {
    sceneElements.renderer.render(sceneElements.sceneGraph, sceneElements.camera);
}

function onDocumentKeyDown(event) {
    switch (event.keyCode) {
        case 68: //d
            keyD = true;
            break;
        case 83: //s
            keyS = true;
            break;
        case 65: //a
            keyA = true;
            break;
        case 87: //w
            keyW = true;
            break;
    }
}
function onDocumentKeyUp(event) {
    switch (event.keyCode) {
        case 68: //d
            keyD = false;
            break;
        case 83: //s
            keyS = false;
            break;
        case 65: //a
            keyA = false;
            break;
        case 87: //w
            keyW = false;
            break;
    }
}

//////////////////////////////////////////////////////////////////


// Create and insert in the scene graph the models of the 3D scene
function load3DObjects(sceneGraph) {

    // ************************** //
    // Create a ground plane
    // ************************** //
    const planeGeometry = new THREE.PlaneGeometry(6, 6);
    const planeMaterial = new THREE.MeshPhongMaterial({ color: 'rgb(200, 200, 200)', side: THREE.DoubleSide });
    const planeObject = new THREE.Mesh(planeGeometry, planeMaterial);
    //sceneGraph.add(planeObject);

    // Change orientation of the plane using rotation
    planeObject.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    // Set shadow property
    planeObject.receiveShadow = true;


    // The coordinate axes
    var axes = new THREE.AxesHelper(2.5);
    sceneGraph.add(axes);



    // ************************** //
    // Create a cube
    // ************************** //
    // Cube center is at (0,0,0)
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const cubeMaterial = new THREE.MeshPhongMaterial({ color: 'rgb(255,0,0)' });
    const cubeObject = new THREE.Mesh(cubeGeometry, cubeMaterial);
    //sceneGraph.add(cubeObject);

    // Set position of the cube
    // The base of the cube will be on the plane 
    cubeObject.translateY(0.5);

    // Set shadow property
    cubeObject.castShadow = true;
    cubeObject.receiveShadow = true;

    // Name
    cubeObject.name = "cube";

    // ************************** //
    // Create a sphere
    // ************************** //
    // Sphere center is at (0,0,0)
    const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({ color: 'rgb(180,180,255)' });
    const sphereObject = new THREE.Mesh(sphereGeometry, sphereMaterial);
    //sceneGraph.add(sphereObject);

    // Set position of the sphere
    // Move to the left and away from (0,0,0)
    // The sphere touches the plane
    sphereObject.translateX(-1.2).translateY(0.5).translateZ(-0.5);

    // Set shadow property
    sphereObject.castShadow = true;


    // ************************** //
    // Create a cylinder
    // ************************** //
    const cylinderGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 25, 1);
    const cylinderMaterial = new THREE.MeshPhongMaterial({ color: 'rgb(200,255,150)' });
    const cylinderObject = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    //sceneGraph.add(cylinderObject);

    // Set position of the cylinder
    // Move to the right and towards the camera
    // The base of the cylinder is on the plane
    cylinderObject.translateX(0.5).translateY(0.75).translateZ(1.5);

    // Set shadow property
    cylinderObject.castShadow = true;

    // chess

    var cubeGeo = new THREE.BoxGeometry(0.5, 0.05,0.5);
    var lightM = new THREE.MeshPhongMaterial({ color: 'rgb(20,20,20)' });
    var darkM = new THREE.MeshPhongMaterial({color: 'rgb(0,0,0)'});
    var board = new THREE.Group();

    for (let x =-4; x<4; x++){
        for (let z=-4; z<4; z++){
            if(z%2 == false){
                var cuby;
                cuby = new THREE.Mesh(cubeGeo, x%2==false ? lightM : darkM);
            }else{
                cuby = new THREE.Mesh(cubeGeo, x%2==false ? darkM : lightM);
            }
            cuby.position.set(x/2 + 0.25, 0, z/2+0.25);
            board.add(cuby);
        }
    }

    sceneGraph.add(board);
    loadKnights(sceneGraph);
    
    console.log("->"+knighty);
}


function gamza(obj){
    knighty=obj;
    console.log(knighty);
    knighty.scale.set(10,10,10);
}



function loadKnights(sceneGraph){
    //load knight
    //pegar nas cores da 169 e meter abaixo
    const loader = new GLTFLoader();

    loader.load('./knight/scene_white.gltf',(gltfScene) => {
        sceneGraph.add(gltfScene.scene);
        gltfScene.scene.position.y=0.05;
        gltfScene.scene.position.x=1.25;
        gltfScene.scene.position.z=1.75;
        gltfScene.scene.scale.x=6;
        gltfScene.scene.scale.y=6;
        gltfScene.scene.scale.z=6;
        gltfScene.scene.castShadow = true;
        gltfScene.scene.receiveShadow = true;

        moveFrontLeft(gltfScene.scene);
    });

    loader.load('./knight/scene_black.gltf', function (gltfScene) {
        //knighty = gltfScene.scene;
        const blackKnight = gltfScene.scene;
        blackKnight.position.set(1.25, 0.05, -1.75);
        blackKnight.scale.set(6,6,6);
        blackKnight.name = "black";

        gamza(blackKnight);
        sceneGraph.add(blackKnight);

        //console.log(blackKnight.getObjectByName('black'));
        //knight = blackKnight.getObjectByName('black');
        sceneElements.blackK =  blackKnight;
    });

    //console.log(sceneElements.blackK);

}

function moveFrontLeft(piece){
    piece.translateZ(-1);
    piece.translateX(-0.5);
}

function computeFrame(time) {

    // THE SPOT LIGHT

    // Can extract an object from the scene Graph from its name
    const light = sceneElements.sceneGraph.getObjectByName("light");

    // Apply a small displacement

    if (light.position.x >= 10) {
        delta *= -1;
    } else if (light.position.x <= -10) {
        delta *= -1;
    }
    //light.translateX(delta);

    // CONTROLING THE CUBE WITH THE KEYBOARD

    const cube = sceneElements.sceneGraph.getObjectByName("cube");

    if (keyD && cube.position.x < 2.5) {
        cube.translateX(dispX);
    }
    if (keyW && cube.position.z > -2.5) {
        cube.translateZ(-dispZ);
    }
    if (keyA && cube.position.x > -2.5) {
        cube.translateX(-dispX);
    }
    if (keyS && cube.position.z < 2.5) {
        cube.translateZ(dispZ);
    }

    step += 0.4
    const black = sceneElements.sceneGraph.getObjectByName("black");
    //console.log(cube.position);
    //console.log(black.scene.position);
    //black.position.x= 20 + (10 * Math.cos(step)); 

    // Rendering
    render(sceneElements);

    // NEW --- Update control of the camera
    sceneElements.control.update();

    // Call for the next frame
    requestAnimationFrame(computeFrame);
}
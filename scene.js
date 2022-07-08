import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';

// To store the scene graph, and elements usefull to rendering the scene
const sceneElements = {
    sceneGraph: null,
    camera: null,
    control: null,
    renderer: null,
    blackK: null,
    whiteK: null
};

// vars init
var delta = 0.1;
var step = 0;
var dispX = 0.2, dispZ = 0.2;
var done1,done2,done4,done5,done7,done8,done10,done11;
var expectedX, expectedZ;
var directionX = new THREE.Vector3(0.2, 0, 0.1);
var directionZ = new THREE.Vector3(0.1, 0, 0.2);
var vectorX = directionX.clone().multiplyScalar(-0.06,0.05,-0.06);
var vectorZ = directionZ.clone().multiplyScalar(-0.06,0.05,-0.06);



// main funcs
initEmptyScene(sceneElements);
loadBasic(sceneElements.sceneGraph);

// resize listener
window.addEventListener('resize', resizeWindow);

//To keep track of the keyboard
document.addEventListener('keydown', onDocumentKeyDown, false);
//document.addEventListener('keyup', onDocumentKeyUp, false);


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
    const ambientLight = new THREE.AmbientLight('rgb(255, 255, 255)', 2);
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
    renderer.setClearColor('rgb(120, 120, 120)', 1.0);
    renderer.setSize(width, height);

    // Setup shadowMap property
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // ************************** //
    // Control for the camera
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
        case 49:
            trial1();
            break;
        case 50:
            trial2();
            break;
        case 51:
            trial4();
            break;
        case 52:
            trial5();
            break;
        case 53:
            trial7();
            break;
        case 54:
            trial8();
            break;
        case 55:
            trial10();
            break;
        case 56: //s
            trial11();
            break;
        
    }
}

// function onDocumentKeyUp(event) {
//     switch (event.keyCode) {
//         case 68: //d
//             keyD = false;
//             break;
//         case 83: //s
//             keyS = false;
//             break;
//         case 65: //a
//             keyA = false;
//             break;
//         case 87: //w
//             keyW = false;
//             break;
//     }
// }



// load basic models
function loadBasic(sceneGraph) {

    // ground plane
    const planeGeometry = new THREE.PlaneGeometry(6, 6);
    const planeMaterial = new THREE.MeshPhongMaterial({ color: 'rgb(200, 200, 200)', side: THREE.DoubleSide });
    const planeObject = new THREE.Mesh(planeGeometry, planeMaterial);
    planeObject.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    planeObject.receiveShadow = true;
    //sceneGraph.add(planeObject);


    // the coordinate axes
    var axes = new THREE.AxesHelper(2.5);
    sceneGraph.add(axes);

    // the grid
    const size = 8;
    const divisions = 16;
    const gridHelper = new THREE.GridHelper( size, divisions );
    gridHelper.position.y=-0.01;
    sceneGraph.add( gridHelper );

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
            cuby.name = (x/2 + 0.25).toString(10) + ":" + (z/2 + 0.25).toString(10);
            cuby.castShadow = true;
            cuby.receiveShadow = true;
            board.add(cuby);
        }
    }

    sceneGraph.add(board);
    console.log(sceneElements.sceneGraph.children[3].children[0]);
    loadKnights(sceneGraph)
    
}



function loadKnights(sceneGraph){
    //load knight
    //pegar nas cores da 169 e meter abaixo

    const loadingManager = new THREE.LoadingManager()   
       
    loadingManager.onLoad = () => {	
        console.log(sceneElements.blackK.name + " and " + sceneElements.whiteK.name + " ready!");
        // sceneElements.whiteK.position.z +=(-0.5);
        // sceneElements.whiteK.position.x -=(-0.5);
        requestAnimationFrame(computeFrame);
    }

    const loader = new GLTFLoader(loadingManager);

    loader.load('./knight/scene_white.gltf',(gltfScene) => {
        const whiteKnight = gltfScene.scene;
        whiteKnight.position.set(1.25, 0.025, 1.75);
        whiteKnight.scale.set(6,6,6);
        whiteKnight.name = "white";

        gltfScene.scene.castShadow = true;
        gltfScene.scene.receiveShadow = true;

        sceneGraph.add(whiteKnight);
        quickReset(whiteKnight);
        sceneElements.whiteK =  whiteKnight;

    });

    loader.load('./knight/scene_black.gltf', function (gltfScene) {
        const blackKnight = gltfScene.scene;
        blackKnight.position.set(1.25, 0.025, -1.75);
        blackKnight.scale.set(6,6,6);
        blackKnight.name = "black";

        blackKnight.castShadow = true;
        blackKnight.receiveShadow = true;

        sceneGraph.add(blackKnight);
        sceneElements.blackK =  blackKnight;

        console.log("--" + blackKnight);
    });
}
// ******************************************************************************************************** //
// functions to handle chess piece movement
// ******************************************************************************************************** //
function trial1(){
    const cube = sceneElements.sceneGraph.getObjectByName("white");
    if(moveFrontRightUp(cube)){
        requestAnimationFrame(trial1);
        render(sceneElements);
    }
}

function trial2(){
    const cube = sceneElements.sceneGraph.getObjectByName("white");
    if(moveFrontRightDown(cube)){
        requestAnimationFrame(trial2);
        render(sceneElements);
    }
}

function trial4(){
    const cube = sceneElements.sceneGraph.getObjectByName("white");
    if(moveBackRightUp(cube)){
        requestAnimationFrame(trial4);
        render(sceneElements);
    }
}

function trial5(){
    const cube = sceneElements.sceneGraph.getObjectByName("white");
    if(moveBackRightDown(cube)){
        requestAnimationFrame(trial5);
        render(sceneElements);
    }
}

function trial7(){
    const cube = sceneElements.sceneGraph.getObjectByName("white");
    if(moveBackLeftDown(cube)){
        requestAnimationFrame(trial7);
        render(sceneElements);
    }
}

function trial8(){
    const cube = sceneElements.sceneGraph.getObjectByName("white");
    if(moveBackLeftUp(cube)){
        requestAnimationFrame(trial8);
        render(sceneElements);
    }
}

function trial10(){
    const cube = sceneElements.sceneGraph.getObjectByName("white");
    if(moveFrontLeftDown(cube)){
        requestAnimationFrame(trial10);
        render(sceneElements);
    }
}

function trial11(){
    const cube = sceneElements.sceneGraph.getObjectByName("white");
    if(moveFrontLeftUp(cube)){
        requestAnimationFrame(trial11);
        render(sceneElements);
    }
}

function quickReset(piece){
    piece.position.set(0.25,0.025,-0.25);
}

function moveFrontRightUp(piece){
    // move code 1
    step += 1;
    if(!done1){
        console.log("beginning to move");
        done1=true;
        expectedZ = piece.position.z - 1;
        expectedX = piece.position.x + 0.5;
        if(expectedX>2 || expectedX<-2 || expectedZ>2 || expectedZ<-2){
            invalidPlay();
            done1=false;
            return false;
        }
        console.log(">"+piece.position.x + "; "+ piece.position.z);
        console.log("expectedz: "+ expectedX + "; expectedX: "+ expectedZ);
    }
    if(piece.position.z > expectedZ || piece.position.x < expectedX){
        piece.position.x -= vectorZ.x;
        piece.position.z += vectorZ.z;
        piece.position.y = 0.025 + (0.5 * Math.abs(Math.sin(step/26.8)));
        return true;
    }
    piece.position.x=expectedX;
    piece.position.y=0.025;
    piece.position.z=expectedZ;
    done1=false;
}

function moveFrontRightDown(piece){
    // move code 2
    step += 1;
    if(!done2){
        console.log("beginning to move");
        done2=true;
        expectedZ = piece.position.z - 0.5;
        expectedX = piece.position.x + 1;
        if(expectedX>2 || expectedX<-2 || expectedZ>2 || expectedZ<-2){
            invalidPlay();
            done2=false;
            return false;
        }
        console.log(">"+piece.position.x + "; "+ piece.position.z);
        console.log("expectedz: "+ expectedX + "; expectedX: "+ expectedZ);
    }
    if(piece.position.z > expectedZ || piece.position.x < expectedX){
        piece.position.x -= vectorX.x;
        piece.position.z += vectorX.z;
        piece.position.y = 0.025 + (0.5 * Math.abs(Math.sin(step/26.8)));
        return true;
    }
    piece.position.x=expectedX;
    piece.position.y=0.025;
    piece.position.z=expectedZ;
    done2=false;
}

function moveBackRightUp(piece){
    // move code 4
    step += 1;
    if(!done4){
        console.log("beginning to move");
        done4=true;
        expectedZ = piece.position.z + 0.5;
        expectedX = piece.position.x + 1;
        if(expectedX>2 || expectedX<-2 || expectedZ>2 || expectedZ<-2){
            invalidPlay();
            done4=false;
            return false;
        }
        console.log(">"+piece.position.x + "; "+ piece.position.z);
        console.log("expectedz: "+ expectedX + "; expectedX: "+ expectedZ);
    }
    if(piece.position.z < expectedZ || piece.position.x < expectedX){
        piece.position.x -= vectorX.x;
        piece.position.z -= vectorX.z;
        piece.position.y = 0.025 + (0.5 * Math.abs(Math.sin(step/26.8)));
        return true;
    }
    piece.position.x=expectedX;
    piece.position.y=0.025;
    piece.position.z=expectedZ;
    done4=false;
}

function moveBackRightDown(piece){
    // move code 5
    step += 1;
    if(!done5){
        console.log("beginning to move");
        done5=true;
        expectedZ = piece.position.z + 1;
        expectedX = piece.position.x + 0.5;
        if(expectedX>2 || expectedX<-2 || expectedZ>2 || expectedZ<-2){
            invalidPlay();
            done5=false;
            return false;
        }
        console.log(">"+piece.position.x + "; "+ piece.position.z);
        console.log("expectedz: "+ expectedX + "; expectedX: "+ expectedZ);
    }
    if(piece.position.z < expectedZ || piece.position.x < expectedX){
        piece.position.x -= vectorZ.x;
        piece.position.z -= vectorZ.z;
        piece.position.y = 0.025 + (0.5 * Math.abs(Math.sin(step/26.8)));
        return true;
    }
    piece.position.x=expectedX;
    piece.position.y=0.025;
    piece.position.z=expectedZ;
    done5=false;
}

function moveBackLeftDown(piece){
    // move code 7
    step += 1;
    if(!done7){
        console.log("beginning to move");
        done7=true;
        expectedZ = piece.position.z + 1;
        expectedX = piece.position.x - 0.5;
        if(expectedX>2 || expectedX<-2 || expectedZ>2 || expectedZ<-2){
            invalidPlay();
            done7=false;
            return false;
        }
        console.log(">"+piece.position.x + "; "+ piece.position.z);
        console.log("expectedz: "+ expectedX + "; expectedX: "+ expectedZ);
    }
    if(piece.position.z < expectedZ || piece.position.x > expectedX){
        piece.position.x += vectorZ.x;
        piece.position.z -= vectorZ.z;
        piece.position.y = 0.025 + (0.5 * Math.abs(Math.sin(step/26.8)));
        return true;
    }
    piece.position.x=expectedX;
    piece.position.y=0.025;
    piece.position.z=expectedZ;
    done7=false;
}

function moveBackLeftUp(piece){
    // move code 8
    step += 1;
    if(!done8){
        console.log("beginning to move");
        done8=true;
        expectedZ = piece.position.z + 0.5;
        expectedX = piece.position.x - 1;
        if(expectedX>2 || expectedX<-2 || expectedZ>2 || expectedZ<-2){
            invalidPlay();
            done8=false;
            return false;
        }
        console.log(">"+piece.position.x + "; "+ piece.position.z);
        console.log("expectedz: "+ expectedX + "; expectedX: "+ expectedZ);
    }
    if(piece.position.z < expectedZ || piece.position.x > expectedX){
        piece.position.x += vectorX.x;
        piece.position.z -= vectorX.z;
        piece.position.y = 0.025 + (0.5 * Math.abs(Math.sin(step/26.8)));
        return true;
    }
    piece.position.x=expectedX;
    piece.position.y=0.025;
    piece.position.z=expectedZ;
    done8=false;
    return false;
}

function moveFrontLeftDown(piece){
    // move code 10
    step += 1;
    if(!done10){
        console.log("beginning to move");
        done10=true;
        expectedZ = piece.position.z - 0.5;
        expectedX = piece.position.x - 1;
        if(expectedX>2 || expectedX<-2 || expectedZ>2 || expectedZ<-2){
            invalidPlay();
            done10=false;
            return false;
        }
        console.log(">"+piece.position.x + "; "+ piece.position.z);
        console.log("expectedz: "+ expectedX + "; expectedX: "+ expectedZ);
    }
    if(piece.position.z > expectedZ || piece.position.x > expectedX){
        piece.position.x += vectorX.x;
        piece.position.z += vectorX.z;
        piece.position.y = 0.025 + (0.5 * Math.abs(Math.sin(step/26.8)));
        return true;
    }
    piece.position.x=expectedX;
    piece.position.y=0.025;
    piece.position.z=expectedZ;
    done10=false;
    return false;
}

function moveFrontLeftUp(piece){
    // move code 11
    step += 1;
    if(!done11){
        console.log("beginning to move");
        done11=true;
        expectedZ = piece.position.z - 1;
        expectedX = piece.position.x - 0.5;
        if(expectedX>2 || expectedX<-2 || expectedZ>2 || expectedZ<-2){
            invalidPlay();
            done11=false;
            return false;
        }
        console.log(">"+piece.position.x + "; "+ piece.position.z);
        console.log("expectedz: "+ expectedX + "; expectedX: "+ expectedZ);
    }
    if(piece.position.z > expectedZ || piece.position.x > expectedX){
        piece.position.x += vectorZ.x;
        piece.position.z += vectorZ.z;
        piece.position.y = 0.025 + (0.5 * Math.abs(Math.sin(step/26.8)));
        return true;
    }
    piece.position.x=expectedX;
    piece.position.y=0.025;
    piece.position.z=expectedZ;
    done11=false;
    return false;
}

function invalidPlay(){
    console.log("invalid play");
    const squary = sceneElements.sceneGraph.getObjectByName("-0.25:0.75");
    squary.material.color.set('rgb(249, 10, 9 )');
    setTimeout(function(){
        squary.material.color.set('rgb(20,20,20)');
    }, 1000);
}

function computeFrame(time) {

    const squary = sceneElements.sceneGraph.getObjectByName("-0.25:0.75");
    var firstBB = new THREE.Box3().setFromObject(squary);
    //squary.position.y=0.025;
    var secondBB = new THREE.Box3().setFromObject(sceneElements.whiteK);
    var thirdBB = new THREE.Box3().setFromObject(sceneElements.blackK);
    var collision = firstBB.intersectsBox(secondBB);
    var winCondition = secondBB.intersectsBox(thirdBB);
    if (collision){
        sceneElements.sceneGraph.remove(sceneElements.sceneGraph.children[3].remove(children[0]));
        //squary.position.y=0.025;
        //squary.material.color.setHex( 0xdb4607 );
        console.log("collided");
    }
    if(winCondition){
        sceneElements.sceneGraph.remove(sceneElements.blackK);
        //win()
        //reset()
    }

    // Rendering
    render(sceneElements);

    // update control of the camera
    sceneElements.control.update();

    // Call for the next frame
    requestAnimationFrame(computeFrame);
}

//TO DO
//-win()
//reset()
//textures
//reflections
// illumination and shading
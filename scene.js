import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from './lib/RGBELoader.js';

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

// load gui
var controls = new function () {
    this.lightSpeed = 0;
    this.jumpHeight = 0.5;
    this.intensity = 0.2;
    this.background = "prototype";

    this.background = function (e){
        if(e!="prototype"){

            new RGBELoader()
            .load("./lib/"+e+".hdr", function (texture){
                texture.mapping = THREE.EquirectangularReflectionMapping;
                sceneElements.sceneGraph.background = texture;
                sceneElements.sceneGraph.environment = texture;
            });

            var floorTex = THREE.ImageUtils.loadTexture("./lib/tabletop.jpg");
            var plane = new THREE.Mesh(new THREE.BoxGeometry(7, 7, 0.01, 30), new THREE.MeshPhongMaterial({
                color: 0xffffff,
                map: floorTex
            }));
            plane.position.y = -0.06;
            plane.rotation.x = -0.5 * Math.PI;
            plane.name="plane";
            sceneElements.sceneGraph.add(plane);

            
            sceneElements.sceneGraph.remove(sceneElements.sceneGraph.getObjectByName("axes"));
            sceneElements.sceneGraph.remove(sceneElements.sceneGraph.getObjectByName("grid"));
        }else{


            sceneElements.sceneGraph.background=null;

            var axes = new THREE.AxesHelper(2.5);
            axes.name="axes";
            sceneElements.sceneGraph.add(axes);
        
            // the grid
            const size = 8;
            const divisions = 16;
            const gridHelper = new THREE.GridHelper( size, divisions );
            gridHelper.position.y=-0.01;
            gridHelper.name="grid";
            sceneElements.sceneGraph.add( gridHelper );
            
            sceneElements.sceneGraph.remove(sceneElements.sceneGraph.getObjectByName("plane"));
        }

    }
};
var gui = new dat.GUI();
gui.add(controls, 'lightSpeed', 0, 0.5)
gui.add(controls, 'intensity', 0,2);
gui.add(controls, 'jumpHeight', 0,3);
gui.add(controls, "background", ['prototype', 'theater', 'pizzo']).onChange(controls.background);

var jmp_hght=controls.jumpHeight;
var intst = controls.intensity;


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
    const ambientLight = new THREE.AmbientLight('rgb(255, 255, 255)', 0.8);
    sceneElements.sceneGraph.add(ambientLight);

    // ***************************** //
    // Add spotlight (with shadows)
    // ***************************** //
    const spotLight = new THREE.SpotLight('rgb(255, 255, 255)', 1);
    var lights = new THREE.Group();
    spotLight.position.set(4, 4, 4);
    lights.add(spotLight);

    // Setup shadow properties for the spotlight
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;

    // Give a name to the spot light
    spotLight.name = "light";

    const geometry13 = new THREE.SphereGeometry( 0.1, 20, 20 );
    const material13 = new THREE.MeshBasicMaterial( { color: 'rgb(235, 161, 52)' } );
    const sphere = new THREE.Mesh( geometry13, material13 );
    sphere.position.set(4,4,4);
    //sphere.position.y = (10 * Math.abs(Math.sin(1)));
    sphere.name = "sun";
    lights.add( sphere );
    lights.name="lights";
    sceneElements.sceneGraph.add(lights);


    // *********************************** //
    // Create renderer (with shadow map)
    // *********************************** //
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    sceneElements.renderer = renderer;
    renderer.setPixelRatio(window.devicePixelRatio);
    // ambient color
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

//come back to this later, takes time to implement and test
function changeSpeed(ammount){
    directionX = new THREE.Vector3(0.2, 0, 0.2/2);
    directionZ = new THREE.Vector3(0.2/2, 0, 0.2);
    vectorX = directionX.clone().multiplyScalar(-0.06,0.05,-0.06);
    vectorZ = directionZ.clone().multiplyScalar(-0.06,0.05,-0.06);
}


// load basic models
function loadBasic(sceneGraph) {

    // ground plane
    // const planeGeometry = new THREE.PlaneGeometry(6, 6);
    // const planeMaterial = new THREE.MeshPhongMaterial({ color: 'rgb(200, 200, 200)', side: THREE.DoubleSide });
    // const planeObject = new THREE.Mesh(planeGeometry, planeMaterial);
    // planeObject.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
    // planeObject.receiveShadow = true;
    //sceneGraph.add(planeObject);

    // var floorTex = THREE.ImageUtils.loadTexture("./lib/tabletop.jpg");
    // var plane = new THREE.Mesh(new THREE.BoxGeometry(7, 7, 0.01, 30), new THREE.MeshPhongMaterial({
    //     color: 0xffffff,
    //     map: floorTex
    // }));
    // plane.position.y = -0.06;
    // plane.rotation.x = -0.5 * Math.PI;
    // plane.name="plane";
    // sceneGraph.add(plane);

    // the coordinate axes
    var axes = new THREE.AxesHelper(2.5);
    axes.name="axes";
    sceneGraph.add(axes);

    // the grid
    const size = 8;
    const divisions = 16;
    const gridHelper = new THREE.GridHelper( size, divisions );
    gridHelper.position.y=-0.01;
    gridHelper.name="grid";
    sceneGraph.add( gridHelper );

    

    var img = "./lib/dark_wood.png";
    var texture = new THREE.ImageUtils.loadTexture(img);
    var darkM = new THREE.MeshPhongMaterial()
    darkM.map=texture;
    darkM.map.repeat.set(1,1);

    var img2 = "./lib/ivory.jpeg";
    var texture2 = new THREE.ImageUtils.loadTexture(img2);
    var lightM = new THREE.MeshPhongMaterial()
    lightM.map=texture2;
    lightM.map.repeat.set(1,1);

    // chess

    var cubeGeo = new THREE.BoxGeometry(0.5, 0.05,0.5);
    //var lightM = new THREE.MeshPhongMaterial({ color: 'rgb(20,20,20)' });
    //var darkM = new THREE.MeshPhongMaterial({color: 'rgb(0,0,0)'});
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
    board.name = "board";
    sceneGraph.add(board);
    console.log(sceneElements.sceneGraph.children[3].children[0]);
    loadKnights(sceneGraph);

    createBoardBorder(sceneGraph);
    
}

function createBoardBorder(sceneGraph){
    //var texture = THREE.ImageUtils.loadTexture("./lib/stone.jpg");
    // var matty = new THREE.MeshPhongMaterial();//{color: 'rgb(123, 201, 18)'});
    //matty.map = texture;
    var geommy = new THREE.BoxGeometry(0.5, 0.05,4);
    //geommy.computeVertexNormals();

    if ("./lib/stone_bump.png") {
        var texture = THREE.ImageUtils.loadTexture("./lib/granite.png");
        var normal_bump = THREE.ImageUtils.loadTexture("./lib/stone-bump.jpg");
        var matty = new THREE.MeshPhongMaterial({color: 'rgb(255, 194, 153)'});
        matty.map = texture;
        matty.normalMap = normal_bump;
        //matty.bumpScale =4;
    }
    matty.map.repeat.set(0.1,1);
    
    var cubs = new THREE.Mesh(geommy, matty);

    cubs.material.normalScale.set(1.2, 1.2);
    cubs.position.y=0;
    cubs.position.x=2.25;
    sceneGraph.add(cubs);

    var geommy2 = new THREE.BoxGeometry(0.5, 0.05,5);
    var cubs2 = new THREE.Mesh(geommy2,matty)
    cubs2.rotation.y=Math.PI/2;
    cubs2.translateX(2.25);
    //cubs2.translateZ(-2.25);
    sceneGraph.add(cubs2);

    var cubs3 = cubs2.clone();
    cubs3.translateX(-4.5);
    sceneGraph.add(cubs3);

    var cubs4 = cubs.clone();
    cubs4.translateX(-4.5);
    sceneGraph.add(cubs4);
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
        whiteKnight.position.set(-1.25, 0.025, 1.75);
        whiteKnight.scale.set(6,6,6);
        whiteKnight.name = "white";

        gltfScene.scene.castShadow = true;
        gltfScene.scene.receiveShadow = true;

        sceneGraph.add(whiteKnight);
        //quickReset(whiteKnight);
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
    const possibilities = [-1.75, -1.25, -0.75, -0.25, 0, 0.25, 0.75, 1.25, 1.75];
    const possibleX = possibilities[Math.floor(Math.random() * possibilities.length)];
    const possibleZ = possibilities[Math.floor(Math.random() * possibilities.length)];
    if((possibleX==1.25 && possibleZ==-1.75) || (possibleX==0 && possibleZ==0)){
        piece.position.set(-1.25,0.025,1.75);
    }else{
        piece.position.set(possibleX,0.025,possibleZ);
    }
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
        piece.position.y = (0.025 + (jmp_hght * Math.abs(Math.sin(step/26.8))));
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
        piece.position.y = 0.025 + (jmp_hght * Math.abs(Math.sin(step/26.8)));
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
        piece.position.y = 0.025 + (jmp_hght * Math.abs(Math.sin(step/26.8)));
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
        piece.position.y = 0.025 + (jmp_hght * Math.abs(Math.sin(step/26.8)));
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
        piece.position.y = 0.025 + (jmp_hght * Math.abs(Math.sin(step/26.8)));
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
        piece.position.y = 0.025 + (jmp_hght * Math.abs(Math.sin(step/26.8)));
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
        piece.position.y = 0.025 + (jmp_hght * Math.abs(Math.sin(step/26.8)));
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
        piece.position.y = 0.025 + (jmp_hght * Math.abs(Math.sin(step/26.8)));
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
    var all_squares = sceneElements.sceneGraph.getObjectByName("board").children[0];
    var curr_pos = sceneElements.sceneGraph.getObjectByName(getKnightPos());

    var materialRed = new THREE.MeshPhongMaterial({ color: 'rgb(235, 70, 52)'});
    var clr = (curr_pos.material);

    curr_pos.material = materialRed;
    all_squares.material.color.set('rgb(217, 63, 28)');
    
    setTimeout(function(){
        all_squares.material.color.set(0xffffff);
        curr_pos.material=clr;
    }, 1000);
}

function getKnightPos(){
    return sceneElements.whiteK.position.x.toString(10) + ":" + sceneElements.whiteK.position.z.toString(10)
}

function computeFrame(time) {

    jmp_hght=(controls.jumpHeight);
    sceneElements.sceneGraph.getObjectByName("light").intensity=controls.intensity;

    sceneElements.sceneGraph.getObjectByName("lights").rotation.y += controls.lightSpeed;
    //console.log(sceneElements.sceneGraph.getObjectByName("sun").rotation.y);

    
    var secondBB = new THREE.Box3().setFromObject(sceneElements.whiteK);
    var thirdBB = new THREE.Box3().setFromObject(sceneElements.blackK);
    var winCondition = secondBB.intersectsBox(thirdBB);
    
    if(winCondition){
        sceneElements.sceneGraph.remove(sceneElements.blackK);
        setTimeout(function(){
            quickReset(sceneElements.whiteK);
            sceneElements.sceneGraph.add(sceneElements.blackK);
        }, 2000);
    }


    // Rendering
    render(sceneElements);

    // update control of the camera
    sceneElements.control.update();

    // Call for the next frame
    requestAnimationFrame(computeFrame);
}

// TO DO
// reflections
// illumination and shading
// fix cavalo preto desaparecer em saltos que nao o matam
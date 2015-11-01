var HEIGHT = 1000;
var WIDTH = 1000;

var renderer, scene, camera;
var pointLight;

var lightFlickerStartTime;
var lightFlickerTime;

function setup() {
    initScene();
    draw();
}

function initScene() {
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(HEIGHT, WIDTH);
    document.getElementById('gameCanvas').appendChild(renderer.domElement);
    
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(50, WIDTH/HEIGHT, 0.1, 10000);
    camera.position.z = 300;
    
    scene.add(camera);
    setupObjects();
    setupLights();
}

function setupObjects() {
    var plane = new THREE.Mesh(
        new THREE.PlaneGeometry(
            HEIGHT,
            WIDTH,
            10,
            10),
        new THREE.MeshLambertMaterial({
            color: 0x003366
        })
    );
    scene.add(plane);
}

function setupLights() {
    pointLight = new THREE.PointLight(0xf8d898);
    pointLight.position.z = 500;
    pointLight.intensity = 0.0;
    pointLight.distance = 10000;
    
    scene.add(pointLight);
}

function flickerLights() {
    
    // If light is already on, calculate the current time
    // If > the flicker time, turn off light and reset
    if (pointLight.intensity > 0.0) {
        var currTime = Date.now();
        if (currTime > lightFlickerStartTime + lightFlickerTime) {
            pointLight.intensity = 0.0;
            lightFlickerStartTime = 0;
            lightFlickerTime = 0;
            return;
        }
    }
    
    var r = Math.random();
    
    if (r > 0.97) {
        // start flicker
        lightFlickerStartTime = Date.now();
        lightFlickerTime = 100; // .1 sec
        pointLight.intensity = 1.0;
    }
}

function draw() {
    renderer.render(scene, camera);
    flickerLights();
    requestAnimationFrame(draw);
}
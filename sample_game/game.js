// http://buildnewgames.com/webgl-threejs/
// consts
var WIDTH = 640;
var HEIGHT = 360;
var FIELD_WIDTH = 400;
var FIELD_HEIGHT = 200;
var PADDLE_WIDTH = 10;
var PADDLE_HEIGHT = 30;

// Game objects
var playerScore = 0;
var cpuScore = 0;
var maxScore = 7;
var scores;
var playerPaddle, cpuPaddle, ball;
var playerPaddleDirY = 0, cpuPaddleDirY = 0, paddleSpeed = 3;
var ballDirX = 1, ballDirY = 1, ballSpeed = 2;
var difficulty = 0.3; // 0 = doesn't move. 1 = impossible

// Scene objects
var renderer, scene, camera, pointLight, spotLight;


function setup() {
    setupGame();
    createScene();
    draw();
}

function setupGame() {
    document.getElementById("winnerBoard").innerHTML = "First to " + maxScore + " wins!";
    scores = document.getElementById("scores");
    playerScore = 0;
    cpuScore = 0;
}

function createScene() {
    // setup renderer in html
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(WIDTH, HEIGHT);
    document.getElementById("gameCanvas").appendChild(renderer.domElement);
    
    camera = new THREE.PerspectiveCamera(50, (WIDTH/HEIGHT), 0.1, 10000);
    scene = new THREE.Scene();
    
    // setup camera
    camera.position.z = 320;
    scene.add(camera);
    
    setupObjects();
    setupLights();
}

function setupObjects() {
    // Setup the playing surface
    var planeWidth = FIELD_WIDTH;
    var planeHeight = FIELD_HEIGHT;
    var planeMaterial = new THREE.MeshLambertMaterial({
        color: 0x4bd121
    });
    var plane = new THREE.Mesh(
        new THREE.PlaneGeometry(
            planeWidth * 0.95,
            planeHeight,
            10,
            10),
        planeMaterial);
    
    scene.add(plane);
    plane.receiveShadow = true;
    
    // Setup the table
    var tableMaterial = new THREE.MeshLambertMaterial({
        color: 0x111111
    });
    var table = new THREE.Mesh(
        new THREE.CubeGeometry(
            planeWidth * 1.05,
            planeHeight* 1.03,
            100,
            10,
            10,
            1),
        tableMaterial);
    table.position.z = -51; // sink the table into the ground 51 units.
    scene.add(table);
    table.receiveShadow = true;
    
    var PADDLE_WIDTH = 10;
    var PADDLE_HEIGHT = 30;
    
    // Setup the pillars
    var pillarMaterial = new THREE.MeshLambertMaterial({
        color: 0x534d0d
    });
    // 5x pillars on each side
    // left
    for (var i = 0; i < 5; i++) {
        var backdrop = new THREE.Mesh(
            new THREE.CubeGeometry(
                30,
                30,
                300,
                1,
                1,
                1
            ), pillarMaterial);
        backdrop.position.x = -50 + i*100;
        backdrop.position.y = 230;
        backdrop.position.z = -30;
        backdrop.castShadow = true;
        backdrop.receiveShadow = true;
        scene.add(backdrop);
    }
    // right
        for (var i = 0; i < 5; i++) {
        var backdrop = new THREE.Mesh(
            new THREE.CubeGeometry(
                30,
                30,
                300,
                1,
                1,
                1
            ), pillarMaterial);
        backdrop.position.x = -50 + i*100;
        backdrop.position.y = -230;
        backdrop.position.z = -30;
        backdrop.castShadow = true;
        backdrop.receiveShadow = true;
        scene.add(backdrop);
    }
    
    // Setup ground plane for shadows
    var groundMaterial = new THREE.MeshLambertMaterial({
        color: 0x888888
    });
    var ground = new THREE.Mesh(
        new THREE.CubeGeometry(
            1000,
            1000,
            3,
            1,
            1,
            1 ),
        groundMaterial);
    ground.position.z = -132;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Setup paddle for player (left)
    var playerPaddleMaterial = new THREE.MeshLambertMaterial({
        color: 0x1b32c0
    });
    playerPaddle = new THREE.Mesh(
        new THREE.CubeGeometry(
            PADDLE_WIDTH, 
            PADDLE_HEIGHT,
            10,
            1,
            1,
            1),
        playerPaddleMaterial);
        
    playerPaddle.position.x = -(FIELD_WIDTH/2) + PADDLE_WIDTH;
    playerPaddle.position.z = 1;

    playerPaddle.receiveShadow = true;
    playerPaddle.castShadow = true;    
    scene.add(playerPaddle);
    
    // Setup paddle for cpu (right)
    var cpuPaddleMaterial = new THREE.MeshLambertMaterial({
        color: 0xff4045
    });
    cpuPaddle = new THREE.Mesh(
        new THREE.CubeGeometry(
            PADDLE_WIDTH, 
            PADDLE_HEIGHT,
            10,
            1,
            1,
            1),
        playerPaddleMaterial);
    
    cpuPaddle.position.x = (FIELD_WIDTH/2) - PADDLE_WIDTH;
    cpuPaddle.position.z = 1;    
    
    cpuPaddle.receiveShadow = true;
    cpuPaddle.castShadow = true;
    scene.add(cpuPaddle);
    
    // Setup ball
    var radius = 5, segments = 6, rings = 6;
    var sphereMaterial = new THREE.MeshLambertMaterial({
        color: 0xd43001
    });
    ball = new THREE.Mesh(
        new THREE.SphereGeometry(
            radius,
            segments,
            rings),
        sphereMaterial);
    ball.position.x = 0;
    ball.position.y = 0;
    ball.position.z = radius;
    ball.receiveShadow = true;
    ball.castShadow = true;
    scene.add(ball);
}

function setupLights() {
    
    // Setup a point light
    pointLight = new THREE.PointLight(0xf8d898);
    
    pointLight.position.x = -1000;
    pointLight.position.y = 0;
    pointLight.position.z = 1000;
    pointLight.intensity = 2.9;
    pointLight.distance = 10000;
    
    scene.add(pointLight);
    
    // Setup a spot light
    spotLight = new THREE.SpotLight(0xf8d898);
    spotLight.position.set(0, 0, 460);
    spotLight.intensity = 1.5;
    spotLight.castShadow = true;
    scene.add(spotLight);
    
    // Wowe shadoes
    renderer.shadowMap.enabled = true;
}

function ballPhysics() {
    // ball goes off 'left' side (player's side)
    if (ball.position.x <= -FIELD_WIDTH/2) {
        cpuScore++;
        updateScoreboard();
        resetBall("cpu");
    }
    
    // ball goes off 'right' side (cpu's side)
    if (ball.position.x >= FIELD_WIDTH/2) {
        playerScore++;
        updateScoreboard();
        resetBall("player");
    }
    
    // ball goes off the 'top' side or 'bot' side
    if ((ball.position.y <= -FIELD_HEIGHT/2) || (ball.position.y >= FIELD_HEIGHT/2)) {
        ballDirY = -ballDirY;
    }
    
    // update ball position
    ball.position.x += ballDirX * ballSpeed;
    ball.position.y += ballDirY * ballSpeed;
    
    // limit the ball's y-speed to 2x the x speed, otherwise gets too hard.
    if (ballDirY > ballSpeed * 2) {
        ballDirY = ballSpeed * 2;
    }
    if (ballDirY < -ballSpeed * 2) {
        ballDirY = -ballSpeed * 2;
    }
}

function updateScoreboard() {
    if (playerScore >= maxScore) {
        scores.innerHTML = "Player wins!";
        gameOver("player");
    }
    else if (cpuScore >= maxScore) {
        scores.innerHTML = "CPU wins :(";
        gameOver("cpu");
    }
    else {
        scores.innerHTML = playerScore + "-" + cpuScore;
    }
}

function resetBall(loser) {
    ball.position.x = 0;
    ball.position.y = 0;
    if (loser === "player") {
        ballDirX = -1;
    }
    else {
        ballDirX = 1;
    }
    ballDirY = 1;
}

function gameOver(winner) {
    ballSpeed = 0;
    bounceTime++;
    if (winner === "player") {
        var paddleToBounce = playerPaddle;
    }
    else {
        var paddleToBounce = cpuPaddle;
    }
    paddleToBounce.position.z = Math.sin(bounceTime * 0.1) * 10;
    paddleToBounce.scale.z = 2 + Math.abs(Math.sin(bounceTime * 0.1)) * 10;
    paddleToBounce.scale.y = 2 + Math.abs(Math.sin(bounceTime * 0.05)) * 10;
}

function paddlePhysics() {
    // if ball is aligned with playerPaddle on x plane, playerPaddle collided with ball.
    // remember the position is the center of the object.
    // only check between front and middle of paddle.
    if (ball.position.x <= playerPaddle.position.x + PADDLE_WIDTH &&
        ball.position.x >= playerPaddle.position.x) {
        // ... and ball is aligned with playerPaddle on y plane
        if (ball.position.y <= playerPaddle.position.y + PADDLE_HEIGHT/2 &&
            ball.position.y >= playerPaddle.position.y - PADDLE_HEIGHT/2) {
            // and ball is traveling towards player
            if (ballDirX < 0) {
                // stretch the paddle to show a hit
                playerPaddle.scale.y = 1.5;
                
                ballDirX = -ballDirX;
                ballDirY -= playerPaddleDirY * 0.7; // impact the ball angle when hitting paddle.
            }
        } 
    }
    
    // if ball is aligned with cpuPaddle on the x plane, cpuPaddle collided with the ball.
    if (ball.position.x <= cpuPaddle.position.x + PADDLE_WIDTH &&
        ball.position.x >= cpuPaddle.position.x) {
        // ... and ball is aligned with cpuPaddle on y plane
        if (ball.position.y <= cpuPaddle.position.y + PADDLE_HEIGHT/2 &&
            ball.position.y >= cpuPaddle.position.y - PADDLE_HEIGHT/2) {
            // ... and ball is traveling towards cpu
            if (ballDirX > 0) {
                // stretch the paddle to show a hit
                cpuPaddle.scale.y = 1.5;
                
                ballDirX = -ballDirX;
                ballDirY -= cpuPaddleDirY * 0.7; // impact the ball angle when hitting paddle.
            }
        } 
    }
}

function cameraPhysics() {
    spotLight.position.x = ball.position.x * 2;
    spotLight.position.y = ball.position.y * 2;
    
    // move behind the player's paddle
    
}

function playerPaddleMovement() {
    if (Key.isDown(Key.A)) {
        // only move if not touching the side of table
        if (playerPaddle.position.y < ((FIELD_HEIGHT * 0.5) - (PADDLE_HEIGHT * 0.5))) {
            playerPaddleDirY = paddleSpeed * 0.5;
        }
        // else cant move so stretch to indicate stuck
        else {
            playerPaddleDirY = 0;
            playerPaddle.scale.z += (10 - playerPaddle.scale.z) * 0.2;
        }
    }
    else if (Key.isDown(Key.D)) {
        // only move if not touching the side of table
        if (playerPaddle.position.y > -((FIELD_HEIGHT * 0.5) - (PADDLE_HEIGHT * 0.5))) {
            playerPaddleDirY = -paddleSpeed * 0.5;
        }
        // else cant move so stretch to indicate stuck
        else {
            playerPaddleDirY = 0;
            playerPaddle.scale.z += (10 - playerPaddle.scale.z) * 0.2;
        }
    }
    else {
        playerPaddleDirY = 0;
    }
    
    // scale back to normal every frame via lerp
    playerPaddle.scale.y += (1 - playerPaddle.scale.y) * 0.2;
    playerPaddle.scale.z += (1 - playerPaddle.scale.z) * 0.2;
    
    // move the paddle
    playerPaddle.position.y += playerPaddleDirY;
}

function opponentPaddleMovement() {
    // lerp towards the ball, on the y plane
    cpuPaddleDirY = (ball.position.y - cpuPaddle.position.y) * difficulty;
        
    // Make sure to clamp the lerp. if its under paddlespeed, just move. otherwise move as far as possible based on speed
    if (Math.abs(cpuPaddleDirY) <= paddleSpeed) {
        cpuPaddle.position.y += cpuPaddleDirY;
    }
    else {
        if (cpuPaddleDirY > paddleSpeed) {
            cpuPaddle.position.y += paddleSpeed;
        }
        else if (cpuPaddleDirY < -paddleSpeed) {
            cpuPaddle.position.y -= paddleSpeed;
        }
    }
    
    // make sure to reign in the position if it overshoots the side of the board
    if (cpuPaddleDirY > 0 && cpuPaddle.position.y >= ((FIELD_HEIGHT * 0.5) - (PADDLE_HEIGHT * 0.5))) {
        cpuPaddle.position.y = (FIELD_HEIGHT * 0.5) - (PADDLE_HEIGHT * 0.5);
    }
    else if (cpuPaddleDirY < 0 && cpuPaddle.position.y <= -((FIELD_HEIGHT * 0.5) - (PADDLE_HEIGHT * 0.5))) {
        cpuPaddle.position.y = -((FIELD_HEIGHT * 0.5) - (PADDLE_HEIGHT * 0.5));
    }
    // scale back to normal every frame
    cpuPaddle.scale.y += (1 - cpuPaddle.scale.y) * 0.2;
}


function draw() {
    renderer.render(scene, camera);
    
    requestAnimationFrame(draw);
    
    // process game logic
    ballPhysics();
    paddlePhysics();
    cameraPhysics();
    playerPaddleMovement();
    opponentPaddleMovement();
}
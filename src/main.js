const canvas = document.querySelector('canvas');
const ctx = canvas.getContext("2d");

let gameState;
let moles = [];
let deadMoles = [];
let buttons = [];
let startTime;
let displayTime;
let timeLimit;
let currentScore;
let highScore;
let raiseMoleInterval;

init();

function init() {
    gameState = "Start";
    fillMoles();
    createButtons();
    currentScore = 0;
    highScore = 0;
    timeLimit = 20;
    canvas.addEventListener("mousedown", checkMole, false);
    canvas.addEventListener("mousedown", checkButton, false);
    loop();
}

function fillMoles() {
    var counter = 0;
    for (var x = 0; x < 3; x++) {
        for (var y = 0; y < 3; y++) {
            moles = moles.concat(new Mole("", "dead", 120 + 250 * x, 70 + 180 * y, 70, 70, counter, 0, null));
            counter++;
        }
    }
}

function createButtons() {
    buttons = buttons.concat(new Button("Start Game", canvas.width / 2, canvas.height / 2 + 50, 90, 30));
    buttons = buttons.concat(new Button("Reset", canvas.width / 2, canvas.height - 20, 50, 30));
    buttons = buttons.concat(new Button("Retry", canvas.width / 2, canvas.height / 2 + 75, 50, 30));
}

function checkMole(e) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    var x = (e.clientX - rect.left) * scaleY;
    var y = (e.clientY - rect.top) * scaleY;
    for (var i = 0; i < moles.length; i++) {
        if ((x >= moles[i].xPos && x <= (moles[i].xPos + moles[i].width)) && (y >= moles[i].yPos && y <= (moles[i].yPos + moles[i].height))) {
            if (moles[i].statusText == "alive") {
                whackMole(i);
            }
        }
    }
}

function checkButton(e) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    var x = (e.clientX - rect.left) * scaleY;
    var y = (e.clientY - rect.top) * scaleY;
    for (var i = 0; i < buttons.length; i++) {
        if ((x >= (buttons[i].xPos - buttons[i].width) && x <= (buttons[i].xPos + buttons[i].width)) && (y >= (buttons[i].yPos - buttons[i].height) && y <= (buttons[i].yPos))) {
            if (gameState == "Start" && buttons[i].text == "Start Game") {
                changeGameState("Play");
            }
            if (gameState == "Play" && buttons[i].text == "Reset") {
                changeGameState("Play");
            }
            if (gameState == "Game Over" && buttons[i].text == "Retry") {
                changeGameState("Play");
            }
        }
    }
}

function whackMole(index) {
    moles[index].statusPic.src = "";
    moles[index].statusText = "dead";
    if (moles[index].interval != null) {
        currentScore += 1;
        endMoleInterval(index);
    }
}

function reviveMole(index) {
    moles[index].statusPic.src = "media/pray.jpg";
    moles[index].statusText = "alive";
    moles[index].timeUp = getRandomDouble(0.5, 1.0);
    startMoleInterval(index);
}

function resetGame() {
    for (var i = 0; i < moles.length; i++) {
        whackMole(i);
        currentScore = 0;
    }
    window.clearInterval(raiseMoleInterval);
    raiseMoleInterval = window.setInterval("reviveMole(getRandomDeadMole())", 700);
    startTime = performance.now();
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);;
}

function getRandomDouble(min, max) {
    return Math.random() * (max - min) + min;
}

function checkTimer(timestamp) {
    let elapsedTime = (timestamp - startTime) / 1000;
    let timeRemaining;
    if (gameState == "Play") {
        timeRemaining = Math.ceil(timeLimit - elapsedTime);
    }
    if (timeRemaining < 0) {
        if (gameState == "Play") {
            changeGameState("Game Over");
        }
    }
    if (gameState == "Play") {
        return timeRemaining;
    }
}

function startMoleInterval(index) {
    moles[index].interval = window.setInterval(function () { endMoleInterval(index); }, moles[index].timeUp * 1000);
}

function endMoleInterval(index) {
    window.clearInterval(moles[index].interval);
    moles[index].interval = null;
    whackMole(index);
}

function getRandomDeadMole() {
    deadMoles = [];
    for (var i = 0; i < moles.length; i++) {
        if (moles[i].statusText == "dead") {
            deadMoles = deadMoles.concat(moles[i]);
        }
    }
    if (deadMoles.length > 0) {
        return deadMoles[getRandomInt(0, deadMoles.length)].index;
    }
}

function changeGameState(newState) {
    gameState = newState;
    if (newState == "Play") {
        resetGame();
    }
    if (newState == "Game Over") {
        if (currentScore > highScore) {
            highScore = currentScore;
        }
        //don't raise moles anymore
        window.clearInterval(raiseMoleInterval);
    }
}

function loop(timestamp) {
    ctx.save();
    requestAnimationFrame(loop);
    if (!startTime) {
        startTime = timestamp;
    }
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    switch (gameState) {
        case "Start":
            ctx.textAlign = "center";
            ctx.font = "50pt Times New Roman";
            ctx.fillStyle = "black";
            ctx.fillText("Whack A Mole", canvas.width / 2, canvas.height / 2);
            ctx.font = "30pt Times new Roman";
            ctx.fillText(buttons[0].text, buttons[0].xPos, buttons[0].yPos);
            break;
        case "Play":
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.font = "30pt Times New Roman";
            ctx.fillText(buttons[1].text, buttons[1].xPos, buttons[1].yPos);
            for (var i = 0; i < moles.length; i++) {
                ctx.beginPath();
                ctx.arc(moles[i].xPos+(moles[i].width/2), moles[i].yPos+(moles[i].height/2), 60, 0, 2 * Math.PI);
                ctx.fill();
                ctx.drawImage(moles[i].statusPic, moles[i].xPos, moles[i].yPos, moles[i].width, moles[i].height);
            }
            displayTime = checkTimer(timestamp);
            ctx.textAlign = "none";
            //display time left
            ctx.fillText("Time: " + displayTime, 100, canvas.height - 20);
            //display score
            ctx.fillText("Score: " + currentScore, canvas.width - 90, canvas.height - 20);
            break;
        case "Game Over":
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.font = "50pt Times New Roman";
            ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
            ctx.font = "30pt Times new Roman";
            ctx.fillText(buttons[2].text, buttons[2].xPos, buttons[2].yPos);
            //display score
            ctx.fillText("Your Score: " + currentScore, canvas.width / 2 - 200, 50);
            //display high score
            ctx.fillText("High Score: " + highScore, canvas.width / 2 + 200, 50);
            break;
    }
    ctx.restore();
}
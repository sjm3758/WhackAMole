const canvas = document.querySelector('canvas');
const ctx = canvas.getContext("2d");

//game's current state ("Start", "Play" or "Game Over")
let gameState;
//array of all moles in the game (9 total)
let moles = [];
//array of dead/whacked moles in the game (length varies)
let deadMoles = [];
//array of canvas buttons
let buttons = [];
let startTime;
//displayed time left to play
let displayTime;
//starting time of the game
let timeLimit;
//player's score on their current attempt
let currentScore;
//player's highest scoring game
let highScore;
//interval time to display a mole to be whacked
let raiseMoleInterval1;
//second interval to allow two moles to appear at once
let raiseMoleInterval2;
//bool determining if half the time limit has elapsed
let halfTime;
//min and max times a mole will remain up
let moleMinTime;
let moleMaxTime;
//game screen's background image
let bgImage;
let img;

init();

//Sets the base values for the game, adds event listeners, and starts the game loop
function init() {
    gameState = "Start";
    fillMoles();
    createButtons();
    currentScore = 0;
    highScore = 0;
    timeLimit = 20;
    halfTime = false;
    bgImage = new Image();
    bgImage.src = "media/mainImg.jpg";
    img = new Image();
    img.src="media/pray.jpg";
    ctx.shadowColor = "black";
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.shadowBlur = blur;
    canvas.addEventListener("mousedown", checkMole, false);
    canvas.addEventListener("mousedown", checkButton, false);
    loop();
}

//initializes mole objects in array with status and location
function fillMoles() {
    var counter = 0;
    for (var x = 0; x < 3; x++) {
        for (var y = 0; y < 3; y++) {
            moles = moles.concat(new Mole("", "dead", 120 + 250 * x, 100 + 180 * y, 70, 70, counter, 0, null));
            counter++;
        }
    }
}

//initializes canvas buttons with text and location
function createButtons() {
    buttons = buttons.concat(new Button("Start Game", canvas.width / 2, canvas.height / 2 + 50, 90, 30));
    buttons = buttons.concat(new Button("Reset", canvas.width / 2, canvas.height - 15, 50, 25));
    buttons = buttons.concat(new Button("Retry", canvas.width / 2, canvas.height / 2 + 75, 50, 30));
    buttons = buttons.concat(new Button("Easy", canvas.width / 2 - 200, canvas.height / 2 + 125, 40, 30));
    buttons = buttons.concat(new Button("Normal", canvas.width / 2, canvas.height / 2 + 125, 60, 30));
    buttons = buttons.concat(new Button("Hard", canvas.width / 2 + 200, canvas.height / 2 + 125, 40, 30));
}

//detects if a mole has been clicked on the canvas, whacks it if it's visible/alive
function checkMole(e) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    var x = (e.clientX - rect.left) * scaleY;
    var y = (e.clientY - rect.top) * scaleY;
    for (var i = 0; i < moles.length; i++) {
        if ((x >= moles[i].xPos - 20 && x <= (moles[i].xPos + moles[i].width + 20)) && (y >= moles[i].yPos - 20 && y <= (moles[i].yPos + moles[i].height + 20))) {
            if (moles[i].statusText == "alive") {
                whackMole(i);
            }
        }
    }
}

//detects if a button has been clicked on the canvas
function checkButton(e) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    var x = (e.clientX - rect.left) * scaleY;
    var y = (e.clientY - rect.top) * scaleY;
    for (var i = 0; i < buttons.length; i++) {
        //ensures buttons on different game states are not clicked when they're invisible
        if ((x >= (buttons[i].xPos - buttons[i].width) && x <= (buttons[i].xPos + buttons[i].width)) && (y >= (buttons[i].yPos - buttons[i].height) && y <= (buttons[i].yPos))) {
            if (gameState == "Start" && buttons[i].text == "Start Game") {
                changeGameState("Instructions");
            }
            else if (gameState == "Instructions") {
                if (buttons[i].text == "Easy") {
                    moleMinTime = 2.0;
                    moleMaxTime = 3.0;
                    changeGameState("Play");
                }
                if (buttons[i].text == "Normal") {
                    moleMinTime = 1.0;
                    moleMaxTime = 2.0;
                    changeGameState("Play");
                }
                if (buttons[i].text == "Hard") {
                    moleMinTime = 0.5;
                    moleMaxTime = 1.0;
                    changeGameState("Play");
                }
            }
            else if (gameState == "Play" && buttons[i].text == "Reset") {
                changeGameState("Play");
            }
            else if (gameState == "Game Over" && buttons[i].text == "Retry") {
                changeGameState("Instructions");
            }
        }
    }
}

//render the clicked mole invisible/dead and add to the player's score
function whackMole(index) {
    moles[index].statusPic.src = "";
    moles[index].statusText = "dead";
    //only add points if the mole hasn't disappeared due to their timer interval expiring
    if (moles[index].interval != null) {
        currentScore += 1;
        endMoleInterval(index);
    }
}

//display a mole and give them a random time limit to stay up before dissapearing
function reviveMole(index) {
    moles[index].statusPic.src = "media/tp.png";
    moles[index].statusText = "alive";
    moles[index].timeUp = getRandomDouble(moleMinTime, moleMaxTime);
    startMoleInterval(index);
}

//reset the status and timers of every mole and reset the interval to display moles
function resetGame() {
    for (var i = 0; i < moles.length; i++) {
        whackMole(i);
        currentScore = 0;
    }
    window.clearInterval(raiseMoleInterval1);
    window.clearInterval(raiseMoleInterval2);
    halfTime = false;
    raiseMoleInterval1 = window.setInterval("reviveMole(getRandomDeadMole())", 1000);
    startTime = performance.now();
    bgImage.src = "media/shelves.jpg";
}

//returns a random int including min, excluding max
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

//returns a random double including min, excluding max
function getRandomDouble(min, max) {
    return Math.random() * (max - min) + min;
}

//elapses game time. returns the time left to play, and ends the game once time reaches 0
function checkTimer(timestamp) {
    let elapsedTime = (timestamp - startTime) / 1000;
    let timeRemaining;
    if (gameState == "Play") {
        timeRemaining = Math.ceil(timeLimit - elapsedTime);
        //add more moles at a time after half the time has elapsed
        if (halfTime == false) {
            if (timeRemaining < (timeLimit / 2)) {
                halfTime = true;
                raiseMoleInterval2 = window.setInterval("reviveMole(getRandomDeadMole())", 500);
            }
        }
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

//draws text to the canvas
function fillText(string, x, y, css, color) {
    ctx.save();
    ctx.font = css;
    ctx.fillStyle = color;
    ctx.fillText(string, x, y);
    ctx.restore();
}

//starts timer on a mole to disappear after n seconds
function startMoleInterval(index) {
    moles[index].interval = window.setInterval(function () { endMoleInterval(index); }, moles[index].timeUp * 1000);
}

//ends disappearing timer on a mole
function endMoleInterval(index) {
    window.clearInterval(moles[index].interval);
    moles[index].interval = null;
    whackMole(index);
}

//finds all invisible/dead moles and returns the index for a random dead mole
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

//changes the game state, and thus the canvas elements displayed
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
        window.clearInterval(raiseMoleInterval1);
        window.clearInterval(raiseMoleInterval2);
        bgImage.src = "media/mainImg.jpg";
    }
}

//the main game loop that handles game logic as well as text displayed based on current game state
function loop(timestamp) {
    ctx.save();
    requestAnimationFrame(loop);
    if (!startTime) {
        startTime = timestamp;
    }
    //background canvas
    ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
    switch (gameState) {
        //Start Screen
        case "Start":
            ctx.textAlign = "center";
            fillText("Whack A Mole", canvas.width / 2, canvas.height / 2 - 100, "50pt Times New Roman", "black");
            fillText("Pandemic Edition", canvas.width / 2, canvas.height / 2 - 50, "italic 35pt Times New Roman", "black");
            fillText(buttons[0].text, buttons[0].xPos, buttons[0].yPos, "30pt Times New Roman", "black");
            fillText("A Game by Sean Mack", canvas.width / 2, canvas.height - 50, "30pt Times New Roman", "black");
            ctx.drawImage(img,canvas.width/2+200,canvas.height-85,50,50);
            break;
        //Instructions Screen
        case "Instructions":
            ctx.textAlign = "center";
            fillText("A mysterious illness has taken over your town.", canvas.width / 2, 160, "18pt Times New Roman", "black");
            fillText("Rumors have spread that the virus gives it's victims the runs.", canvas.width / 2, 200, "18pt Times New Roman", "black");
            fillText("Hundreds have rushed to your local supermarket to buy all the toilet paper!", canvas.width / 2, 240, "18pt Times New Roman", "black");
            fillText("Click on a roll before the other customers whisk them away.", canvas.width / 2, 280, "18pt Times New Roman", "black");
            ctx.textAlign = "none";
            fillText(buttons[3].text, buttons[3].xPos, buttons[3].yPos, "30pt Times New Roman", "black");
            fillText(buttons[4].text, buttons[4].xPos, buttons[4].yPos, "30pt Times New Roman", "black");
            fillText(buttons[5].text, buttons[5].xPos, buttons[5].yPos, "30pt Times New Roman", "black");
            break;
        //Game Screen
        case "Play":
            ctx.textAlign = "center";
            fillText(buttons[1].text, buttons[1].xPos, buttons[1].yPos, "30pt Times New Roman", "black");
            for (var i = 0; i < moles.length; i++) {
                ctx.drawImage(moles[i].statusPic, moles[i].xPos, moles[i].yPos, moles[i].width, moles[i].height);
            }
            displayTime = checkTimer(timestamp);
            ctx.textAlign = "none";
            //display time left
            fillText("Time: " + displayTime, 80, 50, "30pt Times New Roman", "black");
            //display score
            fillText("Score: " + currentScore, canvas.width - 80, 50, "30pt Times New Roman", "black");
            break;
        //Game Over Screen
        case "Game Over":
            ctx.textAlign = "center";
            fillText("Game Over", canvas.width / 2, canvas.height / 2, "50pt Times New Roman", "black");
            fillText(buttons[2].text, buttons[2].xPos, buttons[2].yPos, "30pt Times New Roman", "black");
            //display score
            fillText("Your Score: " + currentScore, canvas.width / 2 - 200, 50, "30pt Times New Roman", "black");
            //display high score
            fillText("High Score: " + highScore, canvas.width / 2 + 200, 50, "30pt Times New Roman", "black");
            break;
    }
    ctx.restore();
}
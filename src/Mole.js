function Mole(statusPic, statusText, xPos, yPos, width, height, index, timeUp, interval) {
    //src image the mole will display
    this.statusPic = new Image();
    this.statusPic.src = statusPic;
    //string for the mole's status ("alive" or "dead")
    this.statusText = statusText;
    this.xPos = xPos;
    this.yPos = yPos;
    this.width = width;
    this.height = height;
    //moles index in the moles[] array in main.js
    this.index = index;
    //moles time to remain visible on screen if it's alive
    this.timeUp = timeUp;
    //time interval to remain visible
    this.interval = interval;
}
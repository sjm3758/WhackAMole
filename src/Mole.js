function Mole(statusPic, statusText, xPos, yPos, width, height, index, timeUp, interval) {
    this.statusPic = new Image();
    this.statusPic.src = statusPic;
    this.statusText = statusText;
    this.xPos = xPos;
    this.yPos = yPos;
    this.width = width;
    this.height = height;
    this.index = index;
    this.timeUp = timeUp;
    this.interval = interval;
}
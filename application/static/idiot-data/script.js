var width = screen.width / 6;
var height = width * (3/4);

var screenWidth = screen.width;
var screenHeight = screen.height;

function recreateWindow(numberOfWindows) {
    for (var i = 0; i < numberOfWindows; i++) {
        window.open(location.protocol+'//'+location.host+location.pathname + '?child', '_blank', 'width=' + width + ',height=' + height);
    }
}

function getPos() {
    return [window.screenX, window.screenY];
}

var dX = 5;
var dY = 5;
var xPos = getPos()[0];
var yPos = getPos()[1];

function playBall() {
     if (xPos > screenWidth - 175){
         dX = Math.ceil(-6 * Math.random()) * 5 - 10
     }

     if (xPos < 0) {
         dX = Math.ceil(7 * Math.random()) * 5 - 10;
     }
     if (yPos > screenHeight - 100) {
         dY = Math.ceil(-6 * Math.random()) * 5 - 10;
     }
     if (yPos < 0) {
         dY = Math.ceil(7 * Math.random()) * 5 - 10;
     }

     xPos += dX;
     yPos += dY;
     window.moveTo(xPos,yPos);
     setTimeout(playBall,10);
}

window.onload = () => {
    if (location.search.includes('child')) {
        setTimeout(playBall, 100);
    } else
        recreateWindow(1);
}

onbeforeunload = function(event) {
     recreateWindow(1);
     return true;
};

function setupVariables() {
    window.paused = false;

    window. fps = 10;
    window. tileSize = Math.floor(Math.min(window.innerWidth, window.innerHeight) / 20);

    window.posX = posY = 0;

    window.fieldX = Math.floor(window.innerWidth / tileSize);
    window.fieldY = Math.floor(window.innerHeight / tileSize);

    window.appleX = appleY = 0;

    window.velocityX = window.velocityY = 0;
    window.tailLength = window.initialLength = 1;

    window.trail = [];
}

var mappings = ['swipeleft', 'swipeup', 'swiperight', 'swipedown'];

function initJQuery() {
    var supportTouch = $.support.touch,
            scrollEvent = "touchmove scroll",
            touchStartEvent = supportTouch ? "touchstart" : "mousedown",
            touchStopEvent = supportTouch ? "touchend" : "mouseup",
            touchMoveEvent = supportTouch ? "touchmove" : "mousemove";
    $.event.special.swipeupdown = {
        setup: function() {
            var thisObject = this;
            var $this = $(thisObject);
            $this.bind(touchStartEvent, function(event) {
                var data = event.originalEvent.touches ?
                        event.originalEvent.touches[ 0 ] :
                        event,
                        start = {
                            time: (new Date).getTime(),
                            coords: [ data.pageX, data.pageY ],
                            origin: $(event.target)
                        },
                        stop;

                function moveHandler(event) {
                    if (!start) {
                        return;
                    }
                    var data = event.originalEvent.touches ?
                            event.originalEvent.touches[ 0 ] :
                            event;
                    stop = {
                        time: (new Date).getTime(),
                        coords: [ data.pageX, data.pageY ]
                    };

                    // prevent scrolling
                    if (Math.abs(start.coords[1] - stop.coords[1]) > 10) {
                        event.preventDefault();
                    }
                }
                $this
                        .bind(touchMoveEvent, moveHandler)
                        .one(touchStopEvent, function(event) {
                    $this.unbind(touchMoveEvent, moveHandler);
                    if (start && stop) {
                        if (stop.time - start.time < 1000 &&
                                Math.abs(start.coords[1] - stop.coords[1]) > 30 &&
                                Math.abs(start.coords[0] - stop.coords[0]) < 75) {
                            start.origin
                                    .trigger("swipeupdown")
                                    .trigger(start.coords[1] > stop.coords[1] ? "swipeup" : "swipedown");
                        }
                    }
                    start = stop = undefined;
                });
            });
        }
    };
    $.each({
        swipedown: "swipeupdown",
        swipeup: "swipeupdown"
    }, function(event, sourceEvent){
        $.event.special[event] = {
            setup: function(){
                $(this).bind(sourceEvent, $.noop);
            }
        };
    });

}

function onKeyDown(event) {
    switch(event.keyCode) {
        case 27:
            paused = !paused;
            break;
        case 37:
            velocityX = -1;
            velocityY = 0;
            break;
        case 38:
            velocityX = 0;
            velocityY = -1;
            break;
        case 39:
            velocityX = 1;
            velocityY = 0;
            break;
        case 40:
            velocityX = 0;
            velocityY = 1;
            break;
    }
}

function isAppleSpotValid(x, y) {
    for (var z of trail) {
        if (z.x == x || z.y == y) return false;
    }

    return true;
}

function moveApple() {
    for (var i = 0; i < fieldX * fieldY; i++) {
        testAppleX = Math.floor(Math.random() * fieldX);
        testAppleY = Math.floor(Math.random() * fieldY);
        if (isAppleSpotValid(testAppleX, testAppleY)) {
            appleX = testAppleX;
            appleY = testAppleY;
            return;
        }
    }
}

function resetGame() {
    velocityX = velocityY = 0;
    posX = posY = 10;
    tailLength = initialLength;
    trail = [];
    moveApple();
}

function checkHitWall() {
    if (posX < 0 || posX > fieldX - 1 || posY < 0 || posY > fieldY - 1) {
        resetGame();
        return true;
    }
    return false;
}

function checkEatApple() {
    if (posX == appleX && posY == appleY) {
        moveApple();
        tailLength++;
    }
}

function checkHitSelf() {
    if (velocityX == 0 && velocityY == 0) return;

    for (var z of trail) {
        if (posX == z.x && posY == z.y) {
            resetGame();
            return true;
        }
    };
    return false;
}

function paint(canvas, context) {
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = 'green';

    for (var z of trail) {
        context.fillRect(z.x * tileSize, z.y * tileSize, tileSize - 2, tileSize - 2);
    }
    context.fillStyle = 'blue';
    context.fillRect(posX * tileSize, posY * tileSize, tileSize - 2, tileSize - 2);

    context.fillStyle = 'red';
    context.fillRect(appleX * tileSize, appleY * tileSize, tileSize - 2, tileSize - 2);

    context.font = '30px sans-serif';
    context.strokeStyle = 'white';
    context.fillStyle = 'white';
    context.fillText('Score: ' + (tailLength - initialLength), 10, 35);
}

function gameTick(canvas, context) {

    if (paused) return;

    posX += velocityX;
    posY += velocityY;

    if (checkHitWall() || checkHitSelf()) {
        paused = true;
        setTimeout(() => {paused = false;}, 1000);
        return;
    }

    checkEatApple();

    trail.push({x: posX, y: posY});
    while (trail.length > tailLength) {
        trail.shift();
    }

    paint(canvas, context);
}

window.addEventListener('load', () => {
    document.body.webkitRequestFullscreen();

    setupVariables();

    document.addEventListener('keydown', onKeyDown);

    var canvas = document.getElementById('canvas');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    var context = canvas.getContext('2d');

    setInterval(gameTick.bind(this, canvas, context), 1000 / fps);

    resetGame();

    if (navigator.userAgent.toLowerCase().includes('mobile')) {
        initJQuery();

        mappings.forEach((name, index) => {
            $(document).on(name, () => {
                onKeyDown({keyCode: 37 + index});
            });
        });
    }

});

function getFoodDistances() {
    var distances = [];

    //left
    if (appleY == posY && posX - appleX > 0) distances.push(posX - appleX); else distances.push(-1);

    //right
    if (appleY == posY && appleX - posX > 0) distances.push(appleX - posX); else distances.push(-1);

    //up
    if (appleX == posX && posY - appleY > 0) distances.push(posY - appleY); else distances.push(-1);

    //down
    if (appleX == posX && appleY - posY > 0) distances.push(appleY - posY); else distances.push(-1);

    return distances;
}

function getWallDistances() {
    var distances = [];

    //left
    distances.push(posX);

    //right
    distances.push(fieldX - posX - 1);

    //up
    distances.push(posY);

    //down
    distances.push(fieldY - posY - 1);

    return distances.map(Math.floor);
}

function getBodyDistance() {
    var distances = [];
    var done = false;

    //left
    for (var xx = posX - 1; xx >= 0; xx--) {
        for (var z of trail) {
            if (z.x == xx && z.y == posY && !done) {
                distances.push(posX - z.x);
                done = true;
            }
        }
    }
    if (!done) distances.push(-1);
    done = false;

    //right
    for (var xx = posX + 1; xx <= fieldX; xx++) {
        for (var z of trail) {
            if (z.x == xx && z.y == posY && !done) {
                distances.push(z.x - posX);
                done = true;
            }
        }
    }
    if (!done) distances.push(-1);
    done = false;

    //up
    for (var yy = posY - 1; yy >= 0; yy--) {
        for (var z of trail) {
            if (z.y == yy && z.x == posX && !done) {
                distances.push(posY - z.y);
                done = true;
            }
        }
    }
    if (!done) distances.push(-1);
    done = false;

    //down
    for (var yy = posY + 1; yy <= fieldY; yy++) {
        for (var z of trail) {
            if (z.y == yy && z.x == posX && !done) {
                distances.push(z.y - posY);
                done = true;
            }
        }
    }
    if (!done) distances.push(-1);

    return distances;
}

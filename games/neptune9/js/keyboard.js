"use strict";

//global
if (typeof KeyEvent == "undefined") {
    var KeyEvent = {
        DOM_VK_LEFT: 37,
        DOM_VK_UP: 38,
        DOM_VK_RIGHT: 39,
        DOM_VK_DOWN: 40,

        DOM_VK_W: 87,
        DOM_VK_A: 65,
        DOM_VK_S: 83,
        DOM_VK_D: 68
    }
}

define(function () {
    function Keyboard() {

        var keysDown = {};
        var keysHit = {};

        window.addEventListener("keydown", function (e) {
            if (!keysDown[e.keyCode]) { //ignore repeated triggering of keyhit when key is held down
                keysDown[e.keyCode] = true;
                keysHit[e.keyCode] = true;
            }
            switch(e.keyCode) {
                case KeyEvent.DOM_VK_DOWN:
                case KeyEvent.DOM_VK_UP:
                case KeyEvent.DOM_VK_RIGHT:
                case KeyEvent.DOM_VK_LEFT:
                e.preventDefault();
                break;
            }
        }, false);
        window.addEventListener("keyup", function (e) {
            delete keysDown[e.keyCode];
        }, false);

        this.isKeyDown = function (keyCode) {
            return keysDown[keyCode];
        }

        this.isKeyHit = function (keyCode) {
            return keysHit[keyCode];
        }

        this.update = function () {
            keysHit = {};
        }

    };
    return Keyboard;
});
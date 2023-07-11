"use strict"

//DOM stuff
var canvas = document.querySelector(".gameCanvas")
var ctx = canvas.getContext('2d')
ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;
var width = canvas.width
var height = canvas.height

var portrait = (height > width)
if (portrait) {
	canvas.classList.add("portrait")
} else {
	canvas.classList.add("landscape")
}

var loaded = false

var spriteImage = new Image()
spriteImage.src = 'sprites.png'
spriteImage.addEventListener('load', function() {
  loaded = true
}, false)

//configurable constants
var scale = 2
var clickMode = true //or holdmode
var controlPanelHeight = 176
var gameHeight = height - controlPanelHeight

function tick() {
  if (loaded) {
  	tickGame()
  }
	window.requestAnimationFrame(tick)
}
window.requestAnimationFrame(tick)

function tickGame() {
	update()
	draw()
}

if (clickMode) {
	canvas.addEventListener("click", function (e) {
		var mouse = {x:event.offsetX, y:event.offsetY}
		//scale to lofi scale
		mouse.x = Math.floor(mouse.x * width / canvas.offsetWidth)
		mouse.y = Math.floor(mouse.y * height / canvas.offsetHeight)
		
		//update buttons
		btns.forEach(function (btn) {
			if (mouse.x >= btn.x && mouse.y > btn.y
				&& mouse.x < btn.x + btn.width
				&& mouse.y < btn.y + btn.height) {
				buttonPressed(btn)
			}
		})
		if (mouse.x < width && mouse.y < gameHeight) gameClicked(mouse)
	})
} else { //hold mode
	canvas.addEventListener("mousedown", mouseDown)
	canvas.addEventListener("touchstart", mouseDown)

	function mouseDown (e) {
		e.preventDefault()
		var mouse = e.touches ? {x:e.touches[0].clientX, y:e.touches[0].clientY} : {x:e.offsetX, y:e.offsetY}
		//scale to lofi scale
		mouse.x = Math.floor(mouse.x * width / canvas.offsetWidth)
		mouse.y = Math.floor(mouse.y * height / canvas.offsetHeight)
		btns.forEach(function (btn) {
			if (mouse.x >= btn.x && mouse.y > btn.y
				&& mouse.x < btn.x + btn.width
				&& mouse.y < btn.y + btn.height) {
				btn.down = true
			}
		})
	}

	canvas.addEventListener("mouseup", mouseUp)
	canvas.addEventListener("mouseout", mouseUp)
	canvas.addEventListener("touchend", mouseUp)

	function mouseUp (e) {
		e.preventDefault()
		btns.forEach(b => b.down = false)
	}
}

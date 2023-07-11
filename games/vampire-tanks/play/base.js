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

//constants
var scale = 2
var controlPanelheight = 150
var gameHeight = height - controlPanelheight

function tick() {
  if (loaded) {
  	tickGame()
  }
	window.requestAnimationFrame(tick)
}
window.requestAnimationFrame(tick)

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

function tickGame() {
	update()
	draw()
}

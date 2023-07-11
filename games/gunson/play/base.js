"use strict"

//configurable constants
var scale = 2
var clickMode = false
var fixedSize = true //if false, you must implement resizeGame()
var controlPanelHeight = 80

//you must implement
//update(), draw()
//maybe: resizeGame(), buttonPressed(action),

//DOM stuff
var canvas = document.querySelector(".gameCanvas")
var ctx = canvas.getContext('2d')
ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;
var width = canvas.width
var height = canvas.height
var gameHeight = height - controlPanelHeight
var mouse = {x:0,y:0,buttons:0} //position on canvas
var mouseClicks = 0 //clicks since last frame
if (!fixedSize) {
	function resize () {
		canvas.width = width = window.innerWidth
		canvas.height = height = window.innerHeight
		gameHeight = height - controlPanelHeight
		resizeGame()
	}
	window.addEventListener("resize", resize)
	resize()
} else {
	var portrait = (height > width)
	if (portrait) {
		canvas.classList.add("portrait")
	} else {
		canvas.classList.add("landscape")
	}	
}

function tick() {
  tickGame()
  window.requestAnimationFrame(tick)
}

function tickGame() {
	update()
	draw()
	mouseClicks = 0
}

function getMouseXYFromEvent(e) {
	var tempMouse = {x:event.offsetX, y:event.offsetY}
	//scale to lofi scale
	tempMouse.x = Math.floor(tempMouse.x * width / canvas.offsetWidth)
	tempMouse.y = Math.floor(tempMouse.y * height / canvas.offsetHeight)	
	return tempMouse
}

if (clickMode) {
	canvas.addEventListener("click", function (e) {
		mouse = getMouseXYFromEvent(e)
		mouse.buttons = e.buttons
		//update buttons
		btns.forEach(function (btn) {
			if (btn.visible !== false && mouse.x >= btn.x && mouse.y > btn.y
				&& mouse.x < btn.x + btn.width
				&& mouse.y < btn.y + btn.height) {
				buttonPressed(btn.action)
			}
		})
		if (mouse.x < width && mouse.y < gameHeight) gameClicked(mouse)
	})
} else { //hold mode
	canvas.addEventListener("mousedown", mouseDown)
	canvas.addEventListener("touchstart", mouseDown)

	function mouseDown (e) {
		e.preventDefault()
		mouse = e.touches ? {x:e.touches[0].clientX, y:e.touches[0].clientY} : {x:e.offsetX, y:e.offsetY}
		//scale to lofi scale
		mouse.x = Math.floor(mouse.x * width / canvas.offsetWidth)
		mouse.y = Math.floor(mouse.y * height / canvas.offsetHeight)
		mouse.buttons = e.buttons
		if (mouse.buttons > 0) mouseClicks++
		btns.forEach(function (btn) {
			if (btn.visible !== false && mouse.x >= btn.x && mouse.y > btn.y
				&& mouse.x < btn.x + btn.width
				&& mouse.y < btn.y + btn.height) {
				if (!btn.down && btn.action !== undefined) {
					buttonPressed(btn.action)
				}
				btn.down = true
			}
		})

		canvas.addEventListener("mousemove", function (e) {
			mouse = getMouseXYFromEvent(e)
			mouse.buttons = e.buttons
			e.preventDefault()
		})
	}

	canvas.addEventListener("mouseup", mouseUp)
	canvas.addEventListener("mouseout", mouseUp)
	canvas.addEventListener("touchend", mouseUp)

	function mouseUp (e) {
		mouse.buttons = e.buttons
		e.preventDefault()
		btns.forEach(b => b.down = false)
	}
}

function drawButton(btn) {
	if (btn.visible===false) return
	if (btn.down) {
		ctx.fillStyle = '#0094FF'
	} else {
		ctx.fillStyle = '#ccc'
	}
	ctx.fillRect(btn.x, btn.y, btn.width, btn.height)
	ctx.fillStyle = "black"
	if (btn.text.length === 1) {
		ctx.font = "99px monospace"
	} else {
		ctx.font = "60px monospace"
	}
	ctx.textAlign = "center"
	ctx.textBaseline = "top"
	ctx.fillText(btn.text, btn.x+btn.width/2, btn.y)
}

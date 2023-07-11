"use strict"

//DOM stuff
var canvas = document.querySelector(".gameCanvas")
var ctx = canvas.getContext('2d')
ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;
var width = canvas.width
var height = canvas.height

var loaded = false

var spriteImage = new Image()
spriteImage.src = 'sprites.png'
spriteImage.addEventListener('load', function() {
  loaded = true
}, false)

//constants
var scale = 2
var gameHeight = width //force to square

var margin = 40
var buttonWidth = (width - margin * 4) / 2
var buttonHeight = 100

function tick() {
  if (loaded) {
  	tickGame()
  }
	window.requestAnimationFrame(tick)
}
window.requestAnimationFrame(tick)

function drawSprite(sprite, x, y) {
	var center = laneCount / 2
	var yScaleFactor = y / 1000
	y *= yScaleFactor
	x -= center
	var scaleFactor = y / 1000
	x = ((x+0.5) * width / laneCount) * scaleFactor
	x += center * width / laneCount
	
	y = y * (gameHeight - horizon) / 1000 + horizon
	ctx.translate(x, y)
	ctx.drawImage(spriteImage, 
		sprite.x, sprite.y, 
		sprite.width, sprite.height,
	  -sprite.width*scale*scaleFactor/2, -sprite.height*scale*scaleFactor/2,
	 sprite.width*scale*scaleFactor, sprite.height*scale*scaleFactor)
	ctx.translate(-x, -y)	
}

var buttons = []
for (var i = 0; i < 2; i++) {
	buttons.push({
		index: i,
		x: margin + i * (width - margin * 2) / 2,
		y: height-buttonHeight-margin,
		width:buttonWidth,
		height:buttonHeight
	})
}
buttons[0].action = "left"
buttons[1].action = "right"
buttons[0].text = "<"
buttons[1].text = ">"

canvas.addEventListener("click", function (event) {
	event.preventDefault()
	var mouse = {x:event.offsetX, y:event.offsetY}
	//scale to lofi scale
	mouse.x = Math.floor(mouse.x * width / canvas.offsetWidth)
	mouse.y = Math.floor(mouse.y * height / canvas.offsetHeight)
	buttons.forEach(function (btn) {
		if (mouse.x >= btn.x && mouse.y > btn.y
			&& mouse.x < btn.x + btn.width
			&& mouse.y < btn.y + btn.height) {
			playerAction(btn.action)
		}
	})
})

document.addEventListener('keydown', (event) => {
    if (event.keyCode == 37) {
    	playerAction("left")
    }
    if (event.keyCode == 39) {
    	playerAction("right")
    }
})


//sprites
var carSprite = {x:1, y:1, width:54, height: 35}
var rockSprite = {x:64, y:1, width:44, height: 36}
var decoSprites = []
decoSprites.push({x:114, y:10, width:19, height: 26})
decoSprites.push({x:139, y:9, width:26, height: 30})
decoSprites.push({x:175, y:15, width:13, height: 18})
decoSprites.push({x:192, y:8, width:19, height: 16})

// Game stuff
var state = "game"
var laneCount = 4
var horizon = gameHeight / 4
var speed = 5
var rocks = []
var rockTimer = 0
var nextRock = 600
var car = {x:0, y:900}
var distance = 0
addRock(); addRock();

function addRock() {
	rocks.push({x:Math.floor(Math.random()*4), y:Math.floor(Math.random()*100)})
	if (Math.random() > 0.95 && distance > 1) {
		rocks.push({x:3.6 + Math.random(), y:Math.random()*200, deco:Math.floor(Math.random()*decoSprites.length)})
	}
}

function tickGame() {
	if (state === "game") {
		speed = Math.max(5, 5 + Math.floor(distance * 4))

		distance += speed * (100/5/60/60/60)
		rocks.forEach(function (r) {
			r.y += speed
			if (r.deco === undefined && car.x === Math.floor(r.x) && r.y > car.y && r.y < car.y + speed ) {
				state = "crash"
			}
		})
		rocks = rocks.filter(r => r.y < 1300)
		rockTimer+=speed
		if (rockTimer >= nextRock) {
			rockTimer = 0
			addRock()
			nextRock = Math.max(nextRock-75, 150)
		}
	}
	draw()
}

function playerAction(action) {
	if (state != "game") return
	if (action === "left" && car.x > 0) car.x--
	if (action === "right" && car.x < laneCount-1) car.x++
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	//background
	ctx.fillStyle = "#aaf" //sky
	ctx.fillRect(0, 0, width, horizon)
	ctx.fillStyle = "#faf" //sand
	ctx.fillRect(0, horizon, width, gameHeight-horizon)
	ctx.fillStyle = "#88f" //ocean
	ctx.beginPath()
	ctx.moveTo(0,horizon)
	ctx.lineTo(width/2, horizon)
	ctx.lineTo(-60,gameHeight)
	ctx.fill()

	//lanes
	ctx.lineWidth = 2
	ctx.strokeStyle = "white"
	ctx.beginPath()
	for (var lane=0;lane<laneCount+1; lane++) {
		ctx.moveTo(width/2, horizon)
		ctx.lineTo(width/laneCount*lane, gameHeight)
		
	}
	ctx.stroke()

	rocks.forEach(function (r) {
		if (r.deco != undefined) {
			drawSprite(decoSprites[r.deco], r.x, r.y)
		} else {
			drawSprite(rockSprite, r.x, r.y)
		}
	})

	drawSprite(carSprite, car.x, car.y)

	ctx.fillStyle = "#333" //control panel
	ctx.fillRect(0, gameHeight, width, height-gameHeight)
	drawButton(buttons[0])
	drawButton(buttons[1])

	ctx.font = "40px monospace"
	ctx.textAlign = "center"
	ctx.fillStyle = "white"
	ctx.strokeStyle = "white"
	ctx.lineWidth = 1
	ctx.fillText(distanceRounded() + " km", width / 2, height - (height - gameHeight) * 0.7)
	ctx.fillText("90 Mile Beach", width / 2, horizon / 2)
}

function distanceRounded() {
	if (distance < 0.01) return 0
	var out = "" + (Math.floor(distance * 100) / 100)
	while (out.length < 4) out += "0"
	return out
}

function drawButton(btn) {
	ctx.font = "40px monospace"
	ctx.textAlign = "center"
	ctx.fillStyle = '#0094FF'
	ctx.fillRect(btn.x, btn.y, btn.width, btn.height)
	ctx.fillStyle = "white"
	ctx.fillText(btn.text, btn.x + btn.width/2, btn.y + btn.height/2)
}

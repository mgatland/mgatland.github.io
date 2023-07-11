"use strict"

//45 minutes

var gridSize = 32
var gridXLength = width / gridSize
var gridYLength = gameHeight / gridSize
var btns = []

//resetted
var score = 0
var snake = []
var shed = []
var apple
var length = 0
var dir = dirLeft
var timer = 0
var dead

var dirUp = {x:0,y:-1}
var dirDown = {x:0,y:1}
var dirRight = {x:1,y:0}
var dirLeft = {x:-1,y:0}
var dirs = [dirUp, dirDown, dirRight, dirLeft]



function gameClicked () {}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#333"
	ctx.fillRect(0, 0, width, gameHeight)

	drawGrid()

	shed.forEach(drawShed)
	snake.forEach(drawSnake)
	drawCell(apple, "pink")

	//hud
	ctx.fillStyle = "#2c77cc"
	ctx.fillRect(0, gameHeight, width, height-gameHeight)

	ctx.fillStyle = "black"
	ctx.font = "30px monospace"
	ctx.fillText("Score: " + score, 30, gameHeight + 30)
	ctx.fillText("Use arrow keys: ", 30, gameHeight + 70)
	ctx.fillText("No touch sorry :(", 30, gameHeight + 100)
}

function drawSnake(bit) {
	drawCell(bit, dead ? "red":"lightgreen")
}

function drawShed(bit) {
	drawCell(bit, "green")
}

function drawCell(cell, color) {
	ctx.fillStyle = color
	ctx.fillRect(cell.x*gridSize, cell.y*gridSize,
		gridSize,gridSize)
}

function drawGrid() {
	//draw grid
	ctx.strokeStyle = 'grey'
	ctx.lineWidth = 2
	ctx.beginPath();
	for (var x = 0; x < gridXLength + 1; x++) {
		ctx.moveTo(x*width / gridXLength, 0)
		ctx.lineTo(x*width / gridXLength, gameHeight)
	}
	for (var y = 0; y < gridYLength + 1; y++) {
		ctx.moveTo(0, y*gameHeight / gridYLength)
		ctx.lineTo(width, y*gameHeight / gridYLength)
	}
	ctx.stroke()
}

function start() {
	score = 0
	snake = [{x:Math.floor(width/gridSize/2),y:2}]
	shed = []
	length = 9
	dir = dirDown
	timer = 0
	dead = false
	placeApple()
}

function placeApple() {
	var ok = false
	while (!ok) {
		var x = Math.floor(Math.random() * gridXLength)
		var y = Math.floor(Math.random() * gridYLength)
		apple = {x:x, y:y}
		ok = isEmpty(apple)
	}
}

function update() {
	if (dead) return
	timer++
	if (timer === 7) {
		var x = snake[0].x + dir.x
		var y = snake[0].y + dir.y
		if (x < 0) x += gridXLength
		if (x >= gridXLength) x -= gridXLength
		if (y < 0) y += gridYLength
		if (y >= gridYLength) y -= gridYLength

		if (!isEmpty({x:x,y:y})) {
			dead = true
		}
		snake.unshift({x:x,y:y})
		if (length === 0) {
			snake.pop()	
		} else {
			length--
		}

		if (apple.x===x&&apple.y===y) {
			shedTail()
			placeApple()
			score++
		}

		timer = 0
	}
}

function shedTail() {
	snake.forEach(cell => shed.push(cell))
}

function isEmpty(gridPos) {
	return !snake.some(t => t.x === gridPos.x && t.y === gridPos.y)
		&& !shed.some(t => t.x === gridPos.x && t.y === gridPos.y)
}

start()

function isSamePos(p1, p2) {
	return p1.x === p2.x && p1.y === p2.y
}

window.addEventListener("keydown", function (e) {
	switch (e.keyCode) {
		case 37: dir = dirLeft
		  break
		case 38: dir = dirUp
		  break
		case 39: dir = dirRight
		  break
		case 40: dir = dirDown
		  break
		}
})

"use strict"

//8:36 pm

var gridXSize = 40
var gridYSize = 60
var gridXLength = width / gridXSize
var gridYLength = gameHeight / gridYSize

var dirUp = {x:0,y:-1}
var dirDown = {x:0,y:1}
var dirRight = {x:1,y:0}
var dirLeft = {x:-1,y:0}
var dirs = [dirUp, dirDown, dirRight, dirLeft]

var btns = []
btns.push({x:40,y:gameHeight+20, width:80, height:120, text:"<", action:dirLeft})
btns.push({x:40+120,y:gameHeight+20, width:80, height:120, text:">", action:dirRight})
btns.push({x:40+120*2,y:gameHeight+20, width:80, height:120, text:"$", action:"shoot"})
btns.push({x:40+120*3,y:gameHeight+20, width:80, height:120, text:"."})

//game state
var dead
var score
var player
var enemies
var shots
var lives
var spawnTimer
var fx
var level

function gameClicked () {}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#333"
	ctx.fillRect(0, 0, width, gameHeight)

	drawGrid()

	ctx.font = "64px monospace"
	ctx.textBaseline = "top"
	drawCell(player, 'A', "green")
	enemies.forEach(drawEnemy)
	shots.forEach(drawShot)
	fx.forEach(drawFx)

	//hud
	ctx.fillStyle = "#2c77cc"
	ctx.fillRect(0, gameHeight, width, height-gameHeight)

	ctx.fillStyle = "black"
	ctx.font = "30px monospace"
	var textY = btns[0].y + btns[0].height + 0
	ctx.fillText("Score: " + score + " lives: " + lives + " use arrow keys", 10, textY)
	btns.forEach(drawButton)
}

function drawCell(cell, char, color) {
	ctx.fillStyle = color
	ctx.fillText(char, cell.x*gridXSize, cell.y*gridYSize-10)
}

function drawFx(e) {
	drawCell(e, e.char, e.color)
}

function drawEnemy(e) {
	if (e.type === 0) {
		drawCell(e, 'e', "red")
	} else if (e.type === 1) {
		drawCell(e, 'w', "red")
	}
}

function drawShot(e) {
	drawCell(e, '$', "lightgreen")
}

function drawButton(btn) {
	if (btn.down) {
		ctx.fillStyle = '#0094FF'
	} else {
		ctx.fillStyle = '#ccc'
	}
	ctx.fillRect(btn.x, btn.y, btn.width, btn.height)
	ctx.fillStyle = "black"
	ctx.font = "128px monospace"
	ctx.fillText(btn.text, btn.x+0, btn.y-20)
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
	lives = 10
	score = 0
	dead = false
	player = {x:Math.floor(gridXLength/2),y:gridYLength-1}
	enemies = []
	shots = []
	fx = []
	spawnTimer = 1
	level = 0	
}

var eSpawnFlipper = 0
function placeEnemy(type) {
	var ok = false
	while (!ok) {
		var x = Math.floor(Math.random() * gridXLength)
		var y = 0
		var enemy = {x:x, y:y, timer:eSpawnFlipper}
		ok = isEmpty(enemy)
	}
	enemy.type = type
	eSpawnFlipper = (eSpawnFlipper == 0) ? 1 : 0
	enemies.push(enemy)
}

function update() {
	//no op
}

function moveStuff() {
	if (dead) return

	fx.forEach(function (e) {
		e.life--

	})
	fx = fx.filter(e => e.life > 0)

	shots.forEach(function (s) {
		clearCell(s.x, s.y-1)
		s.y--
	})

	enemies.forEach(moveEnemy)
	enemies = enemies.filter(e => !e.dead)
	
	if (enemies.length === 0 && spawnTimer === null) {
		spawnTimer = 1
	}
	if (spawnTimer > 0) {
		level++
		spawnTimer--
		if (spawnTimer === 0) {
			spawnTimer = null
			score+= 10
			placeEnemy(0)
			placeEnemy(0)
			placeEnemy(level <=2 ? 0 : 1)
			//level 1 and 2: basic
		  //3 and 4 - one W
		  //5 and 6 - two Ws
			if (level >= 5) placeEnemy(1)
		}
	}

	if (lives <= 0) {
		lives = 0
		dead = true
	}
}

function isEmpty(gridPos) {
	return !enemies.some(t => t.x === gridPos.x && t.y === gridPos.y)
}

start()

function isSamePos(p1, p2) {
	return p1.x === p2.x && p1.y === p2.y
}

function collidesAny(gridPos, list) {
	return list.some(t => t.x === gridPos.x && t.y === gridPos.y)
}

window.addEventListener("keydown", function (e) {
	var dir = null
	switch (e.keyCode) {
		case 37: dir = (dirLeft)
		  break
		case 38: dir = "shoot" //up
		  break
		case 39: dir = (dirRight)
		  break
		case 40: dir = (dirDown)
		  break
		}
	if (dir) tryMove(dir)
})

function tryMove(dir) {
	if (dead) return
	if (dir === dirLeft || dir === dirRight) {
		player.x += dir.x
		player.y += dir.y
		moveIntoXBounds(player)
		clearCell(player.x, player.y)
	}
	if (dir === "shoot") {
		spawnShot(player.x, player.y)
	}
	moveStuff()
}

function moveEnemy(e) {
	if (e.timer === 0) {
		e.timer = 1
		if (e.type === 0) moveEnemyBasic(e)
		if (e.type === 1) moveEnemyW(e)
		if (e.y >= gridYLength) {
			lives--
			e.dead = true
			fx.push({x:e.x,y:e.y-1,char:'X',color:'red',life:1})
		}
		if (collidesAny(e, shots) || isSamePos(e, player)) {
			e.dead = true
			score++
		}
	} else {
		e.timer--
	}
}

function moveEnemyBasic(e) {
	e.y++
}

function moveEnemyW(e) {
	var safe = []
	for (var i = 0; i <= 2; i++) {
		safe[i] = true
		for (var y = e.y; y < gridYLength; y++) {
			safe[i] = safe[i] && !collidesAny({x:e.x-1+i,y:y},shots) 
		}
	}
	if (e.x === 0) safe[0] = false
	if (e.x === gridXLength - 1) safe[2] = false
	if (safe[1]) {
		e.y++
	} else if (safe[0]) {
		e.x--
	} else if (safe[2]) {
		e.x++
	} else {
		//sit still
	}
	moveIntoXBounds(e)
}

function moveIntoXBounds(e) {
	if (e.x < 0) e.x = 0
	if (e.x > gridXLength - 1) e.x = gridXLength - 1
}

function buttonPressed(action) {
	tryMove(action)
}

function spawnShot(x, y) {
	clearCell(x,y)
	shots.push({x:x, y:y})
}

function clearCell(x, y) {
	enemies = enemies.filter(e => e.x != x || e.y != y)
	shots = shots.filter(e => e.x != x || e.y != y)
	//if (player.x === x && player.y === y) dead = true
}

window.requestAnimationFrame(tick)
"use strict"

var dirUp = {x:0,y:-1}
var dirDown = {x:0,y:1}
var dirRight = {x:1,y:0}
var dirLeft = {x:-1,y:0}
var dirs = [dirUp, dirDown, dirRight, dirLeft]

var restartAction = "restart"

var btnSize = 120
var btnSpace = 10
var upDownButtonX = btnSpace*1.5+btnSize
var leftRightButtonY = gameHeight+20+btnSize+btnSpace
var downButtonY = gameHeight+20+btnSize*2+btnSpace*2
var btns = []
btns.push({x:upDownButtonX,y:gameHeight+20, width:btnSize, height:btnSize, text:"⬆", action:dirUp})
btns.push({x:btnSpace,y:leftRightButtonY, width:btnSize, height:btnSize, text:"⬅", action:dirLeft})
btns.push({x:btnSpace*2+btnSize*2,y:leftRightButtonY, width:btnSize, height:btnSize, text:"➔", action:dirRight})
btns.push({x:upDownButtonX,y:downButtonY, width:btnSize, height:btnSize, text:"⬇", action:dirDown})
var restartButton = {x:290,y:downButtonY+30, width:300, height:80, text:"Restart", action:restartAction, visible:false}
btns.push(restartButton)

//game state
var score
var player
var level
var playerDir
var lost
var enemies
var apple

function draw() {
	//ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#FFD25A"
	ctx.fillRect(0, 0, width, gameHeight)

	drawBox(apple, "#0f2")
	drawBox(player, lost ? "#ccc" : "#fff")

	enemies.forEach(function (e) {
		if (e.sleep > 0) {
			drawBox(e, "#f66")
		} else {
			drawBox(e, "#f00")
		}
	})

	//hud
	ctx.fillStyle = "#57B196"
	ctx.fillRect(0, gameHeight, width, height-gameHeight)

	ctx.fillStyle = "black"
	ctx.font = "30px monospace"
	var textY = gameHeight + 30
	ctx.textAlign = "left"
	ctx.textBaseline = "top"
	ctx.fillText("Score: " + score, width/2, textY)
	ctx.fillText("Use arrow keys", width/2, textY+40)
	btns.forEach(drawButton)
}

function drawBox(box, color) {
	ctx.fillStyle = color
	ctx.fillRect(box.x - box.size/2, box.y - box.size/2, box.size, box.size)
	ctx.lineWidth = 2
	ctx.strokeStyle = "#000"
	ctx.strokeRect(box.x - box.size/2, box.y - box.size/2, box.size, box.size)
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

function start() {
	restartButton.visible = false
	score = 0
	level = 0
	lost = false

	player = {
		x:Math.floor(width/2),
		y:Math.floor(gameHeight/2),
		size:32,
		speed:5
	}
	playerDir = dirRight
	enemies = []
	spawnEnemy({x:30, y:30})
	makeRandomApple()
}

function spawnEnemy(pos) {
	enemies.push({
			x:pos.x,
			y:pos.y,
			angle:0,
			speed:0,
			size: 32,
			sleep:90
	})
}

var margin = 16
function makeRandomApple() {
	apple = {}
	apple.x = Math.floor(Math.random() * (width - margin * 2) + margin)
	apple.y = Math.floor(Math.random() * (gameHeight - margin * 2) + margin)
	apple.size = 32
	//avoid spawning near the player
	if (collides(apple, {x:player.x, y:player.y, size:100})) makeRandomApple()
}

function update() {
	if (!lost) {
		updatePlayer()
	}
	restartButton.visible = lost
	enemies.forEach(function (e) {
		if (e.sleep > 0) {
			e.sleep--
			return
		}
		if (collides(e, player)) {
			lost = true
		}
		var dirToPlayer = angleTo(e, player)
		e.angle = turnTowards(e.angle, dirToPlayer, 0.02)
		moveInDir(e, e.angle, e.speed)
		confineToScreen(e)

		var angleChangeNeeded = angleBetween(e.angle, dirToPlayer)
		if (e.speed < 10 && angleChangeNeeded < 1) e.speed+= 0.03
		if (e.speed > 1 && angleChangeNeeded > 1) e.speed-= 0.03
	})
	if (collides(apple, player)) {
		spawnEnemy(apple)
		makeRandomApple()
		score++
	}
}

function moveInDir(box, dir, speed) {
	if (typeof dir === "number") {
		var angle = dir
		box.x += speed * Math.cos(angle);
		box.y += speed * Math.sin(angle);
	} else {
		box.x += dir.x * speed
		box.y += dir.y * speed
	}
}

function updatePlayer() {
	moveInDir(player, playerDir, player.speed)
	confineToScreen(player)
}

function confineToScreen(box) {
	if (box.x < 0 + box.size / 2)
		box.x = 0 + box.size / 2
	if (box.x > width - box.size / 2)
		box.x = width - box.size / 2
	if (box.y < 0 + box.size / 2)
		box.y = 0 + box.size / 2
	if (box.y > gameHeight - box.size / 2)
		box.y = gameHeight - box.size / 2
}

function collides(o, p) {
	return (p.x + p.size/2 > o.x - o.size/2
		&& p.x - p.size/2 < o.x + o.size/2
		&& p.y + p.size/2 > o.y - o.size/2
		&& p.y - p.size/2 < o.y + o.size/2)
}

window.addEventListener("keydown", function (e) {
	var dir = null
	switch (e.keyCode) {
		case 37: dir = dirLeft
		  break
		case 38: dir = dirUp
		  break
		case 39: dir = dirRight
		  break
		case 40: dir = dirDown
		  break
		case 32:
		case 82:
			if (lost) start()
		}
	if (dir) playerDir = dir
})

function buttonPressed(action) {
	if (action===restartAction) {
		start()
	} else {
		playerDir = action
	}
}

function gameClicked () {}

function distance(one, two) {
	var a = one.x - two.x;
	var b = one.y - two.y;
	return Math.sqrt(a * a + b * b);
}

function angleTo(p1, p2) {
	return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

var twoPi = Math.PI * 2
function turnTowards(startAngle, endAngle, rate) {
	var angle = startAngle
	var turnDir = (startAngle-endAngle+twoPi)%twoPi>Math.PI ? 1: -1
	var turnAmount = Math.abs(Math.atan2(Math.sin(startAngle-endAngle), Math.cos(startAngle-endAngle)))
	angle += turnDir * Math.min(rate, turnAmount);
	angle = (angle + twoPi) % twoPi;
	return angle
}

function angleBetween(startAngle, endAngle) {
	return Math.abs(Math.atan2(Math.sin(startAngle-endAngle), Math.cos(startAngle-endAngle)))
}

start()
window.requestAnimationFrame(tick)
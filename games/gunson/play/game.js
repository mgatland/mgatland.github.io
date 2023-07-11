"use strict"

//8:02pm - 8:11pm
//8:38pm - 8:53pm
//10:31pm - 12:49am
//total: 9+15+2.18 = 2 hours 42 minutes

var text
var textTimer

var dirUp = Math.PI * 1.5
var dirDown = Math.PI * 0.5
var dirRight = 0
var dirLeft = Math.PI

var restartAction = "restart"

var btnSize = 120
var btns = []
var restartButton = {x:30,y:gameHeight - 110, width:300, height:80, text:"Restart", action:restartAction, visible:false}
btns.push(restartButton)

//game state
var player
var level
var lost
var enemies
var shots

//consts?
var gravity = {x:0, y:0.3}
var minRopeLength = 20
var ropeRecallSpeed = 3
var ropeRecallDelay = 60
var texts = [
"The deal's off!",
"I know your face... you're a cop!",
"Silly rabbit. Tricks are for kids.",
"Here's the guns. Where's my money?",
"I'm sorry. I couldn't resist.",
"This is just swiss chocolate!",
"EX-TER-MIN-ATE!",
"So your favorite Jedi... is Spock?",
"[insert your own pre-shootout quote]"]

function draw() {
	//ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#444"
	ctx.fillRect(0, 0, width, gameHeight)

	shots.forEach(function (e) {
		drawShot(e, e.hurtsPlayer ? "orange" : "white")
	})

	drawEnt(player, lost ? "#ccc" : "#fff")

	enemies.forEach(function (e) {
		drawEnt(e, e.dead ? "#a66" : e.super ? "#FFA500" : "#f00")
	})

	//hud
	ctx.fillStyle = "#222"
	ctx.fillRect(0, gameHeight, width, height-gameHeight)

	ctx.fillStyle = "#ddd"
	ctx.font = "30px monospace"
	var textY = gameHeight + 20
	ctx.textAlign = "left"
	ctx.textBaseline = "top"
	ctx.fillText("Level: " + level, 20, textY)
	ctx.fillText("WASD: move | mouse: shoot | no touch controls sorry", 200, textY)
	btns.forEach(drawButton)

	if (textTimer < 60) {
		ctx.textAlign = "center"
		ctx.fillStyle = "white"
		ctx.font = "50px monospace"
		ctx.fillText(text, width/2, 40)
	}
}

function drawShot(ent, color) {
	ctx.strokeStyle = color
	ctx.fillStyle = color
	ctx.lineWidth = 1
	ctx.beginPath()
	//hack: draw shots at double size
  ctx.arc(ent.x, ent.y, ent.size/2*2, 0, Math.PI * 2, true)
  ctx.fill()
  ctx.stroke()
}

function drawEnt(ent, color) {
	ctx.strokeStyle = color
	ctx.lineWidth = 4
	ctx.beginPath()
  ctx.arc(ent.x, ent.y, ent.size/2, 0, Math.PI * 2, true)
  ctx.stroke()
  if (ent.angle !== undefined) {
  	ctx.beginPath()
  	ctx.lineWidth = 4
  	ctx.lineCap="round"
  	var pos = clonePos(ent)
  	moveInDir(pos, ent.angle, ent.size/10)
  	ctx.moveTo(pos.x, pos.y)
  	moveInDir(pos, ent.angle, ent.size*.7)
  	ctx.lineTo(pos.x, pos.y)
  	ctx.stroke()
  	ctx.lineCap="butt"
  }
}

function drawBox(box, color) {
	ctx.fillStyle = color
	ctx.fillRect(box.x - box.size/2, box.y - box.size/2, box.size, box.size)
	ctx.lineWidth = 2
	ctx.strokeStyle = "#000"
	ctx.strokeRect(box.x - box.size/2, box.y - box.size/2, box.size, box.size)
}

function start() {
	restartButton.visible = false
	level = 0
	lost = false

	player = {
		x:Math.floor(width/2),
		y:Math.floor(gameHeight/2),
		size:32,
		speed:3,
		angle: 0,
		vel: {x:0,y:0},
		reloadTimer: 0
	}
	enemies = []
	shots = []
}

var defaultEnemyReload = 400
function spawnEnemy() {
	var a = {}
	a.size = 32
	a.x = Math.floor(Math.random() * (width - a.size * 2)) + a.size
	a.y = Math.floor(Math.random() * (gameHeight - a.size * 2)) + a.size
	a.maxReload = defaultEnemyReload //Math.max(100, defaultEnemyReload - level * 10)
	a.reloadTimer = a.maxReload / 2 + Math.random()*a.maxReload/2
	
	//avoid spawning near the player
	if (collides(a, {x:player.x, y:player.y, size:200})) {
		spawnEnemy()
	} else {
		a.angle = angleTo(a, player)
		if (Math.random() * 5 < (level - 1) && Math.random() < 0.2 ) {
			a.super = true
			a.maxReload /= 3
		}
		enemies.push(a)
	}
}

function update() {	
	textTimer++
	restartButton.visible = lost
	if (!lost) {
		updatePlayer()
	}
	enemies.forEach(updateEnemy)
	shots.forEach(function (shot) {
		moveInDir(shot, shot.angle, shot.speed)
		if (isOffscreen(shot)) shot.dead = true
		if (shot.hurtsPlayer && collides(shot, player)) {
			lost = true
			shot.dead = true
		}
		if (shot.hurtsEnemies) {
			enemies.filter(x => !x.dead && collides(shot, x)).forEach(e => {e.dead = true; shot.dead = true})
		}
	})
	shots = shots.filter(x => !x.dead)

	if (enemies.filter(e => !e.dead).length === 0) {
		nextLevel()
	}
}

function nextLevel() {
	enemies = []
	shots = []
	textTimer = 0
	text = texts[level % texts.length]
	level++
	for (var i = 0; i < 4+level*2; i++) {
		spawnEnemy()
	}
}

function updateEnemy(e) {
	if (e.dead) return
	e.angle = angleTo(e, player)
	if (e.reloadTimer > 0) {
		e.reloadTimer--
	} else {
		e.reloadTimer = e.maxReload
		spawnShot(e, e.angle, false)
	}
}

function scroll(ent) {
	ent.x -= 1
	if (ent.x + ent.size < 0) ent.dead = true
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
	player.angle = angleTo(player, mouse)
	if (player.reloadTimer > 0) player.reloadTimer--
	if (mouseClicks > 0 || (mouse.buttons > 0 && player.reloadTimer === 0)) {
		playerShoot(mouse)
	}

	var xSpd = 0
	var ySpd = 0
	if (keys["up"] && !keys["down"]) ySpd = -1
	if (!keys["up"] && keys["down"]) ySpd = 1
	if (keys["left"] && !keys["right"]) xSpd = -1
	if (!keys["left"] && keys["right"]) xSpd = 1
	var speed = player.speed
	if (xSpd != 0 && ySpd != 0) speed *= 0.7
	player.x += xSpd * speed
	player.y += ySpd * speed
	confineToScreen(player)
}

function xyDifference(oldPos, newPos) {
	return {x:newPos.x - oldPos.x, y:newPos.y - oldPos.y}
}

function addPos(me, delta) {
	me.x += delta.x
	me.y += delta.y
}

function clonePos(pos) {
	return {x:pos.x, y:pos.y}
}

function isOffscreen(box) {
	return (box.x < 0 - box.size / 2)
		|| (box.x > width + box.size / 2)
		|| (box.y < 0 - box.size / 2)
		|| (box.y > gameHeight + box.size / 2)
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
	return (distance(o,p) < o.size/2 + p.size/2)
}

window.addEventListener("keydown", function (e) {
	switch (e.keyCode) {
		case 32: player.anchor = null
		  break
		}
})

function buttonPressed(action) {
	if (action===restartAction) {
		start()
	} else {
		player.angle = action
	}
}

function gameClicked (pos) {
	playerShoot(pos)
}

function playerShoot(pos) {
	player.angle = angleTo(player, pos)
	spawnShot(player, player.angle, true)
	player.reloadTimer = 20
}

function spawnShot(pos, angle, hurtsEnemies) {
	shots.push({x:pos.x, y:pos.y, angle:angle,
		speed:4, size:5, hurtsPlayer: !hurtsEnemies,
		hurtsEnemies: hurtsEnemies})
}

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

document.addEventListener('keydown', function (e) {keyChange(e.keyCode, true)})
document.addEventListener('keyup', function (e) {keyChange(e.keyCode, false)})

var keys = []
function keyChange(keyCode, state) {
	switch (keyCode) {
		case 37:
		case 65:
		 keys["left"] = state
		  break
		case 38:
		case 87:
		 keys["up"] = state
		  break
		case 39:
		case 68:
		 keys["right"] = state
		  break
		case 40:
		case 83:
		 keys["down"] = state
		  break
		case 32:
		case 82:
			if (lost) start()
		}
}

"use strict"

//whole world scroll across
//random anchors
//delicious apples to grab
//deadly spots you can't touch

var dirUp = Math.PI * 1.5
var dirDown = Math.PI * 0.5
var dirRight = 0
var dirLeft = Math.PI

var restartAction = "restart"

var btnSize = 120
var btnSpace = 10
var btns = []
var restartButton = {x:btnSpace,y:gameHeight+btnSpace, width:300, height:80, text:"Restart", action:restartAction, visible:false}
btns.push(restartButton)

//game state
var score
var player
var level
var lost
var enemies
var apples
var anchors

//consts?
var gravity = {x:0, y:0.3}
var minRopeLength = 20
var ropeRecallSpeed = 3
var ropeRecallDelay = 60

function draw() {
	//ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#FFD25A"
	ctx.fillRect(0, 0, width, gameHeight)

	apples.forEach(function (e) {
		drawEnt(e, "#0f2")
	})

	if (player.anchor != null) {
		ctx.beginPath()
		ctx.strokeStyle = "#000"
		ctx.lineWidth = player.ropeTimer < ropeRecallDelay ? 1: 2
		ctx.moveTo(player.x, player.y)
		ctx.lineTo(player.anchor.x, player.anchor.y)
		ctx.stroke();
	}

	anchors.forEach(function (e) {
		drawEnt(e, "#fa0")
	})

	drawEnt(player, lost ? "#ccc" : "#fff")

	enemies.forEach(function (e) {
		drawEnt(e, "#f00")
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
	ctx.fillText("Click on an anchor to grapple", width/2, textY+40)
	ctx.fillText("Space or click nowhere to release", width/2, textY+80)
	btns.forEach(drawButton)
}

function drawEnt(ent, color) {
	ctx.fillStyle = color
	ctx.strokeStyle = "#000"
	ctx.lineWidth = 1
	ctx.beginPath();
    ctx.arc(ent.x, ent.y, ent.size/2, 0, Math.PI * 2, true);
    ctx.fill()
    ctx.stroke()
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
		speed:5,
		angle: dirRight,
		vel: {x:0,y:0},
		anchor: null
	}
	enemies = []
	apples = []
	anchors = []
	var step = width / 24
	for (var i = 0; i < 24; i ++) {
		spawnAnchor()
		anchors[anchors.length-1].x = (i + 1) * step
		if (i % 4 === 0) {
			spawnApple()
			apples[apples.length-1].x = (i + 1) * step
		}
	}
}

function spawnEnemy(pos) {
	var a = {}
	a.size = 32
	a.x = width + a.size + Math.floor(Math.random() * width / 4)
	a.y = Math.floor(Math.random() * (gameHeight - a.size * 2)) + a.size 
	//avoid spawning near the player
	if (collides(a, {x:player.x, y:player.y, size:100})) {
		spawnEnemy()
	} else {
		enemies.push(a)
	}
}

var margin = 16
function spawnApple() {
	var a = {}
	a.size = 32
	a.x = width + a.size + Math.floor(Math.random() * width / 4)
	a.y = Math.floor(Math.random() * gameHeight / 2 + 100)
	//avoid spawning near the player
	if (collides(a, {x:player.x, y:player.y, size:100})) {
		spawnApple()
	} else {
		apples.push(a)
	}
}

var flip = 0
function spawnAnchor() {
	var a = {}
	a.size = 32
	a.x = width + a.size
	if (flip===0) {
		a.y = 100 + Math.random() * 50
	} else if (flip === 1) {
		a.y = 200 + Math.random() * 30
	} else {
		a.y = gameHeight - 200 + Math.random() * 100
	}
	flip++
	if (flip == 3) flip = 0
	anchors.push(a)	
}

function update() {
	
	restartButton.visible = lost
	if (!lost) {
		updatePlayer()
	}
	enemies.forEach(function (e) {
		if (collides(e, player)) {
			lost = true
		}
	})
	apples.forEach(function (apple) {
		if (!lost && collides(apple, player)) {
			apple.dead = true
			score++
		}		
	})

	//scroll
	if (!lost) {
		scroll(player)
		anchors.forEach(scroll)
		anchors = anchors.filter(a => !a.dead)
		apples.forEach(scroll)
		apples = apples.filter(a => !a.dead)
		enemies.forEach(scroll)
		enemies = enemies.filter(a => !a.dead)
	}
	if (anchors.length < 24) {
		spawnAnchor()
	}
	if (apples.length < 4) {
		spawnApple()
	}
	if (enemies.length < score / 2) {
		spawnEnemy()
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
	var oldPos = clonePos(player)
	addPos(player.vel, gravity)
	addPos(player, player.vel)
	if (player.anchor !== null) {
		if (distance(player, player.anchor) > player.ropeLength) {
			var dir = angleTo(player.anchor, player)
			var pos = clonePos(player.anchor)
			moveInDir(pos, dir, player.ropeLength)
			player.x = pos.x
			player.y = pos.y
		}
		if (player.ropeTimer < ropeRecallDelay) {
			player.ropeTimer++
		} else {
			if (player.ropeLength > minRopeLength) {
				player.ropeLength -= ropeRecallSpeed
			}	
		}
		
	}
	confineToScreen(player)
	player.vel = xyDifference(oldPos, player)
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

var mouseSlop = 10
function gameClicked (pos) {
	var anchor = anchors.find(a => distance(a, pos) < a.size + mouseSlop)
	if (anchor != null && anchor !== player.anchor) {
		player.anchor = anchor
		player.ropeLength = distance(player, anchor)
		player.ropeTimer = 0
	} else {
		player.anchor = null
	}
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
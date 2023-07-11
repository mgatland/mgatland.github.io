"use strict"

//P0:
// [x] enemy shoots back
// [x] shots collide with tank bodies
// [ish] end of game \ tanks explode
// [ish] multiple rounds

var emptyColor = "rgba(0, 0, 0, 0)"
var maxHillheight = 0.6
var gravity = 0.05
var terrainData
var tanks = []
var shots = []
var exps = []
var turn = 0
var nextLevelQueued = false
var score = [0,0]
var tankRadius = 15 //for collisions

var btns = []
btns.push({x:30, y:30+gameHeight, width:100, height: 100, text:"<"})
btns.push({x:30+110, y:30+gameHeight, width:100, height: 100, text:">"})
btns.push({x:30+110*2, y:30+gameHeight, width:100, height: 45, text:"^"})
btns.push({x:30+110*2, y:30+gameHeight+55, width:100, height: 45, text:"v"})
btns.push({x:30+110*3+40, y:30+gameHeight, width:100, height: 100, text:"Fire"})


function update() {
	shots.forEach(updateShot)
	shots=shots.filter(s => !s.dead)
	if (shots.length === 0 && turn === 0 && btns[4].down) {
		fire(tanks[0])
	}
	if (tanks[turn].dead) {
		nextTurn()
	}
	doAI(tanks[1])
	exps.forEach(updateExp)
	exps = exps.filter(e => !e.dead)
	if (btns[0].down) rotateTurret(tanks[0], -0.03)
	if (btns[1].down) rotateTurret(tanks[0], 0.03)
	if (btns[2].down) changePowerSetting(tanks[0], 0.01)
	if (btns[3].down) changePowerSetting(tanks[0], -0.01)

	if (tanks.some(t => t.dead && !nextLevelQueued)) {
		nextLevelQueued = true
		setTimeout(start, 2000)
	}

}

function doAI(tank) {
	if (tank.dead) return
	//don't make the player wait
	if (turn === 1 && shots.length === 0) {
		fire(tank)
	}
	
	if (tank.ai.desiredPower > tank.power + 0.01) {
		changePowerSetting(tank, +0.01)
	}
	if (tank.ai.desiredPower < tank.power - 0.01) {
		changePowerSetting(tank, -0.01)
	}

	if (tank.ai.desiredAngle > tank.angle + 0.03) {
		rotateTurret(tank, +0.03)
	}
	if (tank.ai.desiredAngle < tank.angle - 0.03) {
		rotateTurret(tank, -0.03)
	}

}

function nextTurn() {
	turn++
	if (turn >= tanks.length) turn = 0
}

function drawButton(btn) {
	if (btn.down) {
		ctx.fillStyle = '#0094FF'
	} else {
		ctx.fillStyle = '#ccc'
	}
	ctx.fillRect(btn.x, btn.y, btn.width, btn.height)
	ctx.fillStyle = "black"
	ctx.font = "30px monospace"
	ctx.fillText(btn.text, btn.x + 10, btn.y + 40)
}


function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.putImageData(terrainData, 0, 0)
	tanks.forEach(drawTank)
	//player power bar
	ctx.fillStyle = "orange"
	var barHeight = tanks[0].power * 100
	ctx.fillRect(btns[3].x + 110, 30+gameHeight+100-barHeight,30,barHeight)

	shots.forEach(function (t) {
		ctx.fillStyle = "white"
		ctx.fillRect(t.x-5,t.y-5,10,10)
		if (t.y < 0) {
			ctx.font = "30px monospace"
			ctx.fillText("^", t.x-7, 30)
		}
	})
	exps.forEach(function (e) {
		ctx.fillStyle = "white"
		ctx.beginPath();
    ctx.arc(e.x, e.y, e.radius, 0, 2 * Math.PI, false);
    ctx.fill();
	})
	btns.forEach(drawButton)

	ctx.fillStyle = "black"
	ctx.font = "30px monospace"
	ctx.fillText("Scores: " + score[0] + " vs " + score[1], width/2, gameHeight + 30)
}

function drawTank(t) {
	ctx.fillStyle = "orange"
	ctx.translate(t.x, t.y)
	ctx.fillRect(-15,-15,30,30)
	ctx.rotate(t.angle)
	ctx.fillRect(0,-2,30,4)
	ctx.rotate(-t.angle)
	ctx.translate(-t.x, -t.y)
	//health bar
	var barLength = t.health
	ctx.fillStyle = "lightblue"
	ctx.fillRect(t.x - 50, t.y - 50, barLength, 10)
	ctx.fillStyle = "red"
	ctx.fillRect(t.x - 50+barLength, t.y - 50, 100-barLength, 10)
}

function colorAtPoint(x,y) {
	if (y < 0) return emptyColor //infinite air above
	if (x < 0 || x >= width || y >= gameHeight) return "OUTSIDE"
	x = Math.floor(x)
	y = Math.floor(y)
	var index = x*4+y*width*4
  var data = terrainData.data.slice(index, index + 4);
  var rgba = 'rgba(' + data[0] + ', ' + data[1] +
  ', ' + data[2] + ', ' + (data[3] / 255) + ')';
  return rgba
}

function updateShot(shot) {
	var playerHp = tanks[0].health
	if (!canMove(shot.x, shot.y, true)) {
		shot.dead = true
		explode(shot.x, shot.y, 30, shot.damage)
		if (shot.owner.ai) {
			updateAIFromHit(shot.owner, shot.x, shot.y, tanks[0].health < playerHp, shot.passedOverTarget)
		}
	}
	shot.x += shot.vel.x
	shot.y += shot.vel.y
	shot.vel.y += gravity

	//ai hack: did the shot pass over the player?
	if (Math.sign(shot.x - tanks[0].x) != Math.sign(shot.x - shot.vel.x - tanks[0].x)) {
		if (shot.y < tanks[0].y) {
			console.log("passed over!")
			shot.passedOverTarget = true
		}
	}
}

function updateAIFromHit(tank, x, y, wasHit, passedOverTarget) {
	var hitPos = {x:x, y:y, passedOverTarget: passedOverTarget}
	var target = tanks[0]
	var oldDist = tank.ai.lastHitPos ? Math.abs(tank.ai.lastHitPos.x - target.x) : 9999
	var oldPassover = tank.ai.lastHitPos ? tank.ai.lastHitPos.passedOverTarget : false
	var newDist = Math.abs(hitPos.x - target.x)
	var newPassover = hitPos.passedOverTarget

	if (wasHit) {
		//try that again!
		return
	}
	if (newDist <= oldDist && (oldPassover == newPassover) && !tank.ai.mustChangeStrategy) {
		console.log("a little bit more of the same")
		doAIAction(tank)
	} else {
		//just for logging
		if (oldPassover != newPassover) {
			console.log("we overshot! turn the other way!")
		} else if (newDist > oldDist) {
			console.log("This is getting worse? turn the other way!")
		} else {
			console.log("we can't go further this way, we must try something else")
		}
		tank.ai.mustChangeStrategy = false
		changeAIStrategy(tank)
		doAIAction(tank)
	}


	tank.ai.lastHitPos = hitPos
}

function changeAIStrategy(tank) {
	tank.ai.amount *= 0.8
	if (tank.ai.amount < 0.1) tank.ai.amount = 0.1
	if (tank.ai.strategy==="turnleft") {
		tank.ai.strategy = "turnright"
	}
	else if (tank.ai.strategy==="turnright") {
		tank.ai.strategy = "turnleft"
	}
	console.log("Let's try " + tank.ai.strategy)
}

function doAIAction(tank) {
	if (tank.ai.strategy==="turnleft") {
		tank.ai.desiredAngle += Math.PI * 0.2 * tank.ai.amount
		if (tank.ai.desiredAngle > Math.PI * 1.45) {
			tank.ai.desiredAngle = Math.PI * 1.45
			tank.ai.mustChangeStrategy = true
		}
	}
	if (tank.ai.strategy==="turnright") {
		tank.ai.desiredAngle -= Math.PI * 0.2 * tank.ai.amount
		if (tank.ai.desiredAngle <= 0) {
			tank.ai.desiredAngle = 0
			tank.ai.mustChangeStrategy = true
		}
	}
	if (tank.ai.strategy==="powerup") {
		tank.ai.desiredAngle += Math.PI * 0.5 * tank.ai.amount
	}
	if (tank.ai.strategy==="powerdown") {
		tank.ai.desiredAngle -= Math.PI * 0.5 * tank.ai.amount
	}
}

function updateExp(e) {
	e.age+= 2
	if (e.age > e.radius) e.dead = true
}

function explode(cX, cY, radius, damage) {
	for (var x = cX - radius; x < cX + radius; x++) {
		for (var y = cY - radius; y < cY + radius; y++) {
			if (distance(x,y,cX,cY) < radius) {
				clearPixel(x,y)
			}
		}
	}
	tanks.forEach(function (t) { 
		if (distance(t.x,t.y,cX,cY) < radius + tankRadius) {
			damageTank(t, damage)
		}
	}
	)
	exps.push({x:cX, y:cY, radius:radius, age:0})
	tanks.forEach(fall)
}

function damageTank(tank, damage) {
	tank.health -= damage
	if (tank.health <= 0) {
		tank.health = 0
		tank.dead = true
		if (tank === tanks[0]) {score[1]++} else {score[0]++}
	}
}

function clearPixel(x, y) {
	x = Math.floor(x)
	y = Math.floor(y)
	var index = x*4+y*width*4
	for (var i = 0; i < 4; i++) {
		terrainData.data[index+i] = 0;
	}
}

function start() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	nextLevelQueued = false
	tanks = []
	shots = []
	exps = []
	turn = 0
	var generator = new TerrainGenerator();
	ctx.fillStyle = "#ccc"
	for (var x = 0; x < width; x++) {
		var y = Math.floor(generator.getNext() * gameHeight * maxHillheight);
		ctx.fillRect(x, gameHeight-y, 1, gameHeight)
	}
	terrainData = ctx.getImageData(0,0,width,gameHeight)
	tanks.push({x: Math.floor(width / 10), y: 0, angle: Math.PI*1.5, power:0.2, health:100})
	tanks.push(
		{
			x: Math.floor(width / 10 * 9),
			y: 0, angle: Math.PI*1.5,
			power:0.2,
			health:100,
			ai:{
				amount:1, 
				desiredAngle:Math.PI*1.1, 
				desiredPower:1,
				strategy:"turnleft"}
		})
	tanks.forEach(fall)
}

start()

/*canvas.addEventListener("click", function (e) {
	var mouse = {x:event.offsetX, y:event.offsetY}
	//scale to lofi scale
	mouse.x = Math.floor(mouse.x * width / canvas.offsetWidth)
	mouse.y = Math.floor(mouse.y * height / canvas.offsetHeight)
	console.log(mouse.x + ":" + mouse.y)
	console.log(canMove(mouse.x, mouse.y))
})*/

function fire(tank) {
	var shot = {x:tank.x, y:tank.y, vel:{x:0,y:0}, damage:50}
	shot.owner = tank
	shot.passedOverTarget = false
	applyForce(shot.vel, tank.angle, 6*tank.power + 1)
	moveInDirection(shot, tank.angle, 31)
	shots.push(shot)
	nextTurn()
}

function rotateTurret(tank, speed) {
	tank.angle += speed
	if (tank.angle > Math.PI * 2) tank.angle = Math.PI * 2
	if (tank.angle < Math.PI) tank.angle = Math.PI
}

function changePowerSetting(tank, amount) {
	tank.power += amount
	if (tank.power > 1) tank.power = 1
	if (tank.power < 0) tank.power = 0	
}

// gamey utilties

function fall(tank) {
	while (canMove(tank.x, tank.y+5)) tank.y++
}

function canMove(x, y, includeTanks = false) {
	var canMove = (colorAtPoint(x, y) === emptyColor)
	if (!canMove) return false
	if (!includeTanks) return true
	tanks.forEach(function (t) {
		if (x > t.x - 15 && x <= t.x + 15
			&& y > t.y - 15 && y <= t.y + 15) {
			canMove = false
		}
	})
	return canMove;
}

// utilities

function distance(x, y, x2, y2) {
	var a = x - x2
	var b = y - y2
	return Math.sqrt(a * a + b * b)
}

function moveInDirection(pos, angle, distance) {
	pos.x += Math.cos(angle) * distance
	pos.y += Math.sin(angle) * distance
}

function applyForce(vel, angle, thrust) {
	vel.x += Math.cos(angle) * thrust
	vel.y += Math.sin(angle) * thrust
}

function TerrainGenerator() {

	var y = Math.random()
	var dY = 0
	var rateOfChange = 0.001
	var edgeBias = 0.001

	function updateDY () {
		if (y < 0.1 && dY < 0) {
			dY += Math.random() * rateOfChange - rateOfChange / 2 + edgeBias
		} else if (y > 0.9 && dY > 0) {
			dY += Math.random() * rateOfChange - rateOfChange / 2 - edgeBias
		} else {
			dY += Math.random() * rateOfChange - rateOfChange / 2
		}
	}

	function getNext() {
		y += dY
		updateDY()
		if (y < 0) {
			y = 0
			dY = 0
		}
		if (y > 1) {
			y = 1
			dY = 0
		}
		return y;
	}

  return {
      getNext: getNext
  };
};
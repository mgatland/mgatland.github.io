"use strict"

//1:10pm - 1:40pm - 30m
//2:20 -4:20 - 2 hours
//10pm 

//focus:
// core tower
// enemies spawn and approach the core tower, damage on hit
// towers shoot the closest enemy
//ammo mechanic
//guns consume ammo
//towers share ammo with adjacents
//no building on bottom row? | enemies can move along bottom row

var debugMode = false
var fastForward = false

var btns = []
var paths = {}
btns.push({x:30, y:50+gameHeight, width:280, height: 50, text:"gun ($4\\30ammo)", buildType:1})
btns.push({x:30, y:110+gameHeight, width:280, height: 50, text:"ammo ($4\\60ammo)", buildType:2})


var gridSize = 32
var gridXLength = width / gridSize
var gridYLength = gameHeight / gridSize

var towerCost = [0, 4,4]

//reset on start
var badSpawnCounter
var badSpawnFreq
var patternCounter
var health
var money
var score
var towers
var actors
var buildType

function drawButton(btn) {
	if (buildType===btn.buildType) {
		ctx.fillStyle = '#0094FF'
	} else {
		ctx.fillStyle = '#ccc'
	}
	ctx.fillRect(btn.x, btn.y, btn.width, btn.height)
	ctx.fillStyle = "black"
	ctx.font = "25px monospace"
	ctx.fillText(btn.text, btn.x + 10, btn.y + 40)
}

function buttonPressed(btn) {
	buildType = btn.buildType
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#6593c7"
	ctx.fillRect(0, 0, width, gameHeight)

	drawGrid()
	towers.forEach(drawTower)
	actors.forEach(drawActor)

	//hud
	ctx.fillStyle = "#2c77cc"
	ctx.fillRect(0, gameHeight, width, height-gameHeight)
	btns.forEach(drawButton)

	ctx.fillStyle = "black"
	ctx.font = "30px monospace"
	ctx.fillText("Building type", 10, gameHeight + 30)
	ctx.fillText("Shields: " + health, width / 2, gameHeight + 30)
	ctx.fillText("Money: " + money, width / 2, gameHeight + 70)
	ctx.fillText("Score: " + score, width / 2, gameHeight + 100)
	ctx.font = "20px monospace"
	ctx.fillText("Adjacent towers share ammo", width / 2, gameHeight + 130)
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

	if (debugMode) {
		ctx.fillStyle = "white"
		ctx.font = "14px monospace"
		for (var x = 0; x < gridXLength + 1; x++) {
			for (var y = 0; y < gridYLength + 1; y++) {
				ctx.fillText(getGridScoreAtXY(x, y),x*gridSize+7,y*gridSize+14)
			}
		}
	}
}

function drawTower(t) {
	if (t.type === 0) {
		var ratio = health / 100
		var r = Math.floor(ratio*176)
		var g = Math.floor(ratio*244)
		var b = Math.floor(ratio*66)
		ctx.fillStyle = "rgb(" + r + "," + g +","+b+")"
	} else if (t.type === 2) {
		var ratio = t.ammo / t.maxAmmo
		var inverse = 1 - ratio
		var r = Math.floor(ratio * 66 + inverse * 244)
		var g = Math.floor(ratio * 244 + inverse * 66)
		var b = Math.floor(ratio * 182 + inverse * 149)
		ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")"
	} else {
		var ratio = t.ammo / t.maxAmmo
		var inverse = 1 - ratio
		var r = Math.floor(ratio * 255 + inverse * 255)
		var g = Math.floor(ratio * 165)
		var b = 0
		ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")"
	}
	ctx.translate(t.pos.x, t.pos.y)
	ctx.fillRect(-gridSize/2,-gridSize/2,gridSize,gridSize)
	//ctx.rotate(t.angle)
	//ctx.rotate(-t.angle)
	ctx.translate(-t.pos.x, -t.pos.y)
	if (t.counter > 10 && t.lastTarget) {
		ctx.strokeStyle = "white"
		ctx.lineWidth = 2
		ctx.beginPath()
		ctx.moveTo(t.pos.x, t.pos.y)
		ctx.lineTo(t.lastTarget.pos.x, t.lastTarget.pos.y)
		ctx.stroke()
	}
}

function drawActor(a) {
	var r = Math.floor(a.health / a.maxHealth * 161)
	var g = 0
	var b = Math.floor(a.health / a.maxHealth * 255)
	ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")"
	ctx.translate(a.pos.x, a.pos.y)
	if (a.type === 0) {
		var size = gridSize  * 0.3
	}
	if (a.type === 1) {
		var size = gridSize  * 0.6
	}
	if (a.type === 2) {
		var size = gridSize  * 1
	}
	ctx.fillRect(-size/2,-size/2,size,size)
	ctx.translate(-a.pos.x, -a.pos.y)
}

function start() {
	towers = []
	actors = []
	buildType = 1
	badSpawnCounter = 0
	badSpawnFreq = 180
	patternCounter = 0
	health = 100
	money = 12
	score = money
	makeTower({x:gridXLength/2,y:gridYLength/2}, 0)
}

var fwding = false
function update() {
	if (health <= 0) {
		health = 0
		return
	}
	updatePaths()

	badSpawnCounter++
	if (badSpawnCounter == badSpawnFreq) {
		var enemy = (patternCounter > 20 && patternCounter % 4 === 0) ? 0 : 1
		if (patternCounter > 40 && patternCounter % 15 === 0) enemy = 2
		if (patternCounter > 140 && patternCounter < 160 && patternCounter % 2 === 0) enemy = 0
		if (patternCounter > 200 && patternCounter < 220 && patternCounter % 3 === 0) enemy = 2
		if (patternCounter > 240) patternCounter -= 220
		spawnEnemy(getRandomEdgeGridPos(), enemy)
		badSpawnCounter = 0
		patternCounter++
		if (patternCounter % 20 === 0 && badSpawnFreq > 60) badSpawnFreq = Math.floor(badSpawnFreq/2)
	}

	updateTowers()
	updateActors()
	if (health > 100) health = 100

	//double speed for testing
	if (fastForward && !fwding) {
		fwding = true
		update()
		update()
		fwding = false
	}
}

function spawnEnemy(gridPos, type) {
	var e = {}
	e.gridPos = {x:gridPos.x, y:gridPos.y}
	e.pos = getPosFromGridPos(e.gridPos)
	e.type = type
	if (e.type === 0) {
		e.speed = 4
		e.damage = 15
		e.health = 10
		e.maxHealth = 10
		e.money = 4
	} else if (e.type === 1) {
		e.speed = 0.75
		e.damage = 15
		e.health = 20
		e.maxHealth = 20
		e.money = 3
	} else {
		e.speed = 0.5
		e.damage = 15
		e.health = 200
		e.maxHealth = 200
		e.money = 40
	}
	actors.push(e)
}

function updateTowers() {
	var range = 100
	towers.forEach(function (a) {
		if (a.counter > 0) {
			a.counter--
		}
		if (a.type === 1) {
			if (a.counter == 0 && a.ammo > 0) {
				var e = closestEnemy(a, range)
				if (e != null) {
					a.lastTarget = e
					a.counter = 15
					e.health -= 1
					a.ammo--
				}
			}
		}
		if (a.type !== 0 && a.feedCounter == 0) {
			feedAdjacentTowers(a)
			a.feedCounter = 5
		}
		if (a.feedCounter > 0) {
			a.feedCounter--
		}
	})
}

function skip(n=10) {
	for (var i = 0; i < n; i++) {
		update()
	}
}

function feedAdjacentTowers(a) {
	dirs.forEach(function (dir) {
		var gridPos = {x:a.gridPos.x+dir.x,y:a.gridPos.y+dir.y}
		var tower = towerAt(gridPos)
		if (tower && tower.ammo != undefined && tower.ammo < tower.maxAmmo && tower.ammo < a.ammo) {
			a.ammo--
			tower.ammo++
		}
	})
}

function closestEnemy(me, range) {
	var best = null
	var bestDist = null
	actors.forEach(function (a) {
		var dist = distanceXY(a.pos.x, a.pos.y, me.pos.x, me.pos.y)
		if (dist < range && (best === null || best > dist) && a.pos.y < gameHeight) {
			best = a
			bestDist = dist
		}
	})
	return best
}

function updateActors() {
	actors.forEach(function (a) {
		if (a.health <= 0) {
			if (!a.dead) {
				a.dead = true
				score += a.damage
				money += a.money
			}
			return
		}
		//decide where to move
		if (!a.desiredGridPos) {
			a.dir = bestDir(a.gridPos)
			if (a.dir) {
				a.desiredGridPos = {x:a.gridPos.x+a.dir.x, y:a.gridPos.y+a.dir.y}
			} else {
				if (a.gridPos.y === gridYLength) a.gridPos.x++
				if (a.gridPos.x === gridXLength) a.gridPos = 0
					a.pos = getPosFromGridPos(a.gridPos)
				a.desiredGridPos = undefined
			}
		}
		//move there
		if (a.desiredGridPos) {
			a.pos.x += a.dir.x * a.speed
			a.pos.y += a.dir.y * a.speed
			if (Math.abs(a.pos.x-(a.desiredGridPos.x+0.5)*gridSize) <= a.speed
				&& Math.abs(a.pos.y-(a.desiredGridPos.y+0.5)*gridSize) <= a.speed)
			{
				a.gridPos = a.desiredGridPos
				a.pos = getPosFromGridPos(a.desiredGridPos)
				a.desiredGridPos = undefined
				if (isSamePos(a.gridPos, towers[0].gridPos)) {
					health -= a.damage
					a.dead = true
				}
			}
		}
	})
	actors = actors.filter (a => !a.dead)
}

var dirUp = {x:0,y:-1}
var dirDown = {x:0,y:1}
var dirRight = {x:1,y:0}
var dirLeft = {x:-1,y:0}
var dirs = [dirUp, dirDown, dirRight, dirLeft]
function bestDir(gridPos) {
	var x = gridPos.x
	var y = gridPos.y
	var score = getGridScoreAtXY(x, y)
	if (getGridScoreAtXY(x,y-1) < score) return dirUp
	if (getGridScoreAtXY(x+1,y) < score) return dirRight
	if (getGridScoreAtXY(x,y+1) < score) return dirDown
	if (getGridScoreAtXY(x-1,y) < score) return dirLeft
}

var edgeList = []
for (var x = 0; x < gridXLength; x++) {
	edgeList.push({x:x, y:gridYLength})
}
var edgeListCounter = 0

function getRandomEdgeGridPos() {
	edgeListCounter++
	if (edgeListCounter === edgeList.length) edgeListCounter = 0
	return edgeList[edgeListCounter]
}

function gameClicked(pos) {
	var gridPos = {x:Math.floor(pos.x/gridSize),y:Math.floor(pos.y/gridSize)}
	var clicked = towers.find(t => t.gridPos.x === gridPos.x && t.gridPos.y === gridPos.y)
	if (!clicked) {
		tryBuild(gridPos)
	}
}

function isEmpty(gridPos) {
	return !towers.some(t => t.gridPos.x === gridPos.x && t.gridPos.y === gridPos.y)
}

function towerAt(gridPos) {
	return towers.find(t => t.gridPos.x === gridPos.x && t.gridPos.y === gridPos.y)
}

function tryBuild(gridPos) {
	if (isEmptyOfEnemies(gridPos) && money >= towerCost[buildType]) {
		makeTower(gridPos, buildType)
		money -= towerCost[buildType]
	}

}

function isEmptyOfEnemies(gridPos) {
	return (!actors.some(a => isSamePos(gridPos, a.gridPos) 
		|| (a.desiredGridPos != undefined && isSamePos(gridPos, a.desiredGridPos))))
}

function makeTower(gridPos, type) {
	var t = {}
	t.gridPos= {x:gridPos.x, y:gridPos.y},
	t.gridPos.x = Math.floor(t.gridPos.x)
	t.gridPos.y = Math.floor(t.gridPos.y)
	t.pos = getPosFromGridPos(t.gridPos)
	t.type = type
	t.counter = 0
	t.feedCounter = 0
	if (t.type === 1) {
		t.ammo = 30
		t.maxAmmo = 30
	} else if (t.type === 2) {
		t.ammo = 60
		t.maxAmmo = 60
	}
	towers.push(t)
}

function getPosFromGridPos(gridPos) {
	var pos = {x:(gridPos.x+0.5)*gridSize, y:(gridPos.y+0.5)*gridSize}
	pos.x = Math.floor(pos.x)
	pos.y = Math.floor(pos.y)
	return pos
}

start()

// utilities

function distanceXY(x, y, x2, y2) {
	var a = x - x2
	var b = y - y2
	return Math.sqrt(a * a + b * b)
}

function updatePaths() {
	paths = {}
	var openList = []
	openList.push({x:towers[0].gridPos.x,y:towers[0].gridPos.y,cost:0})
	while (openList.length > 0) {
		var nextCell = openList.shift()
		var index = nextCell.x+nextCell.y*gridXLength
		var oldCost = paths[index]
		if (oldCost === undefined || oldCost > nextCell.cost) {
			paths[index] = nextCell.cost
			tryAddPathRoom(nextCell, openList, -1, 0)
			tryAddPathRoom(nextCell, openList, +1, 0)
			tryAddPathRoom(nextCell, openList, 0, -1)
			tryAddPathRoom(nextCell, openList, 0, +1)
		}
	}
}

function isSamePos(p1, p2) {
	return p1.x === p2.x && p1.y === p2.y
}

function tryAddPathRoom(oldCell, openList, dX, dY)
{
	var x = oldCell.x + dX
	var y = oldCell.y + dY
	if (x < 0 || x >= gridXLength || y < 0 || y >= gridYLength) return
	var testCell = {x:x, y:y, cost:oldCell.cost+1}
	if (!isEmpty(testCell)) return
	if (openList.find(c => isSamePos(c, testCell))) return
	openList.push(testCell)
}

function getGridScoreAtXY(x, y) {
	var score = paths[x + y * gridXLength]
	if (score === undefined) return 10000
	return score
}
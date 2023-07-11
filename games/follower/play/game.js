"use strict"


// to do:
// [x] add walls
// [x] you lose if you're not touching a wall
// [x] multiple levels with different walls
// [x] score goes up on different levels
// [nah] maybe speed increases?

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

var playerSize = 32
var playerSpeed = 5

//game state
var score
var player
var level
var walls
var playerDir
var lost

function draw() {
	//ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#FFD25A"
	ctx.fillRect(0, 0, width, gameHeight)

	drawLevel()

	//player
	ctx.fillStyle = "#fff"
	ctx.fillRect(player.x - playerSize/2, player.y - playerSize/2, playerSize, playerSize)
	ctx.lineWidth = 2
	ctx.strokeStyle = "#000"
	ctx.strokeRect(player.x - playerSize/2, player.y - playerSize/2, playerSize, playerSize)

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

function drawLevel() {
	ctx.fillStyle = '#FF837B'
	ctx.lineWidth = 16
	walls.forEach(function (w) {
		ctx.fillRect(w.x, w.y, w.width, w.height)
	})
}

function start() {
	restartButton.visible = false
	score = 0
	level = 0
	lost = false

	player = {x:0, y:Math.floor(gameHeight/2)}
	playerDir = dirRight
	loadNextLevel()
}

function update() {
	if (!lost) {
		player.x += playerDir.x * playerSpeed
		player.y += playerDir.y * playerSpeed

		if (hasFallenOff()) {
			lost = true
			restartButton.visible = true
		} else if (player.x > width) {
			player.x -= width
			score++
			loadNextLevel()
		}
	}
}

function loadNextLevel() {
	level++
	walls = []
	var spans = Math.min(level, 13)
	//we cap it at 13 spans - the spanWidth must be > playerSize + playerSpeed + wallWidth
	var doubleFirst = false
	if (spans > 5) doubleFirst = true
	if (level === 1) {
		walls.push({x:0,y:gameHeight/2,width:width,height:10})
	}
	else {
		var y = player.y
		var spanWidth = width / spans
		console.log(spanWidth)
		var margin = 40
		for (var i = 0; i < spans; i++) {
			var newWall = {x:spanWidth*i,y:y,width:spanWidth+10,height:10}
			walls.push(newWall)
			if (i === 0 && doubleFirst) {
				newWall.width = newWall.width + spanWidth
				i++
			}
			var nextY = null
			while (nextY === null) {
				nextY = Math.floor(Math.random()*(gameHeight-margin*2))+margin
				if (Math.abs(nextY - y) < 50) nextY = null
			}
			var minY = Math.min(y, nextY)
			var maxY = Math.max(y, nextY)
			var wallHeight = maxY - minY
			walls.push({x:spanWidth*(i+1),y:minY,width:10,height:wallHeight})
			y = nextY
		}
	}

}

function hasFallenOff() {
	return !walls.some(t => collides(t, player))
}

function collides(wall, p) {
	return (p.x + playerSize/2 > wall.x && p.x - playerSize/2 < wall.x + wall.width
		&& p.y + playerSize/2 > wall.y && p.y - playerSize/2 < wall.y + wall.height)
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


start()
window.requestAnimationFrame(tick)
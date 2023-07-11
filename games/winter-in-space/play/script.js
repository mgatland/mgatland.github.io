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
var iconScale = 4
var margin = 20
var gridXLength = 6
var gridYLength = 6
var gameHeight = width //force to square
var cellWidth = width / gridXLength
var cellHeight = gameHeight / gridYLength
var buttonWidth = (width - margin * 4) / 3
var buttonHeight = 100

function tick() {
  if (loaded) {
  	tickGame()
  }
	window.requestAnimationFrame(tick)
}
window.requestAnimationFrame(tick)

function drawIcon(x, y, index) {
	var spriteWidth = 11
	ctx.translate(x, y)
	ctx.drawImage(spriteImage, 
		index * 12, 15, 
		spriteWidth, spriteWidth,
	  0, 0,
	  spriteWidth*iconScale, spriteWidth*iconScale)
	ctx.translate(-x, -y)	
}

function drawGridSprite(pos, sprite, xOff=0, yOff=0) {
	var x = (pos.x + 0.5 + xOff) * width / gridXLength
	var y = (pos.y + 0.5 + yOff) * gameHeight / gridYLength
	ctx.translate(x, y)
	ctx.rotate(pos.angle || 0)
	ctx.drawImage(spriteImage, 
		sprite.x, sprite.y, 
		sprite.width, sprite.height,
	  -sprite.width/2*scale, -sprite.height/2*scale,
	  sprite.width*scale, sprite.height*scale)
	ctx.rotate(-pos.angle || 0)
	ctx.translate(-x, -y)
}

var buttons = []
for (var i = 0; i < 3; i++) {
	buttons.push({
		index: i,
		x: margin + i * (width - margin * 2) / 3,
		y: height-buttonHeight-margin,
		width:buttonWidth,
		height:buttonHeight
	})
}

canvas.addEventListener("click", function (event) {
	event.preventDefault()
	if (state != "waiting") return
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
	var gridX = Math.floor(mouse.x / cellWidth)
	var gridY = Math.floor(mouse.y / cellWidth)
	if (gridX < gridXLength && gridY < gridYLength) {
		selected = roomxy[gridX][gridY]
		//movement?
		if (canPathTo(selected)) {
			player.x = selected.x
			player.y = selected.y
		}
	}
})

//sprites
var plantSprite = {x:0, y:0, width:19, height: 25}
var blockerSprite = {x:20, y:0, width:20, height: 26}
var playerSprite = {x:45, y:1, width:10, height: 24}
var blockedSprite = {x:0, y:27, width:41, height: 44}
var antsSprite = {x:44, y:32, width:55, height: 61}
var dirtSprite = {x:57, y:1, width:16, height: 8}

// Game stuff
var daysLeft = 36
var food = 10
var blockers = 2
var rooms = []
var roomxy = []
for (var x = 0; x < gridXLength; x++) {
	roomxy[x] = []
	for (var y = 0; y < gridYLength; y++) {
		roomxy[x].push({x:x,y:y,color:Math.random() > 0.5 ? "#aaa" : "#bbb"})
		rooms.push(roomxy[x][y])
	}
}
roomxy[1][4].feature = {type:"food", delay:0}
roomxy[2][2].feature = {type:"food", delay:5}
roomxy[3][1].feature = {type:"blocker", delay:3}
var ants = []

var features = {
	food: {sprite: plantSprite, produces: 3, delay:4, name: "food"},
	blocker: {sprite: blockerSprite, produces: 1, delay:4, name:"thorn"}
}

var state = "waiting"
var endMessage
var player = {x:2,y:3}
var selected = undefined

function getRandomCard() {
	return Math.floor(Math.random() * cardTypeCount)
}

function playerAction(action) {
	if (state === "waiting") {
		if (action === "block") {
			blockers--
			selected.blocked = true
			nextDay()
		}
		if (action === "place dirt") {
			selected.dirt = true
			nextDay()
		}
		if (action === "plant food") {
			selected.feature = {type:"food", delay:features.food.delay}
			nextDay()
		}
		if (action === "plant block") {
			selected.feature = {type:"blocker", delay:features.blocker.delay}
			nextDay()
		}
		if (action === "harvest") {
			var ft = features[selected.feature.type]
			if (selected.feature.type === "food") {
				food += ft.produces
			} else {
				blockers += ft.produces
			}
			selected.feature.delay = ft.delay
			nextDay()
		}
		if (action === "wait") {
			nextDay()
		}
		if (action === "lose") {
			state = "end"
			endMessage = "You're stuck forever"
		}
	}
}

function nextDay() {
	food--
	daysLeft--
	rooms.forEach(function (r) {
		if (r.feature && r.feature.delay > 0) {
			r.feature.delay--
		}
	})

	var room = getNewSpreadAntRoom()
	if (room === null) room = getNewEdgeAntRoom()
	if (room != null) {
		ants.push({x:room.x, y:room.y})
		room.ants = true
		room.feature = undefined
	}

	if (food < 0) {
		food = 0
		state = "end"
		endMessage = "You died of hunger"
	} else if (daysLeft === 0) {
		state = "end"
		endMessage = "You survived winter!"
	}
}

function getNewSpreadAntRoom() {
	var list = rooms.filter(function (r) {
		if (!viableAntRoom(r)) return false
		if (ants.some(a => adjacent(a, r))) return true
	})
	if (list.length === 0) return null
	return list[Math.floor(Math.random() * list.length)]
}

function adjacent(one, two) {
	return (
		(one.x === two.x && (one.y === two.y - 1 || one.y === two.y + 1))
		|| 
		(one.y === two.y && (one.x === two.x - 1 || one.x === two.x + 1))
		)
}

function getNewEdgeAntRoom() {
	var list = []
	for (var x = 0; x < gridXLength; x++) {
		var room = roomxy[x][0]
		if (viableAntRoom(room)) {
			list.push(room)
		}
		room = roomxy[x][gridYLength - 1]
		if (viableAntRoom(room)) {
			list.push(room)
		}
	}
	for (var y = 1; y < gridYLength - 1; y++) {
		var room = roomxy[0][y]
		if (viableAntRoom(room)) {
			list.push(room)
		}
		room = roomxy[gridXLength - 1][y]
		if (viableAntRoom(room)) {
			list.push(room)
		}	
	}
	if (list.length === 0) return null
	return list[Math.floor(Math.random() * list.length)]
}

function viableAntRoom(room) {
	return (!room.blocked && !room.ants)
}

function tickGame() {
	if (state.name === "action") {
		playAction()
		state.frame++
	}
	draw()
}

var animStep = 20

function playAction() {
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
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

	//draw rooms
	for (var x = 0; x < gridXLength; x++) {
		for (var y = 0; y < gridYLength; y++) {
			var room = roomxy[x][y]
			ctx.fillStyle = room.color
			ctx.fillRect(x*cellWidth, y*cellHeight, cellWidth, cellHeight)
			ctx.strokeStyle = "grey"
			ctx.lineWidth = 2
			ctx.strokeRect(x*cellWidth, y*cellHeight, cellWidth, cellHeight)
			if (room.blocked) {
				drawGridSprite(room, blockedSprite)
			} else if (room.ants) {
				drawGridSprite(room, antsSprite)
			} else if (room.feature) {
				var ft = features[room.feature.type]
				drawGridSprite(room, ft.sprite, -.3, +.25)
				ctx.font = "20px monospace"
				if (room.feature.delay > 0) {
					ctx.fillStyle = "grey"
					ctx.fillText(room.feature.delay + " days", (x+0.37)*cellWidth, (y+0.8)*cellHeight)
					ctx.fillText("left", (x+0.37)*cellWidth, (y+0.92)*cellHeight)
				} else {
					ctx.fillStyle = "black"
					var amount = (ft.produces > 1) ? ft.produces + " " : ""
					ctx.fillText(amount + ft.name, (x+0.37)*cellWidth, (y+0.8)*cellHeight)
					ctx.fillText("ready", (x+0.37)*cellWidth, (y+0.92)*cellHeight)
				}
			} else if (room.dirt) {
				drawGridSprite(room, dirtSprite, -.3, +.25)	
			}
			if (selected === room) {
				ctx.strokeStyle = "yellow"
				ctx.lineWidth = 4
				ctx.strokeRect(x*cellWidth, y*cellHeight, cellWidth, cellHeight)
			}
		}
	}

	drawGridSprite(player, playerSprite)

	ctx.font = "30px monospace"
	ctx.textAlign = "left"
	ctx.fillStyle = "white"
	ctx.fillText(daysLeft + " days left. " + food + " food, " + blockers + " thorns.", 10, height - 130)

	buttons[0].action = ""
	buttons[1].action = ""
	buttons[2].action = ""

	if (selected === undefined) {
		ctx.fillText("Click on a room", 10, height - 75)	
	} else if (selected.x === player.x && selected.y === player.y) {
		if (selected.blocked || selected.ants) {
			if (!canPlayerMove()) {
				buttons[0].line1 = "Give up"
				buttons[0].line2 = "(I'm stuck!)"
				buttons[0].action = "lose"
				drawButton(buttons[0])
			}
		} else {
			if (blockers > 0) {
				buttons[0].line1 = "Build trap"
				buttons[0].line2 = "(1 day)"
				buttons[0].action = "block"
				drawButton(buttons[0])			
			} else if (!selected.feature) {
				buttons[0].line1 = "wait"
				buttons[0].line2 = "(1 day)"
				buttons[0].action = "wait"
				drawButton(buttons[0])
			}
			if (selected.feature) {
				if (selected.feature.delay === 0) {
					buttons[1].line1 = "Harvest"
					buttons[1].line2 = "(1 day)"
					buttons[1].action = "harvest"
					drawButton(buttons[1])
				} else {
					buttons[1].line1 = "wait"
					buttons[1].line2 = "(1 day)"
					buttons[1].action = "wait"
					drawButton(buttons[1])	
				}
			} else if (selected.dirt) {
				buttons[1].line1 = "Grow food"
				buttons[1].line2 = "(1 day)"
				buttons[1].action = "plant food"
				drawButton(buttons[1])
				buttons[2].line1 = "Grow thorns"
				buttons[2].line2 = "(1 day)"
				buttons[2].action = "plant block"
				drawButton(buttons[2])
			} else {
				buttons[1].line1 = "Place dirt"
				buttons[1].line2 = "(1 day)"
				buttons[1].action = "place dirt"
				drawButton(buttons[1])
			}
		}
	} else {
		buttons[0].line1 = "can't get"
		buttons[0].line2 = "there"
		buttons[0].action = "no op"
		drawButton(buttons[0])
	}

	if (state === "end") {
		ctx.font = "40px bold monospace"
		ctx.textAlign = "center"
		ctx.fillStyle = "white"
		ctx.strokeStyle = "black"
		ctx.lineWidth = 5
		ctx.strokeText(endMessage, width / 2, gameHeight + 50)
		ctx.fillText(endMessage, width / 2, gameHeight + 50)
		ctx.lineWidth = 2
	}
}

function canPathTo(room) {
	if (!canEnterRoom(room)) return false
	var openList = []
	var closedList = []
	openList.push(roomxy[player.x][player.y])
	while (openList.length > 0) {
		var nextRoom = openList.pop()
		closedList.push(nextRoom)
		tryAddPathRoom(nextRoom, openList, closedList, -1, 0)
		tryAddPathRoom(nextRoom, openList, closedList, +1, 0)
		tryAddPathRoom(nextRoom, openList, closedList, 0, -1)
		tryAddPathRoom(nextRoom, openList, closedList, 0, +1)
	}
	return (closedList.indexOf(room) >= 0)
}

function canPlayerMove() {
	var junk = []
	var openList = []
	var room = roomxy[player.x][player.y]
	//hack, misusing these methods slightly
	tryAddPathRoom(room, openList, junk, -1, 0)
	tryAddPathRoom(room, openList, junk, +1, 0)
	tryAddPathRoom(room, openList, junk, 0, -1)
	tryAddPathRoom(room, openList, junk, 0, +1)
	return openList.length > 0
}

function canEnterRoom(room) {
	return (!room.blocked && !room.ants)
}

function tryAddPathRoom(room, openList, closedList, dX, dY)
{
	var x = room.x + dX
	var y = room.y + dY
	if (x < 0 || x >= gridXLength || y < 0 || y >= gridYLength) return
	var testRoom = roomxy[x][y]
	if (testRoom == undefined) {
		console.log('twf')
	}
	if (!canEnterRoom(testRoom)) return
	if (openList.indexOf(testRoom) >= 0) return
	if (closedList.indexOf(testRoom) >= 0) return
	openList.push(testRoom)
}

function drawButton(btn) {
	ctx.fillStyle = '#0094FF'
	ctx.fillRect(btn.x, btn.y, btn.width, btn.height)
	drawIcon(btn.x, btn.y, {x:0,y:0,width:100,height:100})
	ctx.fillStyle = "white"
	ctx.fillText(btn.line1, btn.x + 5, btn.y + 40)
	ctx.fillText(btn.line2, btn.x + 5, btn.y + 80)	
}

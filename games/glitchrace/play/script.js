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
var buttonSize = 44
var margin = 20
var gridX = 6
var gridY = 7
var gameheight = height - margin * 2 - buttonSize

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

function drawGridSprite(pos, sprite) {
	var x = (pos.x + 0.5) * width / gridX
	var y = (pos.y + 0.5) * gameheight / gridY
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
for (var i = 0; i < 4; i++) {
	buttons.push({
		index: i,
		x: margin + i * (width - margin * 2) / 4,
		y: height-buttonSize-margin,
		width:buttonSize,
		height:buttonSize
	})
}

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
			playerAction(btn.index)
		}
	})
})

//sprites
var carSprite0 = {x:0, y:0, width:9, height: 14}
var carSprite1 = {x:10, y:0, width:9, height: 14}
var carSprite2 = {x:20, y:0, width:9, height: 14}

var carSelectedSprite = {x:0, y:27, width:11, height: 16}

var failSprite = {x:12, y:26, width:10, height:17}
var carDeadSprite = {x:24, y:26, width:12, height:18}
var effectSprite = {x:39, y:28, width:12, height:14}
var coneSprite = {x:56, y:28, width:9, height:10}

// Game stuff
var effects = []
var cars = []
var cardTypeCount = 7
var cones = []
for (var i = 0; i < 2; i++) {
	cones.push({
		x:Math.floor(Math.random() * gridX),
		y:Math.floor(Math.random() * 2 + 2)})
}
var cards = []
for (var i = 0; i < 4; i++) {
	cards.push(getRandomCardForPlayer())
}
var playerCar = {
	x: Math.floor(gridX/2), 
	y: gridY - 1,
	sprite:carSprite2
	}
cars.push(playerCar)
cars.push({x:playerCar.x-1, y:playerCar.y,sprite:carSprite1})
cars.push({x:playerCar.x-3, y:playerCar.y,sprite:carSprite0})
//cars.push({x:playerCar.x-4, y:playerCar.y,sprite:carSprite1})
cars.push({x:playerCar.x+2, y:playerCar.y,sprite:carSprite0})
//cars.push({x:playerCar.x+3, y:playerCar.y,sprite:carSprite1})
var state = {name:"playerChoose"}
var playerWon = false

function getRandomCard() {
	return Math.floor(Math.random() * cardTypeCount)
}

function getRandomCardForPlayer() {
	var card = getRandomCard()
	//don't allow duplicates. Isn't that generous!
	while (cards.filter(x => x === card).length > 0) card = getRandomCard()
	return card
}

function playerAction(index) {
	if (state.name === "playerChoose") {
		playerCar.action = cards[index]
		cards[index] = getRandomCardForPlayer()
		state.name = "action"
		state.car = 0
		cars[state.car].selected = true
		cars[state.car].failed = false
		state.frame = 0
		state.nextCar = false
	}
}

function tickGame() {
	if (state.name === "action") {
		playAction()
		state.frame++
		if (state.nextCar) {
			cars[state.car].selected = false
			state.car++
			if (state.car >= cars.length) {
				state.car = 0
				state.name = "playerChoose"
				if (playerCar.dead) {
					state.name = "gameover"
				}
			} else {
				var car = cars[state.car]
				car.selected = true
				car.failed = false
				state.frame = 0
				state.nextCar = false
				if (car != playerCar) {
					car.action = getRandomCard()
					while (!isActionUseful(car, car.action)) {
						car.action = getRandomCard()
					}
				}
			}
		}
	}
	effects.forEach(function (effect) {
		effect.age++
	})
	effects = effects.filter(x => x.age < 35)
	draw()
}

var teleWide = 0
var leftForward = 1
var rightForward = 2
var crashLeft = 3
var forwardForward = 4
var crashRight = 5
var teleFar = 6

var animStep = 20
function playAction() {
	var car = cars[state.car]
	if (car.dead) {
		car.selected = false
		state.nextCar = true
		return
	}
	if (car.action === teleWide) {
		if (state.frame === animStep) {
			car.canTeleswap = true
			var x = car.x
			var y = car.y
			teleSwap(car, x, y - 1)
			teleSwap(car, x-1, y - 1)
			teleSwap(car, x+1, y - 1)
		}
		if (state.frame === animStep*2) state.nextCar = true
	}
	if (car.action === teleFar) {
		if (state.frame === animStep) {
			car.canTeleswap = true
			var x = car.x
			var yEnd = car.y
			for (var y = 0; y < yEnd; y++) {
				teleSwap(car, x, y)
			}
		}
		if (state.frame === animStep*2) state.nextCar = true
	}
	if (car.action === leftForward) {
		if (state.frame === animStep) moveCar(car, -1, 0)
		if (state.frame === animStep*2) moveCar(car, 0, -1)
		if (state.frame === animStep*3) state.nextCar = true
	}
	if (car.action === rightForward) {
		if (state.frame === animStep) moveCar(car, 1, 0)
		if (state.frame === animStep*2) moveCar(car, 0, -1)
		if (state.frame === animStep*3) state.nextCar = true
	}
	if (car.action === crashLeft) {
		if (state.frame === animStep) moveCar(car, -1, 0, true)
		if (state.frame === animStep*2) state.nextCar = true
	}
	if (car.action === forwardForward) {
		if (state.frame === animStep*1) moveCar(car, 0, -1)
		if (state.frame === animStep*2) state.nextCar = true
	}
	if (car.action === crashRight) {
		if (state.frame === animStep) moveCar(car, 1, 0, true)
		if (state.frame === animStep*2) state.nextCar = true
	}
}

function isActionUseful(car, action) {
	if (action === teleWide) {
		return (cars.some(c => c.y === car.y - 1 && c.x >= car.x - 1 && c.x <= car.x + 1))
	}
	if (action === teleFar) {
		return (cars.some(c => c.x === car.x && c.y < car.y))	
	}
	if (car.action === crashLeft) {
		return car.x > 0 //don't handle traffic cones
	}
	if (car.action === crashRight) {
		return car.x > gridX - 1 //don't handle traffic cones
	}
	if (car.action === forwardForward) {
		return (!cars.some(c => c.x === car.x && c.y === car.y - 1))
	}
	//don't handle diagonals at all
	return true
}

function moveCar(car, x, y, powered) {
	car.failed = false
	car.x += x
	car.y += y
	if (car.x < 0 || car.x >= gridX) moveFail(car, x, y)
	if (car.y < 0 || car.y >= gridY) moveFail(car, x, y)
	if (cones.some(c => c.x === car.x &&  c.y === car.y)) moveFail(car, x, y)
	if (cars.some(c => c != car && c.x === car.x && c.y === car.y && !c.dead)) {
		if (powered) {
			var other = cars.find(c => c != car && c.x === car.x && c.y === car.y && !c.dead)
			other.dead = true
		} else {
			moveFail(car, x, y)
		}
	}

	if (car.y === 0) {
		state.name = "gameover"
		if (car === playerCar) playerWon = true
	}
}

function teleSwap(car, x, y) {
	if (car.canTeleswap) {
		var other = cars.find(c => c.x === x && c.y === y && !c.dead)
		if (other) {
			other.x = car.x
			car.x = x
			other.y = car.y
			car.y = y
			//only first teleport happens
			car.canTeleswap = false
		}
	}
	effects.push({x:x, y:y, age:0})
}

function moveFail(car, x, y) {
	car.failSpot = {x:car.x-x/2, y:car.y-y/2}
	car.x -= x
	car.y -= y
	car.failed = true
}

function draw() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	buttons.forEach(function (btn) {
		if (state.name === "playerChoose") {
			ctx.fillStyle = '#0094FF'
		} else {
			ctx.fillStyle = 'lightgrey'
		}
		ctx.fillRect(btn.x, btn.y, btn.width, btn.height)
		drawIcon(btn.x, btn.y, cards[btn.index])
	})
	//finish line
	ctx.fillStyle = 'lightyellow'
	ctx.fillRect(0, 0, width, gameheight / gridY)
	//draw grid
	ctx.strokeStyle = 'grey'
	ctx.lineWidth = 2
	ctx.beginPath();
	for (var x = 0; x < gridX + 1; x++) {
		ctx.moveTo(x*width / gridX, 0)
		ctx.lineTo(x*width / gridX, gameheight)
	}
	for (var y = 0; y < gridY + 1; y++) {
		ctx.moveTo(0, y*gameheight / gridY)
		ctx.lineTo(width, y*gameheight / gridY)
	}
	ctx.stroke()

	//draw dead cars
	cars.filter(c => c.dead).forEach(function (car) {
		drawGridSprite(car, carDeadSprite)
	})
	//draw cars
	cars.filter(c => !c.dead).forEach(function (car) {
		if (car.selected) {
			drawGridSprite(car, carSelectedSprite)
		}
		drawGridSprite(car, car.sprite)	
		if (car.selected && car.failed) {
			drawGridSprite(car.failSpot, failSprite)
		}
	})
	if (state.name === "gameover") {
		ctx.strokeStyle = "white"
		ctx.textAlign = "center"
		ctx.font = "40px monospace"
		ctx.strokeText(playerWon ? "WINNER" : "GAME OVER", width/2, height/2)
	}
	effects.forEach(function (effect) {
		drawGridSprite(effect, effectSprite)
	})
	cones.forEach(function (c) {
		drawGridSprite(c, coneSprite)
	})
}

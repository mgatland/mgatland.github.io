"use strict"
var canvas = document.querySelector(".gameCanvas")
var ctx = canvas.getContext('2d')
var eventEl = document.querySelector(".event")
var eventTextEl = document.querySelector(".eventText")
var eventButtonEl = document.querySelector(".eventButton")
var inventoryEl = document.querySelector(".inventory")

var traderItem0 = document.querySelector(".traderItems .t0")
var traderItem1 = document.querySelector(".traderItems .t1")
var traderItem2 = document.querySelector(".traderItems .t2")

ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;

var loaded = false

var spriteImage = new Image()
spriteImage.src = 'sprites.png'
spriteImage.addEventListener('load', function() {
  loaded = true
}, false)

function tick() {
  if (loaded) {
  	tickGame()
  }
	window.requestAnimationFrame(tick)
}
window.requestAnimationFrame(tick)

//art stuff
var scale = 3
var shipSprite = {x:0, y:0, width:17, height: 8}
var planetSprites = [
{x:0,y:8,width:9,height:9}
]

var planetNames = ["Earth", "Medusa", "Argon", "Ewaste", 
"Trailer", "Music", "Game", "Mercurious", "Venux", 
"Eart", "Mart", "Juperella", "Saturdine", "Ureally", 
"Neptellia", "Pollon", "ES1334", "NR0184"
]

//game stuff
var worldWidth = 500
var worldHeight = 600
var margin = 60
var ship = {
	pos: {x:100, y:100, angle:1.2},
	sprite:shipSprite,
	isInWarp: false,
	landed:false,
	speed: 0,
	maxSpeed: 3,
	acceleration: 0.1,
	warpTime: 0,
	items: []
}
var buyChoice = -1
var sellChoice = -1
var gameOver = false
var tradeWorlds = 0 //limited to 5 or we run out of items and crash

var allItems = []
allItems.push({name: "Warp Coil", values: ["advanced", "shiny"]})
allItems.push({name: "Space Medicine", values: ["advanced", "practical"]})
allItems.push({name: "Alien Eyeballs", values: ["gross", "exotic"]})
allItems.push({name: "Inside-Out Gas", values: ["weapons", "gross"]})
allItems.push({name: "Rusty Broken Time Machine", values: ["advanced", "vintage"]})
allItems.push({name: "Long-range Torpedoes", values: ["advanced", "shiny", "weapons"]})
allItems.push({name: "Memento from the Original Series", values: ["exotic", "vintage"]})
allItems.push({name: "Gross Meats", values: ["gross", "practical"]})
allItems.push({name: "Exotic Meats", values: ["exotic", "practical"]})
allItems.push({name: "Cassette Tape", values: ["vintage", "exotic"]})
allItems.push({name: "LiPo Batteries (volatile)", values: ["practical", "weapons"]})
allItems.push({name: "Classic Car", values: ["vintage", "practical", "shiny"]})
allItems.push({name: "Catapault", values: ["vintage", "weapons"]})
allItems.push({name: "Alien Soldier", values: ["exotic", "weapons"]})
allItems.push({name: "Sheet of Tinfoil", values: ["shiny"]})
allItems.push({name: "Huge Solar Panel", values: ["shiny", "practical"]})
allItems.push({name: "Jar of Robot Millipedes", values: ["gross", "shiny"]})
allItems.push({name: "Lots of Fake Blood", values: ["gross"]})
allItems.push({name: "Laser Rifles", values: ["weapons","practical"]})
allItems.push({name: "The Art of Subspace Cryptography (book)", values: ["advanced"]})
allItems.push({name: "Giant Crab Claw", values: ["gross", "exotic"]})
allItems.push({name: "Ancient Human Skeletons", values: ["vintage","gross"]})
allItems.push({name: "Assorted Power Tools", values: ["practical"]})
allItems.push({name: "Bionic Prosthetic Arm", values: ["practical", "advanced"]})
allItems.push({name: "Trazerian Glass Slippers", values: ["exotic", "shiny"]})
allItems.push({name: "Nanofibre Dress (3 Outfits In One!)", values: ["advanced", "shiny"]})
allItems.push({name: "Mysterious Egg", values: ["exotic"]})
allItems.push({name: "Last Survivor of an Ancient Race", values: ["vintage","exotic"]})
allItems.push({name: "Orb of Everlasting Pizza", values: ["advanced", "gross", "practical"]})

var traders = []
traders.push({name:"violent society",values:["weapons"]})
traders.push({name:"Technomancers",values:["advanced"]})
traders.push({name:"Magpierians",values:["shiny"]})
traders.push({name:"historians",values:["vintage"]})
traders.push({name:"frontier settlers",values:["practical"]})
traders.push({name:"Space Boys",values:["gross"]})
traders.push({name:"space tourists",values:["exotic"]})

var values = ["weapons", "advanced", "shiny", "vintage", "practical", "gross", "exotic"]
var timeLeft = 5 * 365 - 1;
var planets = []
for (var i = 0; i < 10; i++) {addPlanet()}
console.log("trade worlds: " + tradeWorlds)

var selectedPlanet = null
var missionGoal = pickRandom(values)

function endGame() {
	if (gameOver) return;
	gameOver = true
	document.querySelector(".planetInfo").classList.add("hidden")
	document.querySelector(".travelInfo").classList.add("hidden")	
	document.querySelector(".endInfo").classList.remove("hidden")
	var goodItems = ship.items.filter(x => x.values.includes(missionGoal))
	var badItems = ship.items.filter(x => !x.values.includes(missionGoal))
	var message = "Your mission is over! You found " 
	+ goodItems.length + " items of interest to the federation."
	if (badItems.length > 1) message += " The other " + badItems.length + " will be thrown in the space trash, especially the " + badItems[0].name + "!"
	if (badItems.length == 1) message += " As for the " + badItems[0].name + ", that goes in the space trash!"
	document.querySelector(".endInfo .message").innerHTML = message
}

function tickGame() {
	if (gameOver) return;
	//gameplay
	if (ship.isInWarp)
	{
		ship.warpTime++
		timeLeft -= 2.5
		if (timeLeft <= 0) {
			timeLeft = 0
			endGame()
		} else {
			ship.speed = Math.min(ship.speed + ship.acceleration, ship.maxSpeed)
			var turnSpeed = 0.05 + Math.max(0, ship.warpTime-60*1.5) * 0.001
			var angle = angleTo(ship.pos, ship.target.pos)
			ship.pos.angle = turnTowards(ship.pos.angle, angle, turnSpeed);
			moveAtAngle(ship.pos, ship.speed, ship.pos.angle)
			var dist = distance(ship.pos, ship.target.pos)
			if (dist < 4) {
				ship.isInWarp = false
				ship.landed = true
				showInventory(true)
				showPlanetInfo()
			}
		}
	}

	//rendering
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.font = "20px sans-serif"
	ctx.fillColor = "black";
	ctx.fillText(timeLeftInDays() + " days remaining", worldWidth - 200, 30)
	planets.forEach(drawPlanet)
	drawSprite(ship.pos, ship.sprite)
}

function warpTo(planet) {
	ship.isInWarp = true
	ship.target = planet
	ship.warpTime = 0
	hidePlanetInfo()
}

function addPlanet() {
	var planet = {
		pos:{x: randomX(), y:randomY(), angle:0},
		sprite: pickRandom(planetSprites)
	}
	planet.name = pickRandomAndRemove(planetNames)
	planet.description = generatePlanetDescription()
	planets.push(planet)
	var random = Math.random();
	//always 2 tradeworlds, up to 5
	if ((random < 0.3 && tradeWorlds < 5) || tradeWorlds < 2) {
		tradeWorlds++
		planet.type = "trade"
		planet.items = []
		planet.items.push(pickRandomAndRemove(allItems))
		planet.items.push(pickRandomAndRemove(allItems))
		planet.items.push(pickRandomAndRemove(allItems))
		planet.trader = pickRandomAndRemove(traders)
	} else {
		planet.type = "item"
		planet.item = pickRandomAndRemove(allItems)
	}
}

//ONLY called by showInventory
function prepareForTrading(onPlanet) {
	var trader = onPlanet ? ship.target.trader : null
	ship.items.forEach(function (item) {
		item.apparentValue = false;
		if (trader != null) {
			trader.values.forEach(function (value) {
				if (item.values.includes(value)) item.apparentValue = true
			})
		}
	});
}

function playerCanTrade() {
	return ship.items.filter(x => x.apparentValue).length > 0
}

//drawing

function drawPlanet(planet) {
	drawSprite(planet.pos, planet.sprite)
	if (planet === selectedPlanet) {
		ctx.font = "14px sans-serif"
		ctx.fillColor = "black"
		ctx.textAlign = "center"
		ctx.fillText(planet.name, planet.pos.x, planet.pos.y-25)
		if (planet !== ship.target) {
			ctx.fillText("Click again", planet.pos.x, planet.pos.y+25+16)
			ctx.fillText("to visit", planet.pos.x, planet.pos.y+25+16+17)
		}
	}
}

function drawSprite(pos, sprite) {
	ctx.translate(pos.x, pos.y)
	ctx.rotate(pos.angle)
	ctx.drawImage(spriteImage, 
		sprite.x, sprite.y, 
		sprite.width, sprite.height,
	  -sprite.width/2*scale, -sprite.height/2*scale,
	  sprite.width*scale, sprite.height*scale)
	ctx.rotate(-pos.angle)
	ctx.translate(-pos.x, -pos.y)
}

//utilities

function randomX() {
	return Math.floor(Math.random() * (worldWidth - margin * 2)) + margin
}

function randomY() {
	return Math.floor(Math.random() * (worldHeight - margin * 2)) + margin
}

function pickRandom(list) {
	var i = Math.floor(Math.random() * list.length)
	return list[i]
}

function pickRandomAndRemove(list) {
	var i = Math.floor(Math.random() * list.length)
	var pick = list[i]
	list.splice(i, 1)
	return pick
}

function timeLeftInDays() {
	return Math.floor(timeLeft);
}

function distance(one, two) {
	var a = one.x - two.x;
	var b = one.y - two.y;
	return Math.sqrt(a * a + b * b);
}

function angleTo(p1, p2) {
	return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

function moveAtAngle(pos, speed, angle)
{
	pos.x += speed * Math.cos(angle);
	pos.y += speed * Math.sin(angle);
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

function generatePlanetDescription()
{
	var prefix = ["A lush","A dangerous", "A friendly", "A dramatic", "An icy", "A firey", 
	"A desolate", "A squishy", "A colourful", "A spikey", "A wind-swept"]
	var prefix2 = ["forest", "water", "city", "desert", "totalitarian", "libertarian", "pre-industrial", "high-tech", "barbaric", "unattractive"]
	var noun = ["world", "planet", "environment", "place"]
	return pickRandom(prefix) + " " + pickRandom(prefix2) + " " + pickRandom(noun) + ".";
}

//GUI

function showPlanetInfo() {
	document.querySelector(".planetInfo").classList.remove("hidden")
	document.querySelector(".travelInfo").classList.add("hidden")
	document.querySelector(".locationName").innerHTML = ship.target.name
	document.querySelector(".locationDescription").innerHTML = ship.target.description
	document.querySelector(".traderItems").classList.add("hidden")
	if (ship.target.type === "item") {
		eventEl.classList.add("good")
		eventTextEl.innerHTML = "Captain, we found something!"
		eventButtonEl.innerHTML = "Take the " + ship.target.item.name
		eventButtonEl.classList.remove("hidden")
		eventButtonEl.disabled = false
		document.querySelector(".traderItems").classList.add("hidden")
	} else if (ship.target.type === "searched") {
		eventEl.classList.add("good")
		eventTextEl.innerHTML = "We've searched this planet."
		eventButtonEl.classList.add("hidden")
		document.querySelector(".traderItems").classList.add("hidden")
	} else if (ship.target.type === "trade") {
		eventEl.classList.add("good")
		document.querySelector(".traderItems").classList.remove("hidden")
		traderItem0.innerHTML = ship.target.items[0].name
		traderItem1.innerHTML = ship.target.items[1].name
		traderItem2.innerHTML = ship.target.items[2].name
		traderItem0.classList.remove("chosen")
		traderItem1.classList.remove("chosen")
		traderItem2.classList.remove("chosen")
		buyChoice = -1
		//show planet items
		if (playerCanTrade()) {
			eventTextEl.innerHTML = "The " + ship.target.trader.name + " want to trade. Choose two items to swap, if you're keen!"
			eventButtonEl.classList.remove("hidden")
			eventButtonEl.innerHTML = "Trade"
			updateTradeButton()
		} else {
			eventTextEl.innerHTML = "The " + ship.target.trader.name + " want to trade, but they don't like anything we have at the moment."
			eventButtonEl.classList.add("hidden")
		}
	} else {
		eventEl.classList.remove("good")
		eventTextEl.innerHTML = "There's nothing much here."
		eventButtonEl.classList.add("hidden")
	}
	
}

traderItem0.addEventListener("click", function (e) {
	buyChoice = 0;
	traderItem0.classList.add("chosen")
	traderItem1.classList.remove("chosen")
	traderItem2.classList.remove("chosen")
	updateTradeButton()
});

traderItem1.addEventListener("click", function (e) {
	buyChoice = 1;
	traderItem0.classList.remove("chosen")
	traderItem1.classList.add("chosen")
	traderItem2.classList.remove("chosen")
	updateTradeButton()
});

traderItem2.addEventListener("click", function (e) {
	buyChoice = 2;
	traderItem0.classList.remove("chosen")
	traderItem1.classList.remove("chosen")
	traderItem2.classList.add("chosen")
	updateTradeButton()
});

function updateTradeButton() {
	if (buyChoice >= 0 && sellChoice >= 0) {
		eventButtonEl.innerHTML = "Trade"
		eventButtonEl.disabled = false
	} else if (buyChoice >= 0) {
		eventButtonEl.innerHTML = "Choose what to offer"
		eventButtonEl.disabled = true
	} else {
		eventButtonEl.innerHTML = "Choose what you want"
		eventButtonEl.disabled = true
	}
}

function hidePlanetInfo() {
	document.querySelector(".planetInfo").classList.add("hidden")
	document.querySelector(".travelInfo").classList.remove("hidden")
	document.querySelector(".locationName").innerHTML = "deep space"
}

function showInventory(onPlanet) {
	prepareForTrading(onPlanet)
	inventoryEl.innerHTML = ""
	var n = 0
	ship.items.forEach(function (item) {
		var itemEl = document.createElement("div")
		itemEl.innerHTML = item.name
		itemEl.classList.add("t"+n++)
		if (!item.apparentValue) itemEl.classList.add("unwanted")
		inventoryEl.appendChild(itemEl)
	})
}

inventoryEl.addEventListener("click", function (event) {
	if (ship.target.type==="trade") {
		for (var i = 0; i < ship.items.length; i++) {
			if (event.target.classList.contains("t"+i) && ship.items[i].apparentValue) {
				sellChoice = i
				var elems = document.querySelectorAll(".inventory div");
				[].forEach.call(elems, function(el) {
				    el.classList.remove("chosen");
				});
				event.target.classList.add("chosen")
			}
		}
		updateTradeButton()
	}
})

eventButtonEl.addEventListener("click", function (event) {
	if (ship.target.type === "item") {
		ship.items.push(ship.target.item)
		ship.target.item = undefined
		ship.target.type = "searched"
		showInventory(true)
		showPlanetInfo()
	}
	if (ship.target.type === "trade" && buyChoice >= 0 && sellChoice >= 0) {
		ship.items.push(ship.target.items[buyChoice])
		ship.target.items[buyChoice] = ship.items[sellChoice]
		ship.items.splice(sellChoice, 1)
		buyChoice = -1
		sellChoice = -1
		showInventory(true)
		showPlanetInfo()
	}
})

canvas.addEventListener("click", function (event) {
	var oldSelection = selectedPlanet;
	var mousePos = {x:event.offsetX, y:event.offsetY}

	//find closest planet
	function closestCallback (best, next) {
		var newDist = distance(next.pos, mousePos)
		var oldDist = (best != null) ? distance(best.pos, mousePos) : 9999
		if (newDist < oldDist && newDist < 64) return next
		if (oldDist <= newDist && oldDist < 64) return best
		return null
	}
	selectedPlanet = planets.reduce(closestCallback)
	event.preventDefault()

	if (selectedPlanet === oldSelection && oldSelection != null) {
		warpTo(selectedPlanet);
	}
})

//startup

//starting items - can't be the items you're looking for
for (var i = 0; i < 2; i++) {
	var pick = pickRandomAndRemove(allItems)
	while (pick.values.includes(missionGoal)) {
		allItems.push(pick) //give it back
		pick = pickRandomAndRemove(allItems)
	}
	ship.items.push(pick)
}
showInventory(false)
hidePlanetInfo()
document.querySelector(".goal").innerHTML = missionGoal
document.querySelector(".goal2").innerHTML = missionGoal
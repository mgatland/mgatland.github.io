"use strict"

var money = 0
var food = 2
var fightsLeft = 3
var enemy = null
var items = []
var firstNight = true
var score = 0

var messagesEl = document.querySelector(".messages")

var enemies = []
enemies.push({name: "sparrow", minFear:3, maxFear:5, minDist:3, maxDist: 5})
enemies.push({name: "budgie", minFear:3, maxFear:5, minDist:3, maxDist: 5})

enemies.push({name: "parrot", minFear:5, maxFear:7, minDist:3, maxDist: 5})
enemies.push({name: "pigeon", minFear:5, maxFear:7, minDist:3, maxDist: 5})

enemies.push({name: "owl", minFear:7, maxFear:8, minDist:3, maxDist: 5})
enemies.push({name: "hawk", minFear:8, maxFear:9, minDist:3, maxDist: 5})
enemies.push({name: "kiwi", minFear:9, maxFear:10, minDist:3, maxDist: 5})

document.addEventListener("click", function (event) {
	if (event.target.localName === "a") {
		event.preventDefault()
		doAction(event.target.getAttribute("href"))
	}
})

function doAction(action) {
	if (enemy != null && action != "inventory") { //FIXME inventory hack
		doFightAction(action)
	} else {
		switch (action) {
			case "inventory": showInventory()
				break
			case "buy food":
				if (money >= 3) {
					money -= 3
					food += 3
					addMessage("You buy some food.", false)
				} else {
					addMessage("You need more money.", false)
				}
				break
			case "find-animal":
				startFight()
				break
			case "get-room":
				if (fightsLeft > 0) {
					addMessage("It's a bit early for sleeping - maybe head to the forest first.", false)
				} else {
					clearText()
					if (firstNight === true) {
						addMessage("You can't afford a room, but Seth offers you a free room in return for any birds you can catch.", false)	
						firstNight = false
					}
					if (items.length > 1) {
						money += 2
						addMessage("You give Seth your birds. He gives you the room key and $2 from the tip jar.", false)
					} else if (items.length == 1) {
						money += 2
						addMessage("You give Seth your " + items[0] + ". He gives you the room key and $2 from the tip jar.", false)
					} else {
						addMessage("You've got no birds today. Seth gives you the room key anyway. \"Better luck tomorrow.\"", false)
					}
					addMessage(parse("[goto bar|wake up]"))
					fightsLeft = 3
					score += items.length
					items = []
				}
				break
			default:
		}
		if (action.indexOf("goto") === 0) {
			clearText()
			gotoRoom(action.substring(5))
		} else if (action.indexOf("local ") === 0) {
			gotoLocal(action.substring(6))
		}
	}
	window.scrollTo(0,document.body.scrollHeight)
}

function startFight() {
	if (fightsLeft > 0) {
		fightsLeft--
		var rng = Math.floor(Math.random() * enemies.length)
		var t = enemies[rng] //template
		enemy = {
			name:t.name,
			fear:randRange(t.minFear, t.maxFear),
			dist:randRange(t.minDist, t.maxDist)}
		clearText()
		addMessage("You see a " + enemy.name)
		showFightUpdate()
	} else {
		addMessage("It's too late, you need to sleep.", false)
	}
}

//inclusive!
function randRange(min, max) {
	return Math.floor(Math.random() * (max + 1 - min)) + min
}

function doFightAction(action) {
	switch (action) {
		case "fight food":
			if (food > 0) {
				addMessage("You throw some food. The " + enemy.name + " comes closer and looks calmer.")
				if (enemy.dist > 0) enemy.dist--
				if (enemy.fear > 0) enemy.fear--
				food--
				showFightUpdate()
			} else {
				addMessage("You have no food.", false)
			}
			break
		case "fight move": {
			fightMove()
			break
		}
	}
}

function fightMove() {
	if (enemy.dist > 0) {
		addMessage("You move closer.")
		enemy.dist--
		var luck = Math.random()
		if (luck < 0.25) {
			enemy.fear += 2
			addMessage("*crack* *crack!* You stepped on TWO sticks!")
		}	else if (luck < 0.5) {
			enemy.fear++
			addMessage("*crack* You stepped on a stick!")
		} else {
			addMessage("shhhh...")
		}
		if (enemy.fear > 10) {
			addMessage("The " + enemy.name + " got too scared! it's gone!")
			endFight()
		} else {
			showFightUpdate()
		}
	} else {
		addMessage("You grab it! +1 " + enemy.name)
		items.push(enemy.name)
		endFight()
	}
}

function endFight() {
	enemy = undefined
	addMessage("You can look for " + fightsLeft + " more animals today.")
	addMessage("---")
	addMessage(parse(currentRoom.enter))
}

function showFightUpdate() {
	addMessage(enemy.name + " looks scared like " + enemy.fear + "/10.")
	addMessage("It is " + enemy.dist + " metres away.")
	var option1 = (food > 0) ? "[fight food|give food (" + food + ")], " : ""
	var option2 = (enemy.dist > 0) ? "[fight move|walk forward]" : "[fight move|grab it]"
	// + " or [fight run|give up]" //FIXME
	addMessage(parse(option1 + option2))
}

function showInventory() {
	var stuff = items.length > 0 ? items.join(", ") : "nothing"
	addMessage("You have " + food + " food and $" + money + ". You're holding " + stuff + ". Score: " + score, false)
}

function clearText() {
	messagesEl.innerHTML = ""
}

function addMessage(text, removeOldLinks = true) {
		if (removeOldLinks) removeOldAnchors()
		var el = document.createElement("div")
		//el.classList.add("orderItem")
		el.innerHTML = text
		messagesEl.appendChild(el)
}

function gotoRoom(room) {
	console.log("going to " + room)
	currentRoom = rooms[room]
	addMessage(parse(currentRoom.enter))
}

function gotoLocal(local) {
	console.log("showing local " + local)
	addMessage(parse(currentRoom[local]), false)
}

function parse(string) {
	var result = string.replace(/\[/g, '<a href="');
	var result = result.replace(/\|/g, '">');
	var result = result.replace(/\]/g, '</a>');
	return result
}

var rooms = {}
rooms.bar = 
{enter:
	"You are at the Wool Inn. People from all walks of life hang around getting drunk. [goto bartender|Talk to the bartender], [get-room|get a room] or [goto town|leave].",
}
rooms.bartender =
{
	enter: "Seth the bartender is mixing drinks. Ask him about [local secrets|secrets] or [local life|his life], or [goto bar|leave]",
	secrets: "Seth leans forward and lowers his voice. \"My friend is making a bird zoo. The biggest in the world! They are going to need all the birds they can buy, and then some.\"",
	life: "\"I'm working on a new game, a kind of 2d platform game MMO. But we just found out someone's already using the name we wanted... I guess we'll figure it out.\""
}

rooms.town = {
	enter: "The town seems quiet. Everyone must be at the [goto bar|bar]. You see the [goto shop|shop] is open. Otherwise you could head into [goto forest|the forest]."
}

rooms.forest = {
	enter: "Lootwood Forest. Strange insects chip high above you. You can [find-animal|look for animals] or [goto town|return to town]."
}

rooms.shop = {
	enter: "\"Welcome, friend!\" exclaims Alyx. What are you after? [local food|food]? or [local chat|just a chat]? You can talk to Alyx or [goto town|leave].",
	chat: "Alex probably knows a few [local secrets|secrets]. Or you could ask about her [local life|life].",
	secrets: "\"I'm seeing this really cool guy. But we haven't told anyone yet. In fact, he doesn't really tell anyone anything.\"",
	life: "\"I never thought I'd end up here! I was helping save the world from aliens, I thought we were only two thirds through the adventure... well, it's hard to say, maybe four parts in... anyway, it all blew over, I work here now!\"",
	food: "Buy 3 food for $3? [buy food|yes] [local ok|no thanks]",
	ok: "\"That's OK.\""
}

function removeOldAnchors() {
	var anchors = document.querySelectorAll(".messages a");
	for ( var i=0; i < anchors.length; i++ ) {
	    var span = document.createElement("span");
	    span.className = "oldLink"
	    span.innerHTML = anchors[i].innerHTML;
	    anchors[i].parentNode.replaceChild(span, anchors[i]);
	}
}

var currentRoom
gotoRoom("bar")

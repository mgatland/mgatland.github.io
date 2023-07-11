//need:
// [no] nicer animation and fx
// [x]countdown bar

//out of scope:
// allow all prefixes to stack (tick and reverse can't be combined)
// memory task 
// maybe remove the 'any except' task

var startLevel = 0

document.querySelector(".buttons").addEventListener('click', clickAction)
var instructionsEl = document.querySelector(".instructions")
var balanceEl = document.querySelector('.balance')
var mainEl = document.querySelector('.main')
var barEl = document.querySelector('.bar')

var actBlack = 0
var actRed = 1
var actBlue = 2
var actWhite = 3

var actReverse = 4
var actTick = 5

var actInverse = 6
var allButtons = [actBlue, actRed, actWhite, actBlack]
var allPrefixes = [actReverse, actTick]
var allPrefix2s = [actInverse]

buttonName = []
buttonName[actBlue] = 'blue'
buttonName[actRed] = 'chance'
buttonName[actBlack] = 'black'
buttonName[actWhite] = 'cold'

buttonName[actReverse] = 'shift'
buttonName[actTick] = 'tick'

buttonName[actInverse] = 'seek'

var levels

//game state
var score
var lives
var stateType
var level
var interactive

//current action state
var message
var timeoutId
var task
var correctActions
var barDelay
var barStartTime
var wasQuick

function clickAction(e) {
	var action
	if (e.target.classList.contains("blue")) action = actBlue
	if (e.target.classList.contains("black")) action = actBlack
	if (e.target.classList.contains("white")) action = actWhite
	if (e.target.classList.contains("red")) action = actRed
	if (action != undefined) PlayerAction(action)
}

function PlayerAction(code) {
	if (!interactive) {
		return
	}
	if (correctActions.indexOf(code) >= 0) {
		goodAction()
		return
	}
	badAction()
}

function start() {
	score = 0
	lives = 4
	level = startLevel
	loadLevel()
	startState()
}

function startState() {
	if (lives <= 0) {
		endGame()
		return
	}
	displayScore()
	instructionsEl.innerHTML = message
	if (stateType === "instructions") {
		setBar(2000, false, nextLevel)
	} else {
		setBar(3000, true, tooSlow)
	}
}

function endGame() {
	instructionsEl.innerHTML = "You're out of lives"
	displayScore()
}

function setBar(time, setInteractive, callback) {
	clearTimeout(timeoutId)
	timeoutId = setTimeout(callback, time)
	barDelay = time-200
	barStartTime = null
	if (setInteractive) {
		barEl.classList.add("interactive")
		interactive = true
	} else {
		barEl.classList.remove("interactive")
		interactive = false
	}
}

function tooSlow() {
	score--
	lives--
	instructionsEl.innerHTML = "Too slow"
	displayScore()
	setBar(1000, false, repeatLevel)
}

function badAction() {
	score--
	lives--
	instructionsEl.innerHTML = "No"
	displayScore()
	setBar(1000, false, repeatLevel)
}

function goodAction() {
	score++
	if (wasQuick) {
		score++
		instructionsEl.innerHTML = "Great"
	} else {
		instructionsEl.innerHTML = "Good"
	}
	displayScore()
	setBar(500, false, nextLevel)
}

function repeatLevel() {
	startState()
}

function nextLevel() {
	level++
	loadLevel()
	startState()
}

function buildlevels() {
	levels = [
	{message: "When I say " + buttonName[actBlue] + ", click blue"},
	{btn:actBlue},
	{btn:actBlue},
	{message: "When I say " + buttonName[actRed] + ", click red"},
	{btn:actRed},
	{btn:actRed},
	{btn:actBlue},
	{btn:pickRandom([actRed, actBlue])},
	{btn:pickRandom([actRed, actBlue])},
	{message: "When I say " + buttonName[actReverse] + ", do the opposite"},
	{btn:actBlue, prefix: actReverse},
	{btn:actBlue},
	{btn:actRed, prefix: actReverse},
	{btn:actRed},
	{message: "When I say " + buttonName[actBlack] + ", click black"},
	{message: "When I say " + buttonName[actWhite] + ", click white"},
	{btn:actBlack},
	{btn:actWhite},
	{btn:pickRandom([actWhite, actBlack]), prefix: actReverse},
	{btn:pickRandom([actWhite, actBlack]), prefix: actReverse},
	{btn:pickRandom([actWhite, actBlack]), prefix: actReverse},
	{message: "When I say " + buttonName[actTick] + ", move 1 space clockwise"},
	{btn:actRed},
	{btn:actRed, prefix: actTick},
	{btn:pickRandom(allButtons), prefix: actTick},
	{btn:pickRandom(allButtons), prefix: actTick},
	{btn:pickRandom(allButtons)},
	{btn:pickRandom(allButtons), prefix: actTick},
	{message: "When I say " + buttonName[actInverse] + ", click any wrong answer"},
	{btn:pickRandom(allButtons), prefix2: actInverse},
	{btn:pickRandom(allButtons), prefix2: actInverse},
	{btn:pickRandom(allButtons), prefix2: actInverse},
	]
}

function pickRandom(list) {
	return list[Math.floor(Math.random() * list.length)]
}

function loadLevel() {
	task = null
	correctActions = []
	message = ""
	var levelData = levels[level]

	if (levelData === undefined) {
		//generate a level
		levelData = {}
		levelData.btn = pickRandom(allButtons)
		if (Math.random() < 0.4) levelData.prefix = pickRandom(allPrefixes)
		if (Math.random() < 0.2) {
			levelData.prefix2 = pickRandom(allPrefix2s)
		}
	}
	if (levelData.message != null) {
		stateType = "instructions"
		message = levelData.message
	} else {
		stateType = "task"
		task = levelData
		message = getMessage(task)
		correctActions = getCorrectActions(task)
	}
}

function getMessage(task) {
	var result = buttonName[task.btn]
	if (task.prefix) result = buttonName[task.prefix] + " " + result
	if (task.prefix2) result = buttonName[task.prefix2] + " " + result
	return result
}

function getCorrectActions(task) {
	var actions = []
	actions.push(task.btn)
	if (task.prefix === actReverse) {
		actions = [reverse(actions[0])]
	} 
	if (task.prefix === actTick) {
		actions = [tick(actions[0])]
	}
	if (task.prefix2 === actInverse) {
		var realActions = allButtons.filter(x => !actions.includes(x))
		return realActions
	}
	return actions
}

function tick(action) {
	switch (action) {
		case actBlue: return actBlack;
		case actBlack: return actRed;
		case actRed: return actWhite;
		case actWhite: return actBlue;
	}
}


function reverse(action) {
	switch (action) {
		case actBlue: return actRed;
		case actRed: return actBlue;
		case actBlack: return actWhite;
		case actWhite: return actBlack;
	}
}

function displayScore() {
	balanceEl.innerHTML = "Score: " + score + ", lives: " + lives
}

buildlevels()
start()

window.requestAnimationFrame(updateBar)
function updateBar (timestamp) {
	if (!barStartTime) barStartTime = timestamp
	var progress = timestamp - barStartTime
	var percent = Math.floor(progress*100/barDelay)
	wasQuick = (percent <= 60)
	barEl.style.width = Math.min(100, percent) + "%"
	requestAnimationFrame(updateBar)
}
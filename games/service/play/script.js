"use strict"

var vowels = ['a','e','i','o','u']
var mainMenu = []

var thanks = [
"Thank you!",
"Thanks",
"Cheers",
"Thank you so much!",
"Quickly please, I'm in a hurry.",
"Yes that's correct.",
"Yes thankyou.",
"Cool.",
"I hope it comes faster than last week."
]

var orderStarters = [
"Can I please have ",
"Can I get ",
"I would like ",
"I want ",
"Give me ",
"Let's have ",
"How about "
]

var doubleOrderStarters = [
"Can we please have ",
"Can we get ",
"We would like ",
"We want ",
"Give us ",
"Let's have ",
"How about "
]

var breakfast = [
{name:"BACK", link: mainMenu},
{name:"porridge", price:9.5, prefix: "some"},
{name:"banana bread", price:3.5, prefix: "some"},
{name:"soft boiled eggs", price:12, prefix: "some"},
{name:"crumbed eggs", price:15, prefix: "some"},
{name:"eggs benedict", price:18, prefix: "some"},
{name:"pancakes", price:17, prefix: "some"},
{name:"poached eggs", price:9, prefix: "some"}
]

var burgers = [
{name:"BACK", link: mainMenu},
{name:"beef burger", price:12.5},
{name:"chicken burger", price:11.5},
{name:"pork burger", price:12.5},
{name:"falafel burger", price:10.5},
{name:"shoestring fries", price:4.5, prefix: "some"},
{name:"spicy chicken burger", price:15},
{name:"everything burger", price:17.5}
]

var sides = [
{name:"BACK", link: mainMenu},
{name:"egg", price:3, error: " (breakfast side)"},
{name:"tomato", price:3},
{name:"truffle", price:8},
{name:"mushroom", price:3},
{name:"bacon", price:4.5, prefix:"", error: " (breakfast side)"},
{name:"toast", price:5, prefix: ""},
{name:"salmon", price:5, prefix: ""}
]

var extras = [
{name:"BACK", link: mainMenu},
{name:"swiss cheese", price:3, prefix: "some"},
{name:"pineapple", price:3, prefix: "some"},
{name:"fried egg", price:3},
{name:"extra beef", price:3, prefix: ""},
{name:"extra chicken", price:4.5, prefix: ""},
{name:"bacon", price:3, prefix: "some", error: " (burger extra)"},
{name:"beetroot", price:3, prefix: "some"}
]

var drinks = [
{name:"BACK", link: mainMenu},
{name:"flat white", price:4.5},
{name:"long black", price:4.5},
{name:"soy flat white", price:4.5},
{name:"chai latte", price:4.5},
{name:"short black", price:4.5},
{name:"cappuccino", price:4.5},
{name:"hot chocolate", price:7.5}
]


var editMenu = [
{name:"BACK", link: mainMenu},
{name:"Delete item 1", delete: 1},
{name:"Delete item 2", delete: 2},
{name:"Delete item 3", delete: 3},
{name:"Delete item 4", delete: 4},
{name:"Delete item 5", delete: 5},
{name:"Delete item 6", delete: 6},
{name:"Delete item 7", delete: 6},
]

mainMenu.push({name:"breakfast", link:breakfast})
mainMenu.push({name:"burgers", link:burgers})
mainMenu.push({name:"drinks", link:drinks})
mainMenu.push({name:"sides", link:sides})
mainMenu.push({name:"extras", link:extras})
mainMenu.push({name:"CONFIRM", confirm:true})
mainMenu.push({name:"Edit", link:editMenu})
mainMenu.push({name:""})

var resultMenu = [{name:"Next", next:true}]
var badResultMenu = [{name:"I'm sorry", next:true}]

for (var i = 0; i < 7; i++) {
	resultMenu.push({name:"", next:true})
	badResultMenu.push({name:"", next:true})
	}

var endMenu = [
{name:"the end"}
]


var currentMenu = mainMenu
var order = []
var timer = 0
var expectedOrder = []
var txt = ""
var ordering = false

//score
var correctOrders = 0
var failedOrders = 0
var totalOrders = 0
var customers = 9
var averageSpeeds = []

var optionsEl = document.querySelector(".options")
var orderEl = document.querySelector(".order")
var customerEl = document.querySelector(".customer")
var scoreEl = document.querySelector(".score")
var timerEl = document.querySelector(".timer")

optionsEl.addEventListener("click", function (event) {
	var index = event.target.dataset.id
	var selection = currentMenu[index]
	console.log("click " + index + " " + selection.name)
	if (selection.link != undefined) {
		showMenu(selection.link)
	}
	if (selection.price != undefined) {
		order.push(selection)
		showOrder()
	}
	if (selection.delete != undefined) {
		order.splice(selection.delete - 1, 1)
		showOrder()
	}
	if (selection.confirm != undefined) {
		confirmOrder()
	}
	if (selection.next) {
		nextOrder()
	}
})

nextOrder()

function nextOrder() {
	order = []
	expectedOrder = []
	txt = ""

	var rand = rng()
	
	//hack: no hard orders until order 3
	while (totalOrders < 3 && rand > 0.8) rand = rng()

	if (rand < 0.4) {
		//solo breakfast order
		txt = pickRandom(orderStarters)
		addMain()
		if (rng() > 0.8) addSide()
		if (rng() > 0.5) addDrink()
		addEnding()
	} else if (rand < 0.8) {
		//solo burger order
		txt = pickRandom(orderStarters)
		addBurger()
		if (rng() > 0.7) addExtra()
		if (rng() > 0.5) addFries()
		if (rng() > 0.7) addDrink()
		addEnding()
	} else if (rand < 0.9) {
		//double burgers
		txt = pickRandom(doubleOrderStarters)
		addBurger()
		if (rng() > 0.9) addExtra()
		var bothdrinks = (rng() > 0.7)
		if (bothdrinks || rng() > 0.9) addDrink()
		txt += " and "
		addBurger()
		if (rng() > 0.9) addExtra()
		if (rng() > 0.7) {addFries()} else if (rng() > 0.7) addFriesx2()
		if (bothdrinks || rng() > 0.9) addDrink()
		addEnding()
	} else {
		//double breakfast
		txt = pickRandom(doubleOrderStarters)
		addMain()
		if (rng() > 0.8) addSide()
		var bothdrinks = (rng() > 0.7)
		if (bothdrinks || rng() > 0.9) addDrink()
		txt += " and "
		addMain()
		if (rng() > 0.8) addSide()
		if (bothdrinks || rng() > 0.9) addDrink()
		addEnding()
	}
	ordering = true
	customerEl.innerHTML = txt
	showMenu(mainMenu)
	showScores()
}

function addMain(){
	var main = pickRandomItem(breakfast)
	//no dupes
	while (expectedOrder.indexOf(main) >= 0) main = pickRandomItem(breakfast)
	expectedOrder.push(main)
	txt += addWords(main)
}

function addBurger(){
	var main = pickRandomItem(burgers)
	//no fries and no dupes
	while (main.name.indexOf("fries") >= 0 || expectedOrder.indexOf(main) >= 0) main = pickRandomItem(burgers)
	expectedOrder.push(main)
	txt += addWords(main)
}

function addFries() {
	var fries = burgers[5] //such a hack
	expectedOrder.push(fries)
	txt += " and "
	txt += addWords(fries)
	console.log("Fries were " + fries.name)
}

function addFriesx2() {
	var fries = burgers[5] //such a hack
	expectedOrder.push(fries)
	expectedOrder.push(fries)
	txt += " and two lots of fries"
}

function addDrink() {
	var drink = pickRandomItem(drinks)
	expectedOrder.push(drink)
	txt += " and "
	txt += addWords(drink)
}

function addSide() {
	var side = pickRandomItem(sides)
	expectedOrder.push(side)
	txt += " with "
	txt += addWords(side)
	if (rng() > 0.5) txt += " on the side"
}

function addExtra() {
	var extra = pickRandomItem(extras)
	expectedOrder.push(extra)
	txt += " with "
	txt += addWords(extra)
}

function addEnding() {
	if (txt.indexOf("Can") === 0) {
		txt += "?"
	} else {
		txt += "."
	}
}

function addWords(item) {
	if (item.prefix !== undefined) return item.prefix + " " + item.name
	if (vowels.indexOf(item.name.charAt(0)) >= 0) return "an " + item.name
	return "a " + item.name

}

function pickRandomItem(menu) {
	var i = Math.floor(Math.random() * menu.length)
	while (menu[i].price === undefined) {
		i = Math.floor(Math.random() * menu.length)
	}
	return menu[i]
}

setInterval(function () {
	timer++
	timerEl.innerHTML = timer
}, 1000)

function showMenu(menu) {
	currentMenu = menu
	optionsEl.innerHTML = ""
	var i = 0
	menu.forEach(function (item) {
		var el = document.createElement("div")
		el.classList.add("option")
		el.innerHTML = item.name
		el.dataset.id = i++
		optionsEl.appendChild(el)
	})
}

function showOrder() {
	orderEl.innerHTML = ""
	order.forEach(function (item) {
		var el = document.createElement("div")
		el.classList.add("orderItem")
		el.innerHTML = item.name + " - $" + item.price
		orderEl.appendChild(el)
	})	
}

function confirmOrder() {
	var correct = 0
	var incorrect = []
	order.forEach(function (item) {
		if (expectedOrder.includes(item)) {
			var index = expectedOrder.indexOf(item)
			expectedOrder.splice(index, 1)
			correct++
		} else {
			incorrect.push(item)
		}
	})
	var missing = expectedOrder
	var message = "";
	console.log(expectedOrder)
	var good
	if (missing.length == 0 && incorrect.length == 0) {
		message = pickRandom(thanks)
		correctOrders++
		good = true
	} else {
		failedOrders++
		good = false
		if (incorrect.length > 0) {
			message = "You added these but they were not ordered: "
			message += incorrect.map(x=>x.name + (x.error || "")).join(", ") + ". "
		}
		if (missing.length > 0) {
			message += "You forgot this from the order: "
			message += missing.map(x=>x.name + (x.error || "")).join(", ") + "."
		}
	}
	ordering = false
	totalOrders++
	averageSpeeds.push(timer)
	timer = 0
	var averageSpeed = getAverageSpeed()
	if (customers - totalOrders == 0) {
		message += "<br>----<br>That's the end of your shift."
		if (failedOrders > 1) {
			message += " You need to make less mistakes next time! "
		}
		if (failedOrders < totalOrders / 2) {
			message += "Your average speed was " + averageSpeed + " seconds"
			if (averageSpeed <= 11) {
				message += "! You're a pro. You could show me a thing or two!"
			} else if (averageSpeed <= 13) {
				message += " which is great! You're faster than most of the other staff!"
			} else if (averageSpeed <= 15) {
				message += " which is great! You're keeping up with some of our experienced staff."
			} else if (averageSpeed <= 17) {
				message += " which is pretty good - for a beginner. Nice job."
			} else if (averageSpeed <= 20) {
				message += " which is ok for a beginner! Well done."
			} else if (averageSpeed <= 30) {
				message += " which is ok for a beginner, but you need to work harder."
			} else {
				message += " which is not good enough! I expect big improvements."
			}
		}
		showMenu(endMenu)	
	} else {
		showMenu(good ? resultMenu : badResultMenu)	
	}
	customerEl.innerHTML = message
	showScores()
}

function showScores() {
	scoreEl.innerHTML = "<div>Customers left: " + (customers - totalOrders) + "</div>"
	+ "<div>Failed orders: " + failedOrders + " out of " + totalOrders + "</div>"
	+ "<div>Average speed: " + getAverageSpeed() + "s</div>"

}

function getAverageSpeed() {
	if (averageSpeeds.length == 0 || correctOrders === 0) return 0
	var total = averageSpeeds.reduce(( acc, cur ) => acc + cur, 0);
	return Math.ceil(total / correctOrders)
}

function pickRandom(list) {
	var i = Math.floor(Math.random() * list.length)
	return list[i]	
}

function rng() {
	return Math.random()
}
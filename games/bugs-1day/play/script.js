"use strict"

//2:12pm - 4:20pm (2:08)
//5:05 - 6:15 (1:10)
//total: 3:18

//things to do:
//more things in the shop
//[x] buy mining helmets
//[x] smarter farming
//[x] smarter mining

//maybe remove the one-by-one purchases, they're fiddley
//make warriors do something, or remove them
//  defend against escalating attacks


var maxMessages = 10

var messagesEl = document.querySelector(".messages")
var promptEl = document.querySelector(".prompt")

var farm
var temp

for (let i = 0; i < maxMessages; i++) {
	//empty filler spans determine how many messages we display at a time
	messagesEl.appendChild(document.createElement("span"))
}

promptEl.addEventListener('click', function (event) {
	if (event.target.localName === "a" && event.target.dataset.action != undefined) {
		event.preventDefault()
		doAction(event.target.dataset.action)
	}
})

promptEl.addEventListener('keypress', function (event) {
	if (event.target.localName === "input" && event.keyCode === 13) {
		var link = promptEl.querySelector("a")
		doAction(link.dataset.action)
	}
})

function doAction(action) {
	if (action==='info') {
		showInfo()
	}
	if (action==='jobs') {
		temp.farmers = farm.farmers
		temp.miners = farm.miners
		temp.warriors = farm.warriors
		setWorkerNumberPrompt('farmers')
	}
	if (action.includes('set-workers')) {
		var type = action.replace('set-workers-', '')
		setWorkers(type)
		var next = nextJobType(type)
		if (next !== undefined) {
			setWorkerNumberPrompt(next)	
		} else {
			farm.farmers = temp.farmers
			farm.miners = temp.miners
			farm.warriors = temp.warriors
			correctWorkerTotals()
			addMessage("Jobs changed")
			showJobInfo()
			setDefaultPrompt()
		}
	}
	if (action.includes("buy-1-")) {
		var product = action.replace("buy-1-", '')
		var amount = 1
		buyProduct(product, amount)
	}
	if (action.includes("buy-10-")) {
		var product = action.replace("buy-10-", '')
		var amount = 10
		buyProduct(product, amount)
	}
	if (action.includes("buy-event-")) {
		var code = action.replace("buy-event-", '')
		var product = shopItems.find(x => x.code === code)
		var price = product.price
		if (price > farm.gold) {
			addMessage("You can't afford that.")
		} else {
			var sads = farm.bugs - farm.happy
			var betters = 0
			for (let i = 0; i < sads; i++) { if (rnd100() > 50) betters++ }
			if (sads > 0 && betters === 0) betters++
			addMessage(`Your party cheered up ${betters} sad bugs!`)
			farm.happy += betters
		}
	}
	if (action==='back') {
		setDefaultPrompt()
	}
	if (action==='shop') {
		showShop()
	}
	if (action==='endturn') endTurn()
	window.scrollTo(0,document.body.scrollHeight)
}


function buyProduct(code, amount) {
	var product = shopItems.find(x => x.code === code)
	var price = amount * product.price
	if (farm.items[code] > 0 && !product.multi) {
		addMessage("You you need one of those and you already have it.")
	} else if (price > farm.gold) {
		addMessage("You can't afford that.")
		return
	} else {
		farm.gold -= price
		addMessage("Purchased!")
		farm.items[code]+= amount
		showShop() //update shop info
	}
}

var shopItems = []
shopItems.push({name:'farming gloves', price:4, code:"farmtools", multi:true})
shopItems.push({name:'farm irrigation', price:40, code:"farmtech", multi:false})
shopItems.push({name:'mining helmet', price:8, code:"minetools", multi:true})
shopItems.push({name:'mine floodlights', price:80, code:"minetech", multi:false})
shopItems.push({name:'throw a party', price:20, code:"party", multi:false, event:true})


function showShop() {
	var lines = []
	shopItems.forEach(function (s) {
		if (s.event) {
			lines.push("<div>" + s.name + " $" + s.price + " [buy-event-" + s.code + "|do it]</div>")
		} else if (s.multi) {
			lines.push(
				"<div>" + s.name + " $" + s.price 
				+ " (" + farm.items[s.code] + ") [buy-1-" 
				+ s.code + "|buy] [buy-10-" + s.code + "|buy 10]" + "</div>")
		} else if (farm.items[s.code] === 0) {
			lines.push("<div>" + s.name + " $" + s.price + " [buy-1-" + s.code + "|buy]" + "</div>")
		} else {
			lines.push("<div>" + s.name + " $" + s.price + " (already bought)" + "</div>")
		}
	})
	
	setPrompt("-- The shop! -- $" + farm.gold + lines.join('') + "<div>[back|back]</div>")
}

function endTurn() {
	farm.day++
	addMessage("–––––––––––––")
	addMessage("– Day " + farm.day + " –")

	//eating
	if (farm.food >= farm.bugs) {
		farm.food -= farm.bugs
		addMessage(`Your bugs eat ${farm.bugs} food.`)
	} else {
		var hungry = farm.bugs - farm.food
		farm.food = 0
		var dead = 0
		for (let i = 0; i < hungry; i++) { if (rnd100() > 50) dead++ }
		farm.bugs -= dead
		farm.happy -= dead * 2
		if (farm.happy < 0) farm.happy = 0
		var suffix = (dead > 0) ? ` and ${dead} died of hunger :(` : " :("
		addMessage(`${hungry} bugs went hungry` + suffix)
	}
	//work
	correctWorkerTotals()
	var newFood = calculateFoodProduction()
	var newGold = calculateGoldProduction()
	farm.food += newFood
	farm.gold += newGold
	addMessage(`You grow ${newFood} food and mine ${newGold} gold.`)

	//the hoard
	if (farm.hoard > -1 && farm.hoard < 2) {
		addMessage("* The hoard approaches. *")
	}
	if (farm.hoard >= 2) {
		if (rnd100() > 50) {
			var attack = Math.floor(Math.random() * farm.hoard) + 1
			if (attack <= farm.warriors) {
				addMessage(`The hoard attacks with ${attack} ants! Your warriors scare them off!`)
				if (farm.happy < farm.bugs) {
					var sads = farm.bugs - farm.happy
					for (let i = 0; i < sads; i++) { if (rnd100() > 70) farm.happy++ }
				}
			} else {
				var defended = farm.warriors
				var kidnapped = Math.min(attack-defended, farm.bugs-farm.warriors)
				if (defended > 0) {
					addMessage(`The hoard attacks! Your warriors fight off ${defended}, but ${kidnapped} more kidnap ${kidnapped} of your bugs.`)
				} else {
					addMessage(`The hoard attacks! They kidnap ${kidnapped} bugs.`)
				}
				farm.bugs -= kidnapped
				farm.happy -= kidnapped * 2
				if (farm.happy < 0) farm.happy = 0
		  }
		} else {
			addMessage(`A hoard of ${Math.floor(farm.hoard)} circle your farm.`)
		}
	}
	farm.hoard+= 0.5
	if (farm.day > 32) farm.hoard += 0.5

	//reproduction
	var babies = 0
	for (let i = 0; i < farm.happy/2; i++) { if (rnd100() > 70) babies++ }
	var oldAge = 0
	for (let i = 0; i < farm.bugs; i++) { if (rnd100() > 90) oldAge++ }
	farm.bugs = farm.bugs + babies - oldAge
	farm.happy = farm.happy + babies - oldAge
	if (farm.happy < 0) farm.happy = 0
	addMessage(`${babies} new bugs were born and ${oldAge} died naturally.`)
	correctWorkerTotals()

	showInfo()
	if (farm.bugs === 0) {
		setPrompt("The End")
	}

}

function calculateFoodProduction() {
	var farmers = 0
	var superFarmers = 0
	var multi = 1
	if (farm.items.farmtools < farm.farmers) {
		superFarmers = farm.items.farmtools
		farmers = farm.farmers - superFarmers
	} else {
		superFarmers = farm.farmers
	}
	if (farm.items.farmtech > 0) multi = 1.2
  return Math.floor(farmers * 2 + superFarmers * 3)
}

function calculateGoldProduction() {
	var golders = 0
	var superGolders = 0
	var multi = 1
	if (farm.items.minetools < farm.miners) {
		superGolders = farm.items.minetools
		golders = farm.miners - superGolders
	} else {
		superGolders = farm.miners
	}
	if (farm.items.minetech > 0) multi = 1.2
  return Math.floor(golders * 1 + superGolders * 1.5)
}

function correctWorkerTotals() {
	if (totalWorkers() < farm.bugs) {
		farm.farmers = (farm.bugs - farm.miners - farm.warriors)
	}
	while (totalWorkers() > farm.bugs && farm.miners > 0) {
		farm.miners--
	}
	while (totalWorkers() > farm.bugs && farm.farmers > 0) {
		farm.farmers--
	}
	while (totalWorkers() > farm.bugs && farm.warriors > 0) {
		farm.warriors--
	}
}

function totalWorkers() {
	return farm.farmers + farm.miners + farm.warriors
}

function rnd100() { return Math.random()*100}

function showInfo() {
	addMessage(`You have ${farm.bugs} bugs, ${farm.food} food and ${farm.gold} gold.`)
	showJobInfo()
	addMessage(`${farm.happy} happy (${Math.round(farm.happy*100/farm.bugs)}%)`)
}

function showJobInfo() {
	addMessage(`${farm.farmers} farmers, ${farm.miners} miners, ${farm.warriors} warriors.`)
}

function nextJobType(type) {
	var list = ['farmers','miners','warriors']
	return list[list.indexOf(type)+1]
}

function setWorkerNumberPrompt(type) {
	var freeBugs = getAvailableWorkersAtStep(type)
	var suggested = Math.min(freeBugs, farm[type])
	if (type === 'warriors') suggested = freeBugs
	setPrompt(`<input type="number" min="0" max="${freeBugs}" value="${suggested}"> ${type} [set-workers-${type}|ok]`)
	promptEl.querySelector("input").focus();
}

function getAvailableWorkersAtStep(type) {
	var availableBugs = farm.bugs
	if (type != 'farmers') availableBugs -= temp.farmers
	if (type != 'farmers' && type != 'miners') availableBugs -= temp.miners	
	return availableBugs
}

function setWorkers(type) {
		var val = parseInt(promptEl.querySelector('input').value)
		if (val < 0) val = 0
		var availableBugs = getAvailableWorkersAtStep(type)
		if (val > availableBugs) val = availableBugs
		temp[type] = val
}

function addMessage(text) {
		var el = document.createElement("div")
		el.innerHTML = text
		messagesEl.appendChild(el)
		//remove first child so they rotate
		messagesEl.removeChild(messagesEl.children[0])
}

function setPrompt(text) {
	promptEl.innerHTML = parse(text)
}

function parse(string) {
	var result = string.replace(/\[/g, '<a href="#asd" data-action="');
	var result = result.replace(/\|/g, '">');
	var result = result.replace(/\]/g, '</a>');
	return result
}

function start() {
	farm = {}
	farm.day = 1
	farm.bugs = 10
	farm.food = 15
	farm.gold = 0
	farm.farmers = 10
	farm.miners = 0
	farm.warriors = 0
	farm.happy = 10
	farm.hoard = -1.5
	temp = {}
	farm.items = {}
	shopItems.forEach(s => farm.items[s.code] = 0)
	setDefaultPrompt()
	doAction("info")
}

function setDefaultPrompt() {
	setPrompt("[jobs|change jobs] [shop|spend gold] [endturn|end turn] [info|info]")
}

start()

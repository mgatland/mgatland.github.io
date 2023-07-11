//3:09 pm - 5:05pm

//basic game is working, now
//P1
//stocks should have trends, up and down

//P1
//underlying sectors should have trends \ crashes?
//the whole market should have trends / crashes?

var stocks = []
var stockTogglesEl = document.querySelector('.stockToggles')
var cashEl = document.querySelector('.cash')
var buyAmountEl = document.querySelector('.buyAmount')
var chart

var cash = 10000

var colors = ['red', 'green', 'blue', 'cyan', 'yellow', 'magenta', 'orange', 'white', 'purple', 'pink']
addStock("FROO", "tech")
addStock("GNOG", "tech")
addStock("SPIN", "fidget")
addStock("FIDG", "fidget")
addStock("OBER", "transport")
addStock("BUSX", "transport")
addStock("ARMZ", "weapons")
addStock("FRDM", "weapons")
addStock("DIGR", "energy")
addStock("XPLR", "energy")

var random = new TimeSeries();
setInterval(function() {
	stocks.forEach(function (stock) {
		var vol = stock.volatility
		var change = Math.random() * vol - Math.random() * vol + Math.random() * vol - Math.random() * vol
		stock.value = stock.value + Math.floor(change * 100) / 100
		if (stock.value < 1) stock.value = 1
		stock.timeSeries.append(new Date().getTime(), stock.value)
	})
	updateDisplay()
}, 250)

function createTimeline() {
  chart = new SmoothieChart()
  chart.streamTo(document.getElementById("chart"), 250)
}
createTimeline()

function addStock(code) {
	var stock = {}
	stock.code = code
	stock.amount = 0
	stock.shown = false
	stock.volatility = Math.random() * 5 + Math.random() * 15
	stock.value = Math.floor(Math.random() * 300)
	stock.color = colors.shift()
	stock.timeSeries = new TimeSeries()
	stocks.push(stock)
	var rowEl = document.createElement("div")
	rowEl.dataset.code = code
	rowEl.classList.add("row")
	rowEl.innerHTML = "<div class='key' style='background-color:" + stock.color + "'></div>" 
	+ "<div class='stockCode'>" + code + "</div>"
	+ "<button class='toggle'>Show</button>"
	+ "<button class='buy'>Buy</button>"
	+ "<button class='sell'>Sell</button>"
	+ "<div class='owned'></div>"
	stockTogglesEl.appendChild(rowEl)
	stock.amountEl = document.querySelector("[data-code='" + stock.code + "'] .owned")
}

stockTogglesEl.addEventListener('click', function (e) {
	if (e.target.matches('button')) {
	    e.stopPropagation()
	    var stockCode = e.target.parentElement.dataset.code
	    var stock = getStock(stockCode)
	    if (e.target.classList.contains('toggle')) toggleStock(stock, e.target)
	    if (e.target.classList.contains('buy')) buyStock(stock, e.target)
	    if (e.target.classList.contains('sell')) sellStock(stock, e.target)
	}
})

function buyStock(stock) {
	var amount = getBuyAmount(stock)
	if (amount * stock.value > cash) amount = Math.floor(cash / stock.value)
	cash -= amount * stock.value
	stock.amount += amount
	updateDisplay()
}

function sellStock(stock) {
	var amount = getBuyAmount(stock)
	if (amount > stock.amount) amount = stock.amount
	cash += stock.value * amount
	stock.amount -= amount
	updateDisplay()
}

function getBuyAmount(stock) {
	return Math.floor(buyAmountEl.value / stock.value)
}

function toggleStock(stock, button) {
  if (stock.shown) {
  	stock.shown = false
  	chart.removeTimeSeries(stock.timeSeries)
  	button.innerHTML = "Show"
  } else {
  	stock.shown = true
  	chart.addTimeSeries(stock.timeSeries, { strokeStyle: stock.color, lineWidth: 4 })
  	button.innerHTML = "Hide"
  }
}

function getStock(stockCode) {
	return stocks.find(x => x.code === stockCode)
}

updateDisplay()

function updateDisplay() {
	stocks.forEach(function (stock) {
		stock.amountEl.innerHTML = "" 
		+ stock.amount.toLocaleString() 
		+ " @ " + stock.value.toLocaleString() 
		+ " = " + (stock.amount * stock.value).toLocaleString()
	})
	displayCash()
}

function displayCash() {
	cashEl.innerHTML = "Cash: $" + cash.toLocaleString()
	var netValue = stocks.reduce((acc, stock) => acc + stock.amount * stock.value, 0)
	cashEl.innerHTML += "<br>Share value: $" + netValue.toLocaleString()
}
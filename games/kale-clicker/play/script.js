var total = 0;
var pickTimer = 100;
var pickTimerElement = document.querySelector(".pickTimer");

var displayElement = document.querySelector(".total");
var messagesElement = document.querySelector(".messages");

var hint1 = false;
var oldTick = undefined;

document.querySelector(".gardenPick").addEventListener("click", function () {
	if (pickTimer >= 100) {
		total++;
		pickTimer = 0;
		updateDisplay();
	}
})

var assets = [];

assets.push({
	unlocked: false,
	cost:10,
	buttonText: "Hire a seasonal worker",
	buyMessageText
: "You hired a seasonal worker.",
	pluralText: " seasonal workers",
	activityText: "Picking a leaf",
	unlockText: "You can now hire seasonal workers!",
	count: 0,//mutable
	progress: 0,//mutable
	payoff: 1,
	percentEach: 0.8,
	codeName:"seasonalWorker"
});

assets.push({
	codeName:"smoothie",
	cost:60,
	buttonText: "Buy a Smoothie Machine",
	buyMessageText: "You bought a Smoothie Machine",
	pluralText: " Smoothie Machines",
	activityText: "Mixing smoothies",
	unlockText: "You can now buy Smoothie Machines!",
	payoff: 20,
	percentEach: 0.1,
	//mutables:
	unlocked: false,
	count: 0,//mutable
	progress: 0//mutable
})

assets.push({
	codeName:"shirt",
	cost:150,
	buttonText: "Hire a trendy shirtsmith",
	buyMessageText: "You hired a trendy shirtsmith",
	pluralText: " Shirtsmiths",
	activityText: "Selling a kale shirt",
	unlockText: "You can now hire shirtsmiths!",
	payoff: 150,
	percentEach: 0.05,
	//mutables:
	unlocked: false,
	count: 0,//mutable
	progress: 0//mutable
})

assets.push({
	codeName:"builder",
	cost:300,
	buttonText: "Hire an avocado architect",
	buyMessageText: "You hired a avocado architect",
	pluralText: " architects",
	activityText: "Designing an avocado house",
	unlockText: "You can now hire avocado architects!",
	payoff: 1000,
	percentEach: 0.01,
	//mutables:
	unlocked: false,
	count: 0,//mutable
	progress: 0//mutable
})

assets.forEach(setupAsset);

function setupAsset(asset) {
	asset.countElement = document.querySelector("." + asset.codeName + "Display");
	asset.progressElement = document.querySelector("." + asset.codeName + "ProgressDisplay");
	asset.progressElement.classList.add("hidden");
	asset.progressElement.innerHTML = "<div class='display barLabel'>" + asset.activityText + " (" + asset.payoff + " kale): </div><div class='bar'></div>";
	asset.barElement = document.querySelector("." + asset.codeName + "Block .bar");
	asset.blockElement = document.querySelector("." + asset.codeName + "Block");
	asset.buttonElement = document.querySelector("." + asset.codeName + "Buy");

	asset.buttonElement.addEventListener("click", function () {
		buyAsset(asset)
	})
	setButtonText(asset);
}

function setButtonText(asset) {
	asset.buttonElement.innerHTML = asset.buttonText
 + " (" + asset.cost + " kale)";
}

function buyAsset(asset) {
	if (total >= asset.cost) {
		total -= asset.cost;
		asset.count++;
		addMessage(asset.buyMessageText);
		asset.cost = Math.floor(asset.cost * 1.1);
		setButtonText(asset);
		asset.countElement.innerHTML = "You have " + asset.count + asset.pluralText;
		if (asset.count == 1) {
			//first purchase
			asset.progressElement.classList.remove("hidden");
		}
	}
	updateDisplay();
}

function setBarWidth(barElement, widthPercent) {
  barElement.style.width= Math.floor((100-widthPercent)*1.5) +  'px';
}

//tick
var tickFunction = function (timestamp) {
	if (oldTick === undefined) oldTick = timestamp;
	var ticks = Math.round((timestamp - oldTick) / 16);
	oldTick = oldTick + ticks * 16;
	if (ticks > 0) {
		assets.forEach(tickAsset, {ticks: ticks});
		if (pickTimer < 100) {
			pickTimer += 6 * ticks;
		} else {
			pickTimer = 100;
		}
		setBarWidth(pickTimerElement, pickTimer);
		updateDisplay();
	}
	window.requestAnimationFrame(tickFunction);
}
window.requestAnimationFrame(tickFunction);

function tickAsset(asset) {
	if (asset.count > 0) {
		asset.progress += asset.count * asset.percentEach * this.ticks;
		while (asset.progress > 100) {
			asset.progress -= 100
			total += asset.payoff;
		}
	}
}

function updateDisplay() {
	displayElement.innerHTML = total;
	assets.forEach(displayAsset);
	updateReactions();
}

function displayAsset(asset) {
	if (!asset.unlocked && total >= asset.cost) {
		asset.unlocked = true;
		asset.blockElement.classList.remove("hidden");
		addMessage(asset.unlockText);
	}
	if (asset.count > 0) {
		var percent = Math.floor(asset.progress);
		if (asset.count * asset.percentEach >= 50) {
			percent = 100;
		}
		setBarWidth(asset.barElement, percent);
	}
}

function updateReactions() {
	if (!assets[0].unlocked) {
		if (total === Math.round(assets[0].cost * .5) && !hint1) {
			addMessage("Keep clicking!");
			hint1 = true;
		}
	}
}

function addMessage(text) {
	var msgDiv = document.createElement('div');
	msgDiv.className = "message";
	msgDiv.innerHTML = text;
	messagesElement.appendChild(msgDiv);
	setTimeout(function () {
		msgDiv.style.opacity = '0'
		msgDiv.style.height = '0'
	}, 1000)
	setTimeout(function () {
		messagesElement.removeChild(msgDiv);
	}, 2000)
}
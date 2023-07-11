"use strict"
//12:26AM - 1:22AM
//3:56pm - 4:30pm
//days later:
//4:51pm - 5:32PM
//DONE -  still to publish
//total: 2 hour 11 minutes

var fiveByFive = document.querySelectorAll('.grid')

var gridText = ""
for (let i = 0; i < 25; i++) { gridText += "<div class='cell'></div>"}
fiveByFive.forEach(el => el.innerHTML = gridText)

var firstExampleGrid = document.querySelector('.egFirst')
var exampleKey = filterKeyword("LAND")
var i = 0
for (var c of exampleKey) {
	firstExampleGrid.children[i++].innerHTML = displayChar(c)
}

var secondExampleGrid = document.querySelector('.egSecond')
var secondEgCode = exampleKey + getAlphabetMinus(exampleKey)
var i = 0
for (var c of secondEgCode) {
	secondExampleGrid.children[i++].innerHTML = displayChar(c)
}

var thirdExampleGrid = document.querySelector('.egThird')
thirdExampleGrid.innerHTML = secondExampleGrid.innerHTML
thirdExampleGrid.children[1].classList.add('source')
thirdExampleGrid.children[18].classList.add('source')
thirdExampleGrid.children[3].classList.add('dest')
thirdExampleGrid.children[16].classList.add('dest')

document.querySelectorAll('.egLandGrid').forEach(el => el.innerHTML = secondExampleGrid.innerHTML)

var inputOne = document.querySelector(".inputOne")
var answerOne = encode("ATTACK AT SIX AMQ", "LAND")
var feedbackOne = document.querySelector(".feedbackOne")
inputOne.addEventListener("keyup", function(e) {
	feedbackOne.innerHTML = giveFeedback(inputOne.value, answerOne)
})

var inputTwo = document.querySelector(".inputTwo")
var answerTwo = encode("GO NORTH TO OTHER BASE", "LAND")
var feedbackTwo = document.querySelector(".feedbackTwo")
inputTwo.addEventListener("keyup", function(e) {
	feedbackTwo.innerHTML =  giveFeedback(inputTwo.value, answerTwo)
})

var inputThree = document.querySelector(".inputThree")
var answerThree = "FLYMETOTHEMOON"
var feedbackThree = document.querySelector(".feedbackThree")
inputThree.addEventListener("keyup", function(e) {
	feedbackThree.innerHTML =  giveFeedback(inputThree.value, answerThree)
})

document.querySelectorAll(".page").forEach(el => el.classList.add("hidden"))
document.querySelector(".page").classList.remove("hidden")
document.querySelectorAll(".nextPage").forEach(el => el.addEventListener('click', function (e) {
	document.querySelector(".page.hidden").classList.remove("hidden")
	e.target.classList.add("hidden")
}))

function giveFeedback(value, answer) {
	var cleanValue = cleanMessage(value)
	if (cleanValue === "") return ""
	if (cleanValue===answer) return "Correct"
	if (answer.indexOf(cleanValue)===0) return "Going OK"
	return "Incorrect"
}

function filterKeyword(string) {
	return string.toUpperCase().split("").filter(function(x, n, s) { return s.indexOf(x) == n }).join("");
}

function displayChar(c) {
	c = c.toUpperCase()
	if (c === 'I') return 'I|J'
	return c
}

function getAlphabetMinus(key) {
	var alphabet = "ABCDEFGHIKMNOPQRSTUVWXYZ" //no J
	for (var c of key) {
		alphabet = alphabet.replace(c, "")
	}
	return alphabet
}

function cleanMessage(msg) {
	return msg.toUpperCase().replace(/[^A-Z]/g,'').replace('J', 'I')
}

function encode(message, keyword) {
	var gridText = filterKeyword(keyword) + getAlphabetMinus(keyword)
	var result = ""
	message = cleanMessage(message)
	for (let i = 0; i < message.length; i += 2) {
		var pair = message.substring(i, i + 2)
		if (pair.length===1) pair = pair + "Q"
		var p1 = getXY(pair[0], gridText)
		var p2 = getXY(pair[1], gridText)
		if (pair[0]===pair[1]) {
			console.log("injecting a Q to avoid an identical letter pair")
			var filler = (pair[0] != 'Q') ? 'Q' : 'X'
			message = message.slice(0, i+1) + filler + message.slice(i+1)
			i -= 2 //repeat this step
		} else if (p1.x===p2.x) {
			p1.y++
			p2.y++
			result += charsAtPos(p1, p2, gridText)
		} else if (p1.y===p2.y) {
			p1.x++
			p2.x++
			result += charsAtPos(p1, p2, gridText)
		} else {
			var temp = p2.x
			p2.x = p1.x
			p1.x = temp
			result += charsAtPos(p1, p2, gridText)
		}
	}
	return result
}

function charsAtPos(p1, p2, gridText) {
	return charAtPos(p1, gridText) + charAtPos(p2, gridText)
}

function charAtPos(p, gridText) {
	if (p.x < 0) p.x += 5
	if (p.x >= 5) p.x -= 5
	if (p.y < 0) p.y += 5
	if (p.y >= 5) p.y -= 5
	return gridText.charAt(p.x + p.y*5)
}

function getXY(char, gridText) {
	var i = gridText.indexOf(char)
	return {x: i % 5, y: Math.floor(i / 5)}
}
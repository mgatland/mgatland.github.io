"use strict";
define(function () {

	var Popover = function (name) {	

		var ele = document.querySelector('.popover.' + name);
		var isShown = !ele.classList.contains("hidden");

		this.show = function () {
			if (isShown) return;
			isShown = true;
			ele.classList.toggle("hidden", false);
		}

		this.hide = function () {
			if (isShown === false) return;
			isShown = false;
			ele.classList.toggle("hidden", true);
		}

		this.isShown = function () {
			return isShown;
		}
	}

	return Popover;
});
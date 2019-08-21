---
title: Playtest
layout: normal
---

{::options parse_block_html="true" /}

<h4 class='link'>Not yet</h4>

<img src="logo.gif">

<script>
	const start = Date.parse('23 Aug 2019 16:00:00 GMT+12')
	const link = document.querySelector('.link')
	updateLink()
	function updateLink() {
		const now = new Date()
		if (now > start) {
			link.innerHTML = `<a href="https://realm2.herokuapp.com/">Click here to join</a>`
		} else {
			link.innerHTML = `starts in ${Math.floor((start - now) / 1000 / 60)} minutes`
			setTimeout(updateLink, 1000)
		}
	}
</script>
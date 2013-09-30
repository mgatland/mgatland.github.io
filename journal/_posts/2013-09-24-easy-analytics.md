---
title: Easy analytics
layout: journal
---

Tide was mentioned on [indiegames.com](http://indiegames.com/2013/09/browser_pick_tide.html). The link brought a few hundred visitors, which is more than I've ever had before.

![Visits increase from about zero per day to nearly 300 on September 19.](/journal/images/2013-09-30-site-traffic.png)

I wanted to see what these players were doing in the game, so I added some event tracking code.

### Code corner

If your page already uses Google Analytics, tracking events in JavaScript is easy. All you need to do is call this function:

    _gaq.push(['_trackEvent',gameTitle, action, ""+label]);

I include the game's title, use the action to describe what happened (e.g. the player lost, or won a level) and the label to give additional information, like what level the player was on.

You can also add a 'value' argument, but I don't.

### The results

![Screenshot of data discussed below](/journal/images/2013-09-30-tide-overview.png)

The Unique Events column only counts one event of each type from each device. Someone who starts the game many times will only be counted once in that column.

* 473 people started the game.
* 438 (93%) played at least one level.
* Only 375 (79%) ever lost. The others must have quit before they lost.

The last result surprised me. I thought everyone would keep playing until they lost at least once.

The next image shows how many times each level was played.

![Level 2 was reached 738 times. The numbers drop off for higher levels. Level 16 and 17 were only reached once.](/journal/images/2013-09-30-tide-level-stats.png)

(Ignore the percentages on this chart and the next one, they are not meaningful.)

* The first level was played 738 times.
* Higher levels were reached fewer times.
* The highest level ever reached was level 17.

The next image shows how many players restarted after losing.

![There were 203 restarts after losing once, 83 after losing twice, 33 after losing 3 times. The numbers decrease rapidly.](/journal/images/2013-09-30-tide-restart-stats.png)

This event is recorded if a player restarts after losing a game. The number on the left is the number of times they have already played.

* Most players didn't restart at all.
* 203 (43%) restarted after their first game.
* Far fewer restarted after subsequent games.

### What's next?

I thought Tide was a hard, arcade style game that people would replay to try to improve their high score.

However, that's not happening. Most people only play once.

If players only want to play once, maybe I should make Tide progress more like a modern-style game:

* When you lose, you can continue from the current level instead of restarting the whole game.
* There is a limited number of levels.
* Levels are hand-made, not random, and more interesting.
* When you finish all the levels you get a nice victory screen.

On the other hand, I could try to make Tide into a better arcade-style game:

* Make it much harder, so beginners lose in the first few seconds.
* Show the player's score more clearly.
* Have a high score table.

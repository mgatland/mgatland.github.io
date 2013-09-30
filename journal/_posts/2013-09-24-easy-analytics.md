---
title: Easy analytics
layout: journal
---

Tide was mentioned on [indiegames.com](http://indiegames.com/2013/09/browser_pick_tide.html). The link brought a few hundred visitors — more than I've ever had before.

![Visits increase from about zero per day to nearly 300 on September 19.](/journal/images/2013-09-30-site-traffic.png)

I wanted to see what these new players were doing in the game, so I added some event tracking code.

### Code corner

If your page already uses Google Analytics, tracking events in JavaScript is easy. All you need to do is call this function:

    _gaq.push(['_trackEvent',gameTitle, action, ""+label, value]);

I include the game's title, use the action to describe what happened (e.g. the player won a level) and the label to give additional information, like what level the player was on.

I don't currently use the last argument.

### The results

![Screenshot of data discussed below](/journal/images/2013-09-30-tide-overview.png)

I'm looking at the Unique Events column, which counts only one of each event from each device. This means the same person playing twice will only be counted once.

473 different people started the game. Most of those (438) won at least one level. That's good; it means most people tried the game and worked out the controls.

Only 375 people ever lost. That surprised me, because I thought almost everyone would keep playing until they lost.

We'll look at the _consecutivegames_ event in a moment.

First, let's look at the levels.

![Level 2 was reached 738 times. The numbers drop off for higher levels. Level 16 and 17 were only reached once.](/journal/images/2013-09-30-tide-level-stats.png)

The first column is the level number. The second column shows how many times that level was reached. (Ignore the percentages at the end; they are not useful.)

This looks how you would expect. Fewer people reached higher levels. The highest level anyone reached was level 17.

Next, let's look at how many times players restarted the game after losing.

![There were 203 restarts after losing once, 83 after losing twice, 33 after losing 3 times. The numbers decrease rapidly.](/journal/images/2013-09-30-tide-restart-stats.png)

The number on the left is how many times they had lost already when they decided to play again.

Most players didn't restart any games at all (which isn't shown on this graph). About 200 (42%) restarted after their first loss, and the numbers decrease rapidly.

Five dedicated players played 10 games before quitting.

### What's next?

I thought Tide was a hard, arcade style game that people would replay to try to improve their high score.

However, that's not happening. Most people only play once.

If players only want to play once, maybe I should make Tide progress more like a modern-style game:

* When you lose, you restart the current level instead of going back to the start of the game
* There is a limited number of levels
* Levels are hand-made, not random, and more interesting
* When you finish all the levels you get a nice victory screen.

On the other hand, I could try to make Tide into a better arcade style game:

* Make it much harder, so new players lose in the first few seconds
* Show the player's score more clearly
* Have a high score table.

---
title: Idea for a game installation
layout: normal
---

Hi, here's an idea for a game for [Rabble Room Arcade](http://rabbleroom.co.nz/).

_edit: they're not going to use this; I guess it's too elaborate or expensive. I've also proposed a much simpler project which I hope will get in._

It's basically a clone of the iPhone game [Space Team](https://itunes.apple.com/us/app/spaceteam/id570510529?mt=8), but... in real life.

This is just an idea, I haven't made anything yet.

_1. What's your role (i.e. programmer, artist, etc.)? Is anyone else is involved?_

I'm a programmer. No-one else involved yet.

_2. What's the game called?_

Power Station

_3. What's it all about, and how is it played? (sketches / artwork / demo would be appreciated)_

The players are a team of workers at a power station. They must work together to keep it running.

Each player has a control panel and a display.

![Space Team screenshot](http://a5.mzstatic.com/us/r1000/083/Purple/v4/e0/f1/18/e0f118c9-d022-9414-93b1-4bc3b9b52398/mzl.rkckofxw.320x480-75.jpg)

(That's a screenshot from Space Team. The top picture shows the team's progress. Below that is an instruction and a green bar that acts as a countdown timer. Below that is the control panel.)

The display can show an instruction, e.g. "Set Shiftsanitizer to 1", and a countdown timer.

The control panel has some controls - maybe 4 controls, e.g. a dial, switch, button and slider. These are labelled. Every player's controls have different labels.

When the game starts, each player is shown an instruction, and their countdown starts from 10 seconds.

The instruction must be followed before the timer expires. If it is, the team progresses one step towards winning. If it isn't, the team loses a life.

The instruction might be for a different player's control panel, so the players must talk to teach other.

A central display shows the team's progress and lives. They win if their progress reaches a certain value. They lose if they run out of lives.

Here's an idea for the central display: the number rings that are glowing indicates the team's progress. (This photo is from a game at the Tech museum in San Hose.)

![Tower of glowing red rings](http://www.thegomom.com/wp-content/uploads/2012/09/Tech-Museum-Power-Tower.jpg)

_4. Are there some major themes in the game? (and what are they?)_

Cooperation under pressure. Trust.

It's important to be aware of everyone, even the quietest or youngest player!

_5. What development environment and operating system would the game run on?_

I'm most comfortable with Java, which runs on Windows, Linux, or OS X.

_6. How many people can play the game, and is it co-op or competitive?_

Co-op. 3 players, or more but it would require more hardware.

_7. What sort of player control / interface do you imagine? (don't be afraid to throw out weird and wonderful ideas, the more we have the more we can play with)_

Well, something like this would be really cool!

![Hexagonal control panel in the TARDIS](http://upload.wikimedia.org/wikipedia/en/0/0d/TARDIS_console_1983.jpg)

But maybe something less elaborate...

I imagine the players standing around the central display.

Each player has their control panel (maybe on a lectern, or maybe they're all on a small table.)

![drawing of control panels on a table with lights in the middle](/journal/images/2013-06-23-rabble-room-2.jpg)

This has 4 controls (dials, switches, push-buttons) and an LCD display which can show the instruction and the count-down timer.

![drawing of control panel with LCD display and 4 control knobs or buttons](/journal/images/2013-06-23-rabble-room-1.jpg)

The central display that all players can see shows the team's progress. A tower of glowing rings like in the photo above would be awesome -- a cheaper option could just 5 LEDs in a row, with more turning on as the team progresses.

The team's limited lives could be shown with 3 big red lights; one turns on each time the team loses a life.

There'll be a computer running this whole thing. It will need to be able to tell what value each of the 12 controls is set to, and set the message that appears on each of the 3 digital displays.

For three players, we would need

* 12 controls (e.g. 3 buttons, 3 dials, 3 sliders, 3 switches)
* 3 LCD displays that can each fit at least 26 characters
* 3 big life indicator lights that can be turned off and on
* 5 or more lights to indicate progress
* Speakers for sound

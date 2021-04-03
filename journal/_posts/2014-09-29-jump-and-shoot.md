---
title: Jump and Shoot
---

I showed Space Protector at Digital Nationz yesterday. Here's me trying to look approachable:

![my Space Protector booth at Digital Nationz](/journal/images/2014-09-28-matthew-at-digital-nationz.jpg)

I gave players a gamepad which worked like this:

![D-pad moves left and right, X jumps, Square shoots. Those are the only actions.](/journal/images/2014-09-29-space-protector-gamepad.jpg)

I didn't tell people what the controls were. To my immense surprise, _many players never realised that you can shoot_.

That's right: in my four-button game, some players never found the fourth button.

### But my design was perfect…

In the screenshot below, the player is blocked by two enemies. The enemies do not move, and touching them kills the player. The only way past is to shoot them.

![You must shoot to progress](/journal/images/2014-09-29-you-must-shoot.png)

This scene makes sure the player knows how to shoot before they can proceed. It should force them to learn to shoot.

However, when the non-shooting players reached this scene, they didn't start looking for the shoot button. Instead, they got stuck. One asked "Do I need to get a key?"

I could use a pop-up message saying "Press Square to shoot!" but that's lazy design. It's like putting a "pull" sticker on a door -- a well designed door does not instructions.

Why are players getting stuck, instead of pressing the shoot button?

### A theory

![path to the shoot test](/journal/images/2014-09-29-space-protector-start.png)

By the time players reach the place where they _have to_ shoot, they have already passed a variety of obstacles.

They have already passed five enemies, so they assume they've mastered the controls and don't need to try any new buttons.

If I'm right, moving the shoot test earlier will fix the problem. Players will be forced to learn to shoot while they're still unsure of the controls.

Here's a new shoot test, at the start of the level:

![path to the shoot test](/journal/images/2014-09-29-new-space-protector-start.png)

I tried this change at Digital Nationz and I think it worked. (It's hard to be sure, since not all users were affected anyway.)

Of course, there are many other possible solutions:

* Show the controls at the start of the game
* Have a pop-up message that says "press Square to shoot!"
* Draw a big gun on the player sprite, so players assume they can shoot
* Show a cutscene before the game that demonstrates the player's abilities

The problem is easy to solve, but the trick was knowing that there was a problem at all. It's really hard to predict how "normal gamers" will play your game.

Running playtests is my favourite part of game development. The whole reason I make games is so people can enjoy them.

As well as this lesson, I also learned a lot about what players find fun, frustrating, and funny. Analytics are great, but seeing people play your game in person is the most rewarding and useful thing you can do.

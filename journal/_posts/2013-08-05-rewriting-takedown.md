---
title: Rewriting Takedown
layout: journal
---

I wrote Takedown while I was at high school.

It only worked in Windows. These days, I often don't have a Windows computer nearby. I thought it would be fun to rewrite the game in Javascript, so that it can run on anything.

### What went right

It _was_ fun rewriting my old code. It was a bit like peer-programming with my younger self -- a person who was endlessly enthusiastic, though extremely inexperienced.

Reusing old assets and content led to some satisfying moments of rapid progress -- like when I got the level loader working, and suddenly had 10 levels to play with.

### Changing things

Initially, I wanted the new version to be identical to the original. It uses the original art, sound effects, levels and storyline.

But I did allow a few changes. The original control scheme was terrible; you could move in any direction, and fired in the whatever direction you last moved in, unless you were holding shift which locked your rotation -- it was complicated and no-one liked it.

I replaced those controls with a 2-stick shooter style setup where your movement direction and attack direction are independent.

I also couldn't resist fixing spelling mistakes, making the hardest missions easier, and adding autosave. Do you remember when games didn't autosave? It wasn't just me and Takedown -- even the triple-A games of the time didn't have autosave.

Despite the autosave, it still mostly looks and feels like a Visual Basic game from 2002 by a 16-year-old.

Cool! That was the goal.

### What went wrong

It took a _really_ long time.

After a week, I started to feel depressed. _Why am I doing this? This isn't helping my business. This isn't making me a better designer._

My younger self added a lot of features to Takedown. If I'm 10 times faster, I'm also 12 times less patient. I left out any feature that wasn't used in the main campaign -- then also left out a few that were used.

This means the Javascript game will never be a full remake of the original game. The missing features include:

* Weapon upgrades
* Being able to order your teammates to follow you around
* Enemies say things like "Good shot!" or "Follow me" to each other

### Scripting

I made the new game compatible with the [original mission file format](https://github.com/mgatland/takedown/blob/cbee0ef23787000dc3df97391a1d0893412b33d2/web/res/01.tdm). This forced me to support all my old ideas about mission scripting.

For example, there's no concept of a collectable item in Takedown. Instead, you simulate it as follows:

* place a non-interactive item-shaped decoration on the ground.
* add a trigger that fires when the player steps in the same square as the decoration.
* The trigger sets a flag (saved between levels), hides the decoration, and pops up a "mission briefing" which says "You found an item!"
* Actually, a trigger can only perform 2 actions, so you'll need 2 triggers to do all that.

It's cool that the new game supports the original mission files. But if I rewrote the mission scripts, I could get rid of a lot of awkward scripting hacks.

### Conclusions

I'm happy that Takedown lives on the internet now and everyone (who uses Chrome) can play it.

I feel guilty about spending so much time on this, and embarrassed that I don't have any other new games to show people.

But maybe there's an audience out there somewhere who will discover this game and enjoy it. Maybe people who are nostalgic about awkward, early Windows games?

(Whatever happened to Comet Busters, anyway?)

### Links

* [Play](/games/takedown/play/web/)
* [Feedback](https://mgatland.hackpad.com/Takedown-feedback-zAiAZphmA8u)
* [Development diary](https://mgatland.hackpad.com/Game-5-TakeDown-port-to-JavaScript-SJaOnQoFBPy)
* [Source code](http://www.github.com/takedown/)
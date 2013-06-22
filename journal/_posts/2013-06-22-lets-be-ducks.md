---
title: Let's Be Ducks
layout: journal
---

[Let's Be Ducks](/games/ducks) (or just <i>Ducks</i>) is my third game prototype.

The concept was simple: Make a clone of [ChatChat](http://distractionware.com/blog/2012/01/chatchat-2/) (a game by Terry Cavanagh), using HTML, CSS and JavaScript.

### Playtesting

It's fun launching a multiplayer game, because I can see everyone come and play. I was logged in all day, saying hi when people arrived and watching them look around. It felt a little bit like I was showing my work at an exhibition :)

The game intentionally doesn't have any real gameplay -- if you could earn points or go up levels, that would distract you from exploring and making your own fun.

Players generally did what I expected. They wandered around, napped, quacked, looked at things.

Players only found one of the three secrets. I guess I made the others too obscure.

One screen has a treasure chest and a hint telling you how to quack. Players assume that quacking will let them interact with the chest somehow -- but the 'quacking' secret is actually at the opposite end of the world. No-one ever tried quacking over there.

I like having well-hidden secrets, but the game needs some more obvious secrets. Maybe 'surprises' is a better term: interesting things for people to find as soon as they join the game.

### Latency

Ducks was my first real-time networked game. I've been interested in how networked games work since I started modding <abbr title="Unreal Tournament">UT</abbr> in 1999. Lag compensation, client-side simulation, untrusted clients -- these subjects have been on my mind for 14 years. It was exciting to finally code them for myself.

A character in Ducks can move once every 250 milliseconds. I ran some crude performance tests on a lot of different <abbr title="Platform as a Service">PaaS</abbr> providers before finding one that had a ping time that was _usually_ less than 250 ms.

When you press an arrow key, your character appears to move instantly. This is a client-side prediction. Your move is also sent to the server, where it really happens and then is relayed to everyone (including you).

If your ping is less than 250 milliseconds, then the server will confirm your move before you move again. If it's higher, then bad things happen. You could move twice before the server responds to your first move. When it does respond, it will appear to cancel your second move, making you jump backwards one square.

The lag annoyed me and it annoyed players. Next time, I'll do more to hide it. However, most of the time the server replies within 250 ms and there are no visible lag effects.

### Speed hacks

One player hacked their client to let them move ultra-fast. It's a classic trick. I anticipated this, and don't let them -- they can move fast on their client, but won't on the server or for the other players.

I have a system which queues a player's moves for later if they happen to arrive too quickly. (Because of random variations in latency, a player moving every 250 ms might appear to be trying to move a few milliseconds too early. I can't let them move early, but it's rude to just cancel that move. So I queue it up and replay it when it's the right time.)

This system queued up thousands of moves from the speed-hacked player. This meant that his ducks continued to roam around the map even after he had logged out and logged back in as a new user.

Seeing him apparently control two ducks at the same time made me very confused :)

### Touchscreen Support

The world has changed and touchscreens are everywhere. I wanted Ducks to work on touchscreens, but did not get there in time.

Making the game work on Chrome for Android was an impossible game of whack-a-mole. The browser zooms in when you select an input field, hiding most of the game. Disabling zooming fixes that, but stops the code that zooms the page to the correct size initially. The player is left unable to zoom, with the game locked to the wrong zoom.

I'm sure there is a solution, but it was not easy or obvious.

### Project Management

This was meant to be a one-week project, but it actually took 18 days.

I'm OK with this, because:

* everyone says multiplayer games take much longer. Now I can say I know from experience :)
* I spent a few days learned about Node, networking, and testing PaaS provders.
* and I'm still learning JavaScript.

I wrote a lot of bad code in Ducks, which sometimes caught me out. Sloppy code creates tricky bugs.

There were things I did right, though. Sharing code between the client and server was an early and very wise decision.

The code that determines whether a move is legal or not is all shared. This means I can add a new movement rule on the server (like "it takes one move to wake up from a nap") and the client will automatically know how to simulate that movement.

### Conclusions

Multiplayer games take a lot more work than single-player games.

But they're really fun! I love being able to see people play my game and talk to them about it.

If I'm sticking with JavaScript, I should learn the right way to write it.

Ducks are cute.

If you put a treasure chest in a room, players will go crazy trying to open it.

### What's next?

Something awesome.

### Links

* [Play](/games/ducks)
* [Feedback](https://mgatland.hackpad.com/Ducks-feedback-bMBCM057s5j)
* [Development diary](https://mgatland.hackpad.com/9KP1gS2rLxg#Game-3)
* [Source code](http://www.github.com/mgatland/ducks/)

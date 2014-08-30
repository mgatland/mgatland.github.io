---
title: Multiplayer block-breaking
---

At this year's Kiwijam I combined [Space Protector](/games/spaceprotector)'s front end and [Let's be ducks](/games/ducks/)' server to make a multiplayer platform game.

Space Protector already has multiplayer, but only for 2 players and not on iOS. (It's peer-to-peer using WebRTC, which isn't supported in iOS yet.)

Adding a server lets me use websockets, which work in all major browsers. It also makes it easy to support more players.

### Testing

![Glimmerseed test](/journal/images/2014-08-25-glimmerseed.png)

[Play Glimmerseed](http://glimmerseed.herokuapp.com/)

I changed the game so that players can modify the level. Your shots now alternately remove and add squares to the level.

(I'm slightly obsessed with the multiplayer building game Growtopia, so wanted to make a building game of my own.)

At Kiwijam, on university wifi, the game ran smoothly with five people playing. This is good news.

At my home, it's not playable. I get latency of up to six seconds. You feel this when you shoot the walls: a hole doesn't appear until up to six seconds later.

I guess the game is making me send more data than my internet connection can handle. Compressing the data that's sent might fix this.

The way you build and destroy blocks is confusing. The animations and controls are from a shooting game and don't make sense here.

next steps:

* replace 'shooting' with something that clearly shows the blocks being removed and re-added
* compress data and see if that fixes issues when playing at my house


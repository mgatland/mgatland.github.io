---
title: JSON is great but…
---

In the last post I talked about making Glimmerseed, a multiplayer platform game.

The network code worked great at univeristy, but not at home. I _assumed_ that I was sending too much data for my home internet connection.

So how much was I actually using?

### Data usage

Chrome makes it easy to see what's being sent over our websockets. Let's pop open the web inspector and watch the traffic in a two-player game of Glimmerseed:

![Chrome with the web inspector open](/journal/images/2014-08-27-glimmeseed-net-1.png)

I'm showing two frames here. Each frame has three messages:

* we send our player data (401 bytes). This line is green.
* we get some monster data (131 bytes)
* we get the other player's data (416 bytes)

Then it repeats. (The messages can be slightly different sizes each time.)

The first frame adds up to 948 bytes. At 60 frames per second, that gives us 56 KB per second, or 3.2 MB per minute.

Each additional player would add about 1.4 MB per minute.

A 5 player game would use about 8.8 MB per minute.

That's more than a Netflix movie. I can do better.

### JSON

All the messages are sent in JSON, which is a beautiful but inefficient format.

Here's the entire 401-byte player update:

````
{ "args" : [ { "player" : { 
            "animDelay" : 0,
            "animFrame" : 3,
            "animState" : "standing",
            "block" : 0,
            "deadTimer" : 0,
            "dir" : 2,
            "fallingTime" : 0,
            "groundedY" : 94,
            "hitPos" : null,
            "id" : 1,
            "jumpIsQueued" : false,
            "live" : true,
            "loading" : 0,
            "name" : "beta",
            "pos" : { "x" : 79,
                "y" : 94
              },
            "shootingAnim" : false,
            "shotThisFrame" : false,
            "size" : { "x" : 5,
                "y" : 6
              },
            "spawnPoint" : { "x" : 30,
                "y" : 90
              },
            "state" : "grounded",
            "timeSinceLastShot" : 221,
            "vDir" : -1
          },
        "type" : "p"
      } ],
  "name" : "data"
}
````

Most of this message is the labels, not the data. For example, ````"animDelay" : 0```` uses 11 bytes for the label and only 1 byte for the value.

Since we send the same values every time, we could remove the labels and use an array of values instead. We just remember the order: the first value is animDelay, the second value is animFrame, and so on.

If we did that, the message would look like this:

````
{ "args" : [ { "player" : [0,3,"standing",0,0,2,0,94
		,null,1,false,true,0,"beta",79,94,false,false,
		5,630,90,"grounded",221,-1],
        "type" : "p"
      } ],
  "name" : "data"
}
````

This is now only 146 bytes -- 36% of the original. That's pretty awesome, and it's easy to do.

The message is a little bit harder to understand, but as long as you remember which value goes in which position, it's OK.

With these changes, our 5 player game would only use 3 MB per minute.

### Binary is better

In a string, a number uses one byte per digit. For example, '10' takes two bytes: one for the one and one for the zero. In binary, one byte can count up to 255, and two bytes can count up to 65,025. It's much more efficient.

I converted the player data to binary.

(As part of this, I also the convert the state strings into numbers, so a state of "falling" is now sent as '0', and '0' converts back to "falling" when the message is recieved. We could have done this in the JSON too, it would have saved about 14 bytes.)

The result was 35 bytes to store all player data except the name. (I left the name out of the binary, and put it in the JSON wrapper instead.)

![binary with JSON wrapper](/journal/images/2014-08-27-binary-and-json.png)

The first line shows the binary. (It seems to have grown a byte for some reason - a header?) The second line shows the JSON which wraps the binary.

Unfortunately, the JSON wrapper now gets a "_placeholder" object which is 29 bytes long. The placeholder is almost as big as the actual data!

````
["data",{"type":"p","id":1,"name":"bbb","player":{"_placeholder":true,"num":0}}]
````

The whole message was 115 bytes, which is only 29% as big as our original message. (It's 79% of our improved JSON-without-labels message).

This version is on the server (at the time I write this). You can try it and inspect the packets for yourself: [Glimmerseed](http://glimmerseed.herokuapp.com/).

(Note you have to open the Websocket view before the connection starts, so open it then refresh the page.)

### Other optimisations

The player's name _never_ changes, so sending it 60 times per second is extremely wasteful. I should fix that.

Other values, like the player's respawn point, only change every few seconds at most. Sending these every frame is also wasteful.

However, having parts of the message sometimes present and sometimes not present can get complicated... and it would only save a few bytes.

### That placeholder

Most annoying is the 29 byte placeholder that socket.io adds. It makes up 25% of the data sent. To get rid of it, I need to stop using socket.io or stop using binary.

Using a library that lets me send pure binary is the right solution. But also the most effort.

A quick solution is to Base64-encode the binary data. This turns it into a string, which can go straight into the JSON without a placeholder -- but also makes the binary 33% larger.

The resulting message would look like this:

````
["data",{"type":"p","id":1,"name":"bbb",
    "player":"AwAAAgAAA/8AXgAeAFoAAAAAAAADAAIAHgAeAF4ABQAGAAE="}]
````

The binary data becomes 12 bytes larger, but we lose 29 bytes of placeholder so the total data sent is smaller.

### Conclusions

* I could get big reductions in data use quite easily.
* Sending binary with socket.io is easy, but has a 29 byte overhead.
* The game still doesn't work well on my home internet connection :/
* But it will use a lot less of your phone's data cap :)
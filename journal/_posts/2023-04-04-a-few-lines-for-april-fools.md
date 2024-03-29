---
title: A few lines for April Fools
---

Mojang recently released an April Fools version of Minecraft: Java Edition. The April Fools releases are special and strange variations of Minecraft that are developed with a low budget and explore ideas that are too outrageous to be in the main game. This year's concept was to have in-game voting where players could enable and disable different rules on their server, with many of the rules having unexpected twists.

A core group within Mojang built the voting system and managed the release. Everyone else at the studio was invited to add some individual rules that players could vote on.

I wanted to participate but did not have much time available for side-project shenenanigns. I decided to come up with some simple rules that I could code quickly and that would hopefully be memorable and fun for players. Maximum impact, minimum effort! Here's what I came up with:

### "Prevent floating trees"

In Minecraft, gravity does not apply to most blocks. One of the first actions a player takes in a new world is to collect wood by breaking a block from a tree trunk. This leaves the top of the tree floating in the air.

Many players consider floating trees ugly and communities often make it a rule that players must remove the floating parts before they move on. It's a hot topic!

The comedy in this rule comes from wondering how it's going to work and then being surprised when you find out. You could imagine the floating part of the tree falling down -- that would be fancy! Or perhaps the floating part would automatically break. But here's what actually happens:

<video src="https://user-images.githubusercontent.com/364886/229846421-4f915e7b-d473-4282-a84f-6a5a58e931a8.mp4" controls="controls">
</video>
<p class="video-caption"><a href="https://twitch.tv/ulraf"  target="_blank">Ulraf</a> breaks a tree trunk</p>

<!--
ffmpeg -i .\aprilfools-ulraf.mp4 -ss 01:21:57 -to 01:22:39 "prevent-floating-trees-original-size.mp4"
ffmpeg -i .\prevent-floating-trees-original-size.mp4 -vcodec libx264 -crf 26 prevent-floating-trees.mp4
-->



This was about 20 lines of code.

### "Buff fishing" 

Fishing is popular in the game and there's a lot of discussion around how much loot it should give. Is fishing overpowered? Should we let players fish AFK? The _buff fishing_ rule promises to make fishing more rewarding. You might expect it to improve the loot table or tweak the timing, but no: it turns your fishing bobber into an infinite fountain of ocean loot.

_Warning: flashing lights_

<video src="https://user-images.githubusercontent.com/364886/229846396-53b067f0-d968-44ca-b5fa-e4f48d19d800.mp4" controls="controls">
</video>

<p class="video-caption"><a href="https://www.twitch.tv/pixlriffs" target="_blank">Pixlriffs</a> goes fishing with Ulraf and Bruno</p>

<!--
ffmpeg -i .\aprilfools-pixlriffs.mp4 -ss 02:23:12 -to 02:23:56 "buff-fishing-original-size.mp4"
ffmpeg -i .\buff-fishing-original-size.mp4 -vcodec libx264 -crf 20 buff-fishing.mp4
-->

This one was basically 1 line of code. I think it works pretty well!

In the video above, the players have also enabled the rule _polluted oceans_ (not created by me) which changes the fishing rewards to include all possible items. It's a fun rule, and it synergizes very well with _buff fishing_! But if we had had a bit more time to coordinate I would have suggested nerfing this combo because it's a little too good. Having a quick source of every possible item can spoil content from some of the other game rules. (And I think we could have nerfed it in a way that let us include another good joke.)

Overall, I was happy that I was able to make some people laugh with just a few lines of code and a few minutes of work.

Going cheap isn't always the right approach, and it was important that other devs added rules with a lot more depth than my ones. But... jokes are good too! It's useful to think about all the tools we have to make a feature interesting and not overuse complexity. These two rules used popular community topics to set up the players' expectations and then did something unexpected to surprise them.

You can see the official page for the April Fools snapshot at <a href="https://www.minecraft.net/en-us/article/vote-update">minecraft.net</a>.

<!-- comment 
// comments: 

Video syncronization: when Ulraf says "OK lets jump in" and they go into the game
aprilfools-pixlriffs.mp4: 19:00
aprilfools-ulraf.mp4:  14:00 (-5:00)
aprilfools-bruno.mp4: 16:40 (-2:20)

1h:27m talks about my april fools 'floating trees' rule 
    uralf timestamp from 1:21:57 to 1:22:39 < --- this is good, clip it!
    and then 1:23:02 to 1:23:53 for the follow up joke 

2h21:50 my other game rule, the fishing one
    Pixl timestamp: 2:23:12 to 2:24:04
        (I trimmed this down to end at 2:23:56 for the blog post, cut some of the Warden fun but not all of it)
    Uralf: 2:18:15 to 2:18:51
    Bruno 2:20:46 to 2:21:35
-->

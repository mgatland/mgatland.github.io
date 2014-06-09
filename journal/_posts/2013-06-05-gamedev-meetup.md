---
title: Gamedev Meetup
layout: normal
---

At last month's [game dev meetup](http://www.meetup.com/playmaker/), I was about to go full-time indie. Everyone said congratulations and I had a lot of fun.

But this month was even better, because everyone said: It's been a month; what have you done? And I showed them my games, and they gave lots of feedback.

I don't always agree with the feedback. But I note it anyway, knowing that I might agree with it tomorrow.

* * *

Chris W asked why I'm making one-week games. What's the business plan? How will this turn into money?

Good question. I don't know how it will turn into money.

But most of the indies I admire have released a lot of games; the plan is to be like them… I'll find money later.

* * *

I'm making a simple multiplayer game -- more like a chatroom -- using node.js, with websockets.

I thought I could host it on Heroku, but I found out today [from a beautiful tutorial](https://devcenter.heroku.com/articles/nodejs) that websockets are not supported.

(A competing service, [Nodester](http://nodester.com/), offered websocket support, but they were acquired by AppFog and shut down. The [blog post](http://blog.nodester.com/post/30434216604/nodester-joins-appfog) about the acquisition specifically mentions Nodester's websocket support, as if AppFog were eager to incorporate that technology into their own product, but they haven't yet. Frustrating.)

Anyway, the beautiful Heroku tutorial also told me that in the node world, it's best practice to [check your dependencies into source control](http://www.futurealoof.com/posts/nodemodules-in-git.html).

That's the opposite of what I learned working in enterprise Java -- but it's an appealing idea, based on the principle of making development environments and production environments as similar as possible. No surprises when you deploy. Now I'm reading [The Twelve Factor App](http://www.12factor.net/dependencies) to see what other new ideas I can find.
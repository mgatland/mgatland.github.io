---
title: QBasic and children in 2014
---

Our Code Club took a break from Scratch to teach QBasic this week.

I wrote a [QBasic activity](http://codeclubakl.github.io/qbasic/), made easy installers for Windows and Mac and hacked together a web based version for Chromebook.

Our club has about 20 children, aged 10 to 13 years old.

### Install trouble

My "Easy installer" wasn't. On Windows, to extract a zip, go into a subfolder and run a .bat file is not a simple task. Some people had WinZip, some had WinRar, some had the native interface... all of these tools lead you to browse through a zip rather than extract it. 

The Mac experience was better, because the whole zip is extracted when you click on it. But it was still not ideal.

If we had to install software again, I would build a proper install wizard for Windows, and an Application for mac.

But asking beginners to install anything is best avoided - use a web-based version.

### QBasic online

The [web version](http://codeclubakl.github.io/qbasic/online/) was easier to get started with -- just click a link.

It had its own problems, though.

I discovered the night before that the plus and minus keys didn't work. We need those!

I fixed that, but there were many other issues too. Some from web-DOSBox being immature, some from me not knowing how to configure it properly.

One big problem is that you can't save your work. It only exists while the DOS simulation is running.

Fix that, and this would be the best way to introduce QBasic.

### The class

After the slow setup, it went OK. Everyone progressed through the instructions.

Some people got to the end and found the "Extra for experts." It's easy to tell because they start playing sounds :)

These are the kinds of mistakes I saw:

* `PRINT: "Hello"` instead of `PRINT "Hello"`
* `PRINT Hello` instead of `PRINT "Hello"`
* `GOTO home` without adding the `home:` label

Like with beginner HTML and CSS, we saw a lot of mistakes with special characters, and the concept that they mark the start and end of blocks.

An interesting difference is that Basic gives errors when you make a mistake. I think this is better for learning than HTML and CSS, which just act weird.

Unfortunately, QBasic's error messages are meaningless to beginners. I went around giving answers ("Oh, you need to get rid of that colon") but next time I would probably try to help them to help themselves. Maybe "It means there's a problem on that line. Can you see a difference between your code and the example? Maybe ask someone else to look too."

### Closing

In our closing circle, most people commented on how precise you have to be.

This is a good lesson, but there might be better ways to teach it.

(There's a game where you give students working code, and ask them to break it in a way that's hard to spot -- then challenge another student to find the mistake. I like this because it presents finding bugs as a fun challenge, rather than a frustration.)

I wanted the activity to teach people about control flow and how programs run line-by-line -- concepts that I feel are obfuscated in the colourful, multithreaded OO world of Scratch. I have no idea if it succeeded? *shrug*

At least two students were not pleased. "Can we do Scratch next week?" But someone else said they liked it more than Scratch, so... inconclusive.

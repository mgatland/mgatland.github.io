---
title: QBasic on Modern Computers
layout: normal
---

I want to try teaching QBasic to our 11 and 12-year-old students at Code Club.

Several of the older programmers I meet think that QBasic is "still the best way to start programming".

I don't know if it's true -- Python and Scratch are widely considered to be the best beginner languages today.

But I think it's worth trying. I particularly like the idea of learning how to use GOTO and one-line statements before starting on blocks, loops, and functions (which students often find confusing.)

The first hurdle is getting Basic running on everyone's computers. Here are the alternatives I looked at:

### FreeBasic and FBIde

There's an [FBIde](http://fbide.freebasic.net/) installer that includes [FreeBasic](http://www.freebasic.net/). This is nice and easy, but only supports Windows. We need a cross-platform solution.


### QBasic 4.5

The old DOS program, available from various [old websites](http://www.qbasic.net/en/qbasic-downloads/). Won't run on my Windows computer so that's not an option.

### QB64

This is [a more modern remake of QBasic](http://www.qb64.net/).

The Windows version is distributed in a 7Zip archive. This means you have to install and learn to use 7Zip before you can use QB64.

We can't afford to spend code club time on that, but we could repackage it as a .zip file. Then it would be fine on Windows.

The new GL version is incomplete. The old SDL version is better - in particular, because it can go full-screen.

On OS X, you have to install Apple's developer tools. (It uses the C++ compiler.)

Then you have to run setup.command to - I think - compile the project before you can use it. Then you run a different command to run it. 

That's too much setup time for a 1-hour class. Maybe we could package our own pre-compiled version, but that doesn't sound fun.

I'm going to say QB64 is out for now.

### DOSBox + QBasic 4.5

[DOSBox](http://www.dosbox.com/) is a cross-platform DOS emulator. It runs the old QB45 without any trouble, on every platform.

Configuring DOSBox to run something is too much work, but can we make a pre-configured package that automatically runs QB45?

Yes -- it's easy. I've made a .zip file that users can download. They must extract it then run a .bat file (on Windows) or .command file (on OS X) to start QBasic inside DOSBox.

This is by far the best option so far.

Two extra changes were needed:

1. DOSBox locks the mouse pointer inside its window, which is super annoying. Fortunately, it can be pre-configured it to disable this feature.
2. DOSBox puts a big notice in the command prompt, which reappears when you run your first QBasic program. It's confusing. To work around this, I started all the example QBasic programs with a CLS command to clear the screen.

### What about Chromebooks?

Some of our students use Chromebooks. You can't install anything on a Chromebook, you need a web-based version. Let's look around again…

#### QB64 Qloud

The [QB64 website](http://www.qb64.net/) says they provide a 'Qloud' cloud based QBasic compiler, but it's currently down.

#### CompileOnline

[CompileOnline](http://compileonline.com/) has a QBasic page, but it didn't work with my example programs. Worse, the error messages were C errors, not QBasic errors, making it super confusing. Nope.

#### Steve Hanov

Steve Hanov wrote a [QBasic implementation in JavaScript](http://stevehanov.ca/blog/index.php?id=92). It's not complete, but works for our examples.

It has some problems:

* Console input is always converted to uppsercase. This breaks our examples.
* It doesn't say "press any key to continue" when a program terminates
* Like CompileOnline, it gives long, unhelpful errors in a different language when there are any syntax errors in the code.
* It's embedded into a blog post, so there's lots of visual noise all around the QBasic terminal.
* It starts off with the code of Nibbles preloaded, which has to be deleted before you can start.

I wouldn't use it with beginners in its current state. However, it's open source and we could easily fix all the problems except the error messages. That would be Ok.

#### DOSBOX online

DOSBox can be compiled into JavaScript using Emscripten. [Someone's already made it work](https://github.com/dreamlayers/em-dosbox/), so "all we have to do" is set it up to run QBasic and host it on our website.

It looks like DOSBox is the best option again. It will give our Chromebook users the same experience as our Windows and Mac users.

But I haven't got it working yet. If you want something that works right now, Steve Hanov's JavaScript implementation is the only option I found.

### Conclusion

I recommend using 'qb45' (Qbasic 4.5) running inside DOSBox.

I put pre-packaged versions for Windows and OS X on the [Code Club Auckland website](http://codeclubakl.github.io).

For a web-based version, the best choice is Steve Hanov's [QBasic in JavaScript](http://stevehanov.ca/blog/index.php?id=92), but it's not very suitable for beginners. I will try to set up DOSBox + QBasic 4.5 for the web instead.

This is how to install QBasic, but we have not yet proved that you would want to install it!

* Do children want to use a low-res UI that doesn't support familiar keyboard shortcuts?
* Is making a text-only game fun?
* Will teaching them GOTO ruin their brains forever?

Find out next week!
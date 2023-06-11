---
title: How to make YouTube (or other video websites) louder 
---

Sometimes I find a YouTube video of a conference talk that's just too quiet. Even when it's set to maximum volume, with Windows set to maximum volume, it's still too quiet.

![The YouTube volume slider set to maximum](/journal/images/2017-11-24-volume/youtube-volume.png)

![The Windows volume slider set to maximum](/journal/images/2017-11-24-volume/windows-volume.png)

You can easily fix this with JavaScript!

First, open your web browser's JavaScript console. In Chrome, click on the menu button, then 'more tools', then 'Developer Tools' to open the developer tools.

![Opening the developer tools as described above](/journal/images/2017-11-24-volume/open-dev-tools.png)

In the Developer Tools, click on the *Console* tab.

![Open the console](/journal/images/2017-11-24-volume/open-console.png)

Click in the empty white space after the > symbol. Now you can type or paste code into the console.

![Click on the console](/journal/images/2017-11-24-volume/click-console.png)

Copy this code and paste it into the console.

```js
var videoElement = document.querySelector("video")
var audioCtx = new AudioContext()
var source = audioCtx.createMediaElementSource(videoElement)
var gainNode = audioCtx.createGain()
gainNode.gain.value = 2 // double the volume
source.connect(gainNode)
gainNode.connect(audioCtx.destination)
```

It will look like this once you paste it in:

![The code, as it will appear in the console.](/journal/images/2017-11-24-volume/pasted-code.png)

Press enter to send the code to your browser. The video should immediately get louder.

If you want to make it even louder, copy this line, paste it in and press enter. You can change the number to a higher value to make it even louder.

```js
gainNode.gain.value = 3
```

![The code, as it will appear in the console.](/journal/images/2017-11-24-volume/pasted-code-2.png)

### What just happened?

Imagine that the video was a physical object (like a phone), and it was connected to your speakers by a cable.

![The video is directly connected to the speakers](/journal/images/2017-11-24-volume/circuit-1.png)

We unplugged that cable and connected the video to a new object called a gain node. Then we plugged the gain node into your speakers. Sound flows from the video to the gain node to the speakers. The gain node has a volume dial on it, and we can adjust that dial to amplify the sound.

![The video is now connected to a gain node, and the gain node is connected to the speakers. The gain node has an adjustable volume control which is set to 2.](/journal/images/2017-11-24-volume/circuit-2.png)

### Bookmarklet

I got an email from Andrew Morton who suggested putting this code in a bookmarklet. I've added the bookmarklet below.

<p>Drag this to your bookmarks bar: <a href="javascript:(function(){var videoElement = document.querySelector('video');var audioCtx = new AudioContext();var source = audioCtx.createMediaElementSource(videoElement);var gainNode = audioCtx.createGain();gainNode.gain.value = 3; /* triple the volume */ source.connect(gainNode);gainNode.connect(audioCtx.destination);})();">volume up!</a></p>

Clicking on the bookmark (in your bookmarks bar) will increase the volume on whatever page you have open - so you can make a YouTube video louder with a single click.

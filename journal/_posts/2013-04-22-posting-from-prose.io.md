---
title: Posting from Prose.io

---

For me, "the cloud" is about websites that talk to each other directly.

When I change my Gravatar avatar and Github updates automatically, that's "cloud." If I have to manually update my avatar on Github, but I can do it by passing a link to my avatar on Gravatar, that's a little bit cloudy.

When I have to download my avatar from Gravatar, save it to the Desktop on my PC, then ask Github to download that file from my computer, that's broken. That's not cloudy at all.

I love the idea of working from the cloud, and having nothing stored on my local computer. I would love to be able to use a Chromebook or an internet cafe and work without needing any special files.

* * *

This website is hosted on [Github Pages](http://pages.github.com/). Github Pages lets you upload source files for your website, then it uses Jekyll to apply templates to them and generate index pages.

Jekyll's a great tool, but it's designed to be extended with plugins. Github doesn't allow you to use plugins (for security reasons, I assume) so you're stuck with a very basic Jekyll which doesn't support many features.

Some blogging frameworks like Octopress have worked around this problem. With Octopress, you run your own copy of Jekyll -- with all your favourite extensions -- on your own computer. Your source files are processed on your computer and then uploaded to Github, so Github's own Jekyll doesn't have to do anything.

That's a great way to get around the limitations, but it comes at a cost: you can't just edit your blog and upload it to Github any more. You need to run your own copy of Jekyll after every change, and before you push your changes to Github.

I'm not happy with that, so after trying Octopress, I deleted everything and started again with pure Github and Jekyll.

Working without plugins has been challenging. Displaying a list of all my games, in the order I made them instead of alphabetically, required some mild hacking. Making my journal page support pagination is going to take a lot of work.

But on the bright side, I am writing this post using [prose.io](http://prose.io) -- a website that lets me edit files online and save them directly into Github. And when I save this file, Github will run Jekyll and regenerate all the index pages and this post will appear on my site.

I'll be able to edit my site from anywhere. It's like I'm using a CMS, but without the complexity, performance issues and security vulnerabilities that come with those.

One website hosts files, another -- run by a different company -- lets me edit them. Everything's connected, it's simple, I'm in control but nothing's on my local PC. This is the cloud I want.

---
title: Learning JavaScript without JQuery
---

I'm updating the [Girl Code](https://girlcode.co.nz) activities to no longer use jQuery. jQuery is less trendy and popular every year, and we need to teach our students stuff that will help them look good when they talk to experienced developers.

When we started, some simple tasks were just too complex without jQuery -- in particular, making a GET request went from this:

```javascript
$.get("/report", processReport);
```

to this:

```javascript
var xhr = new XMLHttpRequest();
xhr.responseType = 'json';
xhr.open('GET', '/report');
xhr.onload = function() {
  var jsonResponse = xhr.response;
    processReport(jsonResponse);
};
xhr.send();
```

What a mess! For a student who's trying to remember what 'GET' and 'POST' mean, the jQuery example is so much better.

But the web has matured, and in most browsers a GET request can now look like this:

```javascript
fetch("/report")
  .then(response => response.json())
  .then(processReport);
```

We can work with that. It's still not as good as the jQuery way -- it doesn't use the key word 'GET', and it introduces promises and JSON, concepts that we don't want to teach at this point. But it's short and inoffensive and it'll be fine.

(Note that I'm not a JS expert, and there just the best examples I've found so far. Feel free to email me if you have something that's better! By better I mean: <i>it requires understanding fewer concepts</i>.)

So anyway, the most essential thing you'll ever want to do in JavaScript is create HTML and add it into a page. With vanilla JS, I haven't found a way to do this that I like. But I've found ways that are not too bad. Here are the alternatives I've come up with so far:

The step by step approach:

```javascript
function displayMessage1(message) {
  let postElement = document.createElement("div");
  postElement.classList.add("post");

  let messageElement = document.createElement("div");
  messageElement.classList.add("message");
  messageElement.innerHTML = message;

  postElement.appendChild(messageElement);

  let messageList = document.querySelector(".message-list");
  messageList.appendChild(postElement);
}
```

I personally like this, because it forces students to think of HTML as a tree instead of text. But it's a bit unfair to make them construct HTML in such an abstract way when they've only just learned how to write it the normal way.


Using a DOMParser:

```javascript
function displayMessage2(message) {
  let postElement = new DOMParser().parseFromString('<div class="post"><div class="message">' + message + '</div></div>', 'text/html').body;

  let messageList = document.querySelector(".message-list");
  messageList.appendChild(postElement);
}
```

This is pretty good. It's a shame you have to construct a new DOMParser, specify "text/html", and add ".body" to get the actual element. It would be perfect without those three oddities.

```javascript
function displayMessage3(message) {
  let container = document.createElement("div");
  container.innerHTML = '<div class="post"><div class="message">' + message + '</div></div>';
  let messageList = document.querySelector(".message-list");
  messageList.appendChild(container.firstChild);
}
```

Not sure if this is better or worse. I think it might be easier to explain what's weird about it: we create a temporary throwaway div element to build inside, then use its contents. Our students already have to learn what innerHTML does so it's not an additional load.

```javascript
function displayMessage4(message) {
  let postElement = document.createRange().createContextualFragment('<div class="post"><div class="message">' + message + '</div></div>');
  let messageList = document.querySelector(".message-list");
  messageList.appendChild(postElement);
}
```

My favourite so far. It avoids any ".firstChild" weirdness and returns the element we asked for. It unfortunately introduces a bunch of nonsense words (range? contextual fragment?!?) but it's all on one line, so we can handwave it and say "it makes some HTML".

Any of these will be better with template literals (template strings), so we can have line breaks in the HTML template:

```javascript
function displayMessage5(message) {
  let postElement = document.createRange().createContextualFragment(
    `
    <div class="post">
        <div class="message">${message}</div>
    </div>
    `);
  let messageList = document.querySelector(".message-list");
  messageList.appendChild(postElement);
}
```

Like everything, this is a tradeoff. Template literals are very different from normal strings, and teaching beginners both too closely together will add cognitive load. Should we use normal strings instead, broken into multiple lines?

```javascript
    '<div class="post">' +
    '    <div class="message">' + message + '</div>' +
    '</div>'
```

They'll make more mistakes with this version, but... good mistakes. You'll never regret becoming a string expert.

I think my fav is version 5, with multiline strings but not template literals.

Then later in the course, when we learn about using functions to avoid duplicate code, we could hide <code>document.createRange().createContextualFragment</code> inside a nicely named utility function.

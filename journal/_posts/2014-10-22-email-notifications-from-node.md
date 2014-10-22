---
title: Email Notifications from Node
---

Last night, I set up notifications so I'd know whenever someone logged into [Let's Be Ducks](www.matthewgatland.com/games/ducks/). It's a Node application hosted by AppFog.

I looked into Twitter first, but after reading the twitter API docs, email just seemed a bit easier. Using [emailjs](https://github.com/eleith/emailjs) and Gmail, I had notifications working in less than an hour.

Step one: Create a Gmail account.

Step two: Add emailjs to the `package.json` file:

{% highlight js %}
    "dependencies": {
      "emailjs": "0.3.12"
    }
{% endhighlight %}

Step three: run `npm install`.

Step four: Add this code to the server:

{% highlight js %}
    var email = require('./node_modules/emailjs/email');

    var mailserver  = email.server.connect({
       user:    "ducksalerts@gmail.com", 
       password: "matthewrulz", 
       host:    "smtp.gmail.com", 
       ssl:     true
    });

    sendEmail = function (message) {
        mailserver.send({
           text:    message, 
           from:    "Ducks Alerts <ducksalerts@gmail.com>", 
           to:      "support@matthewgatland.com",
           subject: "ducks"
        }, function(err, message) { console.log(err || message); });  
    }

    sendEmail("Testing the email system.");
{% endhighlight %}

It's now working. If I start the server, I receive a test email.

There were three more little steps, to tidy it up:

* Remove my password from the code. Instead, I created an environment variable in the AppFog UI, which I can access in JavaScript as `process.env.emailpassword`
* Make a Gmail filter to put a "notifyme" label on emails from Ducks Alerts
* Configure Gmail on my phone to pop up a notification for email with the "notifyme" label.

Done! Note that Gmail limits you to 99 emails a day using this method.

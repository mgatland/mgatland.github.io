---
title: Email Notifications from Node
---

**Warning:** this is an old post and this method probably won't work any more. These days (in 2017), I use Sendgrid, a special automated email service, rather than trying to automatically send an email from Gmail.

------

I wanted to be notified whenever someone logged into [Let's Be Ducks](www.matthewgatland.com/games/ducks/). Ducks is a Node application hosted by AppFog.

I looked into Twitter first, but after reading the twitter API docs, email seemed a bit easier. Using [emailjs](https://github.com/eleith/emailjs) and Gmail, I had everything working in less than an hour.

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
       password: process.env.emailpassword, 
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
    };

    sendEmail("Testing the email system.");
{% endhighlight %}

The password is set through an environment variable. In AppFog, there is a UI to configure these.

At this point, the app will send me emails.

After that, I just had to configure my mailbox:

* Make a Gmail filter to put a "notifyme" label on emails from Ducks Alerts
* Configure Gmail on my phone to pop up a notification for email with the "notifyme" label.

Done! Note that Gmail limits you to 99 emails a day using this method.

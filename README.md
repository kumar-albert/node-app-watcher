# Node App Watcher
A simple node module which acts as a serverless program to monitor your        application status.
    
> **It will send notification, once your application status changes(UP or DOWN) 
    
## Installation and setup

```watcher.start(config<object>);```

```
Config object should contains following properties
    1. email: "gmail-id"
            Email id for sending notification(From mail id)
    2. pass: "gmail-password"
    3. to: ["email-id", "email-id"]
        add one or multiple gmail ids for getting notification from watcher
    4. appUrl:  - Application URL to be monitored
```

## Email Notication
We are using node mailer for sending emails. So you can add multible to email ids

## Gmail account configuration
Turn on gmail less secure option for sending emails through nodemailer.
https://nodemailer.com/usage/using-gmail/

## Examples

**watcher.js**
```

var watcher = require("app-watcher");

watcher.start({
    from: "*****@gmail.com",
    pass: "***********",
    to: ["****@gmail.com", "****@hotmail.com", "*****@domain.com"],
    appUrl: "http://application.com/"
});


node watcher.js;

```

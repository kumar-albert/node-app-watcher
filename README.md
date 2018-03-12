# Node App Watcher
A simple node module which acts as a serverless program to monitor your        application status.
    
> **It will send notification, once your application status changes(UP or DOWN) 
    
## Installation and setup
Using npm:

```shell
$ npm i -g npm
$ npm i --save lodash
```

Init Method:
```js 
watcher.start(config<object>);
```


Config object should contains following properties
1. email: "gmail-id"
    Email id for sending notification(From mail id)
2. pass: "gmail-password"
3. to: ["email-id", "email-id"]
    add one or multiple gmail ids for getting notification from watcher
4. appUrl:  - Application URL to be monitored
5. emailContent - this is a optional parameter,
    you can change subject and content of notification email


| Key            | Type      |Optional| Description                       |
|----------------|-----------|--------|-----------------------------------|
| email          | String    |false| Email id for sending notification. Email id should be gmail account id. |
| pass           | String    |false|  Password of gmail account. |
| to             | Array[String] or String|false|  Here you add your notification receivers list |
| appUrl         | String    |false| Application url checking status about application |
| emailContent   | Object    |true|  This is a optional parameter. You can change email content.| 

## Email Content

**emailContent** is a optional parameter, it has two attributes

 1. success {**subject** (String), **body** (String or HTMLString)}

 2. failure {**subject** (String), **body** (String or HTMLString)}

| key           | Type            |Optional| Description               | default values |
|---------------|-----------------|--------|---------------------------|---------|
| emailContent.success.subject| String|true| Optional parameter. You can add you success email subject| App Status - Started |
| emailContent.success.body| String or HTML String|true| Optional parameter. You can add you success email body| <div>Your application started at Mon Mar 01 2018 16:50:02 GMT+0530 (IST)</div> |
| emailContent.failure.subject| String|true| Optional parameter. You can add you failure email subject|App Status - Terminated|
| emailContent.success.body| String|true| Optional parameter. You can add you failure email body|<div>Your application terminated due to [Reason]</div>|

## Email Notication
We are using node mailer for sending emails. So you can add multible to email ids

## Gmail account configuration
Turn on gmail less secure option for sending emails through nodemailer.
https://nodemailer.com/usage/using-gmail/

## Examples

**watcher.js**
```js 

var watcher = require("app-watcher");

//default method
watcher.start({
    from: "*****@gmail.com",
    pass: "***********",
    to: ["****@gmail.com", "****@hotmail.com", "*****@domain.com"],
    appUrl: "http://application.com/"
});
```
(or)

```js
watcher.start({
    from: "*****@gmail.com",
    pass: "***********",
    to: ["****@gmail.com", "****@hotmail.com", "*****@domain.com"],
    appUrl: "http://application.com/",


    emailContent: {         //optional parameter
        success: {
            subject: "",
            body: ""
        },
        failure: {
            subject: "",
            body: ""
        }
    }
});
```
```shell
$ node watcher.js;

```

## Support
[<img src='https://www.ideas2it.com/images/tiny-home-images/logo.png' title='​Ideas2IT Technology Services Pvt.Ltd' height='36px'>](https://www.ideas2it.com)

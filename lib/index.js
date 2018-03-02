/**
 * A simple serverless program to watch your application.
 * If your application gets down, module send email notification
 * @author Kumar Albert <kumaralbert95@gmail.com>
 */

'use strict'
var mailer = require("nodemailer");

var CronJob = require('cron').CronJob;
var request = require('request');
var fs = require('fs');

var interval = '* * * * * *';

var rl = require('readline');

var logFileName = "watcher";

var transporter = null;
var config = {};
var status = "DOWN";

/**
 * It trigger notification emails depends on app status
 * @param {Any} message 
 */
function sendNotification(message) {
    var mailOptions = null;
    if (status === "DOWN") {
        mailOptions = {
            from: config.from, 
            to: config.to, 
            subject: 'App Status - Teminated', 
            html: '<div>Your application termainated due to'+ message + '</div>'
        };
    } else {
        mailOptions = {
            from: config.from, 
            to: config.to, 
            subject: 'App Status - Started', 
            html: '<div>Your application started at'+ new Date() + '</div>'
        };
    }

    if (mailOptions) {
        transporter.sendMail(mailOptions, function (err, info) {
            if(err) {
                console.error(err);
            } else {
                console.info("[info]\t" + "Notication Sent...");
            }
        });
    }
}

function parseContent(data) {
    var content = {
        date: new Date()
    };
    if (data.type === 'error') {
        content.type = 'error';
        content.error = data.error;
    } else {
        content.type = 'success';
        content.message = data.message;
    }
    return JSON.stringify(content);
}


function logJobStatus(data) {
    fs.exists("logs/", function(isExist) {
        if (!isExist) {
            fs.mkdir("logs", function(err) {
                if (err) throw err;
                var month = content.date.getMonth() > 9 ? content.date.getMonth() : '0' + content.date.getMonth();
                var today = content.date.getDate() + "-" + month + "-" + content.date.getFullYear();
                var content = parseContent(data);
                fs.appendFile('logs/'+ logFileName + '-'+ today +'.txt',
                    content + '\n', function(err) {
                    if (err) throw err;
                });
            });
        }
    })
}


var watcher = function() {
    console.info("[info]\t" + "Watching...");
    request({
            url: config.appUrl,
            method: 'get',
            data: {},
            json: true
    }, function(err, response) {
        if (status === "UP" && err) {
            status = "DOWN";
            logJobStatus({
                type: 'error',
                error: err
            });
            sendNotification(JSON.stringify(err));
            return;
        } else if (status === "DOWN" && !err) {
            status = "UP";
            logJobStatus({
                type: 'success'
            });
            sendNotification(JSON.stringify(err));
        }
    });
};


function validateConfig(data) {
    if (data && !data.email) {
        console.info("[error]\t" + "Please provide your email!");
        process.exit(1);
    } else if(data && !data.pass) {
        console.info("[error]\t" + "Please provide your password!");
        process.exit(1);
    } else if(data && !data.to) {
        console.info("[error]\t" + "Please provide your to email addresses!");
        process.exit(1);
    } else if(data && !data.appUrl) {
        console.info("[error]\t" + "Please provide your to application url!");
        process.exit(1);
    } else {
        return true;
    }
}


exports.start = function(data) {
    console.info("[info]\t" + "Service started \t" + new Date());
    logJobStatus({
        type: 'success',
        message: 'App watcher started successfully'
    });
    try {
        config = data;        
        if (validateConfig(config)) {
            transporter = mailer.createTransport({
                service: 'gmail',
                auth: {
                    user: config.from,
                    pass: config.pass
                }
            });
            var job = new CronJob({
                cronTime: interval,
                onTick: watcher,
                start: false
            });
        
            job.start();
        }
    } catch(e) {
        throw e;
    }
}


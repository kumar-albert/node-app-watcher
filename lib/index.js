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
 * This method used to get subject of notification email
 * @param {string} status 
 */
function getEmailSubject(status) {
    var content = config.emailContent ? config.emailContent : null;
    if (status === "DOWN") {
        if (content && content.failure && content.failure.subject) {
            return content.failure.subject;
        }
        return 'App Status - Terminated';
    } else if (status === "UP") {
        if (content && content.success && content.success.subject) {
            return content.success.subject;
        }
        return 'App Status - Started';
    }
    return "";
}

/**
 * This method used to get body of notification email
 * @param {string} status 
 * @param {any} message 
 */
function getEmailBody(status, message) {
    var content = config.emailContent ? config.emailContent : null;
    if (status === "DOWN") {
        if (content && content.failure && content.failure.body) {
            return content.failure.body;
        }
        return '<div>Your application terminated due to '+ message + '</div>';
    } else if (status === "UP") {
        if (content && content.success && content.success.body) {
            return content.success.body;
        }
        return '<div>Your application started at '+ new Date() + '</div>';
    }
    return "";
}

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
            subject: getEmailSubject(status), 
            html: getEmailBody(status, message)
        };
    } else {
        mailOptions = {
            from: config.from, 
            to: config.to, 
            subject: getEmailSubject(status), 
            html: getEmailBody(status, message)
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

/**
 * This method used to parse content is failure or not 
 * @param {*} data 
 */
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

/**
 * This is a logger to log application status
 * @param {*} data 
 */
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

/**
 *  This is a core function, it check app healthy status
*/
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

/**
 * Validation for configuration
 * @param {*} data 
 */
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


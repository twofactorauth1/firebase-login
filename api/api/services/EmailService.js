var nodemailer = require('nodemailer');


exports.sendEmail = function (mailOptions, callback) {
    var transport = nodemailer.createTransport("SMTP", {
        host: "localhost", // hostname
        port: 25
    });
    transport.sendMail(mailOptions, function (err, res) {
        callback(err, res);
    });
};

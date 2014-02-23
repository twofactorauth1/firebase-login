var baseDao = require('./base.dao');
var awsConfigs = require('../configs/aws.config');
var crypto = require('crypto');

var dao = {

    options: {
        name: "user.dao",
        defaultModel: $$.m.User
    },


    getSignedRequest: function (bucket, resource, expirationTimeInSeconds) {
        var s3AccessKey = awsConfigs.S3_ACCESS_KEY;
        var s3SecretKey = awsConfigs.S3_SECRET_KEY;

        var hmac = crypto.createHmac("sha1", s3SecretKey);

        if (expirationTimeInSeconds == 0) {
            expirationTimeInSeconds = $$.u.dateutils.HOUR_IN_SEC;
        }

        var expires = Math.round((new Date().getTime()) / 1000) + expirationTimeInSeconds;

        var toBeHashed = "GET\n\n\n" + expires + "\n/" + bucket + "/" + resource;
        var hashedSignature = hmac.update(toBeHashed).digest('base64');
        var escapedSignature = encodeURIComponent(hashedSignature);

        var url = "http://s3.amazonaws.com/" + bucket + "/" + resource + "?AWSAccessKeyId=" + s3AccessKey + "&Expires=" + expires + "&Signature=" + escapedSignature;
        return url;
    },


    getS3UploadCredentials: function (bucket, filename, redirectUrl) {

        if (!redirectUrl) {
            redirectUrl = awsConfigs.DEFAULT_REDIRECT_URL;
        } else if (redirectUrl.indexOf("/") == 0) {
            var configs = global.noderequire("./configs/configs.js");
            var serverUrl = configs.server_url;

            redirectUrl = serverUrl + redirectUrl;
        }

        var defaultTTL = awsConfigs.POST_TTL || $$.u.dateutils.HOUR;
        var s3AccessKey = awsConfigs.S3_ACCESS_KEY;
        var s3SecretKey = awsConfigs.S3_SECRET_KEY;

        var crypto = require('crypto');

        var policyDoc = {
            "expiration": new Date(new Date().getTime() + defaultTTL).toISOString(),

            "conditions": [
                ["starts-with", "$key", ""],
                ["eq", "$bucket", bucket],
                {"acl": "private"},
                {"success_action_redirect": redirectUrl},
                ["starts-with", "$Content-Type", ""]
            ]
        };

        var s3PolicyBase64 = new Buffer(JSON.stringify(policyDoc)).toString('base64');
        var s3Credentials = {
            s3PolicyBase64: s3PolicyBase64,
            s3Signature: crypto.createHmac("sha1", s3SecretKey).update(s3PolicyBase64).digest("base64"),
            s3Key: s3AccessKey,
            s3Redirect: redirectUrl,
            s3Policy: policyDoc,
            uploadUrl: "http://" + bucket + ".s3.amazonaws.com/"
        };

        return s3Credentials;
    },


    uploadToS3: function (bucket, subdirectory, file, makeUnique, fn) {
        var self = this;

        var name = file.name;
        var type = file.type;
        var size = file.size;
        var path = file.path;

        if (makeUnique === true) {
            //Rename file to ensure uniqueness
            var regExp = /(.+?)(\.[^.]*$|$)/;
            var filenameParts = name.match(regExp);
            var nameNoExt = filenameParts[1];
            var ext = filenameParts[2];
            name = nameNoExt + "_" + new Date().getTime() + ext;
        }

        var key = name;
        if (!$$.u.stringutils.isNullOrEmpty(subdirectory)) {
            key = subdirectory + "/" + name;
        }

        //proxy out to s3
        var AWS = require('aws-sdk');
        var fs = require('fs');

        fs.readFile(path, function (err, data) {
            var s3 = new AWS.S3();
            s3.client.putObject({
                Bucket: bucket,
                Key: key,
                Body: data
            }, function (err, data) {
                if (!err) {
                    fn(null, {filename: name, url: "http://s3.amazonaws.com/" + bucket + "/" + key, resource: key, filesize: size});
                } else {
                    self.log.error("Failed to upload file to S3: " + err.toString() + " [" + data + "]");
                    fn(err, data);
                }
            });
        });
    }
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.S3Dao = dao;

module.exports = dao;
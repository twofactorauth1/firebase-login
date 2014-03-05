var baseApi = require('../base.api');
var formidable = require('formidable');
var s3Dao = require('../../dao/s3.dao');
var awsConfig = require('../../configs/aws.config');


var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "upload",

    dao: null,

    initialize: function () {
        //GET
        app.get(this.url("contact/photo"), this.confirmUpload.bind(this));
        app.post(this.url("contact/photo"), this.isAuthApi, this.uploadContactPhoto.bind(this));
    },


    confirmUpload: function (req, resp) {
        resp.send("ok");
    },


    uploadContactPhoto: function (req, resp) {
        var self = this;
        var form = new formidable.IncomingForm();
        //form.hash = "md5";
        form.parse(req, function (er, fields, files) {
            var bucket = awsConfig.BUCKETS.CONTACT_PHOTOS;
            var accountId = self.accountId();
            var directory = "acct_indigenous";
            if (accountId > 0) {
                directory = "acct_" + accountId;
            }

            var file = files["files[]"];
            //Lets send this up to s3
            s3Dao.uploadToS3(bucket, directory, file, true, function (err, value) {
                if (err) {
                    self.sendFileUploadResult(resp, err, file);
                } else {
                    self.sendFileUploadResult(resp, err, value);
                }
            })
        });
    },


    sendFileUploadResult: function (resp, err, value) {
        var result = {};
        result.files = [];

        if (!err) {
            var file = {
                name: value.name,
                size: value.size,
                url: value.url,
                resource: value.resource
            };

            result.files.push(file);
        } else {
            file = {
                name: value.name,
                error: err.toString()
            };

            result.files.push(file);
        }

        resp.send(result);
    }
});

return new api();
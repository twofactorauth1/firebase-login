var BaseApi = require('../base.api');
var S3Dao = require('../../dao/s3.dao');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, BaseApi.prototype, {

    base: "aws",

    dao: S3Dao,

    initialize: function () {
        //GET
        app.get(this.url("credentials/download/:bucket/:resource"), this.isAuthApi, this.getSignedRequest.bind(this));
        app.get(this.url("credentials/upload/:bucket/:filename"), this.isAuthApi, this.getS3UploadCredentials.bind(this));
    },


    getSignedRequest: function (req, resp) {
        var bucket = req.params.bucket;
        var resource = req.params.resource;

        var url = S3Dao.getSignedRequest(bucket, resource);
        resp.send(url);
    },


    getS3UploadCredentials: function (req, resp) {
        var self = this;
        var filename = req.params.filename;
        var bucket = req.params.bucket;
        var redirect = req.query.redirect;
        if (redirect == null || redirect == "") {
            redirect = req.headers.referer;
        }

        if (!bucket) {
            this.wrapError(resp, 400, null, "Invalid paramater for S3 Bucket");
        }

        var credentials = S3Dao.getS3UploadCredentials(bucket, filename, redirect);
        resp.send(credentials)
    }
});

return new api();
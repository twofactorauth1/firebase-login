/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../../base.api.js');
var s3Dao = require('../../../dao/integrations/s3.dao.js');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "integrations/aws",

    dao: s3Dao,

    initialize: function () {
        //GET
        app.get(this.url("credentials/download/:bucket/:resource"), this.isAuthApi, this.getSignedRequest.bind(this));
        app.get(this.url("credentials/upload/:bucket/:filename"), this.isAuthApi, this.getS3UploadCredentials.bind(this));
    },


    getSignedRequest: function (req, resp) {
        var bucket = req.params.bucket;
        var resource = req.params.resource;

        var url = s3Dao.getSignedRequest(bucket, resource);
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
            self = req = resp = null;
        }

        var credentials = s3Dao.getS3UploadCredentials(bucket, filename, redirect);
        resp.send(credentials)
        self = req = resp = null;
    }
});

return new api();
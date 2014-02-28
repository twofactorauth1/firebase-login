define([], function () {

    "use strict";

    var awsService = {
        getS3SignedRequest: function (bucket, resource) {
            var deferred = $.Deferred();
            var url = $$.api.getApiUrl("s3", "credentials/download/" + bucket + "/" + resource, null, null);
            $.get(url)
                .done(function (data, status, jqhhr) {
                    deferred.resolve(data);
                })
                .fail(function (resp) {
                    deferred.reject(resp);
                });

            return deferred;
        }
    };

    $$.svc.AWSService = awsService;

    return awsService;
});

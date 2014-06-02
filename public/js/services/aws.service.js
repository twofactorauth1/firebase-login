/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

define([], function () {

    "use strict";

    var awsService = {
        getS3SignedRequest: function (bucket, resource) {
            var deferred = $.Deferred();
            var url = $$.api.getApiUrl("integrations/aws", "credentials/download/" + bucket + "/" + resource, null, null);
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

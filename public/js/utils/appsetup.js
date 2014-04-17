/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([], function() {

    var obj = {
        setUp: function () {
            this.setUpServerProps();
            this.setUpApiUrl();
        },


        setUpServerProps: function () {
            if (typeof $$ === 'undefined') {
                $$ = {};
            }

            $$.server = $$.server || {};
            $$.server.get = function (property) {
                return $$.server[property];
            };
        },


        setUpApiUrl: function () {
            $$.api = $$.api || {};

            $$.api.getApiUrl = function (service, path, version, unique) {
                if (version == null || version === "") {
                    version = "1.0";
                }

                var root = "/api/";
                var str = root + version + "/" + service + "/" + path;
                if (str.indexOf("?") > -1) {
                    str = str + "&";
                } else {
                    str = str + "?";
                }

                if (unique == null) {
                    unique = new Date().getTime();
                }
                str = str + "unique=" + unique;
                return str;
            };
        }
    };

    obj.setUp();
    return {};
});

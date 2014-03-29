/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

define(function() {

    var utils = {

        styleutils: {
            loadCSS: function(href) {
                var cssLink = $("<link rel='stylesheet' type='text/css' href='"+href+"'>");
                $("head").append(cssLink);
            }
        },


        viewutils: {
            isMobileLayout:function () {
                return (window.innerWidth || document.documentElement.clientWidth) < 768;
            },


            isMobileOrTabletLayout:function () {
                return (window.innerWidth || document.documentElement.clientWidth) <= 1024;
            },


            isTabletLayout:function () {
                var w = window.innerWidth || document.documentElement.clientWidth;
                return w >= 768 && w <= 1024;
            },


            isMobileTabletTouch:function () {
                if (this.isMobileOrTabletLayout() || this.isTouch()){
                    return true;
                }
                return false;
            },


            isMobileOrTouch:function () {
                if (this.isMobileLayout() || this.isTouch()) {
                    return true;
                }
                return false;
            },


            isTouch:function () {
                if ((Modernizr && Modernizr.touch) === true) {
                    return true;
                }
                return false;
            }
        },


        errorutils: {
            getMessageFromJQXHRResponse: function(resp) {
                if (_.isString(resp)) {
                    return resp;
                }

                if (resp && resp.responseText) {
                    try {
                        resp = JSON.parse(resp.responseText);
                        if (resp.message) {
                            var str= "";
                            if (_.isObject(resp.message)) {
                                for (var key in resp.message) {
                                    if (key != null && key != "undefined" && resp.message[key] != null) {
                                        str += key + ": " + resp.message[key];
                                    }
                                }
                            } else {
                                str = resp.message;
                            }

                            if (resp.detail) {
                                str += "Detail: " + resp.detail;
                            }
                            return str;
                        } else if (resp.detail) {
                            return resp.detail;
                        } else if(resp.code) {
                            return resp.code;
                        }
                    } catch(e) {
                        return resp.responseText;
                    }
                }
                return "";
            }
        }
    }

    if (typeof $$ === 'undefined') {
        $$ = {};
    }

    $$.u = $$.u || {};
    $$.u = _.extend($$.u, utils);
});

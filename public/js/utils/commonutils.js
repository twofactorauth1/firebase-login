/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
    'libs/misc/uuid'
], function(uuid) {
    var utils = {

        querystringutils: {

            getQueryStringValue: function(name, searchValue) {
                if (searchValue == null || searchValue == "") {
                    searchValue = location.search;
                }
                name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
                var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                    results = regex.exec(searchValue);
                return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
            }
        },


        stringutils: {

            isNullOrEmpty: function (str) {
                if (str == null || _.isString(str) === false || str.trim() === "") {
                    return true;
                }
                return false;
            },


            stripHtml: function(str) {
                return str.replace(/(<([^>]+)>)/ig,"");
            },


            splitFullname: function(fullname) {
                var names = fullname.split(" "), first = "", last = "", middle = "";
                first = names[0];

                names.splice(0,1);
                if (names.length > 1) {
                    middle = names[0];
                    names.splice(0,1);
                }
                last = names.join(" ");

                return [first,middle,last];
            },

            plural: function (n, zero, one, more) {
                // plural(2, 'egg') => '2 eggs'
                if (typeof one !== 'string') {
                    one = zero
                    return n + ' ' + (n == 1 ? one : (one + 's'))
                }
                // plural(5, singular, plural)
                // plural(5, none, singular, plural)
                if (typeof more !== 'string') one = zero, more = zero = one
                return (n > 1 ? more : n === 1 ? one : zero).replace(/%[sd]/g, n)
            },

            ellipsis:  function (text, n) {
                if (text.length > n) return text.slice(0, n) + '...';
                return text;
            }
        },


        idutils: {

            generateUUID: function () {
                if (typeof(uuid) !== 'undefined') {
                    return uuid.v4();
                }
                //We're in node.
                if (typeof window === 'undefined') {
                    return require('node-uuid').v4();
                }
            },


            /**
             * Deprecated, use generateUniqueAlphaNumeric()
             *
             * @returns {*}
             */
            generateUniqueAlphaNumericShort: function () {
                return this.generateUniqueAlphaNumeric();
            },


            generateUniqueAlphaNumeric: function (length, lettersOnly, lowerOnly) {
                if (length == null || length === 0) {
                    length = 10;
                }

                if (length <= 10 && lettersOnly !== true) {
                    if (length <= 10) {
                        var val = ((new Date().getTime() * parseInt((Math.random()+1) * 1000)) + new Date().getTime()).toString(36);
                        if (val == NaN || val == undefined) {
                            return this.generateUniqueAlphaNumeric();
                        }
                    }

                    return val.substring(0, length);
                }

                //97 - "a", 122 - "z"
                var integers = {min:49,max:57};
                var upper = {min:65, max:90};
                var lower = {min:97, max:122};

                var range = [], i;
                for (i = lower.min; i <= lower.max; i++) {
                    range.push(String.fromCharCode(i));
                }
                if (lowerOnly !== true) {
                    for (i = upper.min; i <= upper.max; i++) {
                        range.push(String.fromCharCode(i));
                    }
                }
                //Lets weight the numbers, else we barely get any
                if (lettersOnly !== true) {
                    var weight = range.length/10/2;
                    for (var j = 0; j < weight; j++) {
                        for (i = integers.min; i <= integers.max; i++) {
                            range.push(String.fromCharCode(i));
                        }
                    }
                }

                var str = "", rangeLength = range.length, val = null;
                while(str.length < length) {
                    val = range[Math.round(Math.random()*rangeLength)];
                    if (val == null) { continue; }
                    str += val;
                }
                return str;
            },


            generateTimeStampId: function () {
                var msUTC = $$.u.dateutils.getUTCTime();
                return msUTC + "_" + new Date().getTimezoneOffset() + "_" + parseInt(Math.random() * 10000, 8).toString(36);
            },


            getTimeFromTimeStampId: function () {

            }
        },

        dateutils: {

            SECOND: 1000,
            MINUTE: 1000 * 60,
            HOUR: 1000 * 60 * 60,
            DAY: 1000 * 60 * 60 * 24,

            MINUTE_IN_SEC: 60,
            HOUR_IN_SEC: 3600,
            DAY_IN_SEC: 24*3600,

            getUTCTimeMs: function (date) {
                if (date == null) {
                    date = new Date();
                }

                return date.getTime() + (date.getTimezoneOffset() * 60000);
            },


            getUTCTimeString: function (date) {
                if (date == null) {
                    date = new Date();
                }
                return date.toISOString();
            },


            dateDiff:function (date1, date2, unit) {

                if (date1 == null) {
                    date1 = new Date();
                }

                if (date2 == null) {
                    date2 = new Date();
                }

                var diff = date2.getTime() - date1.getTime();

                switch (unit) {
                    case "millisecond":
                        //diff = diff;
                        break;
                    case "second":
                        diff = diff / 1000;
                        break;
                    case "minute":
                        diff = diff / (1000 * 60);
                        break;
                    case "hour":
                        diff = diff / (1000 * 60 * 60);
                        break;
                    case "day":
                        diff = diff / (1000 * 60 * 60 * 24);
                        break;
                }
                return diff;
            }
        },


        formatutils: {

            formatDateDiffInHHMMSS: function (date1, date2, useDayFormat) {
                if (date1 == null) {
                    return "0:00:00";
                }

                if (date2 == null) {
                    date2 = new Date();
                }

                if (_.isString(date1)) {
                    date1 = new Date(date1);
                }

                if (_.isString(date2)) {
                    date2 = new Date(date2);
                }

                var numSeconds = (date2.getTime() - date1.getTime()) / 1000;
                return $$.u.formatutils.formatSecondsToHHMMSS(numSeconds, useDayFormat);
            },


            formatSecondsToHHMMSS: function (secondsVal, useDayFormat) {
                if (useDayFormat == 'true') {
                    useDayFormat = true;
                }
                var hours = Math.floor(secondsVal / 3600);
                var minutes = Math.floor((secondsVal - (hours * 3600)) / 60);
                var seconds = Math.round(secondsVal - (hours * 3600) - (minutes * 60));

                //if (hours   < 10) {hours   = "0"+hours;}
                if (minutes < 10) {
                    minutes = "0" + minutes;
                }
                if (seconds < 10) {
                    seconds = "0" + seconds;
                }

                var time = "";
                if (useDayFormat === true && hours > 23) {
                    var numDays = Math.floor(hours / 24);
                    hours = Math.floor(hours % 24);
                    time = numDays + "d, ";
                }
                time += hours + ':' + minutes + ':' + seconds;
                return time;
            },


            formatMoney: function (value, places, symbol, thousand, decimal) {
                // Extend the default Number object with a formatMoney() method:
                // usage: someVar.formatMoney(decimalPlaces, symbol, thousandsSeparator, decimalSeparator)
                // defaults: (2, "$", ",", ".")
                places = !isNaN(places = Math.abs(places)) ? places : 2;
                symbol = symbol !== undefined ? symbol : "$";
                thousand = thousand || ",";
                decimal = decimal || ".";
                var number = parseFloat(value),
                    negative = number < 0 ? "-" : "",
                    i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
                    j = (j = i.length) > 3 ? j % 3 : 0;
                return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
            },


            formatInteger: function (n) {
                var n = n.toString().split('')
                    , parts = [];
                while (n.length) {
                    parts.unshift(n.splice(-3, 3).join(''))
                }

                return parts.join(',')
            }
        },


        iputils: {

            getClientIp: function (req) {
                return (req.headers['x-forwarded-for'] || '').split(',')[0] || req.client.remoteAddress;
            }
        },


        objutils: {
            deepClone:function (object) {
                var obj = _.isArray(object) === true ? [] : {};
                if (typeof $ !== 'undefined' && typeof $.extend !== 'undefined') {
                    return $.extend(true, obj, object);
                } else {
                    return this.extend(true, obj, object);
                }
            },


            extend: function() {
                var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
                    i = 1,
                    length = arguments.length,
                    deep = false,
                    toString = Object.prototype.toString,
                    hasOwn = Object.prototype.hasOwnProperty,
                    push = Array.prototype.push,
                    slice = Array.prototype.slice,
                    trim = String.prototype.trim,
                    indexOf = Array.prototype.indexOf,
                    class2type = {
                        "[object Boolean]": "boolean",
                        "[object Number]": "number",
                        "[object String]": "string",
                        "[object Function]": "function",
                        "[object Array]": "array",
                        "[object Date]": "date",
                        "[object RegExp]": "regexp",
                        "[object Object]": "object"
                    },
                    jQuery = {
                        isFunction: function (obj) {
                            return jQuery.type(obj) === "function"
                        },
                        isArray: Array.isArray ||
                            function (obj) {
                                return jQuery.type(obj) === "array"
                            },
                        isWindow: function (obj) {
                            return obj != null && obj == obj.window
                        },
                        isNumeric: function (obj) {
                            return !isNaN(parseFloat(obj)) && isFinite(obj)
                        },
                        type: function (obj) {
                            return obj == null ? String(obj) : class2type[toString.call(obj)] || "object"
                        },
                        isPlainObject: function (obj) {
                            if (!obj || jQuery.type(obj) !== "object" || obj.nodeType) {
                                return false
                            }
                            try {
                                if (obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                                    return false
                                }
                            } catch (e) {
                                return false
                            }
                            var key;
                            for (key in obj) {}
                            return key === undefined || hasOwn.call(obj, key)
                        }
                    };
                if (typeof target === "boolean") {
                    deep = target;
                    target = arguments[1] || {};
                    i = 2;
                }
                if (typeof target !== "object" && !jQuery.isFunction(target)) {
                    target = {}
                }
                if (length === i) {
                    target = this;
                    --i;
                }
                for (i; i < length; i++) {
                    if ((options = arguments[i]) != null) {
                        for (name in options) {
                            src = target[name];
                            copy = options[name];
                            if (target === copy) {
                                continue
                            }
                            if (deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
                                if (copyIsArray) {
                                    copyIsArray = false;
                                    clone = src && jQuery.isArray(src) ? src : []
                                } else {
                                    clone = src && jQuery.isPlainObject(src) ? src : {};
                                }
                                // WARNING: RECURSION
                                target[name] = this.extend(deep, clone, copy);
                            } else if (copy !== undefined) {
                                target[name] = copy;
                            }
                        }
                    }
                }
                return target;
            }
        },

        numberutils: {
            toNumber: function (n, _default) {
                return isNaN(n) ? _default : +n;
            }
        }
    };


    //Native Prototype extensions
    String.isNullOrEmpty = function(string) {
        if (string == null || string == "") {
            return true;
        }
        return false;
    };


    if (typeof $$ === 'undefined') {
        $$ = {};
    }

    $$.u = $$.u || {};
    $$.u = _.extend($$.u, utils);

    return $$.u;
});

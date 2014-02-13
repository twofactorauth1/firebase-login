define([
    'libs/misc/uuid'
], function(uuid) {
    var utils = {

        querystringutils: {

            getQueryStringValue: function(name, searchValue) {
                if (searchValue === null || searchValue === "") {
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


            generateUniqueAlphaNumericShort: function () {
                return new Date().getTime().toString(36);
            },


            generateUniqueAlphaNumeric: function () {
                return ((new Date().getTime() * parseInt(Math.random() * 1000, 8)) + new Date().getTime()).toString(36);
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


            formatMoney:function (value, places, symbol, thousand, decimal) {
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
                return $.extend(true, obj, object);
            }
        }
    };

    $$ = $$ || {};
    $$.u = $$.u || {};
    $$.u = _.extend($$.u, utils);

    return $$.u;
});

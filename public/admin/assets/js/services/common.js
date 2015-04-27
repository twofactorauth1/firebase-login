'use strict';
/**
 * service for products
 */
(function(angular) {
    app.service('CommonService', ['$http', function($http) {

        this.generateUniqueAlphaNumericShort = function() {
            return this.generateUniqueAlphaNumeric();
        };

        this.generateUniqueAlphaNumeric = function(length, lettersOnly, lowerOnly) {
            if (length == null || length === 0) {
                length = 10;
            }

            if (length <= 10 && lettersOnly !== true) {
                if (length <= 10) {
                    var val = ((new Date().getTime() * parseInt((Math.random() + 1) * 1000)) + new Date().getTime()).toString(36);
                    if (val == NaN || val == undefined) {
                        return this.generateUniqueAlphaNumeric();
                    }
                }

                return val.substring(0, length);
            }

            //97 - "a", 122 - "z"
            var integers = {
                min: 49,
                max: 57
            };
            var upper = {
                min: 65,
                max: 90
            };
            var lower = {
                min: 97,
                max: 122
            };

            var range = [],
                i;
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
                var weight = range.length / 10 / 2;
                for (var j = 0; j < weight; j++) {
                    for (i = integers.min; i <= integers.max; i++) {
                        range.push(String.fromCharCode(i));
                    }
                }
            }

            var str = "",
                rangeLength = range.length,
                val = null;
            while (str.length < length) {
                val = range[Math.round(Math.random() * rangeLength)];
                if (val == null) {
                    continue;
                }
                str += val;
            }
            return str;
        };

    }]);
})(angular);

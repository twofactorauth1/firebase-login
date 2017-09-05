/*global app   */
/* eslint-disable no-console */
/**
 * service for common utility functions
 */
(function () {
	'use strict';
	app.service('commonService', [function () {


		this.generateUniqueAlphaNumericShort = function () {
			return this.generateUniqueAlphaNumeric();
		};

		this.generateUniqueAlphaNumeric = function (length, lettersOnly, lowerOnly) {
			if (length === null || length === 0) {
				length = 10;
			}

			if (length <= 10 && lettersOnly !== true) {
				if (length <= 10) {
					var val = ((new Date().getTime() * parseInt((Math.random() + 1) * 1000)) + new Date().getTime()).toString(36);
					//if (val == NaN || val == undefined) {
					if (isNaN(val)) {
						return this.generateUniqueAlphaNumeric();
					}
					return val.substring(0, length);
				}
			}

			//97 - "a", 122 - "z"
			var integers = {
					min: 49,
					max: 57
				},
				upper = {
					min: 65,
					max: 90
				},
				lower = {
					min: 97,
					max: 122
				},
				range = [],
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
				var weight = range.length / 10 / 2,
					j;
				for (j = 0; j < weight; j++) {
					for (i = integers.min; i <= integers.max; i++) {
						range.push(String.fromCharCode(i));
					}
				}
			}

			var str = "",
				rangeLength = range.length,
				getVal = null;
			while (str.length < length) {
				getVal = range[Math.round(Math.random() * rangeLength)];
				if (getVal !== null) {
					str += getVal;
				}
			}
			return str;
		};

    }]);
}());

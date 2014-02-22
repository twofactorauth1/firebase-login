/* ===================================================
 * jsvalidate.js v0.5.4
 * ===================================================
 * Copyright 2012 Christopher Mina
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

/*
 * Validates a string value based on the permissions passed in.
 *
 * @param permissions The validation object, accepts several paramaters:
 *          {
 *              required                : null,     -- true|false|null
 *
 *              number : null      -- Validates value as a number
 *                  max : null          -- minimum number value allowed
 *                  min : null          -- maximum number value allowed
 *              integer : null     -- Validates value as an integer
 *                  max : null          -- minimum integer value allowed
 *                  min : null          -- maximum integer value allowed
 *              string : null      -- Validates value as a string
 *                  max : null          -- minimum string length allowed
 *                  min : null          -- maximum string length allowed
 *                  values : null       -- A list of all accepted values.  Value must match at least one value
 *                  regexp : null       -- A regular expression to run against the string.  It must match the regexp provided
 *              date : null        -- Validates the value a a date
 *              email : null       -- Validates the value as an email
 *              phone : null       -- Validates the value as a phone number and formats the number
 *                  allowInternational : null -- If true, allows both 10 digit us, and international numbers
 *				ip : null 			-- Validates the value as an IPV4 IP Address
 *          }
 * @return boolean false is Validation fails, the value if validation succeeds
 */
(function(){
    var validate = {
        validate: function(val, permissions) {
            var allowEmpty = null;
            if (permissions.required != null) {
                allowEmpty = !permissions.required;
            } else {
                allowEmpty = permissions.empty;
            }

            if (allowEmpty == null) {
                allowEmpty = false;
            }

            var isNumber = permissions.number === true;
            var isInteger = permissions.integer === true;
            var isString = permissions.string === true;
            var isDate = permissions.date === true;
            var isEmail = permissions.email === true;
            var isPhone = permissions.phone === true;
            var allowInternational = permissions.allowInternational === true;
            var isZip = permissions.zip === true;
            var isIP = permissions.ip === true;

            var isValid;
            var errorTip;

            if (allowEmpty) {
                errorTip = "A valid value must be supplied.";
            } else {
                errorTip = "A valid non-empty value must be supplied.";
            }

            if (isDate === true) {
                errorTip = "A valid date must be supplied in the form of MM/DD/YYYY.";
            } else if (isEmail === true) {
                errorTip = "A valid email address must be supplied.";
            } else if (isZip === true) {
                errorTip = "A valid zip code must be supplied";
            } else if (isPhone === true) {
                if (allowInternational === true) {
                    errorTip = "A valid 10 digit number, or international number starting with a plus (+) sign is required.";
                } else {
                    errorTip = "A valid 10 digit number is required.";
                }
            } else if (isIP === true) {
                errorTip = "A valid IP Address must be supplied";
            }


            var value = val;
            if (value == null || value === "") {
                if (allowEmpty === true) {
                    if (isDate || isNumber || isInteger) {
                        return {success:true, value:null};
                    }
                    return {success:true, value:value};
                } else {
                    return {success:false, msg:errorTip};
                }
            }

            var min, max;
            if (isDate === true) {
                min = permissions.min;
                max = permissions.max;
            } else {
                min = parseFloat(permissions.min);
                max = parseFloat(permissions.max);
            }

            var regexp, regexp_invalid, match;
            if (isInteger === true || isNumber === true) {
                if (isInteger === true) {
                    regexp = /^[0-9]+$/;
                } else {
                    regexp = /^[0-9.]+$/;
                }

                match = value.match(regexp);
                if (match != null) {
                    var i;
                    if (isInteger === true) {
                        i = parseInt(match[0], 10);
                    }
                    else {
                        i = parseFloat(match[0]);
                    }


                    if (min != null && i < min) {
                        errorTip = "Value must be greater than or equal to " + min;
                        return {success:false, msg:errorTip};

                    }else if (max != null && i > max) {
                        errorTip = "Value must be less than or equal to " + max;
                        return {success:false, ms:errorTip};
                    }

                    return {success:true, value:i};
                } else {
                    return {success:false, msg:errorTip};
                }
            }

            if (isZip === true) {
                isString = true;
                regexp = new RegExp(/(^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ]( )?\d[ABCEGHJKLMNPRSTVWXYZ]\d$)|(^\d{5}(-\d{4})?$)/);
            }
            if (isString === true) {
                if (min != null && value.length < min) {
                    errorTip = "Value must be longer than " + min;
                    return {success:false, msg:errorTip};
                }
                else if (max != null && value.length > max) {
                    errorTip = "Value must be shorter than " + max;
                    return {success:false, msg:errorTip};
                }
                if (permissions.values != null) {
                    if (permissions.values.indexOf(value) > -1) {
                        return {success:true, value:value};
                    } else {
                        return {success:false, msg:errorTip};
                    }
                }

                if (permissions.regexp != null) {
                    regexp = permissions.regexp;
                }

                if (permissions.invalidRegexp != null) {
                    regexp_invalid = permissions.invalidRegexp;
                }

                if (regexp_invalid != null) {
                    isValid = regexp_invalid.test(value);
                    if (isValid === true) {
                        return {success:false, msg:errorTip};
                    }
                }

                if (regexp != null) {
                    isValid = regexp.test(value);

                    if (isValid !== true) {
                        return {success:false, msg:errorTip};
                    }
                }

                return {success:true, value:value};
            }

            if (isDate === true) {
                var date = Date.parse(value);

                if (isNaN(date) === true) {
                    return {success:false, msg:errorTip};
                } else {
                    date = new Date(date);

                    if (min != null && date < min) {
                        errorTip = "You must enter a date after " + min.toLocaleDateString();
                        return {success:false, msg:errorTip};
                    } else if (max != null && date > max) {
                        errorTip = "You must enter a date before " + max.toLocaleDateString();
                        return {success:false, msg:errorTip};
                    }

                    return {success:true, value:new Date(value)};
                }
            }

            if (isEmail === true) {
                var emailRegExp = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
                var validEmail = emailRegExp.test(value);
                if (validEmail === false) {
                    return {success:false, msg:errorTip};
                } else {
                    return {success:true, value:value};
                }
            }

            if (isPhone === true) {
                var phoneUSRegExp = new RegExp(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/);

                if (phoneUSRegExp.test(value) === true) {
                    var formattedPhoneNumber = value.replace(phoneUSRegExp, "($1) $2-$3");
                    return {success:true, value:formattedPhoneNumber};
                } else if (allowInternational === true) {
                    var phoneIntRegExp = new RegExp(/^\+(?:[0-9][ .-]?){6,14}[0-9]$/);
                    if (phoneIntRegExp.test(value) === true) {
                        return {success:true, value:value};
                    }
                }
                return {success:false, msg:errorTip};
            }

            if (isIP === true) {
                var ipRegExp = new RegExp(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/);
                if (ipRegExp.test(value) === true) {
                    return {success:true, value:value};
                }
                return {success:false, msg:errorTip};
            }

            return {success:true, value:value};
        }
    };


    if (typeof $$ === 'undefined') {
        $$ = {};
    }

    $$.u = $$.u || {};
    $$.u = _.extend($$.u, validate);
}).call(this);



/* ===================================================
 * jquery.validate.js v0.5.4
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
 * Validates a form field using a validation object
 *
 * @param permissions The validation object, accepts several paramaters:
 *          {
 *		 		useHtml                 : null,      -- true|false|null - Determines if we use .html() or .val() to get
 *                                                          the value to be validated
 *              required                : null,     -- true|false|null
 *              errorTip                : ""        -- The text to set the tooltip of the element to
 *                                                      in case of failure, default is context sensitive
 *              errorClass              : "error"   -- The class added to the form element for css styling
 *              errorClassSelector      : null      -- the jquery selector onto which to apply the errorClass
 *              errorText               : ""        -- The text to place as the html property of an element, defaults to errorTip.
 *                                                      This text only gets displayed if the associated element is found with the
 *                                                      @param errorTextClassSelector property
 *              errorTextClassSelector : null       -- The jquery selector onto which to apply the errorText as .html(errorText)
 *
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
 *				ip : null  			-- Validates the value as an IPV4 IP Address
 *          }
 * @return boolean false is Validation fails, the value if validation succeeds
 */
define([], function () {

    jQuery.fn.validate = function (permissions) {
        //In case we have already validated, lets move the original title (now _title) back to its right place (title)
        this._moveAttribute("_title", "title");

        var errorTip = permissions.errorTip;
        var errorClass = permissions.errorClass;
        var errorClassSelector = permissions.errorClassSelector;
        var errorTextClassSelector = permissions.errorTextClassSelector;
        var errorText = permissions.errorText;

        var allowEmpty = null;
        if (permissions.required != null) {
            allowEmpty = !permissions.required;
        } else {
            allowEmpty = permissions.empty;
        }

        if (allowEmpty == null) {
            allowEmpty = false;
        }

        if (errorClass == null) {
            errorClass = "error";
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
        if (errorTip == null) {
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
        }

        if (errorText == null) {
            errorText = errorTip;
        }

        var value;
        if (permissions.useHtml == true) {
            value = $(this).html();
        } else {
            value = $(this).val();
        }
        
        if (value == null || value === "") {
            if (allowEmpty === true) {
                this._removeError(errorClass, errorClassSelector, errorTextClassSelector);
                if (isDate || isNumber || isInteger) {
                    return null;
                }
                return value;
            } else {
                this._addError(errorTip, errorClass, errorClassSelector, errorTextClassSelector, errorText);
                return false;
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
                    if (permissions.errorText == null) {
                        errorText = "Value must be greater than or equal to " + min;
                    }
                    this._addError("Value must be greater than or equal to " + min, errorClass, errorClassSelector, errorTextClassSelector, errorText);
                    return false;
                }
                else if (max != null && i > max) {
                    if (permissions.errorText == null) {
                        errorText = "Value must be less than or equal to " + max;
                    }
                    this._addError("Value must be less than or equal to " + max, errorClass, errorClassSelector, errorTextClassSelector, errorText);
                    return false;
                }

                this._removeError(errorClass, errorClassSelector, errorTextClassSelector);
                return i;
            } else {
                this._addError(errorTip, errorClass, errorClassSelector, errorTextClassSelector, errorText);
                return false;
            }
        }

        if (isZip === true) {
            isString = true;
            regexp = new RegExp(/(^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ]( )?\d[ABCEGHJKLMNPRSTVWXYZ]\d$)|(^\d{5}(-\d{4})?$)/);
        }
        if (isString === true) {
            if (min != null && value.length < min) {
                this._addError("Value must be longer than " + min, errorClass, errorClassSelector, errorTextClassSelector, errorText);
                return false;
            }
            else if (max != null && value.length > max) {
                this._addError("Value must be shorter than " + max, errorClass, errorClassSelector, errorTextClassSelector, errorText);
                return false;
            }
            if (permissions.values != null) {
                if (permissions.values.indexOf(value) > -1) {
                    this._removeError(errorClass, errorClassSelector, errorTextClassSelector);
                    return value;
                } else {
                    this._addError(errorTip, errorClass, errorClassSelector, errorTextClassSelector, errorText);
                    return false;
                }
            }

            if (permissions.regexp != null) {
                regexp = permissions.regexp;
            }

            if (permissions.invalidRegexp ) {
                regexp_invalid = permissions.invalidRegexp;
            }

            if (regexp_invalid != null) {
                isValid = regexp_invalid.test(value);
                if (isValid === true) {
                    this._addError(errorTip, errorClass, errorClassSelector, errorTextClassSelector, errorText);
                    return false;
                }
            }

            if (regexp != null) {
                isValid = regexp.test(value);

                if (isValid !== true) {
                    this._addError(errorTip, errorClass, errorClassSelector, errorTextClassSelector, errorText);
                    return false;
                }
            }

            this._removeError(errorClass, errorClassSelector, errorTextClassSelector);
            return value;
        }

        if (isDate === true) {
            var date = Date.parse(value);

            if (isNaN(date) === true) {
                this._addError(errorTip, errorClass, errorClassSelector, errorTextClassSelector, errorText);
                return false;
            } else {
                date = new Date(date);

                if (min != null && date < min) {
                    errorText = errorTip = "You must enter a date after " + min.toLocaleDateString();
                    this._addError(errorTip, errorClass, errorClassSelector, errorTextClassSelector, errorText);
                    return false;
                } else if (max != null && date > max) {
                    errorText = errorTip = "You must enter a date before " + max.toLocaleDateString();
                    this._addError(errorTip, errorClass, errorClassSelector, errorTextClassSelector, errorText);
                    return false;
                }

                this._removeError(errorClass, errorClassSelector, errorTextClassSelector);
                return new Date(value);
            }
        }

        if (isEmail === true) {
            var emailRegExp = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
            var validEmail = emailRegExp.test(value);
            if (validEmail === false) {
                this._addError(errorTip, errorClass, errorClassSelector, errorTextClassSelector, errorText);
                return false;
            } else {
                this._removeError(errorClass, errorClassSelector, errorTextClassSelector);
                return value;
            }
        }

        if (isPhone === true) {
            var phoneUSRegExp = new RegExp(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/);

            if (phoneUSRegExp.test(value) === true) {
                var formattedPhoneNumber = value.replace(phoneUSRegExp, "($1) $2-$3");
                this._removeError(errorClass, errorClassSelector, errorTextClassSelector);
                return formattedPhoneNumber;
            } else if (allowInternational === true) {
                var phoneIntRegExp = new RegExp(/^\+(?:[0-9][ .-]?){6,14}[0-9]$/);
                if (phoneIntRegExp.test(value) === true) {
                    this._removeError(errorClass, errorClassSelector, errorTextClassSelector);
                    return value;
                }
            }
            this._addError(errorTip, errorClass, errorClassSelector, errorTextClassSelector, errorText);
            return false;
        }
        
        if (isIP === true) {
        	var ipRegExp = new RegExp(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/);
            if (ipRegExp.test(value) === true) {
            	this._removeError(errorClass, errorClassSelector, errorTextClassSelector);
            	return value;
            }
            this._addError(errorTip, errorClass, errorClassSelector, errorTextClassSelector, errorText);
            return false;
        }

        this._removeError(errorClass, errorClassSelector, errorTextClassSelector);
        return value;
    };


    jQuery.fn.unvalidate = function (permissions) {
        this._moveAttribute("_title", "title");
        var errorClass = permissions.errorClass;
        var errorClassSelector = permissions.errorClassSelector;
        var errorTextClassSelector = permissions.errorTextClassSelector;
        this._removeError(errorClass, errorClassSelector, errorTextClassSelector);
    };


    jQuery.fn._addError = function (errorTip, errorClass, selector, errorTipSelector, errorText) {
        if (errorClass == null) {
            errorClass = "error";
        }
        if (errorTipSelector == null) {
            errorTipSelector = ".help-inline";
        }
        //Move original title to _title, and set errorTip to title
        this._moveAttribute("title", "_title");
        this.attr("title", errorTip);

        if (selector == null) {
            this.addClass(errorClass);
        } else {
            var ancestor = this.closest(selector);
            if (ancestor != null) {
                ancestor.addClass(errorClass);
            }
        }

        if (errorTipSelector != null) {
            if (errorTipSelector.charAt(0) === "#") {
                $(errorTipSelector).html(errorText).addClass("error-text").show();
            } else {
                var parent = this.parent();
                while (parent && parent.length > 0) {
                    var div = $(errorTipSelector, parent).eq(0);
                    if ($(div).length > 0) {
                        if ($(div).css("display") === "none") {
                            $(div).attr("washidden", "true");
                        }
                        $(div).html(errorText).addClass("error-text").show();
                        parent = null;
                        break;
                    }
                    parent = $(parent).parent();
                }
                return;
            }
        }
    };


    jQuery.fn._removeError = function (errorClass, selector, errorTipSelector) {
        if (errorClass == null) {
            errorClass = "error";
        }
        if (errorTipSelector == null) {
            errorTipSelector = ".help-inline";
        }
        //move original title, now stored in _title, back to title property
        this._moveAttribute("_title", "title");

        if (selector == null) {
            this.removeClass(errorClass);
        } else {
            var ancestor = this.closest(selector);
            if (ancestor != null) {
                ancestor.removeClass(errorClass);
            }
        }

        if (errorTipSelector != null) {
            if (errorTipSelector.charAt(0) === "#") {
                $(errorTipSelector).html("").removeClass("error-text").hide();
            } else {
                var parent = this.parent();
                while (parent && parent.length > 0) {
                    var div = $(errorTipSelector, parent).eq(0);
                    if ($(div).length > 0) {
                        var wasHidden = $(div).attr("washidden");
                        if (wasHidden === "true") {
                            $(div).html("").hide();
                        } else {
                            $(div).html("");
                        }
                        $(div).removeClass("error-text");
                        parent = null;
                        break;
                    }
                    parent = $(parent).parent();
                }
                return;
            }
        }
    };


    jQuery.fn._moveAttribute = function (currAttributeName, newAttributeName) {
        var old = this.attr(currAttributeName);
        if (old != null) {
            this.attr(newAttributeName, old);
        } else {
            this.removeAttr(newAttributeName);
        }
        this.removeAttr(currAttributeName);
    };
});



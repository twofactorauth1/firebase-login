/* ===================================================
 * jquery.keytimer.js v0.8.0
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


/**
 *
 * Attaches a timing event to an input element.  Listens for keyup events and if
 * the user stops typing for the set period of time (duaration param), the event
 * "onkeytimer" is dispatched.
 *
 * @param duration
 */
define([], function () {
    jQuery.fn.startKeyTimer = function (duration) {

        if (this.length > 1) {
            this.each(function() {
                $(this).startKeyTimer(duration);
            });
            return;
        }

        var self = this;
        var onTimeout = function () {
            self.trigger("onkeytimer", [$.data(self, "keyevent")]);
        };

        this.on("keyup", function (event) {
            var timer = $.data(this, "keytimer");
            if (timer !== null) {
                window.clearTimeout(timer);
            }

            $.data(this, "keytimer", window.setTimeout(onTimeout, duration));
            $.data(this, "keyevent", event);
        });
    };


    jQuery.fn.stopKeyTimer = function () {
        this.off("keyup");
        $.data(this, "keytimer", null);
        $.data(this, "keyevent", null);
    };


    jQuery.fn.preventKeyTimer = function () {
        var timer = $.data(this, "keytimer");
        if (timer !== null) {
            window.clearTimeout(timer);
        }
        $.data(this, "keytimer", null);
        $.data(this, "keyevent", null);
    };

    return jQuery;
});

/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

define(['libs/jquery/jquery.cookie'], function() {

    //------------------------------------------------
    //
    //  Storage Utils
    //ok
    // -----------------------------------------------
    var storageutils = {
        set: function(key, value, type) {
            if (type == "session") {
                if (typeof(sessionStorage) !== "undefined") {
                    sessionStorage.setItem(key, value);
                } else {
                    $.cookie("ind_" + key, value);
                }
            } else {
                if (Modernizr.localstorage) {
                    localStorage.setItem(key, value);
                }
                else{
                    $.cookie("ind_" + key, value);
                }
            }

        },


        get: function(key, type) {
            var value = "";

            if (type == "session") {
                if (typeof(sessionStorage) !== "undefined") {
                    value = sessionStorage.getItem(key);
                } else {
                    value = $.cooke("ind_" + key);
                }
            } else {
                if (Modernizr.localstorage) {
                    value = localStorage.getItem(key);
                }
                else{
                    value = $.cookie("ind_" + key);
                }
            }

            return value;
        }
    };
    $$.u = $$.u || {};
    $$.u.storageutils = window.storageutils = storageutils;

    return storageutils;
});
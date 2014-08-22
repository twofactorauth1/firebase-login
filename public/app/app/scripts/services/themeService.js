/*
 * Getting Theam Data From Front End
 *
 * */

'use strict';

mainApp.factory('themeService', function () {

    //TODO Fetch Data Theam Data Front End

    return function (websiteId) {
        console.log(websiteId);
        var theme = {
            "template-engine": "handlebars",
            "supports-menu-lists": "false",

            "theme-id": "default",
            "theme-name": "Indigenous Default",
            "theme-description": "The default indigenous theme",
            "tags": ["default", "awesome", "basic"],

            "excluded-components": [

            ],

            "pages": [
                {
                    "handle": "index",
                    "title": "Home",
                    "components": [
                        "freeform",
                        "contact-us",
                        "feature-blocks",
                        "feature-list",
                        "image-gallery",
                        "image-slider"
                    ]
                },

                {
                    "handle": "about-us",
                    "title": "About Us",
                    "components": [
                        "freeform"
                    ]
                },

                {
                    "handle": "contact-us",
                    "title": "Contact Us",
                    "components": [
                        "contact-us"
                    ]
                }
            ]
        };
        return theme;
    };

});
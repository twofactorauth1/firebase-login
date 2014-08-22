/*
 * Getting Website Data According to Website ID
 *
 * */

'use strict';

mainApp.factory('websiteService', function () {

    //TODO Fetch Data WebsiteDB

    return function (websiteId) {
        console.log(websiteId);
        var website = {
            "_id": "e3e39555-2c1c-45d7-bdc5-b7a0d7df9cfe",
            "accountId": 11,
            "settings": null,
            "title": "Default Website Title",
            "seo": null,
            "linkLists": [
                {
                    "name": "Head Menu",
                    "handle": "head-menu",
                    "links": [
                        {
                            "label": "Home",
                            "type": "link",
                            "linkTo": {
                                "type": "home",
                                "data": "index"
                            }
                        },
                        {
                            "label": "About us",
                            "type": "link",
                            "linkTo": {
                                "type": "page",
                                "data": "about-us"
                            }
                        },
                        {
                            "label": "Indigenous",
                            "type": "link",
                            "linkTo": {
                                "type": "url",
                                "data": "http://INDIGENOUS SOFTWARE, INC."
                            }
                        }
                    ]
                },
                {
                    "name": "Main Menu",
                    "handle": "main-menu",
                    "links": [
                        {
                            "label": "Top",
                            "type": "link",
                            "linkTo": {
                                "type": "section",
                                "data": ""
                            }
                        },
                        {
                            "label": "Section 1",
                            "type": "link",
                            "linkTo": {
                                "type": "section",
                                "data": "section1"
                            }
                        },
                        {
                            "label": "Section 2",
                            "type": "link",
                            "linkTo": {
                                "type": "section",
                                "data": "section2"
                            }
                        },
                        {
                            "label": "Section 3",
                            "type": "link",
                            "linkTo": {
                                "type": "section",
                                "data": "section3"
                            }
                        },
                        {
                            "label": "Contact Us",
                            "type": "link",
                            "linkTo": {
                                "type": "page",
                                "data": "contact-us"
                            }
                        }
                    ]
                }
            ],
            "footer": {
                "type": "thin",
                "data": {
                    "textLeft": "Left Footer Text",
                    "textRight": "Right Footer Text",
                    "textCenter": "Center Footer Text"
                }
            },
            "created": {
                "date": 1408599403927,
                "by": null
            },
            "modified": {
                "date": "",
                "by": null
            }
        };
        return website;
    };

});
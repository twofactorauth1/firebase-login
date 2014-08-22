/*
 * Getting Pages Data From Database
 *
 * */

'use strict';

mainApp.factory('pagesService', function () {

    //TODO Fetch Pages Data From DB

    return function (websiteId) {
        console.log(websiteId);
        var pages = [
            {
                "_id": "64da6cc0-bcf1-4bbb-a208-45ff2007941d",
                "accountId": 11,
                "websiteId": "e3e39555-2c1c-45d7-bdc5-b7a0d7df9cfe",
                "handle": "index",
                "title": "Home",
                "seo": null,
                "visibility": {
                    "visible": true,
                    "asOf": null,
                    "displayOn": null
                },
                "components": [
                    {
                        "_id": "23ad6ee5-66ba-4a65-a82b-a187242599f3",
                        "anchor": null,
                        "type": "freeform",
                        "label": "",
                        "description": "",
                        "value": ""
                    },
                    {
                        "_id": "b9d284c4-48f0-4718-a12b-210b8c73df60",
                        "anchor": null,
                        "type": "contact-us",
                        "label": "",
                        "description": "",
                        "hours": [ ],
                        "location": {
                            "address": "",
                            "address2": "",
                            "city": "",
                            "state": "",
                            "zip": "",
                            "lat": "",
                            "lon": "",
                            "showMap": false,
                            "addressDisplayLabel": ""
                        },
                        "contact": {
                            "email": "",
                            "phone": ""
                        }
                    },
                    {
                        "_id": "1e2b6078-c1d2-4550-8747-35eb74c8d763",
                        "anchor": null,
                        "type": "feature-blocks",
                        "label": "",
                        "description": "",
                        "features": [ ]
                    },
                    {
                        "_id": "09bf4453-e567-4263-9042-cb2e9eb1adf2",
                        "anchor": null,
                        "type": "feature-list",
                        "label": "",
                        "description": "",
                        "features": [ ]
                    },
                    {
                        "_id": "86663e44-c1d2-4743-b1b1-3a42d2f6ad5e",
                        "anchor": null,
                        "type": "image-gallery",
                        "label": "",
                        "description": "",
                        "imageSize": "medium",
                        "source": null,
                        "images": [ ]
                    },
                    {
                        "_id": "fadf8b54-6c03-4d43-9a3e-6338ddc147d4",
                        "anchor": null,
                        "type": "image-slider",
                        "label": "",
                        "description": "",
                        "images": [ ]
                    }
                ],
                "created": {
                    "date": 1408599403942,
                    "by": null
                },
                "modified": {
                    "date": "",
                    "by": null
                }
            }
        ];
        return pages;
    };

});
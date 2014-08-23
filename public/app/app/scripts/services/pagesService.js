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
                        "label": "Free Form Label",
                        "description": "",
                        "value": "Free Form Value"
                    },
                    {
                        "_id": "b9d284c4-48f0-4718-a12b-210b8c73df60",
                        "anchor": null,
                        "type": "contact-us",
                        "label": "Contact US",
                        "description": "you can contact us any time on number give below",
                        "hours": [ ],
                        "location": {
                            "address": "B-4 82 Paschim Vihar New Delhi",
                            "address2": "B-1 90 Rajori Garden, Patalia",
                            "city": "City",
                            "state": "State",
                            "zip": "110063",
                            "lat": "112121212",
                            "lon": "332131312",
                            "showMap": false,
                            "addressDisplayLabel": "display label"
                        },
                        "contact": {
                            "email": "kashish.gupta@intelligrape.com",
                            "phone": "9999749722"
                        }
                    },
                    {
                        "_id": "1e2b6078-c1d2-4550-8747-35eb74c8d763",
                        "anchor": null,
                        "type": "feature-blocks",
                        "label": "Feature Block",
                        "description": "Feature Block Description",
                        "features": [ ]
                    },
                    /*{
                        "_id": "09bf4453-e567-4263-9042-cb2e9eb1adf2",
                        "anchor": null,
                        "type": "feature-list",
                        "label": "feature-list-label",
                        "description": "feature-list-description",
                        "features": [ ]
                    },*/
                    /*{
                        "_id": "86663e44-c1d2-4743-b1b1-3a42d2f6ad5e",
                        "anchor": null,
                        "type": "image-gallery",
                        "label": "image-gallery-label",
                        "description": "image-gallery-description",
                        "imageSize": "medium",
                        "source": null,
                        "images": [ ]
                    },*/
                    /*{
                        "_id": "fadf8b54-6c03-4d43-9a3e-6338ddc147d4",
                        "anchor": null,
                        "type": "image-slider",
                        "label": "image-slider-label",
                        "description": "image-slider-description",
                        "images": [ ]
                    }*/
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
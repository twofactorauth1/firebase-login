/*
 * Getting Pages Data From Database
 *
 * */
'use strict';
mainApp.factory('pagesService', ['websiteService', '$http', function (websiteService, $http) {
    var websiteObject, pages = [];
    //TODO Fetch Pages Data From DB
    return function (callback) {
        //todo get handle (page name)
        websiteService(function (err, data) {
            if (err) {
                console.log(err, ">>>>>>>>>>>>>websiteService>>>>>>>>err>>>>>>>>>>>");
                callback(err, null)
            } else {
                websiteObject = data;
                var handle = 'index';
                //API is getting only one page but we need page arrays
                pages[0] = {
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
                            "_id": "00000000-0000-0000-0000-000000000000",
                            "anchor": null,
                            "type": "contact-us",
                            "title": "Contact Us",
                            "subtitle": "This is the contact us subtitle",
                            "hours": [ ],
                            "location": {
                                "address": "address",
                                "address2": "address2",
                                "city": "City",
                                "state": "State",
                                "zip": "000000",
                                "lat": "0000000000",
                                "lon": "0000000000",
                                "showMap": false,
                                "addressDisplayLabel": "display label"
                            },
                            "contact": {
                                "email": "email",
                                "phone": "phone"
                            },
                            "bg": {
                                "img": {
                                    "url": "http://www.site.com/images/bgimage.jpg",
                                    "width": 1400,
                                    "height": 836,
                                    "parallax": true,
                                    "blur": true
                                },
                                "color": "#000000"
                            },
                            "btn": {
                                "text": "Btn Text",
                                "url": "http://google.com",
                                "icon": "fa fa-rocket"
                            }
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
                callback(null, pages);
            }
        });

    };
}]);
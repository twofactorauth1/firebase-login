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
                    "components" : [
                        {
                            "_id" : "f43b987f-9164-4b08-8a27-57471e789016",
                            "anchor" : null,
                            "type" : "masthead",
                            "label" : "Masthead",
                            "description" : "This is the masthead description",
                            "title" : "Introducing <b>INDIGENOUS!</b>",
                            "subtitle" : "Indigenous is a fully integrated business management platform&nbsp;<br>for independent service professionals and small businesses<br>",
                            "bg" : {
                                "img" : {
                                    "url" : "/assets/images/indimain/home-top.jpg",
                                    "width" : 2716,
                                    "height" : 1810,
                                    "parallax" : true,
                                    "blur" : false
                                },
                                "color" : ""
                            },
                            "btn" : {
                                "text" : "Learn More",
                                "url" : "#features",
                                "icon" : "fa fa-email"
                            },
                            "version":1
                        },
                        {
                            "_id" : "d12b442s-0034-2f09-4h65-33423h8894778",
                            "anchor" : null,
                            "type" : "signup-form",
                            "formName" : "",
                            "contactType" : "",
                            "fields" : [],
                            "title" : "Sign Up For News Updates",
                            "btntext" : "I'M INTERESTED",
                            "label" : "",
                            "description" : "",
                            "version":2
                        },
                        {
                            "_id" : "3941e2e4-c6fc-4745-a81f-afeecac45391",
                            "anchor" : null,
                            "type" : "products",
                            "label" : "",
                            "description" : "",
                            "title" : "PRODUCTS",
                            "product-sections" : [
                                {
                                    "product-section-id" : "tests",
                                    "products" : [
                                        {
                                            "id" : "metabolic",
                                            "image" : "assets/images/fitstop/about.png",
                                            "title" : "METABOLIC EXERCISE TESTING",
                                            "subtitle" : "Metabolic Exercise Testing will include:",
                                            "text" : "1.lorem",
                                            "btn" : {
                                                "url" : "",
                                                "text" : "Read More"
                                            }
                                        },
                                        {
                                            "id" : "body-fat",
                                            "image" : "assets/images/fitstop/about.png",
                                            "title" : "Body Fat title",
                                            "subtitle" : "Body Fat subtitle",
                                            "text" : "Body Fat text",
                                            "btn" : {
                                                "url" : "",
                                                "text" : "Read More"
                                            }
                                        }
                                    ]
                                },
                                {
                                    "product-section-id" : "equipment",
                                    "products" : [
                                        {
                                            "id" : "equipment1",
                                            "image" : "assets/images/fitstop/about.png",
                                            "title" : "Equipment title",
                                            "subtitle" : "Equipment subtitle",
                                            "text" : "Equipment text",
                                            "btn" : {
                                                "url" : "",
                                                "text" : "Read More"
                                            }
                                        },
                                        {
                                            "id" : "equipment2",
                                            "image" : "assets/images/fitstop/about.png",
                                            "title" : "Equipment child title",
                                            "subtitle" : "Equipment child subtitle",
                                            "text" : "Equipment child text",
                                            "btn" : {
                                                "url" : "",
                                                "text" : "Read More"
                                            }
                                        }
                                    ]
                                }
                            ],
                            "value" : "",
                            "version":1
                        },
                        {
                            "_id" : "g98d442s-0034-2f09-4h65-33423h8894778",
                            "anchor" : null,
                            "type" : "social",
                            "networks" : {
                                "facebook" : "https://www.facebook.com/indigenous.io",
                                "twitter" : "https://twitter.com/indigenous_io",
                                "google-plus" : "https://plus.google.com/u/0/105022706688618584400/posts/p/pub",
                                "pinterest" : "http://www.pinterest.com/indigenousdotio/"
                            },
                            "version":1
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
                };
                callback(null, pages);
            }
        });

    };
}]);
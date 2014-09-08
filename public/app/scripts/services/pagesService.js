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
                         "_id": "f43b987f-9164-4b08-8a27-57471e789016",
                         "anchor": null,
                         "type": "masthead",
                         "label": "Masthead",
                         "description": "This is the masthead description",
                         "title": "Introducing <b>INDIGENOUS!</b>",
                         "subtitle": "Indigenous is a fully integrated business management platform&nbsp;<br>for independent service professionals and small businesses<br>",
                         "bg": {
                         "img": {
                         "url": "/assets/images/indimain/home-top.jpg",
                         "width": 2716,
                         "height": 1810,
                         "parallax": true,
                         "blur": false
                         },
                         "color": ""
                         },
                         "btn": {
                         "text": "Learn More",
                         "url": "#features",
                         "icon": "fa fa-email"
                         }
                         },
                         {
                         "_id": "s32d253h-8675-2x06-2v68-65431s970864",
                         "anchor": "customers",
                         "type": "feature-block",
                         "label": "",
                         "description": "",
                         "value": "",
                         "title": "<span class='fa fa-users'></span>",
                         "subtitle": "We’re launching our first customers now! Check back here and on <a href='/page/blog'>our blog</a> to learn more about how Indigenous has helped their businesses.",
                         "text": "",
                         "bg": {
                         "img": {
                         "url": "",
                         "width": 800,
                         "height": 200,
                         "parallax": false,
                         "blur": false
                         },
                         "color": "#4bb0cb"
                         },
                         "btn": {
                         "text": "Btn Text",
                         "url": "http://google.com",
                         "icon": "fa fa-rocket"
                         }
                         },
                        {
                            "_id": "a21b456q-5564-1g87-6j43-22123j887656",
                            "anchor": "features",
                            "type": "feature-list",
                            "title": "<h1>Features<br></h1>",
                            "subtitle": "Tell your story. Build and connect with your customer base. Realize your revenue potential.",
                            "features": [
                                {
                                    "feature_title": "Customers",
                                    "feature_subtitle": "<ul><li> Mail and social account contact import</li><li>Social profile synchronization and contact completion</li><li>Sales pipeline status & filtering by internal and external activity</li><li>Push button access to key demographic info integrated with your mobile workflow</li></ul>",
                                    "feature_icon": "fa fa-users"
                                },
                                {
                                    "feature-title": "Website",
                                    "feature-subtitle": "<ul><li>Modern web site with drag and drop development and inline editing</li><li>Templates, professional design options & copywriting services</li><li>Unique subdomain.indigenous.io or fully qualified top level domain name support</li><li>Fully integrated hosting and push button publishing</li><li>Responsive design optimized for mobile administration and viewing</li></ul>",
                                    "feature-icon": "fa fa-laptop"
                                },
                                {
                                    "feature-title": "Marketing",
                                    "feature-subtitle": "<ul><li>Continuous monitoring of social channels in one simple dashboard</li><li>Collect, manage, and segment subscribers on a platform you control</li><li>Group subscribers and schedule targeted, cross channel campaigns</li><li>Ready-to-use templates make it easy to create eye-catching, polished emails</li></ul>",
                                    "feature-icon": "fa fa-bullhorn"
                                },
                                {
                                    "feature-title": "Commerce",
                                    "feature-subtitle": "<ul><li>Fully integrated online store for digital, physical and recurring products</li><li>Digital goods delivery and integrated reporting and tracking</li><li>Direct settlement through customer merchant account with Stripe</li><li>Comprehensive real time reporting</li></ul>",
                                    "feature-icon": "fa fa-credit-card"
                                }
                            ],
                            "bg": {
                                "img": {
                                    "url": "/assets/images/indimain/wave-bg.jpg",
                                    "width": null,
                                    "height": null,
                                    "parallax": false,
                                    "blur": false,
                                    "pattern": true
                                },
                                "color": ""
                            },
                            "btn": {
                                "text": "Learn More",
                                "url": "#features",
                                "icon": "fa fa-email"
                            }
                        },
                        {
                            "_id": "j45k442s-0034-2f09-4h65-33423h8894778",
                            "anchor": "blog",
                            "type": "blog-teaser",
                            "title": "Check out our blog",
                            "subtitle": "",
                            "posts": [
                                "820067b3-5a90-4bcc-94d9-81019027c900"
                            ],
                            "label": "",
                            "description": "",
                            "value": ""
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
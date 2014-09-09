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
                            "version": "v1",
                            "type": "masthead",
                            "title": "FIT STOP HUMAN PERFORMANCE & HEALTH ENHANCEMENT LAB",
                            "subtitle": " We are a fitness testing and guidance company that provides advanced assessment services to fitness minded organizations and individuals with programs that are designed for the novice as well as the experienced exerciser. Our testing programs and exercise instruction provide practical information on how to manipulate your energy systems to optimize weight management, endurance performance, power production and stamina gains.",
                            "bg": {
                                "img": {
                                    "url": "/assets/images/fitstop/home-top.jpg",
                                    "width": 1235,
                                    "height": 935,
                                    "parallax": true,
                                    "blur": false
                                },
                                "color": ""
                            },
                            "btn": {
                                "text": "SIGN UP TODAY",
                                "url": "http://google.com",
                                "icon": "fa fa-email"
                            }
                        },
                        {
                            "_id": "cd591421-d223-40bf-861e-ccc840d61960",
                            "anchor": null,
                            "version":"v2",
                            "type": "feature-list",
                            "title": "SERVICES",
                            "subtitle": "Subtitle Services",
                            "features": [
                                {
                                    "feature-icon": "fa fa-paste",
                                    "feature-title": "ADVANCED FITNESS TESTING",
                                    "feature-subtitle": 'VO2 Max<br>Anaerobic Threshold<br>Resting Metabolic Rate<br>Body Fat Testing',
                                    "btn": {
                                        "url": "www.google.com",
                                        "text": "View All"
                                    }
                                },
                                {
                                    "feature-icon": "fa fa-flask",
                                    "feature-title": "RESEARCH",
                                    "feature-subtitle": "Product Development &<br>Showcasing.",
                                    "btn": {
                                        "url": "www.google.com",
                                        "text": "View"
                                    }
                                },
                                {
                                    "feature-icon": "fa fa-comments-o",
                                    "feature-title": "COACHING",
                                    "feature-subtitle": "Train to Finish Strong.<br>Online Coaching with an Exercise Physiologist.",
                                    "btn": {
                                        "url": "www.google.com",
                                        "text": "View"
                                    }
                                },
                                {
                                    "feature-image": "/assets/images/fitstop/training-icon.png",
                                    "feature-image-hover": "assets/images/fitstop/training-icon-hov.png",
                                    "feature-title": "TRAINING PLANS",
                                    "feature-subtitle": "Our training plans follow a<br>systematic approach in the<br>ramping up of your fitness, to help<br>you achieve your goal safely and<br>efficiently",
                                    "btn": {
                                        "url": "www.google.com",
                                        "text": "View Plans"
                                    }
                                }
                            ],
                            "text-color": "#fff",
                            "bg": {
                                "img": {
                                    "url": "/assets/images/fitstop/feature-list-back.png",
                                    "width": 1235,
                                    "height": 935,
                                    "parallax": false,
                                    "blur": false
                                },
                                "color": ""
                            },
                            "btn": {
                                "text": "SIGN UP TODAY",
                                "url": "http://google.com",
                                "icon": "fa fa-email"
                            }
                        },
                        {
                            "_id": "d749298j-0034-2f09-4h65-33423h8898767",
                            "anchor": null,
                            "type": "image-text",
                            "version":"v1",
                            "title": "ABOUT",
                            "text": "<h2>Ken Nocodemus, MA.</h2><h4>EXERCISE PHYSIOLOGIST & COACH</h4><p>Ken is the director and founder of The Fit Stop Human Performance Lab in Carlsbad, CA. His work involves developing and implementing a variety of sophisticated assessment and guidance programs to improve the health and physical performance levels of endurance athletes, employees and the general population.  He has delivered and managed wellness screening programs for a number of prestigious clients including the California Highway Patrol, Calif. Department of Corrections, the City of Santa Monica, PacificCare Health Systems, the Los Angeles Clippers, Sempre Utilities, Navy Special Warfare, along with numerous fire and police departments throughout California.  Early in his career, he worked as an exercise physiologist in the clinical arena including physical therapy and cardiac rehabilitation.</p>",
                            "imagePosition": "right",
                            "caption": "caption",
                            "imgurl": "/assets/images/fitstop/about.png",
                            "bg": {
                                "img": {
                                    "url": "",
                                    "width": null,
                                    "height": null,
                                    "parallax": false,
                                    "blur": false
                                },
                                "color": "#fff"
                            },
                            "btn": {
                                "text": "SIGN UP TODAY",
                                "url": "http://google.com",
                                "icon": "fa fa-email"
                            }
                        },
                        {
                            "_id": "d56d253h-8675-2x06-2v68-65431s970864",
                            "anchor": null,
                            "type": "feature-block",
                            "version":"v1",
                            "title": "With Indigenous - an environment built around you - the elements key to nurturing your business are at your fingertips. Not only that, they are flexible and scalable.",
                            "subtitle": "",
                            "text": "<ul><li>A dynamic and evolving website that tells your story</li><li>A way to connect with clients via mailing lists, newsletters, and more</li><li>An innovative and educated marketing plan</li><li>An easy-to-setup and easy-to-use billing system</li></ul>",
                            "bg": {
                                "img": {
                                    "url": "/assets/images/fitstop/feature-block-1.jpg",
                                    "width": 1400,
                                    "height": 998,
                                    "parallax": true,
                                    "blur": false
                                },
                                "color": ""
                            },
                            "btn": {
                                "text": "Btn Text",
                                "url": "http://google.com",
                                "icon": "fa fa-rocket"
                            }
                        },
                        {
                            "_id": "3941e2e4-c6fc-4745-a81f-afeecac45391",
                            "anchor": null,
                            "type": "products",
                            "label": "label",
                            "version":"v1",
                            "description": "description",
                            "title": "PRODUCTS",
                            "product-sections": [
                                {
                                    "product-section-id": "tests",
                                    "products": [
                                        {
                                            "id": "metabolic",
                                            "image": "assets/images/fitstop/about.png",
                                            "title": "METABOLIC EXERCISE TESTING",
                                            "subtitle": "Metabolic Exercise Testing will include:",
                                            "text": "1.lorem",
                                            "btn": {
                                                "url": "http://google.com",
                                                "text": "Read More and more"
                                            }
                                        },
                                        {
                                            "id": "body-fat",
                                            "image": "assets/images/fitstop/about.png",
                                            "title": "Body Fat title",
                                            "subtitle": "Body Fat subtitle",
                                            "text": "Body Fat text",
                                            "btn": {
                                                "url": "http://google.com",
                                                "text": "Read More"
                                            }
                                        }
                                    ]
                                },
                                {
                                    "product-section-id": "equipment",
                                    "products": [
                                        {
                                            "id": "equipment1",
                                            "image": "assets/images/fitstop/about.png",
                                            "title": "Equipment title",
                                            "subtitle": "Equipment subtitle",
                                            "text": "Equipment text",
                                            "btn": {
                                                "url": "http://google.com",
                                                "text": "Read More"
                                            }
                                        },
                                        {
                                            "id": "equipment2",
                                            "image": "assets/images/fitstop/about.png",
                                            "title": "Equipment child title",
                                            "subtitle": "Equipment child subtitle",
                                            "text": "Equipment child text",
                                            "btn": {
                                                "url": "http://google.com",
                                                "text": "Read More"
                                            }
                                        }
                                    ]
                                }
                            ],
                            "value": "value"
                        },
                        {
                            "_id": "3941e2e4-c6fc-4745-a81f-afeecac45397",
                            "anchor": null,
                            "type": "freeform",
                            "version":"v1",
                            "label": "",
                            "description": "",
                            "title": "Advanced Overhaul Profile (AOP)",
                            "subtitle": "This is a Comprehensive Health, Fitness, and Physical Performance Assessment",
                            "text": "The AOP will evalulate your fitness and then assist in setting you up with your training plans and devices with one month of online coaching with an exercise physiologist. Here is what is included:",
                            "assessments": [
                                {
                                    "assessment-icon": "fa fa-check",
                                    "title": "CMP -",
                                    "subtitle": "Reg.$200",
                                    "text": "Cardio-Metabolic Exercise Profile w/VO2Max, Anaerobic Threshold, MaxFat & Target Training Zones."
                                },
                                {
                                    "assessment-icon": "fa fa-check",
                                    "title": "VITALS -",
                                    "subtitle": "Reg.$25",
                                    "text": "Resting blood pressure and heart rate, Lung Function (VC & FEV1) and a Health Risk Appraisal"
                                },
                                {
                                    "assessment-icon": "fa fa-check",
                                    "title": "REE -",
                                    "subtitle": "Reg.$100",
                                    "text": "Resting Energy Expendure Profile to determine resting metabolism"
                                },
                                {
                                    "assessment-icon": "fa fa-check",
                                    "title": "FMT -",
                                    "subtitle": "Reg.$100",
                                    "text": "Functional Movement screening with range of motion, strength, power and core stability assessments"
                                },
                                {
                                    "assessment-icon": "fa fa-check",
                                    "title": "FAR -",
                                    "subtitle": "Reg.$25",
                                    "text": "Fitness Age Report which takes into account your aerobic capacity, function and motion assessments and muscle strength and endurance (push-ups, sit-ups, grip, vertical jump)"
                                },
                                {
                                    "assessment-icon": "fa fa-check",
                                    "title": "COACHING -",
                                    "subtitle": "Reg.$100",
                                    "text": "1-month of online coaching with an exercise physiologist"
                                }
                            ],
                            "assessment-title": "$339",
                            "assessment-text": "$550 value!",
                            "btn": {
                                "url": "www.google.com",
                                "text": "START TODAY"
                            },
                            "value": ""
                        },
                        {
                            "_id": "g98d442s-0034-2f09-4h65-33423h8894778",
                            "anchor": null,
                            "version":"v1",
                            "type": "social",
                            "networks": {
                                "facebook": "https://www.facebook.com",
                                "twitter": "https://twitter.com",
                                "google-plus": "https://plus.google.com",
                                "pinterest": "http://www.pinterest.com"
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
                };
                callback(null, pages);
            }
        });

    };
}]);
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
                            }
                        },
                        {
                            "_id" : "s32d253h-8675-2x06-2v68-65431s970864",
                            "anchor" : "customers",
                            "type" : "feature-block",
                            "label" : "",
                            "description" : "",
                            "value" : "",
                            "title" : "<span class='fa fa-users'></span>",
                            "subtitle" : "We’re launching our first customers now! Check back here and on <a href='/page/blog'>our blog</a> to learn more about how Indigenous has helped their businesses.",
                            "text" : "",
                            "bg" : {
                                "img" : {
                                    "url" : "",
                                    "width" : null,
                                    "height" : null,
                                    "parallax" : false,
                                    "blur" : false
                                },
                                "color" : "#4bb0cb"
                            },
                            "btn" : {
                                "text" : "Btn Text",
                                "url" : "http://google.com",
                                "icon" : "fa fa-rocket"
                            }
                        },
                        {
                            "_id" : "d56d253h-8675-2x06-2v68-65431s970864",
                            "anchor" : null,
                            "type" : "feature-block",
                            "title" : "With Indigenous - an environment built around you - the elements key to nurturing your business are at your fingertips. Not only that, they are flexible and scalable.",
                            "subtitle" : "",
                            "text" : "<ul><li>A dynamic and evolving website that tells your story</li><li>A way to connect with clients via mailing lists, newsletters, and more</li><li>An innovative and educated marketing plan</li><li>An easy-to-setup and easy-to-use billing system</li></ul>",
                            "bg" : {
                                "img" : {
                                    "url" : "/assets/images/indimain/img-3.jpg",
                                    "width" : 1400,
                                    "height" : 998,
                                    "parallax" : true,
                                    "blur" : false
                                },
                                "color" : ""
                            },
                            "btn" : {
                                "text" : "Btn Text",
                                "url" : "http://google.com",
                                "icon" : "fa fa-rocket"
                            }
                        },
                        {
                            "_id" : "a21b456q-5564-1g87-6j43-22123j887656",
                            "anchor" : "features",
                            "type" : "feature-list",
                            "title" : "<h1>Features<br></h1>",
                            "subtitle" : "Tell your story. Build and connect with your customer base. Realize your revenue potential.",
                            "features" : [
                                {
                                    "feature-title" : "Customers",
                                    "feature-subtitle" : "<ul><li> Mail and social account contact import</li><li>Social profile synchronization and contact completion</li><li>Sales pipeline status & filtering by internal and external activity</li><li>Push button access to key demographic info integrated with your mobile workflow</li></ul>",
                                    "feature-icon" : "fa fa-users"
                                },
                                {
                                    "feature-title" : "Website",
                                    "feature-subtitle" : "<ul><li>Modern web site with drag and drop development and inline editing</li><li>Templates, professional design options & copywriting services</li><li>Unique subdomain.indigenous.io or fully qualified top level domain name support</li><li>Fully integrated hosting and push button publishing</li><li>Responsive design optimized for mobile administration and viewing</li></ul>",
                                    "feature-icon" : "fa fa-laptop"
                                },
                                {
                                    "feature-title" : "Marketing",
                                    "feature-subtitle" : "<ul><li>Continuous monitoring of social channels in one simple dashboard</li><li>Collect, manage, and segment subscribers on a platform you control</li><li>Group subscribers and schedule targeted, cross channel campaigns</li><li>Ready-to-use templates make it easy to create eye-catching, polished emails</li></ul>",
                                    "feature-icon" : "fa fa-bullhorn"
                                },
                                {
                                    "feature-title" : "Commerce",
                                    "feature-subtitle" : "<ul><li>Fully integrated online store for digital, physical and recurring products</li><li>Digital goods delivery and integrated reporting and tracking</li><li>Direct settlement through customer merchant account with Stripe</li><li>Comprehensive real time reporting</li></ul>",
                                    "feature-icon" : "fa fa-credit-card"
                                }
                            ],
                            "bg" : {
                                "img" : {
                                    "url" : "/assets/images/indimain/wave-bg.jpg",
                                    "width" : null,
                                    "height" : null,
                                    "parallax" : false,
                                    "blur" : false,
                                    "pattern" : true
                                },
                                "color" : ""
                            },
                            "btn" : {
                                "text" : "Learn More",
                                "url" : "#features",
                                "icon" : "fa fa-email"
                            }
                        },
                        {
                            "_id" : "w12b442s-0034-2f09-4h65-33423h8898767",
                            "anchor" : "company",
                            "type" : "image-text",
                            "title" : "Company",
                            "subtitle" : "",
                            "text" : "<p>The thing is, it’s not about who we are, but how we help you tell your story and vision, and the intrinsic qualities and talents that make you and your program, services, and ideas so awesome. Indigenous gives you the framework and the tools you need to excel so that you can do what you do best instead of getting bogged down in the technical aspects. We listen to and evolve with your needs and those of your clients.</p><p>Indigenous was founded to help businesses evolve past their plateaus and achieve their stretch goals. We accelerate growth and solve problems by assessing the effectiveness of people, processes, and technology, and we provide feedback that allows our clients to make precise adjustments.</p><p>At its core, the founders and employees of Indigenous feel strongly that best-in-suite tools should not deter small and medium-sized businesses from reaching their goals. While we continue to <a href='http://indigenous.io/signup'>support enterprises</a>, we are now deploying a Software as a Service (SaaS) platform that brings best-in-class tools to businesses that already have the right people and are open to using best practices as their process.</p>",
                            "imagePosition" : "left",
                            "caption" : "",
                            "imgurl" : "/assets/images/indimain/office-image.jpg ",
                            "bg" : {
                                "img" : {
                                    "url" : "",
                                    "width" : null,
                                    "height" : null,
                                    "parallax" : true,
                                    "blur" : false
                                },
                                "color" : "#4bb0cb"
                            },
                            "btn" : {
                                "text" : "Learn More",
                                "url" : "#features",
                                "icon" : "fa fa-email"
                            }
                        },
                        {
                            "_id" : "c12b442s-0034-2f09-4h65-33423h674832",
                            "anchor" : "team",
                            "type" : "meet-team",
                            "title" : " Team",
                            "teamMembers" : [
                                {
                                    "name" : "Mike Trevino",
                                    "position" : "Chief Executive Officer",
                                    "profilepic" : "/assets/images/indimain/team/mike.jpg",
                                    "bio" : "Mike is a senior business leader with global experience developing high growth companies and a focus on delivering advanced software.",
                                    "social" : {
                                        "linkedin" : "http://www.linkedin.com/pub/mike-trevino/0/6b2/856"
                                    }
                                },
                                {
                                    "name" : "Donavon Guyot",
                                    "position" : "Chief Technology Officer",
                                    "profilepic" : "/assets/images/indimain/team/donavon.jpg",
                                    "bio" : "A strategic and trusted technical advisor, Donavon has deep expertise in sourcing, leading, and steering diverse, high performing technical teams.",
                                    "social" : {
                                        "linkedin" : "http://www.linkedin.com/pub/donavon-guyot/2/90b/27a"
                                    }
                                },
                                {
                                    "name" : "John Eisenschmidt",
                                    "position" : "VP, Product Management",
                                    "profilepic" : "/assets/images/indimain/team/john.jpg",
                                    "bio" : "Solving problems at the intersection of business and information technology, John identifies best practices and simple solutions for your business.",
                                    "social" : {
                                        "linkedin" : "http://www.linkedin.com/in/johneisenschmidt"
                                    }
                                },
                                {
                                    "name" : "Noël Norcross ",
                                    "position" : "Director of Content",
                                    "profilepic" : "/assets/images/indimain/team/noel.jpg",
                                    "bio" : "With a diverse background as a writer, editor, and educator, Noël collaborates with businesses to tell their stories creatively and compellingly.",
                                    "social" : {
                                        "linkedin" : "http://www.linkedin.com/in/noelnorcross"
                                    }
                                },
                                {
                                    "name" : "Brad Risse",
                                    "position" : "UI Designer",
                                    "profilepic" : "/assets/images/indimain/team/brad.jpg",
                                    "bio" : "Brad utilizes his programming skills to produce elegant and very functional websites and mobile apps focused on the user experience.",
                                    "social" : {
                                        "linkedin" : "http://www.linkedin.com/pub/bradly-risse/26/431/103"
                                    }
                                },
                                {
                                    "name" : "Lana V. Risse",
                                    "position" : "Graphic Designer",
                                    "profilepic" : "/assets/images/indimain/team/lana.jpg",
                                    "bio" : "Well-versed in print and digital design and branding, Lana adopts the latest techniques to create beautiful and functional audience experiences.",
                                    "social" : {
                                        "linkedin" : "http://www.linkedin.com/pub/lana-vorobyeva/28/910/4b2"
                                    }
                                },
                                {
                                    "name" : "Kyle Miller",
                                    "position" : "Architect",
                                    "profilepic" : "/assets/images/indimain/team/kyle.jpg",
                                    "bio" : "Kyle is a detail-oriented lead developer with a strong background in communication, leadership, and critical thinking.",
                                    "social" : {
                                        "linkedin" : "http://www.linkedin.com/in/kylejmiller"
                                    }
                                },
                                {
                                    "name" : "",
                                    "position" : "",
                                    "profilepic" : "/assets/images/indimain/team/become.png",
                                    "bio" : "The bio.",
                                    "become-member" : "true"
                                }
                            ],
                            "value" : ""
                        },
                        {
                            "_id" : "f34s442s-0034-2f09-4h65-33423h8894778",
                            "anchor" : null,
                            "type" : "testimonials",
                            "title" : "Testimonials",
                            "subtitle" : "",
                            "testimonials" : [
                                {
                                    "img" : "/assets/images/indimain/testimonials/prolific.jpg",
                                    "name" : "Prolific Athletes",
                                    "site" : "www.profilicathletes.com",
                                    "text" : "“Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ac eleifend lorem. Ut a velit hendrerit, suscipit metus in, ornare dolor. Suspendisse tortor ligula, tempus et iaculis at, tempor id dui. Pellentesque ac vestibulum mi. Suspendisse tristique sapien tempus neque placerat pulvinar. Suspendisse molestie, turpis eu ornare dictum, ligula purus ultricies turpis, eget dictum nibh urna tincidunt lacus. Integer ligula tortor, egestas et odio in, suscipit placerat risus.”"
                                },
                                {
                                    "img" : "/assets/images/indimain/testimonials/katya.jpg",
                                    "name" : "Katya Myers",
                                    "site" : "www.katyameyers.com",
                                    "text" : "“Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ac eleifend lorem. Ut a velit hendrerit, suscipit metus in, ornare dolor. Suspendisse tortor ligula, tempus et iaculis at, tempor id dui. Pellentesque ac vestibulum mi. Suspendisse tristique sapien tempus neque placerat pulvinar. Suspendisse molestie, turpis eu ornare dictum, ligula purus ultricies turpis, eget dictum nibh urna tincidunt lacus. Integer ligula tortor, egestas et odio in, suscipit placerat risus.”"
                                },
                                {
                                    "img" : "/assets/images/indimain/testimonials/racingweight.jpg",
                                    "name" : "Racing Weight",
                                    "site" : "www.racingweight.com",
                                    "text" : "“Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ac eleifend lorem. Ut a velit hendrerit, suscipit metus in, ornare dolor. Suspendisse tortor ligula, tempus et iaculis at, tempor id dui. Pellentesque ac vestibulum mi. Suspendisse tristique sapien tempus neque placerat pulvinar. Suspendisse molestie, turpis eu ornare dictum, ligula purus ultricies turpis, eget dictum nibh urna tincidunt lacus. Integer ligula tortor, egestas et odio in, suscipit placerat risus.”"
                                },
                                {
                                    "img" : "/assets/images/indimain/testimonials/fitstop.jpg",
                                    "name" : "Fit Stop",
                                    "site" : "www.fitstop-lab.com",
                                    "text" : "“Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ac eleifend lorem. Ut a velit hendrerit, suscipit metus in, ornare dolor. Suspendisse tortor ligula, tempus et iaculis at, tempor id dui. Pellentesque ac vestibulum mi. Suspendisse tristique sapien tempus neque placerat pulvinar. Suspendisse molestie, turpis eu ornare dictum, ligula purus ultricies turpis, eget dictum nibh urna tincidunt lacus. Integer ligula tortor, egestas et odio in, suscipit placerat risus.”"
                                },
                                {
                                    "img" : "/assets/images/indimain/testimonials/sherbakov.jpg",
                                    "name" : "Mike Sherbakov",
                                    "site" : "www.mikesherbakov.com",
                                    "text" : "“Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ac eleifend lorem. Ut a velit hendrerit, suscipit metus in, ornare dolor. Suspendisse tortor ligula, tempus et iaculis at, tempor id dui. Pellentesque ac vestibulum mi. Suspendisse tristique sapien tempus neque placerat pulvinar. Suspendisse molestie, turpis eu ornare dictum, ligula purus ultricies turpis, eget dictum nibh urna tincidunt lacus. Integer ligula tortor, egestas et odio in, suscipit placerat risus.”"
                                }
                            ],
                            "label" : "",
                            "description" : "",
                            "value" : ""
                        },
                        {
                            "_id" : "k97g096d-8675-2x06-2v68-65431s970864",
                            "anchor" : null,
                            "type" : "feature-block",
                            "title" : " <span class=\"fa fa-globe\"></span>",
                            "subtitle" : "<span class=\"fa fa-map-marker\"></span> We are inspired by the natural beauty, people, and excellence of our home base in San Diego.",
                            "text" : "",
                            "bg" : {
                                "img" : {
                                    "url" : "/assets/images/indimain/img-4.jpg",
                                    "width" : 1400,
                                    "height" : 544,
                                    "parallax" : true,
                                    "blur" : false
                                },
                                "color" : ""
                            },
                            "btn" : {
                                "text" : "Btn Text",
                                "url" : "http://google.com",
                                "icon" : "fa fa-rocket"
                            }
                        },
                        {
                            "_id" : "j45k442s-0034-2f09-4h65-33423h8894778",
                            "anchor" : "blog",
                            "type" : "blog-teaser",
                            "title" : "Check out our blog",
                            "subtitle" : "",
                            "posts" : [
                                {
                                    _id: "2",
                                    accountId: "6",
                                    websiteId: "4s4r2sx2-3g54-3f5h-44f3-erer3d22ss3s",
                                    post_author: "Noel Norcross",
                                    post_title: "What's an Indigenous?",
                                    post_content: "<p>The problem with giving your company an adjective for a name is that it imputes the essence</p>",
                                    post_excerpt: "The problem with giving your company an adjective",
                                    post_status: "Publish",
                                    post_url: "welcome-to-indigenous",
                                    post_tags: [
                                        "Social Media",
                                        "Customer Service",
                                        "Marketing",
                                        "Pricing"
                                    ],
                                    post_category: "Marketing",
                                    comment_status: "on",
                                    comment_count: "2",
                                    created: {
                                        date: 1397761951291,
                                        by: null
                                    },
                                    modified: {
                                        date: "",
                                        by: null
                                    }
                                }
                            ],
                            "bg" : {
                                "img" : {
                                    "url" : "http://www.site.com/images/bgimage.jpg",
                                    "width" : 1400,
                                    "height" : 836,
                                    "parallax" : true,
                                    "blur": true
                                },
                                "color" : "#000000"
                            },
                            "btn" : {
                                "text" : "Btn Text",
                                "url" : "http://google.com",
                                "icon" : "fa fa-rocket"
                            },
                            "label" : "",
                            "description" : "",
                            "value" : ""
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
                            "description" : ""
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
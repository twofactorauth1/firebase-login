'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

	app.factory('SimpleSiteBuilderService', SimpleSiteBuilderService);

	SimpleSiteBuilderService.$inject = ['$http', 'AccountService', 'WebsiteService'];
	/* @ngInject */
	function SimpleSiteBuilderService($http, AccountService, WebsiteService) {
		var ssbService = {};
		var baseWebsiteAPIUrl = '/api/1.0/cms/website/'; //TODO: upgrade to api/2.0 when ready
		var basePageAPIUrl = '/api/1.0/cms/page/';


		ssbService.getSite = getSite;
		ssbService.getPage = getPage;
		ssbService.savePage = savePage;
		ssbService.setActiveSection = setActiveSection;
		ssbService.setActiveComponent = setActiveComponent;
		ssbService.activeSectionIndex = undefined;
		ssbService.activeComponentIndex = undefined;


		AccountService.getAccount(function(data) {
			ssbService.getSite(data.website.websiteId);
		});

		function setActiveSection(sectionIndex) {
			ssbService.activeSectionIndex = sectionIndex;
		}

		function setActiveComponent(componentIndex) {
			ssbService.activeComponentIndex = componentIndex;
		}

		function getSite(id) {

			function success(data) {
				ssbService.website = data;
			}

			function error(error) {
				console.error('SimpleSiteBuilderService getSite error: ' + error);
			}

			return $http.get(baseWebsiteAPIUrl + id).success(success).error(error);
		}

		function getPage(id) {

			return $http.get(basePageAPIUrl + id).success(successPage).error(errorPage);

		}

		function savePage(page) {

			return (
				$http({
					url: baseWebsiteAPIUrl + ssbService.website._id + '/page/' + page._id,
					method: 'POST',
					data: angular.toJson(page)
				}).success(successPage).error(errorPage)
			)

		}

		function successPage(data) {

			/*
			 *
			 * Transform legacy pages to new section/component model format
			 * TODO: think about moving this to API?
			 */
			// if (data.components) {
			// 	data.sections = angular.copy(data.components);
			// 	for (var i = 0; i < data.sections.length; i++) {
			// 		var component = angular.copy(data.sections[i]);
			// 		var defaultSectionObj = {
			// 			layout: '1-col',
			// 			components: [component]
			// 		};
			// 		data.sections[i] = defaultSectionObj;

			// 	}
			// 	delete data.components;
			// }

			// ssbService.page = data;


			/* test new section data model */
			var testSectionsComponent = {
			    "_id" : "552c42f4-d9d0-4b77-bde0-adb608848669",
			    "accountId" : 1281,
			    "websiteId" : "4e2bfc1b-8e96-4bbe-a65f-fee65e3a8053",
			    "handle" : "new-landing-page",
			    "title" : "New Landing Page",
			    "seo" : null,
			    "visibility" : {
			        "visible" : true,
			        "asOf" : null,
			        "displayOn" : null
			    },
			    "sections": [
			        {
			            "layout": "1-col",
			            "components": [
			                {
			                    "_id" : "70858b4d-4b94-455d-aeec-d0d5669178d3",
			                    "anchor" : "70858b4d-4b94-455d-aeec-d0d5669178d3",
			                    "type" : "text-only",
			                    "version" : "1",
			                    "txtcolor" : "#ffffff",
			                    "text" : "<p style=\"text-align: center;\"><span style=\"font-size:24px;\"> <img class=\"img-responsive\" alt=\"\" src=\"//s3.amazonaws.com/indigenous-digital-assets/account_6/indigenouslogo_1424781316317.gif\" /></span></p>",
			                    "bg" : {
			                        "img" : {
			                            "url" : "",
			                            "width" : null,
			                            "height" : null,
			                            "parallax" : false,
			                            "blur" : false,
			                            "overlay" : false,
			                            "show" : false,
			                            "overlayopacity" : 1
			                        },
			                        "color" : "#ffffff",
			                        "opacity" : 1
			                    },
			                    "visibility" : true,
			                    "spacing" : {
			                        "pb" : "35",
			                        "pl" : 0,
			                        "pr" : 0,
			                        "mt" : 0,
			                        "mb" : 0,
			                        "mr" : "auto",
			                        "ml" : "auto",
			                        "mw" : 1024,
			                        "usePage" : false
			                    },
			                    "header_title" : "Text Block"
			                }
			            ]
			        },
			        {
			            "layout": "2-col",
			            "components": [
			                {
			                    "_id" : "70858b4d-4b94-455d-aeec-d0d5669178d3",
			                    "anchor" : "70858b4d-4b94-455d-aeec-d0d5669178d3",
			                    "type" : "text-only",
			                    "version" : "1",
			                    "txtcolor" : "#ffffff",
			                    "text" : "<p style=\"text-align: center;\"><span style=\"font-size:24px;\"> <img class=\"img-responsive\" alt=\"\" src=\"//s3.amazonaws.com/indigenous-digital-assets/account_6/indigenouslogo_1424781316317.gif\" /></span></p>",
			                    "bg" : {
			                        "img" : {
			                            "url" : "",
			                            "width" : null,
			                            "height" : null,
			                            "parallax" : false,
			                            "blur" : false,
			                            "overlay" : false,
			                            "show" : false,
			                            "overlayopacity" : 1
			                        },
			                        "color" : "#ffffff",
			                        "opacity" : 1
			                    },
			                    "visibility" : true,
			                    "spacing" : {
			                        "pb" : "35",
			                        "pl" : 0,
			                        "pr" : 0,
			                        "mt" : 0,
			                        "mb" : 0,
			                        "mr" : "auto",
			                        "ml" : "auto",
			                        "mw" : 1024,
			                        "usePage" : false
			                    },
			                    "header_title" : "Text Block"
			                },
			                {
			                    "_id" : "70858b4d-4b94-455d-aeec-d0d5669178d3",
			                    "anchor" : "70858b4d-4b94-455d-aeec-d0d5669178d3",
			                    "type" : "text-only",
			                    "version" : "1",
			                    "txtcolor" : "#ffffff",
			                    "text" : "<p style=\"text-align: center;\"><span style=\"font-size:24px;\"> <img class=\"img-responsive\" alt=\"\" src=\"//s3.amazonaws.com/indigenous-digital-assets/account_6/indigenouslogo_1424781316317.gif\" /></span></p>",
			                    "bg" : {
			                        "img" : {
			                            "url" : "",
			                            "width" : null,
			                            "height" : null,
			                            "parallax" : false,
			                            "blur" : false,
			                            "overlay" : false,
			                            "show" : false,
			                            "overlayopacity" : 1
			                        },
			                        "color" : "#ffffff",
			                        "opacity" : 1
			                    },
			                    "visibility" : true,
			                    "spacing" : {
			                        "pb" : "35",
			                        "pl" : 0,
			                        "pr" : 0,
			                        "mt" : 0,
			                        "mb" : 0,
			                        "mr" : "auto",
			                        "ml" : "auto",
			                        "mw" : 1024,
			                        "usePage" : false
			                    },
			                    "header_title" : "Text Block"
			                }
			            ]
			        }
			    ],
			    // "components" : [
			    //     {
			    //         "_id" : "70858b4d-4b94-455d-aeec-d0d5669178d3",
			    //         "anchor" : "70858b4d-4b94-455d-aeec-d0d5669178d3",
			    //         "type" : "text-only",
			    //         "version" : "1",
			    //         "txtcolor" : "#ffffff",
			    //         "text" : "<p style=\"text-align: center;\"><span style=\"font-size:24px;\"> <img class=\"img-responsive\" alt=\"\" src=\"//s3.amazonaws.com/indigenous-digital-assets/account_6/indigenouslogo_1424781316317.gif\" /></span></p>",
			    //         "bg" : {
			    //             "img" : {
			    //                 "url" : "",
			    //                 "width" : null,
			    //                 "height" : null,
			    //                 "parallax" : false,
			    //                 "blur" : false,
			    //                 "overlay" : false,
			    //                 "show" : false,
			    //                 "overlayopacity" : 1
			    //             },
			    //             "color" : "#ffffff",
			    //             "opacity" : 1
			    //         },
			    //         "visibility" : true,
			    //         "spacing" : {
			    //             "pb" : "35",
			    //             "pl" : 0,
			    //             "pr" : 0,
			    //             "mt" : 0,
			    //             "mb" : 0,
			    //             "mr" : "auto",
			    //             "ml" : "auto",
			    //             "mw" : 1024,
			    //             "usePage" : false
			    //         },
			    //         "header_title" : "Text Block"
			    //     }, 
			    //     {
			    //         "_id" : "8abfd13c-dbf1-44a0-ba96-b52d6f30cd5d",
			    //         "anchor" : "8abfd13c-dbf1-44a0-ba96-b52d6f30cd5d",
			    //         "type" : "feature-list",
			    //         "version" : "2",
			    //         "title" : "<span style=\"color:#ffffff;\"><span style=\"line-height:1;\"><span style=\"line-height:1.1;\"><strong><span style=\"font-size:36px;\"></span><br /><span style=\"font-size:48px;\">The Easiest Way to Grow<br />Your&nbsp;Small Business Online</span><span style=\"font-size:36px;\"></span></strong></span></span><br /><span style=\"font-size:22px;\"><br />Join a community of small business owners and entrepreneurs who<br />depend on Indigenous to tell their story and share their skills.<br />More time for customers. Less time on technology.</span><br /><br /><span style=\"font-size:24px;\"><strong>ALL IN ONE SOLUTION</strong></span><span style=\"font-size:22px;\"></span></span>",
			    //         "features" : [ 
			    //             {
			    //                 "top" : "<div style=\"text-align: center;\"><img class=\"img-responsive\" alt=\"\" src=\"//s3.amazonaws.com/indigenous-digital-assets/account_6/1_1446246029962.png\" /></div>",
			    //                 "content" : "<p style=\"text-align: center;\"><strong><span style=\"color:#ffffff;\"><span style=\"font-size:18px;\"></span></span><span style=\"color:#ffffff;\"><span style=\"font-size:18px;\">Professional Website Builder</span></span><span style=\"color:#ffffff;\"><span style=\"font-size:18px;\"></span></span></strong></p>"
			    //             }, 
			    //             {
			    //                 "top" : "<div style=\"text-align: center;\"><img class=\"img-responsive\" alt=\"\" src=\"//s3.amazonaws.com/indigenous-digital-assets/account_6/2_1446246030596.png\" /></div>",
			    //                 "content" : "<p style=\"text-align: center;\"><strong><span style=\"color:#ffffff;\"><span style=\"font-size:18px;\"></span></span><span style=\"color:#ffffff;\"><span style=\"font-size:18px;\">Automated Email Communication</span></span><span style=\"color:#ffffff;\"><span style=\"font-size:18px;\"></span></span></strong></p>"
			    //             }, 
			    //             {
			    //                 "top" : "<div style=\"text-align: center;\"><img class=\"img-responsive\" alt=\"\" src=\"//s3.amazonaws.com/indigenous-digital-assets/account_6/3_1446246031181.png\" /></div>",
			    //                 "content" : "<p style=\"text-align: center;\"><strong><span style=\"color:#ffffff;\"><span style=\"font-size:18px;\"></span></span><span style=\"color:#ffffff;\"><span style=\"font-size:18px;\">Simplified<br />Social Media</span></span><span style=\"color:#ffffff;\"><span style=\"font-size:18px;\"></span></span></strong></p>"
			    //             }, 
			    //             {
			    //                 "top" : "<div style=\"text-align: center;\"><img class=\"img-responsive\" alt=\"\" src=\"//s3.amazonaws.com/indigenous-digital-assets/account_6/4_1446246032035.png\" /></div>",
			    //                 "content" : "<p style=\"text-align: center;\"><strong><span style=\"color:#ffffff;\"><span style=\"font-size:18px;\"></span></span><span style=\"color:#ffffff;\"><span style=\"font-size:18px;\">Actionable Business Insights</span></span><span style=\"color:#ffffff;\"><span style=\"font-size:18px;\"></span></span></strong></p>"
			    //             }
			    //         ],
			    //         "txtcolor" : "#888888",
			    //         "bg" : {
			    //             "img" : {
			    //                 "url" : "http://s3.amazonaws.com/indigenous-digital-assets/account_6/1_1446516379206.jpg",
			    //                 "width" : null,
			    //                 "height" : null,
			    //                 "parallax" : false,
			    //                 "blur" : true,
			    //                 "overlay" : true,
			    //                 "show" : true,
			    //                 "overlayopacity" : 70,
			    //                 "undernav" : false,
			    //                 "fullscreen" : false,
			    //                 "overlaycolor" : "#000000"
			    //             },
			    //             "color" : "#ffffff",
			    //             "opacity" : 1
			    //         },
			    //         "blockbgcolor" : null,
			    //         "visibility" : true,
			    //         "spacing" : {
			    //             "pb" : "20",
			    //             "pl" : 0,
			    //             "pr" : 0,
			    //             "mt" : 0,
			    //             "mb" : 0,
			    //             "mr" : "auto",
			    //             "ml" : "auto",
			    //             "mw" : 1024,
			    //             "usePage" : false
			    //         },
			    //         "header_title" : "Feature List"
			    //     }
			    // ],
			    "screenshot" : "//indigenous-screenshots.s3.amazonaws.com/account_6/1446529161288.png",
			    "templateId" : null,
			    "secure" : false,
			    "type" : "page",
			    "email_type" : null,
			    "version" : 98,
			    "latest" : true,
			    "created" : {
			        "date" : "2015-10-30T22:35:45.845Z",
			        "by" : null
			    },
			    "modified" : {
			        "date" : new Date("2015-11-03T05:39:21.274Z"),
			        "by" : null
			    },
			    "mainmenu" : null
			}
			ssbService.page = testSectionsComponent;
		}

		function errorPage(error) {
			console.error('SimpleSiteBuilderService page error: ' + error);
		}

		return ssbService;
	}

})();
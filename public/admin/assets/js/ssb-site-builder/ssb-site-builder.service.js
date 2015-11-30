'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

	app.factory('SimpleSiteBuilderService', SimpleSiteBuilderService);

	SimpleSiteBuilderService.$inject = ['$http', '$q', '$timeout', 'AccountService', 'WebsiteService'];
	/* @ngInject */
	function SimpleSiteBuilderService($http, $q, $timeout, AccountService, WebsiteService) {
		var ssbService = {};
		var baseWebsiteAPIUrl = '/api/1.0/cms/website/'; //TODO: upgrade to api/2.0 when ready
		var basePageAPIUrl = '/api/1.0/cms/page/';
		var baseComponentAPIUrl = '/api/1.0/cms/component/';
    var baseWebsiteAPIUrlv2 = '/api/2.0/cms/websites/'
    var basePageAPIUrlv2 = '/api/2.0/cms/pages/';
    var baseTemplateAPIUrlv2 = '/api/2.0/cms/templates/';
    var baseSectionAPIUrlv2 = '/api/2.0/cms/sections';

		ssbService.getSite = getSite;
		ssbService.getPage = getPage;
		ssbService.getPages = getPages;
		ssbService.savePage = savePage;
		ssbService.saveWebsite = saveWebsite;
		ssbService.setActiveSection = setActiveSection;
		ssbService.setActiveComponent = setActiveComponent;
		ssbService.activeSectionIndex = undefined;
		ssbService.activeComponentIndex = undefined;
		ssbService.getPlatformSections = getPlatformSections;
		ssbService.getPlatformComponents = getPlatformComponents;
		ssbService.getComponent = getComponent;
		ssbService.getSection = getSection;
        ssbService.getSections = getUserSections;
		ssbService.checkForDuplicatePage = checkForDuplicatePage;
		ssbService.loading = { value: 0 };
		ssbService.getThemes = getThemes;
    ssbService.applyThemeToPage = applyThemeToPage;
    ssbService.createPage = createPage;
    ssbService.getTemplates = getTemplates;


		function ssbRequest(fn) {
			// return $timeout(function() {
				ssbService.loading.value = ssbService.loading.value + 1;
				console.info('service | loading +1 : ' + ssbService.loading.value);
				fn.finally(function() {
					ssbService.loading.value = ssbService.loading.value - 1;
					console.info('service | loading -1 : ' + ssbService.loading.value);
				})
				return fn;
			// }, 0);
		}

		function setActiveSection(sectionIndex) {
			ssbService.activeSectionIndex = sectionIndex;
		}

		function setActiveComponent(componentIndex) {
			ssbService.activeComponentIndex = componentIndex;
		}

		function getSite(id) {

			function success(data) {

        //TODO: temp pending API impl
        if (!data.theme) {
          data.theme = {
            _id: '11032028',
            styles: {
              headerBackgroundColor: '#FFFFFF',
              bodyBackgroundColor: '#FFFFFF',
              primaryTextColor: '#000000',
              primaryBtnColor: '#50c7e8',
              headingSize: '16px',
              paragraphSize: '12px'
            },
            defaultFontStack: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            headingFontStack: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            paragraphFontStack: '"Helvetica Neue", Helvetica, Arial, sans-serif'
          }
          data.themeOverrides = data.theme;
        }

				ssbService.website = data;
			}

			function error(error) {
				console.error('SimpleSiteBuilderService getSite error: ' + error);
			}

			return ssbRequest($http.get(baseWebsiteAPIUrl + id).success(success).error(error));
		}

		function getPages(id) {

			function success(data) {
				ssbService.pages = data;
			}

			function error(error) {
				console.error('SimpleSiteBuilderService getPages error: ' + error);
			}

			return ssbRequest($http.get(baseWebsiteAPIUrl + ssbService.websiteId + '/pages').success(success).error(error));
		}

		function getPage(id) {

			return ssbRequest($http.get(basePageAPIUrlv2 + id).success(successPage).error(errorPage));

		}

		function savePage(page) {

			return (
				ssbRequest($http({
					url: basePageAPIUrlv2 + page._id,
					method: 'POST',
					data: angular.toJson(page)
				}).success(successPage).error(errorPage))
			)

		}

    function createPage(templateId) {

      return (
        ssbRequest($http({
          url: baseWebsiteAPIUrlv2 + ssbService.website._id + '/page/',
          method: 'POST',
          data: { templateId: templateId }
        }).success(successPage).error(errorPage))
      )

    }

		function successPage(data) {

			/*
			 *
			 * Transform legacy pages to new section/component model format
			 */
			if (data.components && data.components.length && !data.sections) {
				data.sections = angular.copy(data.components);
				for (var i = 0; i < data.sections.length; i++) {
					var component = angular.copy(data.sections[i]);
					var defaultSectionObj = {
						layout: '1-col',
						components: [component]
					};

          defaultSectionObj.name = sectionName(defaultSectionObj) + ' Section';

					data.sections[i] = defaultSectionObj;

				}
				// delete data.components;
			}

      /*
       *
       * Name sections without a name (can be edited in UI)
       */
      for (var i = 0; i < data.sections.length; i++) {
        if (!data.sections[i].name) {
          data.sections[i].name = sectionName(data.sections[i]) + ' Section';
        }
      }

			ssbService.page = data;
		}

		function errorPage(error) {
			console.error('SimpleSiteBuilderService page error: ' + error);
		}

		function saveWebsite(website) {

			function success(data) {
				ssbService.website = data;
			}

			function error(error) {
				console.error('SimpleSiteBuilderService saveWebsite error: ' + error);
			}

			return (
				ssbRequest($http({
					url: baseWebsiteAPIUrl,
					method: 'POST',
					data: angular.toJson(website)
				}).success(success).error(error))
			)

		}

		//TODO: component versions
		function getComponent(component, version) {

			function success(data) {
				console.log('SimpleSiteBuilderService requested component: ' + data);
			}

			function error(error) {
				console.error('SimpleSiteBuilderService component error: ' + error);
			}

			return (
				ssbRequest($http({
					url: baseComponentAPIUrl + component.type,
					method: "POST",
					data: angular.toJson({
						version: version
					})
				}).success(success).error(error))
			)

		}

		//TODO: api implement
		function getSection(section, version) {

			var deferred = $q.defer();

			if (section.type.indexOf('ssb-') === -1) {
				getLegacySection(section, section.version).then(function(wrappedLegacyComponent){
					deferred.resolve(wrappedLegacyComponent);
				});
			} else {
        if (section.type == 'ssb-hero') {
				  deferred.resolve(
            {
              "_id": "76ef64ca-ed11-49db-8ebb-412343214123",
              "anchor": "76ef64ca-ed11-49db-8ebb-412343214123",
              "name": "Hero",
              "type": "ssb-page-section",
              "subtype": "platform",
              "layout": "hero",
              "canAddComponents": false,
              "version": 1,
              "txtcolor": "#FFFFFF",
              "bg": {
                "img": {
                  "url": "",
                  "width": null,
                  "height": null,
                  "parallax": false,
                  "blur": false,
                  "overlay": false,
                  "show": false
                },
                "color": "#4bb0cb"
              },
              "visibility": true,
              "components": [
                {
                  "_id": "31d45d75-e63c-40bf-8c83-10102edda912",
                  "anchor":"31d45d75-e63c-40bf-8c83-10102edda912",
                  "type":"ssb-text",
                  "version":1,
                  "txtcolor":"",
                  "text":"<div style=\"text-align: center;\"><strong><span style=\"font-size: 96px;\">MONI KING</span></strong></div>",
                  "bg":{
                    "img":{
                      "url":"",
                      "width":null,
                      "height":null,
                      "parallax":false,
                      "blur":false,
                      "overlay":false,
                      "show":false
                    },
                    "color":""
                  },
                  "visibility":true,
                  "spacing":{"mt":0,"pt":0,"pl":0,"pr":0,"pb":0,"ml":0,"mr":0,"mb":0}
                },
                {
                  "_id": "31d45d75-e63c-40bf-8c83-10102edda111",
                  "anchor":"31d45d75-e63c-40bf-8c83-10102edda111",
                  "type":"ssb-image",
                  "version":1,
                  "src": "",
                  "alttext": "Hero",
                  "bg":{
                    "img":{
                      "url":"",
                      "width":null,
                      "height":null,
                      "parallax":false,
                      "blur":false,
                      "overlay":false,
                      "show":false
                    },
                    "color":""
                  },
                  "visibility":true,
                  "spacing":{"mt":0,"pt":0,"pl":0,"pr":0,"pb":0,"ml":0,"mr":0,"mb":0}
                }
              ],
            }
          );
        }

        if (section.type == 'ssb-header') {
          deferred.resolve(
            {
              "_id": "76ef64ca-ed35-49db-8ebb-412343219999",
              "anchor": "76ef64ca-ed35-49db-8ebb-412343219999",
              "name": "Header",
              "type": "ssb-page-section",
              "subtype": "platform",
              "layout": "header",
              "canAddComponents": false,
              "version": 1,
              "txtcolor": "#FFFFFF",
              "bg": {
                "img": {
                  "url": "",
                  "width": null,
                  "height": null,
                  "parallax": false,
                  "blur": false,
                  "overlay": false,
                  "show": false
                },
                "color": "#4bb0cb"
              },
              "visibility": true,
              "components": [
                {
                  "_id":"c239d2be-ac45-4fd9-aed2-26196e870d5b",
                  "anchor":"c239d2be-ac45-4fd9-aed2-26196e870d5b",
                  "type":"navigation",
                  "version":2,
                  "txtcolor":null,
                  "activetxtcolor":null,
                  "logo":null,
                  "nav":{
                    "bg":"#017ebe",
                    "hoverbg":null,
                    "hover":null
                  },
                  "bg":{
                    "img":{
                      "url":"",
                      "width":null,
                      "height":null,
                      "parallax":false,
                      "blur":false,
                      "overlay":false,
                      "show":false
                    },
                    "color":"#89c4f4"
                  },
                  "customnav":true,
                  "linkLists":[
                    {
                      "name":"Head Menu",
                      "handle":"head-menu",
                      "links":[
                        {
                          "label":"Home",
                          "type":"link",
                          "linkTo":{
                            "data":"index",
                            "type":"page",
                            "page":null
                          }
                        },
                        {
                          "label":"About",
                          "type":"link",
                          "linkTo":{
                            "data":"index",
                            "type":"page",
                            "page":null
                          }
                        },
                        {
                          "label":"Media",
                          "type":"link",
                          "linkTo":{
                            "data":"index",
                            "type":"page",
                            "page":null
                          }
                        },
                        {
                          "label":"Contact",
                          "type":"link",
                          "linkTo":{
                            "data":"index",
                            "type":"page",
                            "page":null
                          }
                        }
                        ]
                      }
                  ],
                  "visibility":true,
                  "shownavbox":false
                },
                {
                  "_id":"0207f7a8-680c-45f4-a9cc-011dbdc63e29",
                  "anchor":"0207f7a8-680c-45f4-a9cc-011dbdc63e29",
                  "type":"social-link",
                  "version":1,
                  "txtcolor":null,
                  "networks":[
                    {
                      "name":"facebook",
                      "url":"http://www.facebook.com",
                      "icon":"facebook",
                    },
                    {
                      "name":"twitter",
                      "url":"http://www.twitter.com",
                      "icon":"twitter",
                    },
                    {
                      "name":"google-plus",
                      "url":"http://plus.google.com",
                      "icon":"google-plus",
                    }
                  ],
                  "bg":{
                    "img":{
                      "url":"",
                      "width":null,
                      "height":null,
                      "parallax":false,
                      "blur":false,
                      "overlay":false,
                      "show":false
                    },
                    "color":""
                  },
                  "visibility":true
                }
              ],
            }
          );
        }

			}

			function success(data) {
				console.log('SimpleSiteBuilderService requested section: ' + data);
			}

			function error(error) {
				console.error('SimpleSiteBuilderService section error: ' + error);
			}

			return ssbRequest(deferred.promise);

		}


    function sectionName(section) {
      var sectionName = section.layout;

      if (section.components) {
        if (section.components.length === 1 && section.components[0].header_title) {
          sectionName = section.components[0].header_title;
        } else if (section.components[0]) {
          sectionName = section.components[0].type;
        }
      }

      return sectionName;

    }

		function getLegacySection(section, version) {
			var sectionDefault = {
				"layout": "1-col",
				"txtcolor": undefined,
				"bg": {
					"img": {
						"url": "",
						"width": null,
						"height": null,
						"parallax": false,
						"blur": false,
						"overlay": false,
						"show": false
					},
					"color": undefined
				},
				"visibility": true,
				"spacing": {
					"mt": "0",
					"ml": "0",
					"mr": "0",
					"mb": "0",
					"pt": "0",
					"pb": "0",
					"pl": "0",
					"pr": "0"
				}
			}

			return getComponent(section, version).then(function(component) {
				sectionDefault.components = [component.data];

        sectionDefault.name = sectionName(sectionDefault);

				return sectionDefault;
			});
		}

		//TODO: api implement
		function getPlatformSections() {

			var tempSection = {
				"name": "3 Column Text",
				"layout": "3-col",
				"components": [{
					"_id": "c72f4759-fcae-4fb6-a2a2-b0790a7b2742",
					"anchor": "c72f4759-fcae-4fb6-a2a2-b0790a7b2742",
					"type": "text",
					"version": 1,
					"txtcolor": "#000000",
					"text": "<p><span style=\"\">Some Text</span></p><p><span style=\"\"></span>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nulla quae nesciunt, veritatis adipisci sit, consequatur accusamus in laboriosam amet repellendus ducimus mollitia ad labore quisquam voluptas porro esse. Dolore reiciendis, quos molestiae dolorum, officiis sapiente. Cumque vitae placeat aspernatur! Modi repellat, deleniti dolorum iste illum, esse excepturi magnam quibusdam, similique delectus est aliquam autem dolores possimus accusamus expedita nulla provident maxime eligendi ullam ad. Consequuntur ea officia nam quos, deserunt, nemo architecto repellat neque et ad natus! Asperiores pariatur distinctio amet repellendus aspernatur deleniti ipsa animi quis nesciunt quia quod eius, ex sapiente, neque quae quaerat labore. Debitis, quaerat, fugiat.</p>",
					"bg": {
						"img": {
							"url": "",
							"width": null,
							"height": null,
							"parallax": false,
							"blur": false,
							"overlay": false,
							"show": false
						},
						"color": "#FFFFFF"
					},
					"visibility": true,
					"spacing": {
						"mt": "0",
						"ml": "0",
						"mr": "0",
						"mb": "0",
						"pt": "20",
						"pb": "20",
						"pl": "20",
						"pr": "20"
					}
				},
				{
					"_id": "c72f4759-1234-4fb6-a2a2-b0790a7b2742",
					"anchor": "c72f4759-1234-4fb6-a2a2-b0790a7b2742",
					"type": "text",
					"version": 1,
					"txtcolor": "#000000",
					"text": "<p><span style=\"\">Some Text</span></p><p><span style=\"\"></span>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nulla quae nesciunt, veritatis adipisci sit, consequatur accusamus in laboriosam amet repellendus ducimus mollitia ad labore quisquam voluptas porro esse. Dolore reiciendis, quos molestiae dolorum, officiis sapiente. Cumque vitae placeat aspernatur! Modi repellat, deleniti dolorum iste illum, esse excepturi magnam quibusdam, similique delectus est aliquam autem dolores possimus accusamus expedita nulla provident maxime eligendi ullam ad. Consequuntur ea officia nam quos, deserunt, nemo architecto repellat neque et ad natus! Asperiores pariatur distinctio amet repellendus aspernatur deleniti ipsa animi quis nesciunt quia quod eius, ex sapiente, neque quae quaerat labore. Debitis, quaerat, fugiat.</p>",
					"bg": {
						"color": "#FFFFFF",
						"opacity": 1,
						"img": {
							"url": "",
							"width": null,
							"height": null,
							"parallax": false,
							"blur": false,
							"overlay": false,
							"show": false
						},
					},
					"visibility": true,
					"spacing": {
						"mt": "0",
						"ml": "0",
						"mr": "0",
						"mb": "0",
						"pt": "20",
						"pb": "20",
						"pl": "20",
						"pr": "20"
					}
				},
				{
					"_id": "5a9adc3a-027d-4e87-a114-946986478f45",
					"anchor": "5a9adc3a-027d-4e87-a114-946986478f45",
					"type": "text",
					"version": 1,
					"txtcolor": "#000000",
					"text": "<p><span style=\"\">Some Text</span></p><p><span style=\"\"></span>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nulla quae nesciunt, veritatis adipisci sit, consequatur accusamus in laboriosam amet repellendus ducimus mollitia ad labore quisquam voluptas porro esse. Dolore reiciendis, quos molestiae dolorum, officiis sapiente. Cumque vitae placeat aspernatur! Modi repellat, deleniti dolorum iste illum, esse excepturi magnam quibusdam, similique delectus est aliquam autem dolores possimus accusamus expedita nulla provident maxime eligendi ullam ad. Consequuntur ea officia nam quos, deserunt, nemo architecto repellat neque et ad natus! Asperiores pariatur distinctio amet repellendus aspernatur deleniti ipsa animi quis nesciunt quia quod eius, ex sapiente, neque quae quaerat labore. Debitis, quaerat, fugiat.</p>",
					"bg": {
						"color": "#FFFFFF",
						"opacity": 1,
						"img": {
							"url": "",
							"width": null,
							"height": null,
							"parallax": false,
							"blur": false,
							"overlay": false,
							"show": false
						},
					},
					"visibility": true,
					"spacing": {
						"mt": "0",
						"ml": "0",
						"mr": "0",
						"mb": "0",
						"pt": "20",
						"pb": "20",
						"pl": "20",
						"pr": "20"
					}
				}],
				"txtcolor": "#000000",
				"bg": {
					"color": "#FFFFFF",
					"opacity": 1,
					"img": {
						"url": "",
						"width": null,
						"height": null,
						"parallax": false,
						"blur": false,
						"overlay": false,
						"show": false
					},
				},
				"visibility": true,
				"spacing": {
					"mt": "0",
					"ml": "0",
					"mr": "0",
					"mb": "0",
					"pb": "0",
					"pl": "0",
					"pr": "0",
					"pt": "0"
				}
			}

			function success(data) {
				console.log('SimpleSiteBuilderService requested section: ' + data);
			}

			function error(error) {
				console.error('SimpleSiteBuilderService section error: ' + error);
			}

			var deferred = $q.defer();
			deferred.resolve(section);
			return ssbRequest(deferred.promise);

		}

		//TODO: make actual API call
		function getPlatformComponents() {
			var components = [
        // {
        //   title: 'Blog',
        //   type: 'blog',
        //   preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/blog.png',
        //   filter: 'blog',
        //   description: 'Use this section for your main blog page which displays all your posts with a sidebar of categories, tags, recent posts, and posts by author.',
        //   enabled: true
        // }, {
        //   title: 'Blog Teaser',
        //   type: 'blog-teaser',
        //   preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/blog-teaser.png',
        //   filter: 'blog',
        //   description: 'The Blog Teaser is perfect to showcase a few of your posts with a link to your full blog page.',
        //   enabled: true
        // }, {
        //   title: 'Masthead',
        //   type: 'masthead',
        //   preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/masthead.jpg',
        //   filter: 'misc',
        //   description: 'Introduce your business with this section on the top of your home page.',
        //   enabled: true
        // }, {
        //   title: 'Feature List',
        //   type: 'feature-list',
        //   preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/feature-list.jpg',
        //   filter: 'features',
        //   description: 'Showcase what your business offers with a feature list.',
        //   enabled: true
        // }, {
        //   title: 'Contact Us',
        //   type: 'contact-us',
        //   preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/contact-us.jpg',
        //   filter: 'contact',
        //   description: 'Let your visitors where your located, how to contact you, and what your business hours are.',
        //   enabled: true
        // }, {
        //   title: 'Coming Soon',
        //   type: 'coming-soon',
        //   preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/coming-soon.jpg',
        //   filter: 'misc',
        //   description: 'Even if your site isn\'t ready you can use this section to let your visitors know you will be availiable soon.',
        //   enabled: true
        // }, {
        //   title: 'Feature block',
        //   type: 'feature-block',
        //   preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/feature-block.jpg',
        //   filter: 'features',
        //   description: 'Use this section to show one important feature or maybe a quote.',
        //   enabled: true
        // },{
        //   title: 'Footer',
        //   type: 'footer',
        //   preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/footer.png',
        //   filter: 'misc',
        //   description: 'Use this section to show footer on your page.',
        //   enabled: false
        // }, {
        //   title: 'Image Gallery',
        //   type: 'image-gallery',
        //   preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/gallery.jpg',
        //   filter: 'images',
        //   description: 'Display your images in this image gallery section with fullscreen large view.',
        //   enabled: true
        // },
        {
          title: 'Image Text',
          version: 1,
          type: 'image-text',
          preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/image-text.jpg',
          filter: 'images',
          description: 'Show an image next to a block of text on the right or the left.',
          enabled: true
        },
        // {
        //   title: 'Meet Team',
        //   type: 'meet-team',
        //   icon: 'fa fa-users',
        //   preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/meet-team.png',
        //   filter: 'team',
        //   description: 'Let your visitors know about the team behind your business. Show profile image, position, bio, and social links for each member.',
        //   enabled: true
        // },
        {
          title: 'Navigation 1',
          type: 'navigation',
          preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/navbar-v1.jpg',
          filter: 'navigation',
          description: 'A simple navigation bar with the logo on the left and nav links on the right. Perfect for horizontal logos.',
          version: 1,
          enabled: true
        }, {
          title: 'Navigation 2',
          type: 'navigation',
          preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/nav-v2-preview.png',
          filter: 'navigation',
          description: 'If your logo is horizontal or square, this navigation will showcase your logo perfectly with addtional space for more links.',
          version: 2,
          enabled: true
        }, {
          title: 'Navigation 3',
          type: 'navigation',
          preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/nav-v3-preview.png',
          filter: 'navigation',
          description: 'This navigation features a large block navigation links for a modern feel.',
          version: 3,
          enabled: true
        },
        {
          title: 'Products',
          type: 'products',
          icon: 'fa fa-money',
          preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/products.png',
          filter: 'products',
          description: 'Use this as the main products page to start selling. It comes together with a cart and checkout built in.',
          enabled: true
        },
        // {
        //   title: 'Pricing Tables',
        //   type: 'pricing-tables',
        //   preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/pricing-tables.png',
        //   filter: 'text',
        //   description: 'Subscription product types with multiple options are best when shown in a pricing table to help the visitor decide which one is best for them.',
        //   enabled: true
        // },
        {
          title: 'Simple form',
          type: 'simple-form',
          preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/simple-form.jpg',
          filter: 'forms',
          description: 'Automatically create contacts in the backend when a visitor submits this form. Add first name, last name, email, or phone number fields.',
          enabled: true
        },
        // {
        //   title: 'Single Post',
        //   type: 'single-post',
        //   icon: 'custom single-post',
        //   preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/45274f46-0a21-11e5-83dc-0aee4119203c.png',
        //   filter: 'blog',
        //   description: 'Used for single post design. This is a mandatory page used to show single posts. This will apply to all posts.',
        //   enabled: false
        // },
        {
          title: 'Social',
          type: 'social-link',
          preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/social-links.jpg',
          filter: 'social',
          description: 'Let your visitors know where else to find you on your social networks. Choose from 18 different networks.',
          enabled: true
        },
        {
          title: 'Video',
          type: 'video',
          icon: 'fa fa-video',
          preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/video.png',
          filter: 'video',
          description: 'Showcase a video from Youtube, Vimeo, or an uploaded one. You can simply add the url your video is currently located.',
          enabled: true
        },
        {
          title: 'Text Block',
          type: 'text-only',
          preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/text-block.jpg',
          filter: 'text',
          description: 'A full width section for a large volume of text. You can also add images within the text.',
          enabled: true
        },
        // {
        //   title: 'Thumbnail Slider',
        //   type: 'thumbnail-slider',
        //   preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/thumbnail.png',
        //   filter: 'images',
        //   description: 'Perfect for sponsor or client logos you have worked with in the past. Works best with logos that have a transparent background. ',
        //   enabled: true
        // },
        {
          title: 'Top Bar',
          type: 'top-bar',
          icon: 'fa fa-info',
          preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/top-bar.png',
          filter: 'contact',
          description: 'Show your social networks, phone number, business hours, or email right on top that provides visitors important info quickly.',
          enabled: true
        },
        // {
        //   title: 'Testimonials',
        //   type: 'testimonials',
        //   icon: 'fa fa-info',
        //   preview: 'https://s3-us-west-2.amazonaws.com/indigenous-admin/45263570-0a21-11e5-87dd-b37fd2717aeb.png',
        //   filter: 'text',
        //   description: 'A section to showcase your testimonials.',
        //   enabled: true
        // }
        ];

        var ret = [];
        components.forEach(function(cmp) {
          ret.push(getComponent(cmp));
        })

        return $q.all(ret)
		}

		//TODO: api implement
		function getThemes() {

			var tempThemes = [{
				_id: '11032028',
				name: 'Default',
        previewImage: 'https://s3.amazonaws.com/indigenous-themes/indimain/ssb-indimain-preview.png',
				styles: {
					headerBackgroundColor: '#FFFFFF',
					bodyBackgroundColor: '#FFFFFF',
					primaryTextColor: '#000000',
					primaryBtnColor: '#50c7e8',
					headingSize: '16px',
					paragraphSize: '12px'
				},
				defaultFontStack: '"Helvetica Neue", Helvetica, Arial, sans-serif',
				headingFontStack: '"Helvetica Neue", Helvetica, Arial, sans-serif',
				paragraphFontStack: '"Helvetica Neue", Helvetica, Arial, sans-serif',
				defaultSections: [{
					//
				}]
			},
			{
				_id: '96751783',
				name: 'Young Soul',
        previewImage: 'https://s3.amazonaws.com/indigenous-themes/young-soul/young-soul-preview.png',
				styles: {
					headerBackgroundColor: '#9ACCCB',
					bodyBackgroundColor: '#E8E7E7',
					primaryTextColor: '#000000',
          			primaryBtnTextColor: '#FFFFFF',
					primaryBtnBackgroundColor: '#000000',
					headingSize: '16px',
					paragraphSize: '12px'
				},
				defaultFontStack: '"Roboto", Helvetica, Arial, sans-serif',
				headingFontStack: '"Roboto", Helvetica, Arial, sans-serif',
				paragraphFontStack: '"Roboto", Helvetica, Arial, sans-serif',
				defaultSections: [{
					//
				}]
			},
			{
				_id: '123456',
				name: 'Abril - Fatface',
        previewImage: 'https://s3.amazonaws.com/indigenous-themes/indimain/ssb-indimain-preview.png',
				styles: {
					headerBackgroundColor: '#9ACCCB',
					bodyBackgroundColor: '#E8E7E7',
					primaryTextColor: '#000000',
          			primaryBtnTextColor: '#FFFFFF',
					primaryBtnBackgroundColor: '#000000',
					headingSize: '16px',
					paragraphSize: '12px'
				},
				defaultFontStack: '"Abril Fatface", fantasy',
				headingFontStack: '"Abril Fatface", fantasy',
				paragraphFontStack: '"Abril Fatface", fantasy',
				defaultSections: [{
					//
				}]
			},
			{
				_id: '112233',
				name: 'Aguafina Script',
        previewImage: 'https://s3.amazonaws.com/indigenous-themes/indimain/ssb-indimain-preview.png',
				styles: {
					headerBackgroundColor: '#9ACCCB',
					bodyBackgroundColor: '#E8E7E7',
					primaryTextColor: '#000000',
          			primaryBtnTextColor: '#FFFFFF',
					primaryBtnBackgroundColor: '#000000',
					headingSize: '16px',
					paragraphSize: '12px'
				},
				defaultFontStack: '"Aguafina Script", cursive',
				headingFontStack: '"Abril Fatface", fantasy',
				paragraphFontStack: '"Abril Fatface", fantasy',
				defaultSections: [{
					//
				}]
			}];

			function success(data) {
				console.log('SimpleSiteBuilderService requested themes: ' + data);
			}

			function error(error) {
				console.error('SimpleSiteBuilderService themes error: ' + error);
			}

      ssbService.themes = tempThemes;

			var deferred = $q.defer();
			deferred.resolve(tempThemes);
			return ssbRequest(deferred.promise);

		}

		function checkForDuplicatePage(pageHandle) {

			function success(data) {
				console.log('SimpleSiteBuilderService checkForDuplicatePage: ' + data);
			}

			function error(error) {
				console.error('SimpleSiteBuilderService checkForDuplicatePage error: ' + error);
			}

			return (
        ssbRequest($http({
					url: baseWebsiteAPIUrl + ssbService.website._id + '/page/' + pageHandle,
					method: 'GET',
				}).success(success).error(error))
			)

		}

		function getUserSections() {

            function success(data) {
                console.log('SimpleSiteBuilderService getUserSections: ' + data);
            }

            function error (error) {
                console.error('SimpleSiteBuilderService getUserSections error: ' + error);
            }

            return (ssbRequest($http({
                url: baseSectionAPIUrlv2,
                method: 'GET'
            }).success(success).error(error)));
			//return [];
		}

    function getTemplates() {

      function success(data) {
        ssbService.templates = data;
        console.log('SimpleSiteBuilderService getTemplates: ' + data);
      }

      function error(error) {
        console.error('SimpleSiteBuilderService getTemplates error: ' + error);
      }

      return (
        ssbRequest($http({
          url: baseTemplateAPIUrlv2,
          method: 'GET',
        }).success(success).error(error))
      )

    }

    function applyThemeToPage(theme) {
        // Load web font loader
       if (theme.name !== 'Default') {
          WebFont.load({
            google: {
              families: [theme.defaultFontStack.split(',')[0].replace(/"/g, '')]
            }
          });
          window.WebFontConfig = {
            active: function() {
              sessionStorage.fonts = true;
            }
          }
        }
        ssbService.website.theme = theme;
        ssbService.website.themeOverrides = theme;
    }


		(function init() {

			AccountService.getAccount(function(data) {
				ssbService.websiteId = data.website.websiteId;
        ssbService.getSite(data.website.websiteId);
        ssbService.getPages();
        ssbService.getThemes();
				ssbService.getTemplates();
			});

		})();


		return ssbService;
	}

})();

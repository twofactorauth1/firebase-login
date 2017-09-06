/*global app,console*/
/* eslint-disable no-console*/
(function () {
	app.controller('SiteBuilderBlogPostCardComponentController', ssbBlogPostCardComponentController);

	ssbBlogPostCardComponentController.$inject = ['$scope', '$attrs', '$filter', '$location', 'SimpleSiteBuilderBlogService'];
	/* @ngInject */
	function ssbBlogPostCardComponentController($scope, $attrs, $filter, $location, SimpleSiteBuilderBlogService) {

		console.info('ssb-blog-post-card directive init...');

		var vm = this;

		vm.init = init;
		vm.getPublishedDate = getPublishedDate;
		vm.initData = initData;
		vm.getFeaturedImageUrl = getFeaturedImageUrl;
		vm.encodeUrlText = encodeUrlText;
		vm.titleStyle = titleStyle;
		vm.descriptionStyle = descriptionStyle;

		function initData() {
			var posts = SimpleSiteBuilderBlogService.loadDataFromPage('script#indigenous-precache-sitedata-posts');
			if (posts && posts.length) {
				vm.post = posts[0];
			}

		}

		function titleStyle() {
			var styleString = ' ';
			if (vm.component && vm.component.settings && vm.component.settings.title && vm.component.settings.title.fontSize) {
				styleString += 'font-size: ' + vm.component.settings.title.fontSize + 'px !important;';
			}
			if (vm.component && vm.component.settings && vm.component.settings.title && vm.component.settings.title.fontFamily) {
				styleString += 'font-family: ' + vm.component.settings.title.fontFamily + 'px !important;';
			}
			if (vm.component && vm.component.settings && vm.component.settings.title && vm.component.settings.title.color) {
				styleString += 'color: ' + vm.component.settings.title.color + "!important;";
			}
			return styleString;
		}

		function descriptionStyle() {
			var styleString = ' ';
			if (vm.component && vm.component.settings && vm.component.settings.description && vm.component.settings.description.fontSize) {
				styleString += 'font-size: ' + vm.component.settings.description.fontSize + 'px !important;';
			}
			if (vm.component && vm.component.settings && vm.component.settings.description && vm.component.settings.description.fontFamily) {
				styleString += 'font-family: ' + vm.component.settings.description.fontFamily + 'px !important;';
			}
			if (vm.component && vm.component.settings && vm.component.settings.description && vm.component.settings.description.color) {
				styleString += 'color: ' + vm.component.settings.description.color + "!important;";
			}
			return styleString;
		}



		function getPublishedDate(dateValue) {
			if (dateValue) {
				return Date.parse(dateValue);
			}
		}

		function getFeaturedImageUrl(url) {
			if (url) {
				return url.replace(/^(http|https):/i, "");
			}
		}

		function encodeUrlText(url) {
			return encodeURI(url);
		}


		function init(element) {
			vm.element = element;

			if (!vm.post) {
				vm.initData();
			}
		}


	}


}());

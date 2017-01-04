(function(){

app.controller('SiteBuilderRssFeedComponentController', ssbRssFeedComponentController);

ssbRssFeedComponentController.$inject = ['$scope', '$attrs', '$filter', '$transclude', 'RssFeedService'];
/* @ngInject */
function ssbRssFeedComponentController($scope, $attrs, $filter, $transclude, RssFeedService) {

	console.info('ssb-rss-feed directive init...')

	var vm = this;

	vm.loadFeed = loadFeed;

	vm.init = init;
	vm.titleStyle = titleStyle;
	vm.descriptionStyle = descriptionStyle;

	function titleStyle(){
		var styleString = ' ';
		if(vm.component && vm.component.settings && vm.component.settings.title && vm.component.settings.title.fontSize){
			styleString += 'font-size: ' + vm.component.settings.title.fontSize + 'px !important;';
		}
		if(vm.component && vm.component.settings && vm.component.settings.title && vm.component.settings.title.fontFamily){
			styleString += 'font-family: ' + vm.component.settings.title.fontFamily + 'px !important;';
		}
		if(vm.component && vm.component.settings && vm.component.settings.title && vm.component.settings.title.color){
			styleString += 'color: ' + vm.component.settings.title.color + "!important;";
		}
		return styleString;
	}

	function descriptionStyle(){
		var styleString = ' ';
		if(vm.component && vm.component.settings && vm.component.settings.description && vm.component.settings.description.fontSize){
			styleString += 'font-size: ' + vm.component.settings.description.fontSize + 'px !important;';
		}
		if(vm.component && vm.component.settings && vm.component.settings.description && vm.component.settings.description.fontFamily){
			styleString += 'font-family: ' + vm.component.settings.description.fontFamily + 'px !important;';
		}
		if(vm.component && vm.component.settings && vm.component.settings.description && vm.component.settings.description.color){
			styleString += 'color: ' + vm.component.settings.description.color + "!important;";
		}
		return styleString;
	}


	function loadFeed(){
		vm.loading = true;
		RssFeedService.parseFeed(vm.component.settings.source).then(function(feeds){
	        console.log(feeds);
	        vm.feeds = feeds.data.responseData.feed.entries;
	        vm.loading = false;
		})
	}

	function init(element) {
		vm.element = element;
		loadFeed();
	}

}


})();

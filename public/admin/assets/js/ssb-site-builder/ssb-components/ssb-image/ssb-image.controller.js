/*global app, console */
/*jslint unparam:true*/
(function () {
	'use strict';
	app.controller('SiteBuilderImageComponentController',
		function () {
			console.info('ssb-image directive init...');
			var vm = this;

			function init(element) {
				vm.element = element;
			}
			vm.init = init;
		});
}());

/*global mainApp */
mainApp.filter('unsafe', function ($sce) {
	'use strict';
	return $sce.trustAsHtml;
});

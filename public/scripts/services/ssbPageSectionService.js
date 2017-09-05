/*global mainApp   */
/*jslint unparam:true*/
/* eslint-disable no-console */
(function () {
	'use strict';

	mainApp.factory('SsbPageSectionService', function () {
		var ssbSectionService = {};
		ssbSectionService.offset = 0;

		function getSectionOffset() {
			return ssbSectionService.offset;
		}

		function setSectionOffset(offset) {
			ssbSectionService.offset = offset;
		}
		ssbSectionService.getSectionOffset = getSectionOffset;
		ssbSectionService.setSectionOffset = setSectionOffset;
		return ssbSectionService;
	});
}());

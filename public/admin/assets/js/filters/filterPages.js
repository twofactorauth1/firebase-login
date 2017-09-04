/*global app*/
/*jslint unparam:true*/
app.filter('filterPages', function () {
	'use strict';
	return function (pages, websiteLinks, customLinks, customNav, handle) {
		var linkList = [], currentlinks = null;
		if (customNav) {
			currentlinks = customLinks;
		} else {
			currentlinks = websiteLinks;
		}
		currentlinks.forEach(function (value) {
			if (value.handle === "head-menu") {
				linkList = value.links;
			}
		});
		if (pages) {
			return pages.filter(function (page) {
				var valid = true;
				if (page.mainmenu === false) {
					valid = false;
				}
				if (valid) {
					_.each(linkList, function (link) {
						if (page.handle === link.linkTo.data && (link.linkTo.type === 'page' || link.linkTo.type === 'home')) {
							if (handle && handle === link.linkTo.data) {
								valid = true;
							} else {
								valid = false;
							}
						}
					});
				}
				return valid;
			});
		}
	};
});

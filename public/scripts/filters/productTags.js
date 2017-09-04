/*global mainApp */
mainApp.filter('selectedTags', function () {
	'use strict';
	return function (products, tags) {
		if (products) {
			return products.filter(function (product) {
				if (!tags || tags.length === 0) {
					return (product.status === 'active');
				} else {
					var i = 0;
					if (product.status === 'active') {
						for (i = 0; i < product.tags.length; i++) {
							if (tags.indexOf(product.tags[i]) !== -1) {
								return true;
							}
						}
					}
					return false;
				}
			});
		}
	};
});

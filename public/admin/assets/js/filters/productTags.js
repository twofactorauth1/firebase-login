'use strict';

app.filter('selectedTags', function () {
  return function (products, tags) {
    if (products) {
      return products.filter(function (product) {
        if (!tags || tags.length === 0) {
          if (product.status === 'active') {
            return true;
          }
        } else {
          _.each(product.tags, function (tag) {
            if (product.status === 'active' && tags.indexOf(tag) !== -1) {
              return true;
            }
          });
        }
      });
    }
  };
});

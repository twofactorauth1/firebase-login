'use strict';
/*global app*/
app.directive('productsComponent', ['ProductService', function (ProductService) {
  return {
    scope: {
      component: '=',
      version: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope) {

      //show editing in admin
      scope.isEditing = true;
      //assign and hold the checkout modal state
      scope.checkoutModalState = 1;
      //assign and hold the currentProductPage for pagination
      scope.currentProductPage = 1;

      /*
       * @filterTags
       * - if component has tags filter them or return the _product
       */

      function filterTags(_product) {
        var _tags = scope.component.productTags;
        if (_tags) {
          if (_product.tags && _tags.length > 0) {
            if (_.intersection(_tags, _product.tags).length > 0) {
              return _product;
            }
          }
        }
        return _product;
      }

      /*
       * @filterProducts
       * - filter the products and assign them to the scope
       */

      function filterProducts(data) {
        var _filteredProducts = [];
        _.each(data, function (product) {
          if (filterTags(product)) {
            _filteredProducts.push(product);
          }
        });
        scope.products = angular.copy(_filteredProducts);
        scope.filteredProducts = _filteredProducts;
      }

      /*
       * @watch:numtodisplay
       * - watch for the display number to change in the component settings
       */

      scope.$watch('component.numtodisplay', function (newValue) {
        if (newValue) {
          scope.component.numtodisplay = newValue;
          scope.pageChanged(scope.currentProductPage);
        }
      });

      /*
       * @watch:productTags
       * - watch for product tags to change in component settings and filter products
       */

      scope.$watch('component.productTags', function (newValue) {
        if (newValue) {
          scope.component.productTags = newValue;
          filterProducts(scope.originalProducts);
          scope.pageChanged(scope.currentProductPage);
        }
      });

      /*
       * @getAllProducts
       * - get products for products and pricing table components
       */

      ProductService.getProducts(function (data) {
        scope.originalProducts = angular.copy(data);
        filterProducts(data);
      });

      /*
       * @pageChanged
       * - when a page is changes splice the array to show offset products
       */

      scope.pageChanged = function (pageNo) {
        scope.currentProductPage = pageNo;
        if (scope.products) {
          var begin = ((scope.currentProductPage - 1) * scope.component.numtodisplay);
          var end = begin + scope.component.numtodisplay;
          scope.filteredProducts = scope.products.slice(begin, end);
        }
      };
    }
  };
}]);

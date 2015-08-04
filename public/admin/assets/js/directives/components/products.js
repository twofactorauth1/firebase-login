'use strict';
/*global app, moment*/
app.directive('productsComponent', ['ProductService', function (ProductService) {
  return {
    scope: {
      component: '='
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
        if (_tags && _tags.length > 0) {
          if (_product.tags) {
            if (_.intersection(_tags, _product.tags).length > 0) {
              return true;
            }
          }
        } else {
          return true;
        }
      }

      /*
       * @checkOnSale
       * - check if today is inbetween sales dates
       */

      function checkOnSale(_product) {
        if (_product.on_sale) {
          if (_product.sale_date_from && _product.sale_date_to) {
            var date = new Date();
            var startDate = new Date(_product.sale_date_from);
            var endDate = new Date(_product.sale_date_to);
            if (startDate <= date && date <= endDate) {
              return true; //false in this case
            }
            return false;
          }
          return true;
        }
      }

      /*
       * @filterProducts
       * - filter the products and assign them to the scope
       */

      function filterProducts(data, fn) {
        var _filteredProducts = [];
        _.each(data, function (product) {
          if (filterTags(product)) {
            if (checkOnSale(product)) {
              product.onSaleToday = true;
            }
            _filteredProducts.push(product);
          }
        });
        scope.products = _filteredProducts;
        if (fn) {
          fn();
        }
      }

      /*
       * @watch:numtodisplay
       * - watch for the display number to change in the component settings
       */

      scope.$watch('component.numtodisplay', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          scope.component.numtodisplay = newValue;
          filterProducts(scope.originalProducts, function () {
            scope.pageChanged(1);
          });
        }
      });

      /*
       * @watch:productTags
       * - watch for product tags to change in component settings and filter products
       */

      scope.$watch('component.productTags', function (newValue, oldValue) {
        if (newValue !== oldValue) {
          scope.component.productTags = newValue;
          filterProducts(scope.originalProducts, function () {
            scope.pageChanged(1);
          });
        }
      });

      /*
       * @getAllProducts
       * - get products for products and pricing table components
       */

      ProductService.getProducts(function (data) {
        scope.originalProducts = angular.copy(data);
        filterProducts(data, function () {
          scope.pageChanged(1);
        });
      });

      /*
       * @pageChanged
       * - when a page is changes splice the array to show offset products
       */

      scope.pageChanged = function (pageNo) {
        scope.currentProductPage = pageNo;
        if (scope.products) {
          var begin = ((scope.currentProductPage - 1) * scope.component.numtodisplay);
          var numDisplay = scope.component.numtodisplay;
          //check if set to 0 and change to all products
          if (numDisplay === 0) {
            numDisplay = scope.products.length;
          }
          var end = begin + numDisplay;
          scope.filteredProducts = scope.products.slice(begin, end);
        }
      };
    }
  };
}]);

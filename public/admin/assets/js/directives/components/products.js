'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
app.directive('productsComponent', ['$log', '$filter', 'PaymentService', 'ProductService', 'AccountService', 'UserService', function ($log, $filter, PaymentService, ProductService, AccountService, UserService) {
  return {
    scope: {
      component: '=',
      version: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs, ctrl) {
      scope.isEditing = true;
      scope.checkoutModalState = 1;
      scope.currentProductPage = 1;

      scope.$watch('component.numtodisplay', function (newValue, oldValue) {
        if (newValue) {
          scope.component.numtodisplay = newValue;
          scope.pageChanged(scope.currentProductPage);
        }
      });

      function filterProduct(element) {
        var _tags = scope.component.productTags;
        if (_tags) {
          if (element.tags && _tags.length > 0) {
            if (_.intersection(_tags, element.tags).length > 0) {
              return element;
            }
          }
        }
        return element;
      }

      function filterProducts(data) {
        var _filteredProducts = [];
        _.each(data, function (product) {
          if (filterProduct(product)) {
            _filteredProducts.push(product);
          }
        });
        scope.products = angular.copy(_filteredProducts);
        scope.filteredProducts = _filteredProducts;
      }

      scope.$watch('component.productTags', function (newValue, oldValue) {
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

      // scope.$watch('currentProductPage', function (newValue, oldValue) {
      //   console.log('currentProductPage >>> ', newValue);
      // });

      scope.pageChanged = function (pageNo) {
        $log.log('Page changed to: ' + pageNo);
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

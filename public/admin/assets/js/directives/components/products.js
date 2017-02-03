'use strict';
/*global app, moment*/
app.directive('productsComponent', ['ProductService', '$location', '$timeout', 'AccountService', function (ProductService, $location, $timeout, AccountService) {
  return {
    scope: {
      component: '=',
      ssbEditor: '='
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
        var activeProducts =_.filter(_filteredProducts, function(product){ return product.type !== 'DONATION'})
        scope.products = activeProducts;
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
          scope.component.numtodisplay = parseInt(newValue) > 0 ? parseInt(newValue) : 0;
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

      ProductService.getActiveProducts(function (data) {
        scope.originalProducts = angular.copy(data);
        filterProducts(data, function () {
          scope.pageChanged(1);
        });
      });

      AccountService.getAccount(function(account) {
        scope.account = account;
        scope.paypalInfo = null;
        scope.stripeInfo = null;
        scope.account.credentials.forEach(function(cred, index) {
            if (cred.type == 'stripe') {
                scope.stripeInfo = cred;
            }
        });
        scope.paypalInfo = scope.account.commerceSettings.paypal;
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
          $timeout(function () {
            $(window).trigger('resize');
            console.log("Products loaded");
          }, 0);
        }
      };

      scope.addProducts = function()
      {
        $location.path('/commerce/products');
      }

      scope.isImage = function(src) {
          var isIcon = src && src.indexOf("fa-") === 0;
          return !isIcon;
      }

      scope.gridStyle = function(cell){
        var styleString = ' ';
        if (cell && cell.bg && cell.bg.color) {
            styleString += 'background-color: ' + cell.bg.color + "!important;";
        } 
        return styleString;
      }

      
      scope.titleStyle = function(style){
        var styleString = ' ';
        if(style){
          if (style.titleFontFamily) {
            styleString += 'font-family: ' + style.titleFontFamily + "!important;";
          }
          if (style.titleTextSize) {
            styleString += 'font-size: ' + style.titleTextSize + "px !important;";
          }
          if (style.titleTextColor) {
            styleString += 'color: ' + style.titleTextColor + "!important;";
          }
        }
         
        return styleString;
      }

      scope.priceStyle = function(style){
        var styleString = ' ';
        if(style){
          if (style.priceFontFamily) {
            styleString += 'font-family: ' + style.priceFontFamily + "!important;";
          }
          if (style.titleTextSize) {
            styleString += 'font-size: ' + style.priceTextSize + "px !important;";
          }
          if (style.priceTextColor) {
            styleString += 'color: ' + style.priceTextColor + "!important;";
          }
        }
        return styleString;
      }
    }
  };
}]);

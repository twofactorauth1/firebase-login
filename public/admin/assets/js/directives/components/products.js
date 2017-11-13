'use strict';
/*global app, moment*/
app.directive('productsComponent', ['ProductService', '$location', '$timeout', '$filter', 'AccountService', function (ProductService, $location, $timeout, $filter, AccountService) {
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
      scope.paging = {
          currentProductPage : 1
      }

      scope.currentPath = angular.copy($location);
      
      scope.productSortOrder = {
          order: "most_recent"
      }
      /*
       * @filterTags
       * - if component has tags filter them or return the _product
       */

      function filterTags(_product) {
        var _tags = scope.component.productTags;
        
        if (_tags && _tags.length > 0) {
          _tags = _.map(_tags, function(tag){return tag.toLowerCase()});
          if (_product.tags) {
            var _productTags = _.map(_product.tags, function(tag){return tag.toLowerCase()});
            if (_.intersection(_tags, _productTags).length > 0) {
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
              product.actualSalesPrice = product.sale_price;
            }
            else{
              product.actualSalesPrice = product.regular_price;
            }
            _filteredProducts.push(product);
          }
        });
        var activeProducts =_.filter(_filteredProducts, function(product){ return product.type !== 'DONATION'})
        if(scope.productSortOrder.order){
          var sortOrder = "created.date";
          var sortDir = true;
          if(scope.productSortOrder.order == "price_low"){
              sortOrder = "actualSalesPrice";
              sortDir = false;
          }
          else if(scope.productSortOrder.order == "price_high"){
              sortOrder = "actualSalesPrice";
              sortDir = true;
          }
          scope.products = $filter('orderBy')(activeProducts, [sortOrder, "created.date"], sortDir);
        }
        else{
          scope.products = activeProducts;
        }  
        
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

      scope.changeProductSortOrder = function(){
          filterProducts(scope.originalProducts, function() {
              scope.pageChanged(1);
          });
      }

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
        scope.paging.currentProductPage = pageNo;
        if (scope.products) {
          var begin = ((scope.paging.currentProductPage - 1) * scope.component.numtodisplay);
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
          if (style.priceTextSize) {
            styleString += 'font-size: ' + style.priceTextSize + "px !important;";
          }
          if (style.priceTextColor) {
            styleString += 'color: ' + style.priceTextColor + "!important;";
          }
        }
        return styleString;
      }

      scope.descriptionStyle = function(style){
        var styleString = ' ';
        if(style){
          if (style.descriptionFontFamily) {
            styleString += 'font-family: ' + style.descriptionFontFamily + "!important;";
          }
          if (style.descriptionTextSize) {
            styleString += 'font-size: ' + style.descriptionTextSize + "px !important;";
          }
          if (style.descriptionTextColor) {
            styleString += 'color: ' + style.descriptionTextColor + "!important;";
          }
        }
        return styleString;
      }

      scope.cartButtonStyle = function(style){
        var styleString = ' ';
        if(style){
          if (style.addToCartBtnBgColor) {
            styleString += 'background-color: ' + style.addToCartBtnBgColor + "!important;";
            styleString += 'border-color: ' + style.addToCartBtnBgColor + "!important;";
          }
          if (style.addToCartBtnTxtColor) {
            styleString += 'color: ' + style.addToCartBtnTxtColor + "!important;";
          }
        }
         
        return styleString;
      }

      scope.productSortOrderOptions = [
          {
              label: "Most Recent",
              data: "most_recent"
          },
          {
              label: "Price: Low to High",
              data: "price_low"
          },
          {
              label: "Price: High to Low",
              data: "price_high"
          }
      ]
    }
  };
}]);

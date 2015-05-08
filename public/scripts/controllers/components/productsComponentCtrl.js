'use strict';
/*global mainApp, moment, angular, cartData*/
/*jslint unparam:true*/
mainApp.controller('ProductsComponentCtrl', ['$scope', 'productService', 'userService', 'orderService', 'paymentService', 'cartService',
  function ($scope, ProductService, UserService, OrderService, PaymentService, cartService) {

    $scope.checkoutModalState = 1;
    /*
     * @getAllProducts
     * - get products for products and pricing table components
     */

    ProductService.getAllProducts(function (data) {
      $scope.products = data;
    });

    /*
     * @updateSelectedProduct
     * - when product details is clicked update selected product
     */

    $scope.updateSelectedProduct = function (product) {
      product.attributes = $scope.selectedProductAttributes(product);
      $scope.selectedProduct = product;
    };

    // $scope.selectDisabled = function(index) {
    //     if (index > 0) {
    //         return true;
    //     }
    //     return false;
    // };

    $scope.selectChanged = function (index) {
      var selectedAttributes = $scope.selectedProduct.attributes;
      var allselected = false;
      _.each(selectedAttributes, function (attribute, i) {
        if (attribute.selected) {
          allselected = true;
        } else {
          allselected = false;
        }
      });

      if (allselected) {
        console.log('updating price');
        // $scope.updatePrice();
      } else {
        console.log('all not selected');
      }
    };

    /*
     * @selectedProductAttributes
     * - get attributes availiable for the selected product
     */

    $scope.selectedProductAttributes = function (product) {
      var attributes;
      if (product) {
        var formattedAttributes = [];
        _.each(product.variations, function (variation) {
          _.each(variation.attributes, function (attribute) {
            var foundAttr = _.find(formattedAttributes, function (formAttr) {
              return formAttr.name === attribute.name;
            });
            if (foundAttr) {
              if (foundAttr.values.indexOf(attribute.option) < 0) {
                foundAttr.values.push(attribute.option);
              }
            } else {
              var _attribute = {
                name: attribute.name,
                values: [attribute.option]
              };
              formattedAttributes.push(_attribute);
            }
          });
        });
        attributes = formattedAttributes;
      } else {
        attributes = [];
      }
      return attributes;
    };

    /*
     * @updatePrice
     * - update the price when a matching variation is found based on the attribute selection
     */

    $scope.updatePrice = function () {

      var variations = $scope.selectedProduct.variations;
      var selectedAttributes = $scope.selectedProduct.attributes;

      var _matchedVariation = _.find(variations, function (_variation) {
        var match = true;
        _.each(selectedAttributes, function (attr) {
          var matchedVarAttr = _.find(_variation.attributes, function (var_attr) {
            return var_attr.name === attr.name;
          });
          if (matchedVarAttr.option !== attr.selected) {
            match = false;
          }
        });
        return match;
      });

      if (_matchedVariation) {
        $scope.matchedVariation = _matchedVariation;
      } else {
        console.warn('no matching variation');
      }
    };

    /*
     * @addDetailsToCart
     * - add product to cart
     */

    $scope.addDetailsToCart = function (product, variation) {
      var productMatch = '';
      if (variation) {
        productMatch = variation;
        productMatch.variation = true;
        productMatch.name = product.name;
      } else {
        productMatch = _.find($scope.products, function (item) {
          return item._id === product._id;
        });
        productMatch.clicked = true;
      }

      if (!$scope.cartDetails) {
        $scope.cartDetails = [];
      }
      if (!productMatch.quantity) {
        productMatch.quantity = 1;
      }
      var match = _.find($scope.cartDetails, function (item) {
        return item._id === productMatch._id;
      });
      if (match) {
        match.quantity = parseInt(match.quantity, 10) + 1;
      } else {
        cartService.addItem(productMatch);
        $scope.cartDetails.push(productMatch);
      }

      console.log('cart ', cartService.getCartItems());

      $scope.calculateTotalChargesfn();
    };

    /*
     * @removeFromCart
     * - remove product to cart
     */

    $scope.removeFromCart = function (product) {
      var filtered = _.filter($scope.cartDetails, function (item) {
        return item._id !== product._id;
      });
      var productMatch = _.find($scope.products, function (item) {
        return item._id === product._id;
      });
      productMatch.clicked = false;
      $scope.cartDetails = filtered;
      $scope.calculateTotalChargesfn();
    };

    $scope.checkCardNumber = function () {
      var card_number = angular.element('#number')
        .val();
      if (!card_number) {
        angular.element("#card_number .error")
          .html("Card Number Required");
        angular.element("#card_number")
          .addClass('has-error');
        angular.element("#card_number .glyphicon")
          .addClass('glyphicon-remove');
      } else {
        angular.element("#card_number .error")
          .html("");
        angular.element("#card_number")
          .removeClass('has-error')
          .addClass('has-success');
        angular.element("#card_number .glyphicon")
          .removeClass('glyphicon-remove')
          .addClass('glyphicon-ok');
      }
    };

    $scope.basicInfo = {};

    $scope.validateBasicInfo = function () {
      console.log('validateBasicInfo >>> ', $scope.basicInfo);

      // check to make sure the form is completely valid
      if (isValid) {
        alert('our form is amazing');
        checkoutModalState = 3
      }

    };
    /*
     * @calculateTotalChargesfn
     * - calculate the total based on products in cart
     */

    $scope.calculateTotalChargesfn = function () {
      var subTotal = 0;
      // var totalTax = 0;
      // var total = 0;
      _.each($scope.cartDetails, function (item) {
        subTotal = parseFloat(subTotal) + (parseFloat(item.regular_price) * item.quantity);
      });
      $scope.subTotal = subTotal;
      $scope.totalTax = parseFloat(($scope.subTotal * 8) / 100);
      $scope.total = $scope.subTotal + $scope.totalTax;
    };

    /*
     * @makeCartPayment
     * - make the final payment for checkout
     */

    $scope.makeCartPayment = function () {
      $scope.checkoutModalState = 4;
      console.log('makeCartPayment >>> ');
      var expiry = angular.element('#expiry')
        .val()
        .split("/");
      var exp_month = expiry[0].trim();
      var exp_year = "";
      if (expiry.length > 1) {
        exp_year = expiry[1].trim();
      }
      var cardInput = {
        number: angular.element('#number')
          .val(),
        cvc: angular.element('#cvc')
          .val(),
        exp_month: exp_month,
        exp_year: exp_year
      };

      if (!cardInput.number || !cardInput.cvc || !cardInput.exp_month || !cardInput.exp_year) {
        $scope.checkCardNumber();
        $scope.checkCardExpiry();
        $scope.checkCardCvv();
        $scope.checkoutModalState = 3;
        return;
      }

      if (!cardInput.number || !cardInput.cvc || !cardInput.exp_month || !cardInput.exp_year) {
        $scope.checkoutModalState = 3;
        return;
      }

      var contact = $scope.newContact;
      if (isEmpty(contact.first) || isEmpty(contact.last) || isEmpty(contact.first) || isEmpty(contact.details[0].emails[0].email) || isEmpty(contact.details[0].phones[0].number)) {
        $scope.checkoutModalState = 2;
        return;
      }

      function isEmpty(str) {
        return (!str || 0 === str.length);
      }

      PaymentService.getStripeCardToken(cardInput, function (token) {
        console.log('getStripeCardToken >>>');
        // PaymentService.saveCartDetails(token, parseInt($scope.total * 100), function (data) {
        //     console.log('card details ', data);
        // });

        console.log('$scope.newContact.first >>> ', $scope.cartDetails);
        // Is this checking to see if the customer already exists
        UserService.postContact($scope.newContact, function (customer, err) {
          var order = {
            "customer_id": customer._id,
            "session_id": null,
            "status": "processing",
            "cart_discount": 0,
            "total_discount": 0,
            "total_shipping": 0,
            "total_tax": parseInt($scope.totalTax).toFixed(2),
            "shipping_tax": 0,
            "cart_tax": 0,
            "currency": "usd",
            "line_items": [], // { "product_id": 31, "quantity": 1, "variation_id": 7, "subtotal": "20.00", "tax_class": null, "sku": "", "total": "20.00", "name": "Product Name", "total_tax": "0.00" }
            "total_line_items_quantity": $scope.cartDetails.length,
            "payment_details": {
              "method_title": 'Credit Card Payment', //Check Payment, Credit Card Payment
              "method_id": 'cc', //check, cc
              "card_token": token, //Stripe card token if applicable
              "charge_description": null, //description of charge if applicable
              "statement_description": null, //22char string for cc statement if applicable
              "paid": true
            },
            "shipping_methods": "", // "Free Shipping",
            "shipping_address": {
              "first_name": customer.first,
              "last_name": customer.last,
              "phone": customer.details[0].phones[0].number,
              "city": customer.details[0].addresses[0].city,
              "country": "US",
              "address_1": customer.details[0].addresses[0].address,
              "company": "",
              "postcode": customer.details[0].addresses[0].zip,
              "email": customer.details[0].emails[0].email,
              "address_2": customer.details[0].addresses[0].address_2,
              "state": customer.details[0].addresses[0].state
            },
            "billing_address": {
              "first_name": customer.first,
              "last_name": customer.last,
              "phone": customer.details[0].phones[0].number,
              "city": customer.details[0].addresses[0].city,
              "country": "US",
              "address_1": customer.details[0].addresses[0].address,
              "company": "",
              "postcode": customer.details[0].addresses[0].zip,
              "email": customer.details[0].emails[0].email,
              "address_2": customer.details[0].addresses[0].address_2,
              "state": customer.details[0].addresses[0].state
            },
            "notes": []
          };

          _.each($scope.cartDetails, function (item) {
            var totalAmount = (parseInt(item.regular_price) * parseInt(item.quantity)).toFixed(2);
            console.log('totalAmount >>> ', totalAmount);
            var _item = {
              "product_id": item._id,
              "quantity": parseInt(item.quantity).toFixed(2),
              "regular_price": parseInt(item.regular_price),
              "variation_id": '',
              "tax_class": null,
              "sku": "",
              "total": totalAmount,
              "name": item.name,
              "total_tax": "0.00"
            };
            order.line_items.push(_item);
          });

          OrderService.createOrder(order, function (newOrder) {
            $scope.checkoutModalState = 5;
            $scope.cartDetails = [];
            _.each($scope.products, function (product) {
              product.clicked = false;
            });
            $scope.subTotal = 0;
            $scope.totalTax = 0;
            $scope.total = 0;
            console.log('newOrder >>> ', newOrder);
            // PaymentService.saveCartDetails(token, parseInt($scope.total * 100), function(data) {});
          });
        });
      });

    };

    angular.element('#cart-checkout-modal')
      .on('hidden.bs.modal', function () {
        console.log('checkoutModalState ', $scope.checkoutModalState);
        if ($scope.checkoutModalState === 5) {
          $scope.checkoutModalState = 1;
        }
      });

    $scope.currentProductPage = 1;

    $scope.setPage = function (pageNo) {
      $scope.currentProductPage = pageNo;
    };

    $scope.pageChanged = function () {
      $log.log('Page changed to: ' + $scope.currentProductPage);
    };

    $scope.getProductOffset = function (currentProductPage, numtodisplay) {
      return (currentProductPage * numtodisplay) - numtodisplay;
    };

    /*
     * @variationAttributeExists
     * - check variation attributes to see if they exist
     */

    $scope.variationAttributeExists = function (value) {
      var variations = $scope.selectedProduct.variations;
      var matchedAttribute = false;
      _.each(variations, function (_variation) {
        _.find(_variation.attributes, function (_attribute) {
          if (_attribute.option === value) {
            matchedAttribute = true;
          }
        });
      });
      return matchedAttribute;
    };
  }
]);

mainApp.service('cartService', function () {
  var cartData = {};

  cartData.items = [];

  this.getCartItems = function () {
    return cartData.items;
  };

  this.addItem = function (item) {
    cartData.items.push(item);
  };

});

'use strict';
/*global mainApp, moment, angular*/
/*jslint unparam:true*/
mainApp.controller('ProductsComponentCtrl', ['$scope', 'productService', 'userService', 'orderService', 'paymentService',
  function ($scope, ProductService, UserService, OrderService, PaymentService) {

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
      console.log('product.attributes ', product.attributes);
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
        console.log('attribute ', attribute);
        if (attribute.selected) {
          allselected = true;
        } else {
          console.log('attribute.selected ', i);
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
        console.log('formattedAttributes ', formattedAttributes);
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
      console.log('variation exists >>> ', variation);
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
        match.quantity = parseInt(match.quantity) + 1;
      } else {
        $scope.cartDetails.push(productMatch);
      }
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
      console.log('cartDetails >>> ', $scope.cartDetails);
      var expiry = angular.element('#expiry').val().split("/");
      var exp_month = expiry[0].trim();
      var exp_year = "";
      if (expiry.length > 1) {
        exp_year = expiry[1].trim();
      }
      var cardInput = {
        number: angular.element('#number').val(),
        cvc: angular.element('#cvc').val(),
        exp_month: exp_month,
        exp_year: exp_year
      };
      console.log('cardInput >>> ', cardInput);

      if (!cardInput.number || !cardInput.cvc || !cardInput.exp_month || !cardInput.exp_year) {
        $scope.checkCardNumber();
        $scope.checkCardExpiry();
        $scope.checkCardCvv();
        return;
      }

      if (!cardInput.number || !cardInput.cvc || !cardInput.exp_month || !cardInput.exp_year) {
        return;
      }

      PaymentService.getStripeCardToken(cardInput, function (token) {
        // PaymentService.saveCartDetails(token, parseInt($scope.total * 100), function (data) {
        //     console.log('card details ', data);
        // });

          if ($scope.newContact.first !== undefined) {
            // Is this checking to see if the customer already exists
            UserService.postContact($scope.newContact, function (customer, err) {

              var order = {
                "customer_id": customer._id,
                "session_id": null,
                "completed_at": null,
                "status": "processing",
                "total": 0.0,
                "cart_discount": 0.0,
                "total_discount": 0.0,
                "total_shipping": 0.0,
                "total_tax": 0.0,
                "shipping_tax": 0.0,
                "cart_tax": 0.0,
                "currency": "usd",
                "line_items": [{
                  "product_id": 31,
                  "quantity": 1,
                  "variation_id": 7,
                  "subtotal": "20.00",
                  "tax_class": null,
                  "sku": "",
                  "total": "20.00",
                  "name": "Product Name",
                  "total_tax": "0.00"
                }],
                "total_line_items_quantity": 0,
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

              console.log('order ', order);

              OrderService.createOrder(order, function (newOrder) {
                console.log('newOrder >>> ', newOrder);
                // PaymentService.saveCartDetails(token, parseInt($scope.total * 100), function(data) {});
              });
            });
          }
      });

    };

    /*
     * @variationAttributeExists
     * - check variation attributes to see if they exist
     */

    $scope.variationAttributeExists = function (value) {
      var variations = $scope.selectedProduct.variations;
      var matchedAttribute = false;
      _.each(variations, function (_variation) {
        var _matchedVariation = _.find(_variation.attributes, function (_attribute) {
          if (_attribute.option === value) {
            matchedAttribute = true;
          }
        });
      });
      return matchedAttribute;
    };
  }
]);

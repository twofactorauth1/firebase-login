'use strict';
/*global app*/
app.directive('productsComponent', ['paymentService', 'productService', 'accountService', 'cartService', 'userService', 'orderService', 'formValidations', function (PaymentService, ProductService, AccountService, cartService, UserService, OrderService, formValidations) {
  return {
    require: [],
    scope: {
      component: '=',
      version: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope) {
      //assign and hold the checkout modal state
      scope.checkoutModalState = 1;
      //default newContact object for checkout modal
      scope.newContact = {};
      //assign and hold the currentProductPage for pagination
      scope.currentProductPage = 1;

      // initializations
      scope.showTax = true;
      scope.showNotTaxed = false; // Some items are not taxed when summing

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
       * @filterProducts
       * - filter the products and assign them to the scope
       */

      function filterProducts(data, fn) {
        var _filteredProducts = [];
        _.each(data, function (product) {
          if (filterTags(product)) {
            _filteredProducts.push(product);
          }
        });
        scope.products = _filteredProducts;
        if (fn) {
          fn();
        }
      }

      /*
       * @getAllProducts
       * - get all products, set originalProducts obj and filter
       */

      ProductService.getAllProducts(function (data) {
        scope.originalProducts = data;
        filterProducts(scope.originalProducts, function () {
          scope.pageChanged(1);
        });
      });


      /*
       * @getTax
       * - fetch the tax for any given postcode and calculate percent
       */

      scope.getTax = function (postcode, fn) {
        ProductService.getTax(postcode, function (taxdata) {
          if (taxdata.results[0] && taxdata.results[0].taxSales) {
            scope.showTax = true;
            if (taxdata.results[0].taxSales === 0) {
              taxdata.results[0].taxSales = 1;
            }
            scope.taxPercent = parseFloat(taxdata.results[0].taxSales * 100).toFixed(0);
            if (fn) {
              fn(scope.taxPercent);
            }
          } else {
            scope.invalidZipCode = true;
            scope.showTax = false;
          }
        });
      };

      /*
       * @getUserPreferences
       * - fetch the user tax preferences for calculations
       */

      scope.taxPercent = 1; //set at 1 to not disturb multiplication
      scope.showTax = false;

      AccountService(function (err, account) {
        if (err) {
          console.log('Controller:MainCtrl -> Method:accountService Error: ' + err);
        } else {
          console.log('commerceSettings ', account.commerceSettings);
          scope.settings = account.commerceSettings;
          if (scope.settings && scope.settings.taxes && scope.settings.taxbased === 'business_location') {
            if (account.business.addresses[0].zip) {
              console.log('getting tax ', account.business.addresses[0].zip);
              if (account.business.addresses[0].zip) {
                scope.getTax(account.business.addresses[0].zip);
              }
            }
          }
        }
      });

      /*
       * @isValidUSZip
       * - validate the US Zip Code
       */

      //TODO: Add country check
      function isValidUSZip(sZip) {
        var regex = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
        return regex.test(sZip);
      }

      /*
       * @shippingPostCodeChanged
       * - when a shipping zipcode is modified update the taxpercent if customer_shipping is the taxbased
       */

      scope.invalidZipCode = false;
      scope.shippingPostCodeChanged = function (postcode) {
        console.log('isValidUSZip(postcode) ', isValidUSZip(postcode));
        scope.emptyZipCode = false;
        scope.invalidZipCode = false;
        if (!postcode) {
          scope.emptyZipCode = false;
          scope.emptyZipCode = true;
          return;
        }
        if (isValidUSZip(postcode)) {
          if (postcode && scope.settings.taxes && scope.settings.taxbased !== 'business_location') {
            scope.calculatingTax = true;
            scope.invalidZipCode = false;
            scope.showTax = false;
            scope.getTax(postcode, function () {
              scope.calculatingTax = false;
              scope.showTax = true;
              scope.calculateTotalChargesfn();
            });
            console.log('shipping postcode changed ', postcode);
          }
        } else {
          scope.invalidZipCode = true;
          scope.showTax = false;
        }
      };

      /*
       * @checkBillingFirst,checkBillingLast, checkBillingEmail, checkBillingAddress, checkBillingState, checkBillingCity, checkBillingPhone, validateAddressDetails
       * - validatitions for checkout
       */

      //TODO: change to $isValid angular style
      scope.checkBillingFirst = function (first) {
        if (!first) {
          scope.emptyFirstName = true;
        } else {
          scope.emptyFirstName = false;
        }
      };

      scope.checkBillingLast = function (last) {
        if (!last) {
          scope.emptyLastName = true;
        } else {
          scope.emptyLastName = false;
        }
      };

      scope.checkBillingEmail = function (email) {
        if (!email) {
          scope.emptyEmail = true;
          scope.invalidEmail = false;
        } else {
          scope.emptyEmail = false;
          scope.invalidEmail = !formValidations.email.test(email);
        }
      };

      scope.checkBillingAddress = function (address) {
        if (!address) {
          scope.emptyAddress = true;
        } else {
          scope.emptyAddress = false;
        }
      };

      scope.checkBillingState = function (state) {
        if (!state) {
          scope.emptyState = true;
        } else {
          scope.emptyState = false;
        }
      };

      scope.checkBillingCity = function (city) {
        if (!city) {
          scope.emptyCity = true;
        } else {
          scope.emptyCity = false;
        }
      };

      scope.checkBillingPhone = function (phone) {
        if (!phone) {
          scope.invalidPhone = false;
        } else {
          scope.invalidPhone = !formValidations.phone.test(phone);
        }
      };

      scope.validateAddressDetails = function (details, email, phone) {
        scope.emptyFirstName = false;
        scope.emptyLastName = false;
        scope.emptyEmail = false;
        scope.emptyAddress = false;
        scope.emptyState = false;
        scope.emptyCity = false;
        scope.invalidZipCode = false;
        scope.emptyZipCode = false;
        scope.inValidEmail = false;
        scope.inValidPhone = false;
        var first, last, address, state, city, zip;
        if (scope.newContact) {
          first = scope.newContact.first;
          last = scope.newContact.last;
        }
        if (details) {
          address = details.address;
          state = details.state;
          city = details.city;
          zip = details.zip;
        }

        scope.checkBillingFirst(first);
        scope.checkBillingLast(last);
        scope.checkBillingEmail(email);
        scope.checkBillingAddress(address);
        scope.checkBillingState(state);
        scope.checkBillingCity(city);
        scope.checkBillingPhone(phone);
        scope.shippingPostCodeChanged(zip);

        if (scope.emptyFirstName || scope.emptyLastName || scope.emptyEmail || scope.emptyAddress || scope.emptyState || scope.emptyCity || scope.invalidZipCode || scope.emptyZipCode || scope.inValidEmail || scope.inValidPhone) {
          return;
        }
        scope.checkoutModalState = 3;
      };

      /*
       * @updateSelectedProduct
       * - when product details is clicked update selected product
       */

      // scope.updateSelectedProduct = function (product) {
      //   product.attributes = scope.selectedProductAttributes(product);
      //   scope.selectedProduct = product;
      // };

      /*
       * @selectChanged
       * - one of the selected attributes has changed
       */

      // scope.selectChanged = function () {
      //   var selectedAttributes = scope.selectedProduct.attributes;
      //   var allselected = false;
      //   _.each(selectedAttributes, function (attribute) {
      //     if (attribute.selected) {
      //       allselected = true;
      //     } else {
      //       allselected = false;
      //     }
      //   });
      //   if (allselected) {
      //     console.log('updating price');
      //     // scope.updatePrice();
      //   } else {
      //     console.log('all not selected');
      //   }
      // };

      /*
       * @selectedProductAttributes
       * - get attributes availiable for the selected product
       */

      // scope.selectedProductAttributes = function (product) {
      //   var attributes;
      //   if (product) {
      //     var formattedAttributes = [];
      //     _.each(product.variations, function (variation) {
      //       _.each(variation.attributes, function (attribute) {
      //         var foundAttr = _.find(formattedAttributes, function (formAttr) {
      //           return formAttr.name === attribute.name;
      //         });
      //         if (foundAttr) {
      //           if (foundAttr.values.indexOf(attribute.option) < 0) {
      //             foundAttr.values.push(attribute.option);
      //           }
      //         } else {
      //           var _attribute = {
      //             name: attribute.name,
      //             values: [attribute.option]
      //           };
      //           formattedAttributes.push(_attribute);
      //         }
      //       });
      //     });
      //     attributes = formattedAttributes;
      //   } else {
      //     attributes = [];
      //   }
      //   return attributes;
      // };

      /*
       * @updatePrice
       * - update the price when a matching variation is found based on the attribute selection
       */

      scope.updatePrice = function () {
        var variations = scope.selectedProduct.variations;
        var selectedAttributes = scope.selectedProduct.attributes;
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
          scope.matchedVariation = _matchedVariation;
        } else {
          console.warn('no matching variation');
        }
      };

      /*
       * @addDetailsToCart
       * - add product to cart
       */

      scope.addDetailsToCart = function (product, variation) {
        var productMatch = '';
        if (variation) {
          productMatch = variation;
          productMatch.variation = true;
          productMatch.name = product.name;
        } else {
          productMatch = _.find(scope.products, function (item) {
            return item._id === product._id;
          });
          productMatch.clicked = true;
        }
        if (!scope.cartDetails) {
          scope.cartDetails = [];
        }
        if (!productMatch.quantity) {
          productMatch.quantity = 1;
        }
        var match = _.find(scope.cartDetails, function (item) {
          return item._id === productMatch._id;
        });
        if (match) {
          match.quantity = parseInt(match.quantity, 10) + 1;
        } else {
          cartService.addItem(productMatch);
          scope.cartDetails.push(productMatch);
        }
        scope.calculateTotalChargesfn();
      };

      /*
       * @removeFromCart
       * - remove product to cart
       */

      scope.removeFromCart = function (product) {
        var filtered = _.filter(scope.cartDetails, function (item) {
          return item._id !== product._id;
        });
        var productMatch = _.find(scope.products, function (item) {
          return item._id === product._id;
        });
        productMatch.clicked = false;
        scope.cartDetails = filtered;
        scope.calculateTotalChargesfn();
      };

      scope.checkCardNumber = function () {
        var card_number = angular.element('#number').val();
        if (!card_number) {
          angular.element("#card_number .error").html("Card Number Required");
          angular.element("#card_number").addClass('has-error');
          angular.element("#card_number .glyphicon").addClass('glyphicon-remove');
        } else {
          angular.element("#card_number .error").html("");
          angular.element("#card_number").removeClass('has-error').addClass('has-success');
          angular.element("#card_number .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
        }
      };

      /*
       * @validateBasicInfo
       * -
       */

      scope.basicInfo = {};
      scope.validateBasicInfo = function () {
        console.log('validateBasicInfo >>>');
        // check to make sure the form is completely valid
        // if (isValid) {
        //   alert('our form is amazing');
        //   checkoutModalState = 3
        // }
      };

      /*
       * @calculateTotalChargesfn
       * - calculate the total based on products in cart
       */

      scope.calculateTotalChargesfn = function () {
        var _subTotal = 0;
        var _totalTax = 0;
        // var total = 0;
        _.each(scope.cartDetails, function (item) {
          _subTotal = parseFloat(_subTotal) + (parseFloat(item.regular_price) * item.quantity);
          if (item.taxable && scope.showTax) {
            if (scope.taxPercent === 0) {
              scope.taxPercent = 1;
            }
            _totalTax += (item.regular_price * parseFloat(scope.taxPercent) / 100) * item.quantity;
          }

          if(!item.taxable) {
            scope.showNotTaxed = true;
          }
        });
        scope.subTotal = _subTotal;
        scope.totalTax = _totalTax;
        scope.total = _subTotal + _totalTax;
      };

      /*
       * @makeCartPayment
       * - make the final payment for checkout
       */

      function isEmpty(str) {
        return (!str || 0 === str.length);
      }

      /*
       * @formatNum
       * -
       */

      function formatNum(num) {
        return parseFloat(Math.round(num * 100) / 100).toFixed(2);
      }

      /*
       * @makeCartPayment
       * -
       */

      scope.makeCartPayment = function () {
        scope.checkoutModalState = 4;
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
        if (!cardInput.number || !cardInput.cvc || !cardInput.exp_month || !cardInput.exp_year) {
          scope.checkCardNumber();
          scope.checkCardExpiry();
          scope.checkCardCvv();
          scope.checkoutModalState = 3;
          return;
        }
        if (!cardInput.number || !cardInput.cvc || !cardInput.exp_month || !cardInput.exp_year) {
          scope.checkoutModalState = 3;
          return;
        }
        var contact = scope.newContact;
        if (isEmpty(contact.first) || isEmpty(contact.last) || isEmpty(contact.first) || isEmpty(contact.details[0].emails[0].email) || isEmpty(contact.details[0].phones[0].number)) {
          scope.checkoutModalState = 2;
          return;
        }


        PaymentService.getStripeCardToken(cardInput, function (token) {
          // PaymentService.saveCartDetails(token, parseInt(scope.total * 100), function (data) {
          //     console.log('card details ', data);
          // });
          // Is this checking to see if the customer already exists
          var _formattedDetails = [{
            _id: Math.uuid(10),
            emails: [{
              _id: Math.uuid(10),
              email: scope.newContact.details[0].emails[0].email
            }],
            phones: [{
              _id: Math.uuid(10),
              number: scope.newContact.details[0].phones[0].number
            }],
            addresses: [{
              _id: Math.uuid(10),
              address: scope.newContact.details[0].addresses[0].address,
              address2: scope.newContact.details[0].addresses[0].address2,
              state: scope.newContact.details[0].addresses[0].state,
              zip: scope.newContact.details[0].addresses[0].zip,
              country: "US",
              defaultShipping: false,
              defaultBilling: false,
              city: scope.newContact.details[0].addresses[0].city,
              countryCode: "",
              displayName: ""
            }],
          }];
          console.log('scope.newContact ', scope.newContact);
          scope.newContact.details = _formattedDetails;
          console.log('scope.newContact ', scope.newContact);
          UserService.postContact(scope.newContact, function (customer) {
            var order = {
              "customer_id": customer._id,
              "session_id": null,
              "status": "processing",
              "cart_discount": 0,
              "total_discount": 0,
              "total_shipping": 0,
              "total_tax": formatNum(scope.totalTax),
              "shipping_tax": 0,
              "cart_tax": 0,
              "currency": "usd",
              "line_items": [], // { "product_id": 31, "quantity": 1, "variation_id": 7, "subtotal": "20.00", "tax_class": null, "sku": "", "total": "20.00", "name": "Product Name", "total_tax": "0.00" }
              "total_line_items_quantity": scope.cartDetails.length,
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
            _.each(scope.cartDetails, function (item) {
              var totalAmount = item.regular_price * item.quantity;
              var _item = {
                "product_id": item._id,
                "quantity": item.quantity,
                "regular_price": formatNum(item.regular_price),
                "variation_id": '',
                "tax_class": null,
                "sku": "",
                "total": formatNum(totalAmount),
                "name": item.name,
                "total_tax": "0.00"
              };
              order.line_items.push(_item);
            });
            OrderService.createOrder(order, function () {
              scope.checkoutModalState = 5;
              scope.cartDetails = [];
              _.each(scope.products, function (product) {
                product.clicked = false;
              });
              scope.subTotal = 0;
              scope.totalTax = 0;
              scope.total = 0;
              // PaymentService.saveCartDetails(token, parseInt(scope.total * 100), function(data) {});
            });
          });
        });
      };

      /*
       * @
       * -
       */

      angular.element('#cart-checkout-modal').on('hidden.bs.modal', function () {
        if (scope.checkoutModalState === 5) {
          scope.checkoutModalState = 1;
        }
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


      /*
       * @variationAttributeExists
       * - check variation attributes to see if they exist
       */

      scope.variationAttributeExists = function (value) {
        var variations = scope.selectedProduct.variations;
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

      scope.checkCardNumber = function () {
        var card_number = angular.element('#number').val();
        if (!card_number) {
          angular.element("#card_number .error").html("Card Number Required");
          angular.element("#card_number").addClass('has-error');
          angular.element("#card_number .glyphicon").addClass('glyphicon-remove');
        } else {
          angular.element("#card_number .error").html("");
          angular.element("#card_number").removeClass('has-error').addClass('has-success');
          angular.element("#card_number .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
        }
      };

      scope.checkCardExpiry = function () {
        var expiry = angular.element('#expiry').val();
        var card_expiry = expiry.split("/");
        var exp_month = card_expiry[0].trim();
        var exp_year;
        if (card_expiry.length > 1) {
          exp_year = card_expiry[1].trim();
        }

        if (!expiry || !exp_month || !exp_year) {
          if (!expiry) {
            angular.element("#card_expiry .error").html("Expiry Required");
          } else if (!exp_month) {
            angular.element("#card_expiry .error").html("Expiry Month Required");
          } else if (!exp_year) {
            angular.element("#card_expiry .error").html("Expiry Year Required");
          }
          angular.element("#card_expiry").addClass('has-error');
          angular.element("#card_expiry .glyphicon").addClass('glyphicon-remove');
        } else {
          angular.element("#card_expiry .error").html("");
          angular.element("#card_expiry .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
          angular.element("#card_expiry").removeClass('has-error').addClass('has-success');
        }
      };

      scope.checkCardCvv = function () {
        var card_cvc = angular.element('#cvc').val();
        if (!card_cvc) {
          angular.element("#card_cvc .error").html("CVC Required");
          angular.element("#card_cvc").addClass('has-error');
          angular.element("#card_cvc .glyphicon").addClass('glyphicon-remove');
        } else {
          angular.element("#card_cvc .error").html("");
          angular.element("#card_cvc").removeClass('has-error').addClass('has-success');
          angular.element("#card_cvc .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
        }
      };

      scope.checkCoupon = function () {
        console.log('>> checkCoupon');
        var coupon = scope.newAccount.coupon;
        //console.dir(coupon);
        //console.log(scope.newAccount.coupon);
        if (coupon) {
          PaymentService.validateCoupon(coupon, function (data) {
            if (data.id && data.id === coupon) {
              console.log('valid');
              angular.element("#coupon-name .error").html("");
              angular.element("#coupon-name").removeClass('has-error').addClass('has-success');
              angular.element("#coupon-name .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
              scope.couponIsValid = true;
            } else {
              console.log('invalid');
              angular.element("#coupon-name .error").html("Invalid Coupon");
              angular.element("#coupon-name").addClass('has-error');
              angular.element("#coupon-name .glyphicon").addClass('glyphicon-remove');
              scope.couponIsValid = false;
            }
          });
        } else {
          angular.element("#coupon-name .error").html("");
          angular.element("#coupon-name").removeClass('has-error').addClass('has-success');
          angular.element("#coupon-name .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
          scope.couponIsValid = true;
        }
      };

      scope.checkCardName = function () {
        var name = $('#card_name #name').val();
        if (name) {
          $("#card_name .error").html("");
          $("#card_name").removeClass('has-error').addClass('has-success');
          $("#card_name .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
        }
      };
    },
    controller: function ($scope) {
      $scope.setCheckoutState = function (state) {
        $scope.checkoutModalState = state;
      };
    }
  };
}]);

app.service('cartService', function () {
  var cartData = {};
  cartData.items = [];
  this.getCartItems = function () {
    return cartData.items;
  };
  this.addItem = function (item) {
    cartData.items.push(item);
  };
});

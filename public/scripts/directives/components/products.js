'use strict';
/*global app*/
app.directive('productsComponent', ['$timeout', 'paymentService', 'productService', 'accountService', 'CartDetailsService', 'userService', 'orderService', 'formValidations', '$routeParams', '$location', 'ENV', '$sce', 'localStorageService', '$modal', function($timeout, PaymentService, ProductService, AccountService, CartDetailsService, UserService, OrderService, formValidations, $routeParams, $location, ENV, $sce, localStorageService, $modal) {
    return {
        require: [],
        scope: {
            component: '='
        },
        templateUrl: '/components/component-wrap.html',
        link: function(scope, element) {
            scope.showPaypalLoading = false;
            scope.showPaypalErrorMsg = false;
            scope.order = null;
            //cookie data fetch

            var cookieKey = 'cart_cookie_' + scope.component._id;
            var orderCookieKey = 'order_cookie_' + scope.component._id;
            var cookieData = localStorageService.get(cookieKey);
            var orderCookieData = localStorageService.get(orderCookieKey);

            //assign and hold the checkout modal state
            scope.checkoutModalState = 1;
            //default newContact object for checkout modal
            scope.newContact = {};
            //assign and hold the currentProductPage for pagination
            scope.currentProductPage = 1;

            

            // initializations
            scope.showTax = false;
            scope.showNotTaxed = false; // Some items are not taxed when summing
            scope.hasSubscriptionProduct = false;
            scope.paypalURL = $sce.trustAsResourceUrl(ENV.paypalCheckoutURL);
            console.log('url:', scope.paypalURL);
            scope.taxPercent = 0;
            initializeCouponDetails();    
            

            scope.calculateTotalChargesfn = CartDetailsService.calculateTotalCharges;



            scope.$watch(function() {
                return CartDetailsService;
            }, function() {
                console.log('watch');
                scope.total = CartDetailsService.total;
                scope.subTotal = CartDetailsService.subTotal;
                scope.totalTax = CartDetailsService.totalTax;
                scope.showTax = CartDetailsService.showTax;
                scope.taxPercent = CartDetailsService.taxPercent;
                scope.showNotTaxed = CartDetailsService.showNotTaxed;
                scope.numItems = CartDetailsService.items.length;
                scope.cartDetails = CartDetailsService.items;
                scope.hasSubscriptionProduct = CartDetailsService.hasSubscriptionProduct;
                scope.totalDiscount = CartDetailsService.totalDiscount;
                scope.totalShipping = CartDetailsService.totalShipping;
                scope.shippingTax = CartDetailsService.shippingTax;
                scope.cartTax = CartDetailsService.cartTax;
                if(scope.cartDetails && scope.cartDetails.length)
                    CartDetailsService.calculateTotalCharges(scope.cart_discount, scope.percent_off);

            }, true);



            scope.setInnerHeight = function(){
                var styleString = " ";
                if($(window).width() < 768){
                    var header = $("#cart-checkout-modal .modal-header").outerHeight();
                    var footer = $("#cart-checkout-modal .modal-footer:not('.ng-hide')").eq(0).outerHeight();
                    var win = $(window).height();
                    var calcHeight = win - (header + footer);
                    styleString += " height:" + calcHeight + "px;";
                    return styleString;
                }
            }


            /*
             * @filterTags
             * - if component has tags filter them or return the _product
             */

            function filterTags(_product) {
                var regex = new RegExp('[\\?&]tags=([^&#]*)');
                var _tags = scope.component.productTags;

                // If additional tags were passed on the URI ('-' delimited), parse and union w/ _product.tags
                var _dynamicTag = regex.exec(location.search);
                if (_dynamicTag && _dynamicTag.length > 1) {
                    _tags = _.union(_tags, _dynamicTag[1].split('-'));
                }

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
                _.each(data, function(product) {
                    if (filterTags(product)) {
                        if (CartDetailsService.checkOnSale(product)) {
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
             * @getAllProducts
             * - get all products, set originalProducts obj and filter
             */

            ProductService.getActiveProducts(function(data) {
                scope.originalProducts = data;
                filterProducts(scope.originalProducts, function() {
                    scope.pageChanged(1);
                });
                cookieProcessFn();
            });



            scope.itemClicked = function(item) {
                var returnValue = false;
                if (item && CartDetailsService.items) {
                    var clicked = _.find(CartDetailsService.items, function(product) {
                        return product._id === item._id;
                    });
                    returnValue = clicked ? true : false;
                }
                return returnValue;
            }

            /*
             * @getTax
             * - fetch the tax for any given postcode and calculate percent
             */

            scope.getTax = function(postcode, fn) {
                ProductService.getTax(postcode, function(taxdata) {
                    if (taxdata.results[0] && taxdata.results[0].taxSales) {
                        CartDetailsService.showTax = true;
                        if ((scope.settings.taxbased === 'business_location') || (!scope.settings.taxnexus) || (scope.settings.taxnexus && scope.settings.taxnexus.length == 0) || (scope.settings.taxnexus && _.pluck(scope.settings.taxnexus, 'text').indexOf(taxdata.results[0].geoState) > -1)) {
                            console.debug('Nexus location - taxable: ', taxdata.results[0].geoState);
                            CartDetailsService.taxPercent = parseFloat(taxdata.results[0].taxSales * 100).toFixed(2);
                        } else {
                            console.debug('Non Nexus location - not taxable: ', taxdata.results[0].geoState);
                            CartDetailsService.taxPercent = 0.00; // Show 0% for non-nexus locations - force think/rethink by client
                        }
                        if (fn) {
                            fn(CartDetailsService.taxPercent);
                        }
                    } else {
                        scope.invalidZipCode = true;
                        CartDetailsService.showTax = false;
                    }
                });
            };

            /*
             * @getUserPreferences
             * - fetch the user tax preferences for calculations
             */



            AccountService(function(err, account) {
                if (err) {
                    console.log('Controller:MainCtrl -> Method:accountService Error: ' + err);
                } else {
                    scope.account = account;
                    scope.paypalInfo = null;
                    scope.stripeInfo = null;

                    scope.account.credentials.forEach(function(cred, index) {
                        if (cred.type == 'stripe') {
                            scope.stripeInfo = cred;
                        }
                    });
                    console.log('Stripe?', scope.stripeInfo);
                    console.log('commerceSettings ', account.commerceSettings);
                    scope.settings = account.commerceSettings;
                    CartDetailsService.commerceSettings = account.commerceSettings;
                    if (scope.settings) {
                        scope.paypalInfo = scope.settings.paypal;
                        if (scope.settings.taxes && scope.settings.taxbased === 'business_location') {
                            if (account.business.addresses && account.business.addresses.length > 0 && account.business.addresses[0].zip) {
                                console.log('getting tax ', account.business.addresses[0].zip);
                                if (account.business.addresses[0].zip) {
                                    scope.getTax(account.business.addresses[0].zip);
                                }
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
                var regex = formValidations.zip;
                return regex.test(sZip);
            }

            /*
             * @shippingPostCodeChanged
             * - when a shipping zipcode is modified update the taxpercent if customer_shipping is the taxbased
             */

            scope.invalidZipCode = false;
            scope.shippingPostCodeChanged = function(postcode, state) {
                console.log('isValidUSZip(postcode) ', isValidUSZip(postcode));
                scope.emptyZipCode = false;
                scope.invalidZipCode = false;
                if (!postcode) {
                    scope.emptyZipCode = false;
                    scope.emptyZipCode = true;
                    return;
                }
                if(state)
                    CartDetailsService.checkIfStateTaxable(state, scope.cart_discount, scope.percent_off);
                if (isValidUSZip(postcode)) {
                    if (postcode && scope.settings.taxes && scope.settings.taxbased !== 'business_location') {
                        scope.calculatingTax = true;
                        scope.invalidZipCode = false;
                        CartDetailsService.showTax = false;
                        scope.getTax(postcode, function() {
                            scope.calculatingTax = false;
                            CartDetailsService.showTax = true;
                            CartDetailsService.calculateTotalCharges(scope.cart_discount, scope.percent_off);
                        });
                        console.log('shipping postcode changed ', postcode);
                    }
                } else {
                    scope.invalidZipCode = true;
                    if (scope.settings.taxbased !== 'business_location') {
                        CartDetailsService.showTax = false;
                    }
                }
            };

            /*
             * @checkBillingFirst,checkBillingLast, checkBillingEmail, checkBillingAddress, checkBillingState, checkBillingCity, checkBillingPhone, validateAddressDetails
             * - validatitions for checkout
             */

            //TODO: change to $isValid angular style
            scope.checkBillingFirst = function(first) {
                if (!first) {
                    scope.emptyFirstName = true;
                } else {
                    scope.emptyFirstName = false;
                }
            };

            scope.checkBillingLast = function(last) {
                if (!last) {
                    scope.emptyLastName = true;
                } else {
                    scope.emptyLastName = false;
                }
            };

            scope.checkBillingEmail = function(email) {
                if (!email) {
                    scope.emptyEmail = true;
                    scope.invalidEmail = false;
                } else {
                    scope.emptyEmail = false;
                    scope.invalidEmail = !formValidations.email.test(email);
                }
            };

            scope.checkBillingAddress = function(address) {
                if (!address) {
                    scope.emptyAddress = true;
                } else {
                    scope.emptyAddress = false;
                }
            };

            scope.checkBillingState = function(state) {
                if (!state) {
                    scope.emptyState = true;
                    CartDetailsService.isStateTaxable = false;
                } else {
                    scope.emptyState = false;
                    CartDetailsService.checkIfStateTaxable(state, scope.cart_discount, scope.percent_off);
                }                
            };

            scope.checkBillingCity = function(city) {
                if (!city) {
                    scope.emptyCity = true;
                } else {
                    scope.emptyCity = false;
                }
            };

            scope.checkBillingPhone = function(phone) {
                if (!phone) {
                    scope.invalidPhone = false;
                } else {
                    scope.invalidPhone = !formValidations.phone.test(phone);
                }
            };


            scope.validateAddressDetails = function(details, email, phone) {
                scope.emptyFirstName = false;
                scope.emptyLastName = false;
                scope.emptyEmail = false;
                scope.emptyAddress = false;
                scope.emptyState = false;
                scope.emptyCity = false;
                scope.invalidZipCode = false;
                scope.emptyZipCode = false;
                scope.invalidEmail = false;
                scope.invalidPhone = false;
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
                scope.shippingPostCodeChanged(zip, state);

                if (scope.emptyFirstName || scope.emptyLastName || scope.emptyEmail || scope.emptyAddress || scope.emptyState || scope.emptyCity || scope.invalidZipCode || scope.emptyZipCode || scope.invalidEmail || scope.invalidPhone) {
                    return;
                }

                if (CartDetailsService.hasSubscriptionProduct) {
                    scope.checkoutModalState = 3;
                } else {
                    if (scope.stripeInfo && scope.paypalInfo) {
                        scope.checkoutModalState = 6;
                    } else if (scope.stripeInfo) {
                        scope.checkoutModalState = 3;
                    } else if (scope.paypalInfo) {
                        scope.checkoutModalState = 6;
                    }
                }
            };


            scope.scrollToElement = function(){
                $timeout(function() {
                    if($(".form-group.has-error").eq(0).length){
                        $(".form-group.has-error").eq(0)[0].scrollIntoView();
                    }
                    else{
                        angular.element("#cart-checkout-modal .modal-body").scrollTop(0);
                    }
                }, 0);
            }

            /*
             * @updateSelectedProduct
             * - when product details is clicked update selected product
             */

            scope.updateSelectedProduct = function(product) {
                product.attributes = scope.selectedProductAttributes(product);
                scope.selectedProduct = product;

                scope.openProductDetailsModal();
            };

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

            scope.selectedProductAttributes = function(product) {
                var attributes;
                if (product) {
                    var formattedAttributes = [];
                    _.each(product.variations, function(variation) {
                        _.each(variation.attributes, function(attribute) {
                            var foundAttr = _.find(formattedAttributes, function(formAttr) {
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

            scope.updatePrice = function() {
                var variations = scope.selectedProduct.variations;
                var selectedAttributes = scope.selectedProduct.attributes;
                var _matchedVariation = _.find(variations, function(_variation) {
                    var match = true;
                    _.each(selectedAttributes, function(attr) {
                        var matchedVarAttr = _.find(_variation.attributes, function(var_attr) {
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

            scope.addDetailsToCart = function(setCookie, product, variation) {
                if (setCookie) {
                    cookieData.products.push({
                        product: product,
                        variation: variation,
                        quantity: 1
                    });
                    localStorageService.set(cookieKey, cookieData);
                }
                var productMatch = '';
                if (variation) {
                    productMatch = variation;
                    productMatch.variation = true;
                    productMatch.name = product.name;
                } else {
                    productMatch = _.find(scope.products, function(item) {
                        return item._id === product._id;
                    });
                }
                if(productMatch) {
                    if (!productMatch.quantity) {
                        productMatch.quantity = 1;
                    }
                    if (CartDetailsService.items.indexOf(productMatch) === -1) {
                        productMatch.quantity = 1;
                    }

                    var match = _.find(CartDetailsService.items, function(item) {
                        return item._id === productMatch._id;
                    });
                    if (match) {
                        match.quantity = parseInt(match.quantity, 10) + 1;
                    } else {
                        CartDetailsService.addItemToCart(productMatch, scope.cart_discount, scope.percent_off);
                    }
                }

            };



            scope.reloadCartDetails = function(product, variation, quantity) {
                var productMatch = '';
                if (variation) {
                    productMatch = variation;
                    productMatch.variation = true;
                    productMatch.name = product.name;
                } else {
                    productMatch = _.find(scope.products, function(item) {
                        return item._id === product._id;
                    });
                }
                if(productMatch) {
                    productMatch.quantity = quantity;

                    var match = _.find(CartDetailsService.items, function(item) {
                        return item._id === productMatch._id;
                    });
                    if (match) {
                        match.quantity = parseInt(match.quantity, 10) + quantity;
                    } else {
                        CartDetailsService.addItemToCart(productMatch, scope.cart_discount, scope.percent_off);
                    }

                }

            };

            /*
             * @removeFromCart
             * - remove product to cart
             */

            scope.removeFromCart = function(setCookie, product) {
                if (setCookie) {
                    cookieData.products.forEach(function(e, i) {
                        if (e.product._id == product._id) {
                            cookieData.products.splice(i, 1);
                        }
                    });
                    if (!cookieData.products.length) {
                        cookieData.state = 1;
                    }
                    localStorageService.set(cookieKey, cookieData);
                }

                CartDetailsService.removeItemFromCart(product, scope.cart_discount, scope.percent_off);

            };

            scope.checkCardNumber = function() {
                var card_number = _.compact($('.modal #number').map( function(){return $(this).val(); }).get())[0]
                if (!card_number) {
                    $('.modal #card_number .error').html('Card Number Required');
                    $('.modal #card_number').addClass('has-error');
                    $('.modal #card_number .glyphicon').addClass('glyphicon-remove');
                } else {
                    $('.modal #card_number .error').html('');
                    $('.modal #card_number').removeClass('has-error').addClass('has-success');
                    $('.modal #card_number .glyphicon').removeClass('glyphicon-remove').addClass('glyphicon-ok');
                }
            };

            /*scope.checkCardName = function() {
             var name = $('.modal #card_name #name').val();
             if (!name) {
             $('.modal #card_name .error').html('Card Name Required');
             $('.modal #card_name').addClass('has-error');
             $('.modal #card_name .glyphicon').addClass('glyphicon-remove');
             } else {
             $('.modal #card_name .error').html('');
             $('.modal #card_name').removeClass('has-error').addClass('has-success');
             $('.modal #card_name .glyphicon').removeClass('glyphicon-remove').addClass('glyphicon-ok');
             }

             };*/


            /*
             * @validateBasicInfo
             * -
             */

            scope.basicInfo = {};
            scope.validateBasicInfo = function() {
                console.log('validateBasicInfo >>>');
                // check to make sure the form is completely valid
                // if (isValid) {
                //   alert('our form is amazing');
                //   checkoutModalState = 3
                // }
            };


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

            scope.paypalPayment = function() {
                scope.showPaypalLoading = true;
                scope.failedOrderMessage = '';

                initializeCouponDetails();

                var contact = scope.newContact;
                if (isEmpty(contact.first) || isEmpty(contact.last) || isEmpty(contact.first) || isEmpty(contact.details[0].emails[0].email)) {
                    scope.checkoutModalState = 2;
                    return;
                }

                scope.initializeModalEvents();
                var phone_number = '';
                if (scope.newContact.details[0].phones && scope.newContact.details[0].phones[0] && scope.newContact.details[0].phones[0].number) {
                    phone_number = scope.newContact.details[0].phones[0].number;
                }
                var _formattedDetails = [{
                    _id: Math.uuid(10),
                    emails: [{
                        _id: Math.uuid(10),
                        email: scope.newContact.details[0].emails[0].email
                    }],
                    phones: [],
                    addresses: [{
                        _id: Math.uuid(10),
                        address: scope.newContact.details[0].addresses[0].address,
                        address2: scope.newContact.details[0].addresses[0].address2,
                        state: scope.newContact.details[0].addresses[0].state,
                        zip: scope.newContact.details[0].addresses[0].zip,
                        country: 'US',
                        defaultShipping: false,
                        defaultBilling: false,
                        city: scope.newContact.details[0].addresses[0].city,
                        countryCode: '',
                        displayName: ''
                    }]
                }];
                if (scope.newContact.details[0].phones && scope.newContact.details[0].phones[0] && scope.newContact.details[0].phones[0].number) {
                    _formattedDetails[0].phones.push({
                        _id: Math.uuid(10),
                        number: scope.newContact.details[0].phones[0].number
                    });
                }
                console.log('scope.newContact ', scope.newContact);
                scope.newContact.details = _formattedDetails;
                console.log('scope.newContact ', scope.newContact);

                var customer = scope.newContact;
                console.log('customer, ', customer);

                //UserService.postContact(scope.newContact, function (customer) {
                var order = {
                    //'customer_id': customer._id,
                    'customer': customer,
                    'session_id': null,
                    'status': 'paid',
                    'cart_discount': 0,
                    'total_discount': 0,
                    'total_shipping': formatNum(scope.totalShipping),
                    'total_tax': formatNum(scope.totalTax),
                    'shipping_tax': formatNum(scope.shippingTax),
                    'cart_tax': scope.cartTax || 0,
                    'currency': 'usd',
                    'line_items': [], // { 'product_id': 31, 'quantity': 1, 'variation_id': 7, 'subtotal': '20.00', 'tax_class': null, 'sku': '', 'total': '20.00', 'name': 'Product Name', 'total_tax': '0.00' }
                    'total_line_items_quantity': CartDetailsService.items.length,
                    'payment_details': {
                        'method_title': 'Credit Card Payment', //Check Payment, Credit Card Payment
                        'method_id': 'cc', //check, cc
                        'card_token': null, //Stripe card token if applicable
                        'charge_description': null, //description of charge if applicable
                        'statement_description': null, //22char string for cc statement if applicable
                        'paid': true
                    },
                    'shipping_methods': '', // 'Free Shipping',
                    'shipping_address': {
                        'first_name': customer.first,
                        'last_name': customer.last,
                        'phone': phone_number,
                        'city': customer.details[0].addresses[0].city,
                        'country': 'US',
                        'address_1': customer.details[0].addresses[0].address,
                        'company': '',
                        'postcode': customer.details[0].addresses[0].zip,
                        'email': customer.details[0].emails[0].email,
                        'address_2': customer.details[0].addresses[0].address2,
                        'state': customer.details[0].addresses[0].state
                    },
                    'billing_address': {
                        'first_name': customer.first,
                        'last_name': customer.last,
                        'phone': phone_number,
                        'city': customer.details[0].addresses[0].city,
                        'country': 'US',
                        'address_1': customer.details[0].addresses[0].address,
                        'company': '',
                        'postcode': customer.details[0].addresses[0].zip,
                        'email': customer.details[0].emails[0].email,
                        'address_2': customer.details[0].addresses[0].address2,
                        'state': customer.details[0].addresses[0].state
                    },
                    'notes': []
                };
                _.each(CartDetailsService.items, function(item) {
                    var totalAmount = item.regular_price * item.quantity;
                    var _item = {
                        'product_id': item._id,
                        'quantity': item.quantity,
                        'regular_price': formatNum(item.regular_price),
                        'sale_price': item.on_sale ? formatNum(item.sale_price) : null,
                        'on_sale': item.onSaleToday || false,
                        'taxable': item.taxable || false,
                        'variation_id': '',
                        'tax_class': null,
                        'sku': '',
                        'total': formatNum(totalAmount),
                        'name': item.name,
                        'total_tax': '0.00',
                        'type': item.type
                    };
                    order.line_items.push(_item);
                });

                OrderService.createPaypalOrder(order, function(data) {
                    scope.order = data;
                    scope.showPaypalLoading = false;
                    if (data && !data._id) {
                        var failedOrderMessage = 'Error in order processing';
                        console.log(failedOrderMessage);
                        if (data.message)
                            failedOrderMessage = data.message;
                        scope.checkoutModalState = 6;
                        scope.failedOrderMessage = failedOrderMessage;
                        return;
                    }
                    console.log('order, ', order);
                    scope.checkoutModalState = 7;
                    localStorageService.set(orderCookieKey, data);
                    scope.paypalKey = data.payment_details.payKey;
                    CartDetailsService.items = [];


                    CartDetailsService.subTotal = 0;
                    CartDetailsService.totalTax = 0;
                    CartDetailsService.total = 0;
                    localStorageService.remove(cookieKey);
                    // PaymentService.saveCartDetails(token, parseInt(scope.total * 100), function(data) {});
                });
            };

            scope.makeCartPayment = function() {
                var coupon = scope.checkoutOrder.coupon;
                if(coupon && scope.couponIsValid === false){
                    scope.checkoutModalState = 3;
                    return;
                }
                angular.element("#cart-checkout-modal .modal-body").scrollTop(0);
                scope.failedOrderMessage = '';
                scope.checkoutModalState = 4;
                var expiry = _.compact($('.modal #expiry').map( function(){ return $(this).val(); }).get())[0];
                if (expiry && expiry.indexOf('/') !== -1) {
                    expiry = expiry.split('/');
                }

                var exp_month = expiry && expiry[0].trim();
                var exp_year = '';
                if (expiry && expiry.length > 1) {
                    exp_year = expiry[1].trim();
                }
                var cardInput = {
                    name: _.compact($('.modal #card_name #name').map( function(){ return $(this).val(); }).get())[0],
                    number: _.compact($('.modal #number').map( function(){ return $(this).val(); }).get())[0],
                    cvc: _.compact($('.modal #cvc').map( function(){return $(this).val(); }).get())[0],
                    exp_month: exp_month,
                    exp_year: exp_year
                        //TODO: add the following:
                        /*
                         * name:name,
                         * address_city:city,
                         * address_country:country,
                         * address_line1:line1,
                         * address_line2:line2,
                         * address_state:state,
                         * address_zip:zip
                         */
                };
                if (!cardInput.number || !cardInput.cvc || !cardInput.exp_month || !cardInput.exp_year || !cardInput.name) {
                    scope.checkCardName();
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
                if (isEmpty(contact.first) || isEmpty(contact.last) || isEmpty(contact.first) || isEmpty(contact.details[0].emails[0].email)) {
                    scope.checkoutModalState = 2;
                    return;
                }
                if (contact) {
                    cardInput.name = contact.first + ' ' + contact.last;
                    cardInput.address_line1 = contact.details[0].addresses[0].address;
                    cardInput.address_city = contact.details[0].addresses[0].city;
                    cardInput.address_state = contact.details[0].addresses[0].state;
                    cardInput.address_zip = contact.details[0].addresses[0].zip;
                    cardInput.address_country = contact.details[0].addresses[0].country || 'US';
                    if (contact.details[0].addresses[0].address2) {
                        cardInput.address_line2 = contact.details[0].addresses[0].address2;
                    }
                }

                if (coupon) {
                    scope.showDiscount = undefined;
                    PaymentService.validateCoupon(coupon, function(data) {
                        console.log('data ', data);
                        scope.currentCoupon = data;
                        scope.checkingCoupon = false;
                        console.log('validate coupon');
                        if (data && data.id && data.id === coupon) {
                            console.log('valid');
                            angular.element("#coupon-name .error").html("");
                            scope.couponIsValid = true;
                            scope.coupon = data;
                            scope.showDiscount = true;
                            
                            //calculateDiscount(data);
                            validateAndCreateOrder(cardInput, data);
                        } else {
                            console.log('invalid');
                            angular.element("#coupon-name .error").html("Invalid Coupon");
                            scope.couponIsValid = false;
                            scope.checkoutModalState = 3;
                            scope.coupon = undefined;
                            scope.showDiscount = false;
                            return;
                        }
                    });
                }
                else{
                   scope.coupon = undefined; 
                   scope.showDiscount = false;
                   validateAndCreateOrder(cardInput);
                }

                //});
            };


            function calculateDiscount(){
                console.log("calculating discount");                
                if(scope.coupon){
                    if(scope.coupon.amount_off){
                        scope.cart_discount = scope.coupon.amount_off;
                        scope.percent_off = false;
                    }
                    else if(scope.coupon.percent_off){                        
                        scope.cart_discount = scope.coupon.percent_off;
                        scope.percent_off = true;
                    }
                }
                else{
                    scope.cart_discount = 0;
                    scope.percent_off = false;
                }
                CartDetailsService.calculateTotalCharges(scope.cart_discount, scope.percent_off);
            }


            function validateAndCreateOrder(cardInput, couponObj){
                PaymentService.getStripeCardToken(cardInput, function(token, error) {

                    // PaymentService.saveCartDetails(token, parseInt(scope.total * 100), function (data) {
                    //     console.log('card details ', data);
                    // });
                    // Is this checking to see if the customer already exists
                    if (error) {
                        switch (error.param) {
                            case 'number':
                                $('.modal #card_number .error').html(error.message);
                                $('.modal #card_number').addClass('has-error');
                                $('.modal #card_number .glyphicon').addClass('glyphicon-remove');
                                break;
                            case 'exp_month':
                                $('.modal #card_expiry .error').html(error.message);
                                $('.modal #card_expiry').addClass('has-error');
                                $('.modal #card_expiry .glyphicon').addClass('glyphicon-remove');
                                break;
                            case 'exp_year':
                                $('.modal #card_expiry .error').html(error.message);
                                $('.modal #card_expiry').addClass('has-error');
                                $('.modal #card_expiry .glyphicon').addClass('glyphicon-remove');
                                break;
                            case 'cvc':
                                $('.modal #card_cvc .error').html(error.message);
                                $('.modal #card_cvc').addClass('has-error');
                                $('.modal #card_cvc .glyphicon').addClass('glyphicon-remove');
                                break;
                            case 'name':
                                $('.modal #card_name .error').html(error.message);
                                $('.modal #card_name').addClass('has-error');
                                $('.modal #card_name .glyphicon').addClass('glyphicon-remove');
                                break;
                            default:
                                $('.modal #card_number .error').html('There was an error processing your payment information.  Please check the details and try again.');
                                $('.modal #card_number').addClass('has-error');
                                $('.modal #card_number .glyphicon').addClass('glyphicon-remove');
                                break;
                        }
                        scope.checkoutModalState = 3;
                        return;
                    }
                    scope.initializeModalEvents();
                    var phone_number = '';
                    if (scope.newContact.details[0].phones && scope.newContact.details[0].phones[0] && scope.newContact.details[0].phones[0].number) {
                        phone_number = scope.newContact.details[0].phones[0].number;
                    }
                    var _formattedDetails = [{
                        _id: Math.uuid(10),
                        emails: [{
                            _id: Math.uuid(10),
                            email: scope.newContact.details[0].emails[0].email
                        }],
                        phones: [],
                        addresses: [{
                            _id: Math.uuid(10),
                            address: scope.newContact.details[0].addresses[0].address,
                            address2: scope.newContact.details[0].addresses[0].address2,
                            state: scope.newContact.details[0].addresses[0].state,
                            zip: scope.newContact.details[0].addresses[0].zip,
                            country: 'US',
                            defaultShipping: false,
                            defaultBilling: false,
                            city: scope.newContact.details[0].addresses[0].city,
                            countryCode: '',
                            displayName: ''
                        }]
                    }];
                    if (scope.newContact.details[0].phones && scope.newContact.details[0].phones[0] && scope.newContact.details[0].phones[0].number) {
                        _formattedDetails[0].phones.push({
                            _id: Math.uuid(10),
                            number: scope.newContact.details[0].phones[0].number
                        });
                    }
                    console.log('scope.newContact ', scope.newContact);
                    scope.newContact.details = _formattedDetails;
                    console.log('scope.newContact ', scope.newContact);

                    var customer = scope.newContact;
                    console.log('customer, ', customer);

                    //UserService.postContact(scope.newContact, function (customer) {
                    var order = {
                        //'customer_id': customer._id,
                        'customer': customer,
                        'session_id': null,
                        'status': 'paid',
                        'cart_discount': 0,
                        'total_discount': 0,
                        'total_shipping': formatNum(scope.totalShipping),
                        'total_tax': formatNum(CartDetailsService.totalTax),
                        'shipping_tax': formatNum(scope.shippingTax),
                        'cart_tax': scope.cartTax || 0,
                        'currency': 'usd',
                        'line_items': [], // { 'product_id': 31, 'quantity': 1, 'variation_id': 7, 'subtotal': '20.00', 'tax_class': null, 'sku': '', 'total': '20.00', 'name': 'Product Name', 'total_tax': '0.00' }
                        'total_line_items_quantity': CartDetailsService.items.length,
                        'payment_details': {
                            'method_title': 'Credit Card Payment', //Check Payment, Credit Card Payment
                            'method_id': 'cc', //check, cc
                            'card_token': token, //Stripe card token if applicable
                            'charge_description': null, //description of charge if applicable
                            'statement_description': null, //22char string for cc statement if applicable
                            'paid': true
                        },
                        'shipping_methods': '', // 'Free Shipping',
                        'shipping_address': {
                            'first_name': customer.first,
                            'last_name': customer.last,
                            'phone': phone_number,
                            'city': customer.details[0].addresses[0].city,
                            'country': 'US',
                            'address_1': customer.details[0].addresses[0].address,
                            'company': '',
                            'postcode': customer.details[0].addresses[0].zip,
                            'email': customer.details[0].emails[0].email,
                            'address_2': customer.details[0].addresses[0].address2,
                            'state': customer.details[0].addresses[0].state
                        },
                        'billing_address': {
                            'first_name': customer.first,
                            'last_name': customer.last,
                            'phone': phone_number,
                            'city': customer.details[0].addresses[0].city,
                            'country': 'US',
                            'address_1': customer.details[0].addresses[0].address,
                            'company': '',
                            'postcode': customer.details[0].addresses[0].zip,
                            'email': customer.details[0].emails[0].email,
                            'address_2': customer.details[0].addresses[0].address2,
                            'state': customer.details[0].addresses[0].state
                        },
                        'notes': []
                    };
                    _.each(CartDetailsService.items, function(item) {
                        var totalAmount = item.regular_price * item.quantity;
                        var _item = {
                            'product_id': item._id,
                            'quantity': item.quantity,
                            'regular_price': formatNum(item.regular_price),
                            'sale_price': item.on_sale ? formatNum(item.sale_price) : null,
                            'on_sale': item.onSaleToday || false,
                            'taxable': item.taxable || false,
                            'variation_id': '',
                            'tax_class': null,
                            'sku': '',
                            'total': formatNum(totalAmount),
                            'name': item.name,
                            'total_tax': '0.00'
                        };
                        order.line_items.push(_item);
                    });
                    if(couponObj){
                        order.coupon = couponObj;
                    }

                    OrderService.createOrder(order, function(data) {
                        if (data && !data._id) {
                            var failedOrderMessage = 'Error in order processing';
                            console.log(failedOrderMessage);
                            if (data.message)
                                failedOrderMessage = data.message;
                            scope.checkoutModalState = 3;
                            scope.failedOrderMessage = failedOrderMessage;
                            return;
                        }
                        scope.order = data;
                        console.log('order, ', order);
                        scope.checkoutModalState = 5;
                        CartDetailsService.items = [];


                        CartDetailsService.subTotal = 0;
                        CartDetailsService.totalTax = 0;
                        CartDetailsService.total = 0;
                        localStorageService.remove(cookieKey);
                        cookieData = {
                          products: []
                        };
                        cookieProcessFn();
                        clearCardDetails();
                        CartDetailsService.showTax = false;
                        scope.showTax = false;
                        // PaymentService.saveCartDetails(token, parseInt(scope.total * 100), function(data) {});
                    });

                });
            }

            var clearCardDetails = function() {
                $('.modal #product-card-details').trigger('reset');
                $('.modal #card_number').removeClass('has-error has-success');
                $('.modal #card_number .glyphicon').removeClass('glyphicon-remove glyphicon-ok')
                $('.modal #card_name').removeClass('has-error has-success');
                $('.modal #card_name .glyphicon').removeClass('glyphicon-remove glyphicon-ok')
                $('.modal #card_expiry').removeClass('has-error has-success');
                $('.modal #card_expiry .glyphicon').removeClass('glyphicon-remove glyphicon-ok')
                $('.modal #card_cvc').removeClass('has-error has-success');
                $('.modal #card_cvc .glyphicon').removeClass('glyphicon-remove glyphicon-ok')
                $(element).find('.jp-card-number').text('•••• •••• •••• ••••');
                $(element).find('.jp-card-cvc').text('•••');
                $(element).find('.jp-card-name').text('Full Name');
                $(element).find('.jp-card-expiry').text('••/••');
                $(element).find('.jp-card').removeClass('jp-card-identified');
                
                initializeCouponDetails();   
                //angular.element("#card_coupon").removeClass('has-error has-success');
            }

            /*
             * @
             * -
             */
            scope.initializeModalEvents = function() {
                $('.modal').off('hidden.bs.modal').on('hidden.bs.modal', function() {
                    console.log('modal closed');
                    $timeout(function() {
                        scope.$apply(function() {
                            if (scope.checkoutModalState === 5) {
                                scope.checkoutModalState = 1;
                                scope.newContact = {};
                                clearCardDetails();                                
                            }
                        });
                    }, 0);
                });
            }

            /*
             * @pageChanged
             * - when a page is changes splice the array to show offset products
             */

            scope.pageChanged = function(pageNo) {
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

            scope.variationAttributeExists = function(value) {
                var variations = scope.selectedProduct.variations;
                var matchedAttribute = false;
                _.each(variations, function(_variation) {
                    _.find(_variation.attributes, function(_attribute) {
                        if (_attribute.option === value) {
                            matchedAttribute = true;
                        }
                    });
                });
                return matchedAttribute;
            };

            scope.checkCardNumber = function() {
                scope.failedOrderMessage = '';
                var card_number = _.compact($('.modal #number').map( function(){return $(this).val(); }).get())[0];
                if (!card_number) {
                    $('.modal #card_number .error').html('Card Number Required');
                    $('.modal #card_number').addClass('has-error');
                    $('.modal #card_number .glyphicon').addClass('glyphicon-remove');
                } else {
                    $('.modal #card_number .error').html('');
                    $('.modal #card_number').removeClass('has-error').addClass('has-success');
                    $('.modal #card_number .glyphicon').removeClass('glyphicon-remove').addClass('glyphicon-ok');
                }
            };

            scope.checkCardName = function() {
                scope.failedOrderMessage = '';
                var name = _.compact($('.modal #card_name #name').map( function(){return $(this).val(); }).get())[0];
                if (!name) {
                    $('.modal #card_name .error').html('Card Name Required');
                    $('.modal #card_name').addClass('has-error');
                    $('.modal #card_name .glyphicon').addClass('glyphicon-remove');
                } else {
                    $('.modal #card_name .error').html('');
                    $('.modal #card_name').removeClass('has-error').addClass('has-success');
                    $('.modal #card_name .glyphicon').removeClass('glyphicon-remove').addClass('glyphicon-ok');
                }

            };


            scope.checkCardExpiry = function() {
                scope.failedOrderMessage = '';
                var expiry = _.compact($('.modal #expiry').map( function(){return $(this).val(); }).get())[0]
                if (expiry && expiry.indexOf('/') !== -1) {
                    expiry = expiry.split('/');
                }
                var card_expiry = expiry;
                var exp_month = card_expiry && card_expiry[0].trim();
                var exp_year;
                if (card_expiry && card_expiry.length > 1) {
                    exp_year = card_expiry[1].trim();
                }

                if (!expiry || !exp_month || !exp_year) {
                    if (!expiry) {
                        $('.modal #card_expiry .error').html('Expiry Required');
                    } else if (!exp_month) {
                        $('.modal #card_expiry .error').html('Expiry Month Required');
                    } else if (!exp_year) {
                        $('.modal #card_expiry .error').html('Expiry Year Required');
                    }
                    $('.modal #card_expiry').addClass('has-error');
                    $('.modal #card_expiry .glyphicon').addClass('glyphicon-remove');
                } else {
                    $('.modal #card_expiry .error').html('');
                    $('.modal #card_expiry .glyphicon').removeClass('glyphicon-remove').addClass('glyphicon-ok');
                    $('.modal #card_expiry').removeClass('has-error').addClass('has-success');
                }
            };

            scope.checkCardCvv = function() {
                scope.failedOrderMessage = '';
                var card_cvc = _.compact($('.modal #cvc').map( function(){return $(this).val(); }).get())[0];
                if (!card_cvc) {
                    $('.modal #card_cvc .error').html('CVC Required');
                    $('.modal #card_cvc').addClass('has-error');
                    $('.modal #card_cvc .glyphicon').addClass('glyphicon-remove');
                } else {
                    $('.modal #card_cvc .error').html('');
                    $('.modal #card_cvc').removeClass('has-error').addClass('has-success');
                    $('.modal #card_cvc .glyphicon').removeClass('glyphicon-remove').addClass('glyphicon-ok');
                }
            };

            scope.checkCoupon = function() {
                scope.couponChecked = true;
                scope.checkingCoupon = true;
                console.log('>> checkCoupon');
                var coupon = scope.checkoutOrder.coupon;
                //console.dir(coupon);
                //console.log(scope.newAccount.coupon);
                if (coupon) {
                    scope.showDiscount = undefined;
                    PaymentService.validateCoupon(coupon, function(data) {
                        console.log('data ', data);
                        scope.currentCoupon = data;
                        scope.checkingCoupon = false;
                        console.log('validate coupon');
                        if (data && data.id && data.id === coupon) {
                            console.log('valid');
                            angular.element("#coupon-name .error").html("");
                            scope.couponIsValid = true;
                            scope.coupon = data;
                            scope.showDiscount = true;
                        } else {
                            console.log('invalid');
                            angular.element("#coupon-name .error").html("Invalid Coupon");
                            scope.couponIsValid = false;
                            scope.showDiscount = false;
                            scope.coupon = undefined;
                        }
                    });
                } else {
                    scope.coupon = undefined;
                    scope.showDiscount = false;
                    scope.couponIsValid = true;
                    scope.checkingCoupon = false;
                    angular.element("#coupon-name .error").html("");
                    angular.element("#coupon-name").removeClass('has-error').addClass('has-success');
                    angular.element("#coupon-name .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                }
            };

            /* scope.checkCardName = function () {
             scope.failedOrderMessage = '';
             var name = $('#card_name #name').val();
             if (name) {
             $('#card_name .error').html('');
             $('#card_name').removeClass('has-error').addClass('has-success');
             $('#card_name .glyphicon').removeClass('glyphicon-remove').addClass('glyphicon-ok');
             }
             };*/

            /**
             * @cookieProcessFn
             * - if cookie has data restore the checkout flow to that state
             */
            if (!cookieData) {
                cookieData = {
                    products: []
                };
            }
            var cookieProcessFn = function() {
                console.log('Cookie Data', cookieData);
                cookieData.products.forEach(function(entry, index) {
                    scope.reloadCartDetails(entry.product, entry.variation, entry.quantity);
                });
                CartDetailsService.calculateTotalCharges(scope.cart_discount);

                if (cookieData.state) {
                    scope.checkoutModalState = cookieData.state;
                }

                if (cookieData.contactInfo) {
                    scope.newContact = cookieData.contactInfo;
                } else {
                  scope.newContact = {};
                }

                if ($routeParams.state && $routeParams.comp == 'products') {
                    scope.checkoutModalState = parseInt($routeParams.state);
                    scope.showModalFn();
                    if (scope.checkoutModalState == 5 && orderCookieData) {
                        OrderService.setOrderPaid(orderCookieData, function(data) {
                            if (data && !data._id) {
                                var failedOrderMessage = 'Error in order processing';
                                console.log(failedOrderMessage);
                                if (data.message)
                                    failedOrderMessage = data.message;
                                scope.failedOrderMessage = failedOrderMessage;
                                return;
                            }
                            localStorageService.remove(orderCookieKey);
                        });
                    }
                    if (scope.checkoutModalState == 6) {
                        scope.showPaypalErrorMsg = true;
                    }
                }
            };

            scope.cookieUpdateContactFn = function() {
                cookieData.contactInfo = scope.newContact;
                localStorageService.set(cookieKey, cookieData);
            };

            scope.cookieUpdateQuantityFn = function(item) {
                cookieData.products.forEach(function(product, index) {
                    if (item._id == product.product._id) {
                        product.quantity = parseInt(item.quantity);
                    }
                });
                localStorageService.set(cookieKey, cookieData);
            };

            scope.paypalLoginClickFn = function () {
                var dgFlow = new PAYPAL.apps.DGFlow({expType: null});
                dgFlow.startFlow($location.absUrl());
                scope.close();
                angular.element("body").hide();
                $timeout(function () {
                    angular.element("body").show();
                }, 3000);
            };

            scope.deleteOrderFn = function (order) {
                OrderService.deletePaypalOrder(order, function (data) {
                    if (data.deleted) {
                        scope.close();
                        scope.checkoutModalState = 1;
                    }
                });
            };

            scope.showModalFn = function () {
              scope.modalInstance = $modal.open({
                templateUrl: 'product-cart-modal',
                keyboard: true,
                size: 'lg',
                scope: scope,
                backdrop: 'static'
              });

              $timeout(function () {
                $('#product-card-details-' + scope.component._id).card({
                    container: '#card-wrapper-' + scope.component._id
                });
                console.log('card setup');
                angular.element("#cart-checkout-modal").parents(".modal-dialog").addClass("product-cart-modal-dialog");

              }, 200);
            };


            /*
            * product details modal
            * - moved from product component to global template
            */
            scope.openProductDetailsModal = function() {
                scope.modalInstance = $modal.open({
                    templateUrl: 'product-details-modal',
                    keyboard: true,
                    size: 'lg',
                    scope: scope
                });
                $timeout(function () {
                    angular.element("#product-details-content").parents(".modal").addClass("product-details-cart-modal");
                }, 200);

            };

            scope.closeProductDetailsModal = function() {
                scope.modalInstance.close();
            };

            scope.close = function() {
                scope.modalInstance.close();
                if (scope.checkoutModalState == 5) {
                  scope.checkoutModalState = 1;
                  redirectAfterOrderOrClose(1);
                }
            }

            scope.cartValidItemCountFn = function () {
                var isValid = true;
                scope.cartDetails.forEach(function(item, index) {
                    if (!item.quantity) {
                        isValid = false;
                    } else if (parseInt(item.quantity) <= 0) {
                        isValid = false;
                    }
                });
                return isValid
            };

            scope.isImage = function(src) {
                var isIcon = src && src.indexOf("fa-") === 0;
                return !isIcon;
            };

            function redirectAfterOrderOrClose(_time){
                if(scope.settings && scope.settings.checkout && scope.settings.checkout.redirectUrl){
                    $timeout(function() {
                        var redirectUrl = scope.settings.checkout.redirectUrl;
                        if(scope.order){
                            redirectUrl = redirectUrl + "?orderId="+ scope.order._id;
                        }
                        window.location.href = redirectUrl;
                    }, _time || scope.settings.checkout.redirectTimeout || 5000);
                }
            };


            function initializeCouponDetails(){
                scope.cart_discount = 0; 
                scope.showDiscount = undefined;
                scope.percent_off = false;
                scope.coupon = undefined;
                scope.checkoutOrder = {
                    coupon : ""
                };
            }


            scope.$watch('checkoutModalState', function(state){
                if(state === 5){
                    redirectAfterOrderOrClose();
                }
            });


            scope.$watch('showDiscount', function(_discount){
                if(angular.isDefined(_discount)){
                    calculateDiscount();
                }
            }, true)

        },
        controller: function($scope) {
            var cookieKey = 'cart_cookie_' + $scope.component._id;
            var cookieData = localStorageService.get(cookieKey);
            if (!cookieData) {
                cookieData = {
                    products: []
                };
            }
            $scope.setCheckoutState = function(setCookie, state) {
                if (setCookie) {
                    cookieData.state = state;
                    localStorageService.set(cookieKey, cookieData);
                }
                $scope.checkoutModalState = state;
                angular.element("#cart-checkout-modal .modal-body").scrollTop(0);
            };
        }
    };
}]);

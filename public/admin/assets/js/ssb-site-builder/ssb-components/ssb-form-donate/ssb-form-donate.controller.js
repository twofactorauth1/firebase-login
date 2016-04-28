(function() {

    app.controller('SiteBuilderFormDonateComponentController', ssbFormDonateComponentController);

    ssbFormDonateComponentController.$inject = ['$scope', '$attrs', '$filter', '$transclude', '$injector', 'formValidations', '$timeout', '$sce', '$location', 'ENV', 'localStorageService', '$routeParams'];
    /* @ngInject */
    function ssbFormDonateComponentController($scope, $attrs, $filter, $transclude, $injector, formValidations, $timeout, $sce, $location, ENV, localStorageService, $routeParams) {

        console.info('ssb-form-donate directive init...')

        var vm = this;
        var orderCookieKey = 'order_cookie';
        var orderCookieData = localStorageService.get(orderCookieKey);

        vm.init = init;

        vm.userExists = false;

        vm.formBuilder = {};
        vm.checkoutModalState = 1;
        vm.showPaypalErrorMsg = false;
        vm.showPaypalLoading = false;
        vm.paypalLoginClickFn = paypalLoginClickFn;
        vm.paypalURL = $sce.trustAsResourceUrl(ENV.paypalCheckoutURL);
        console.log('url:', vm.paypalURL);

        vm.fieldClass = fieldClass;

        vm.fieldStyle = fieldStyle;
        vm.inputStyle = inputStyle;
        vm.inputContainerStyle = inputContainerStyle;
        vm.buttonStyle = buttonStyle;
        vm.formStyle = formStyle;
        vm.addCustomField = addCustomField;
        vm.addPattern = addPattern;
        vm.formValidations = formValidations;
        vm.setCheckoutState = setCheckoutState;
        vm.paypalPayment = paypalPayment;

        vm.nthRow = 'nth-row';

        vm.isEditing = $scope.$parent.vm && $scope.$parent.vm.uiState;

        if ($injector.has("productService")) {
            var productService = $injector.get('productService');
        }

        function fieldClass(field) {
            var classString = 'col-sm-12';

            if (vm.component.formSettings && vm.component.formSettings.fieldsPerRow) {
                classString = "col-sm-" + Math.floor(12 / vm.component.formSettings.fieldsPerRow);
                if (vm.component.formSettings.spacing && vm.component.formSettings.spacing.pr)
                    vm.nthRow = 'nth-row' + vm.component.formSettings.fieldsPerRow;
            }
            return classString;
        };


        function fieldStyle(field) {
            var styleString = ' ';
            if (field && field.spacing) {
                if (field.spacing.mb) {
                    styleString += 'margin-bottom: ' + field.spacing.mb + 'px;';
                }
            }
            return styleString;
        };

        function inputContainerStyle(field) {
            var styleString = ' ';
            if (field) {
                if (field.align === 'left' || field.align === 'right')
                    styleString += 'float: ' + field.align + " !important;";

                if (field.align === 'center') {
                    styleString += 'margin: 0 auto !important; float:none !important;';
                }
            }
            return styleString;
        };

        function inputStyle(field) {

            var styleString = ' ';
            if (field) {
                if (field && field.inputTextSize) {
                    styleString += 'font-size: ' + field.inputTextSize + 'px !important;';
                }
                if (field && field.inputFontFamily) {
                    styleString += 'font-family: ' + field.inputFontFamily + "!important;";
                }
                if (field && field.inputBgColor) {
                    styleString += 'background-color: ' + field.inputBgColor + "!important;";
                }
                if (field && field.inputBorderColor) {
                    styleString += 'border-color: ' + field.inputBorderColor + ";";
                }
                if (field && field.inputTextColor) {
                    styleString += 'color: ' + field.inputTextColor + ";";
                }
            }

            return styleString;
        };



        function buttonStyle(btn) {
            var styleString = '';

            if (btn && btn.align) {
                if (btn.align === 'left' || btn.align === 'right')
                    styleString += 'float: ' + btn.align + " !important;";

                if (btn.align === 'center') {
                    styleString += 'margin: 0 auto !important; float:none !important;';
                }
            }
            return styleString;
        };

        function formStyle(form) {
            var styleString = '';
            if (form) {
                if (form.formFontFamily) {
                    styleString += 'font-family: ' + form.formFontFamily + ";";
                }
                if (form.formTextColor) {
                    styleString += 'color: ' + form.formTextColor + ";";
                }
            }
            return styleString;
        };

        function addCustomField(type) {
            console.log("Add custom");
        };

        function addPattern(val) {
            if (val.name === "phone") {
                return vm.formValidations.phone;
            }
            if (val.name === "email") {
                return vm.formValidations.email;
            }
        }



        vm.createUser = function(form) {
            // Admin check
            if ($scope.$parent.vm.state)
                return;

            if ($injector.has("userService"))
                userService = $injector.get("userService");

            if ($injector.has("ipCookie"))
                ipCookie = $injector.get("ipCookie");

            var fingerprint = new Fingerprint().get();
            var sessionId = ipCookie("session_cookie").id;

            var skipWelcomeEmail;

            if (vm.component.skipWelcomeEmail) {
                skipWelcomeEmail = true;
            }

            var _campaignId;
            if (!vm.component.campaignId) {
                vm.component.campaignId = '';
            } else {
                _campaignId = vm.component.campaignId;
            }

            var first_name = "";
            var last_name = "";

            if (vm.formBuilder.name) {
                var name_arr = vm.formBuilder.name.split(/ (.+)?/);
                first_name = name_arr[0];
                if (name_arr.length > 1) {
                    last_name = name_arr[1];
                }
            }

            var formatted = {
                fingerprint: fingerprint,
                sessionId: sessionId,
                first: first_name,
                last: last_name,
                details: [{
                    emails: [],
                    phones: [],
                    addresses: []
                }],
                campaignId: _campaignId,
                emailId: vm.component.emailId,
                sendEmail: vm.component.sendEmail,
                skipWelcomeEmail: skipWelcomeEmail,
                fromEmail: vm.component.fromEmail,
                fromName: vm.component.fromName,
                contact_type: vm.component.tags,
                uniqueEmail: vm.component.uniqueEmail || false,
                activity: {
                    activityType: 'CONTACT_FORM',
                    note: vm.formBuilder.Message || "Contact form data.",
                    sessionId: ipCookie("session_cookie").id,
                    contact: vm.formBuilder
                }
            };
            if (vm.formBuilder.email)
                formatted.details[0].emails.push({
                    email: vm.formBuilder.email
                });
            if (vm.formBuilder.phone) {
                formatted.details[0].phones.push({
                    number: vm.formBuilder.phone,
                    type: 'm'
                });
            }

            if (vm.formBuilder.address || vm.formBuilder.city || vm.formBuilder.state || vm.formBuilder.zip || vm.formBuilder.country) {
                formatted.details[0].addresses.push({
                    address: vm.formBuilder.address,
                    city: vm.formBuilder.city,
                    state: vm.formBuilder.state,
                    country: vm.formBuilder.country,
                    zip: vm.formBuilder.zip
                });
            }

            //create contact
            userService.addContact(formatted, function(data, err) {
                if (err && err.code === 409) {
                    vm.userExists = true;
                } else if (err && err.code !== 409) {
                    vm.formError = true;
                    $timeout(function() {
                        vm.formError = false;
                    }, 5000);
                } else if (data) {
                    var name = vm.formBuilder.name;

                    // This variant of the FB Tracking pixel is going away in late 2016
                    // Ref: https://www.facebook.com/business/help/373979379354234
                    if (vm.component.facebookConversionCode) {
                        var _fbq = window._fbq || (window._fbq = []);
                        if (!_fbq.loaded) {
                            var fbds = document.createElement('script');
                            fbds.async = true;
                            fbds.src = '//connect.facebook.net/en_US/fbds.js';
                            var s = document.getElementsByTagName('script')[0];
                            s.parentNode.insertBefore(fbds, s);
                            _fbq.loaded = true;
                        }
                        window._fbq = window._fbq || [];
                        window._fbq.push(['track', vm.component.facebookConversionCode, {
                            'value': '0.00',
                            'currency': 'USD'
                        }]);
                    }


                    if (!vm.component.redirect) {
                        vm.formSuccess = true;
                        vm.formBuilder = {};
                        form.$setPristine(true);

                        $timeout(function() {
                            vm.formSuccess = false;
                        }, 3000);
                    } else {
                        if (vm.component.redirectType === 'page') {
                            window.location.href = vm.component.redirectUrl;
                        }
                        if (vm.component.redirectType === 'external') {
                            window.location.href = 'http://' + vm.component.redirectUrl;
                        }
                    }

                }
            });
        };

        function setCheckoutState(state) {
            vm.checkoutModalState = state;
        }

        function _formattedOrder() {
            if ($injector.has("ipCookie")) {
                ipCookie = $injector.get("ipCookie");
            }

            var fingerprint = new Fingerprint().get();
            var sessionId = ipCookie("session_cookie").id;

            var skipWelcomeEmail;

            if (vm.component.skipWelcomeEmail) {
                skipWelcomeEmail = true;
            }

            var _campaignId;
            if (!vm.component.campaignId) {
                vm.component.campaignId = '';
            } else {
                _campaignId = vm.component.campaignId;
            }

            var first_name = "";
            var last_name = "";

            if (vm.formBuilder.name) {
                var name_arr = vm.formBuilder.name.split(/ (.+)?/);
                first_name = name_arr[0];
                if (name_arr.length > 1) {
                    last_name = name_arr[1];
                }
            }

            var formatted = {
                fingerprint: fingerprint,
                sessionId: sessionId,
                first: first_name,
                last: last_name,
                details: [{
                    emails: [],
                    phones: [],
                    addresses: []
                }],
                campaignId: _campaignId,
                emailId: vm.component.emailId,
                sendEmail: vm.component.sendEmail,
                skipWelcomeEmail: skipWelcomeEmail,
                fromEmail: vm.component.fromEmail,
                fromName: vm.component.fromName,
                contact_type: vm.component.tags,
                uniqueEmail: vm.component.uniqueEmail || false,
                activity: {
                    activityType: 'DONATE_FORM',
                    note: vm.formBuilder.Message || "Donate form data.",
                    sessionId: ipCookie("session_cookie").id,
                    contact: vm.formBuilder
                }
            };
            if (vm.formBuilder.email)
                formatted.details[0].emails.push({
                    email: vm.formBuilder.email
                });
            if (vm.formBuilder.phone) {
                formatted.details[0].phones.push({
                    number: vm.formBuilder.phone,
                    type: 'm'
                });
            }

            if (vm.formBuilder.address || vm.formBuilder.city || vm.formBuilder.state || vm.formBuilder.zip || vm.formBuilder.country) {
                formatted.details[0].addresses.push({
                    address: vm.formBuilder.address,
                    city: vm.formBuilder.city,
                    state: vm.formBuilder.state,
                    country: vm.formBuilder.country,
                    zip: vm.formBuilder.zip
                });
            }

            var url = $location.absUrl().split('?')[0];
            var order = {
                //"customer_id": customer._id,
                "cancelUrl": url + '?state=2&comp=donation',
                "returnUrl": url + '?state=5&comp=donation',
                "customer": formatted,
                "session_id": null,
                "status": "pending_payment",
                "cart_discount": 0,
                "total_discount": 0,
                "total_shipping": 0,
                "total_tax": 0,
                "shipping_tax": 0,
                "cart_tax": 0,
                "currency": "usd",
                "line_items": [], // { "product_id": 31, "quantity": 1, "variation_id": 7, "subtotal": "20.00", "tax_class": null, "sku": "", "total": "20.00", "name": "Product Name", "total_tax": "0.00" }
                "total_line_items_quantity": 1,
                "payment_details": {
                    "method_title": 'Credit Card Payment', //Check Payment, Credit Card Payment
                    "method_id": 'cc', //check, cc
                    "card_token": null, //Stripe card token if applicable
                    "charge_description": null, //description of charge if applicable
                    "statement_description": null, //22char string for cc statement if applicable
                    "paid": true
                },
                "shipping_methods": "",
                "shipping_address": {
                    "first_name": formatted.first,
                    "last_name": formatted.last,
                    "phone": vm.formBuilder.Phone || '',
                    "city": formatted.details[0].addresses.length ? formatted.details[0].addresses[0].city : '',
                    "country": "US",
                    "address_1": formatted.details[0].addresses.length ? formatted.details[0].addresses[0].address : '',
                    "company": "",
                    "postcode": formatted.details[0].addresses.length ? formatted.details[0].addresses[0].zip : '',
                    "email": formatted.details[0].emails.length ? formatted.details[0].emails[0].email : '',
                    "address_2": formatted.details[0].addresses.length ? formatted.details[0].addresses[0].address2 : '',
                    "state": formatted.details[0].addresses.length ? formatted.details[0].addresses[0].state : ''
                },
                "billing_address": {
                    "first_name": formatted.first,
                    "last_name": formatted.last,
                    "phone": vm.formBuilder.Phone || '',
                    "city": formatted.details[0].addresses.length ? formatted.details[0].addresses[0].city : '',
                    "country": "US",
                    "address_1": formatted.details[0].addresses.length ? formatted.details[0].addresses[0].address : '',
                    "company": "",
                    "postcode": formatted.details[0].addresses.length ? formatted.details[0].addresses[0].zip : '',
                    "email": formatted.details[0].emails.length ? formatted.details[0].emails[0].email : '',
                    "address_2": formatted.details[0].addresses.length ? formatted.details[0].addresses[0].address2 : '',
                    "state": formatted.details[0].addresses.length ? formatted.details[0].addresses[0].state : ''
                },
                "notes": []
            };

            var totalAmount = parseFloat(vm.formBuilder.amount);
            var _item = {
                "product_id": vm.product._id,
                "quantity": 1,
                "sale_price": totalAmount,
                "regular_price": totalAmount,
                "variation_id": '',
                "tax_class": null,
                "sku": "",
                "total": totalAmount,
                "name": vm.product.name,
                "total_tax": "0.00",
                "type": vm.product.type
            };
            order.line_items.push(_item);

            return order;
        }

        function paypalPayment() {
            vm.showPaypalLoading = true;

            if ($injector.has('orderService')) {
                var orderService = $injector.get('orderService');
                var order = _formattedOrder();

                orderService.createPaypalOrder(order, function(data) {
                    vm.order = data;
                    vm.showPaypalLoading = false;
                    if (data && !data._id) {
                        var failedOrderMessage = "Error in order processing";
                        console.log(failedOrderMessage);
                        if (data.message)
                            failedOrderMessage = data.message;
                        vm.checkoutModalState = 5;
                        vm.failedOrderMessage = failedOrderMessage;
                        return;
                    }
                    console.log('order, ', order);
                    vm.checkoutModalState = 3;
                    localStorageService.set(orderCookieKey, data);
                    vm.paypalKey = data.payment_details.payKey;
                    vm.formBuilder = {};
                });
            }
        }

        function paypalLoginClickFn() {
            var dgFlow = new PAYPAL.apps.DGFlow({
                expType: null
            });
            dgFlow.startFlow($location.absUrl());
            $('#form-donate-modal-' + vm.component._id).modal('hide');
        }

        function init(element) {
            vm.element = element;
            if ($injector.has("productService")) {
                var productService = $injector.get('productService');
                productService.getProduct(vm.component.productSettings.product.data, function(product) {
                    vm.product = product;
                });
            }

            if ($injector.has('accountService')) {
                var accountService = $injector.get('accountService');
                accountService(function(err, account) {
                    vm.account = account;
                    vm.paypalInfo = null;
                    vm.stripeInfo = null;

                    account.credentials.forEach(function(cred, index) {
                        if (cred.type == 'stripe') {
                            vm.stripeInfo = cred;
                        }
                    });

                    vm.paypalInfo = account.commerceSettings.paypal;
                });
            }

						console.log($routeParams, orderCookieData);
            if ($routeParams.state && $routeParams.comp == 'donation') {
                vm.checkoutModalState = parseInt($routeParams.state);
                $('#form-donate-modal-' + vm.component._id).modal('show');
                if (vm.checkoutModalState == 5 && orderCookieData) {
                    if ($injector.has('orderService')) {
                        var orderService = $injector.get('orderService');
                        orderService.setOrderPaid(orderCookieData, function(data) {
                            if (data && !data._id) {
                                var failedOrderMessage = "Error in order processing";
                                console.log(failedOrderMessage);
                                if (data.message)
                                    failedOrderMessage = data.message;
                                vm.failedOrderMessage = failedOrderMessage;
                                return;
                            }
                            localStorageService.remove(orderCookieKey);
                        });
                    }
                }
                if (vm.checkoutModalState == 2) {
                    vm.showPaypalErrorMsg = true;
                }
            }
        }

    }


})();

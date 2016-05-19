(function() {

    app.controller('SiteBuilderFormDonateComponentController', ssbFormDonateComponentController);

    ssbFormDonateComponentController.$inject = ['$scope', '$attrs', '$filter', '$transclude', '$injector', 'formValidations', '$timeout', '$sce', '$location', '$interval', 'ENV'];
    /* @ngInject */
    function ssbFormDonateComponentController($scope, $attrs, $filter, $transclude, $injector, formValidations, $timeout, $sce, $location, $interval, ENV) {

        console.info('ssb-form-donate directive init...')

        var productService = null;
        var localStorageService = null;
        var $routeParams = null;
        var orderCookieData = null;

        if ($injector.has('ProductService')) {
            productService = $injector.get('ProductService');
        }

        if ($injector.has("productService")) {
            productService = $injector.get('productService');
        }

        if ($injector.has("localStorageService")) {
            localStorageService = $injector.get('localStorageService');
        }

        if ($injector.has("$routeParams")) {
            $routeParams = $injector.get('$routeParams');
            orderCookieData = localStorageService.get(orderCookieKey);
        }

        var vm = this;
        var orderCookieKey = 'order_cookie';

        vm.init = init;

        vm.userExists = false;

        vm.formBuilder = {};
        vm.checkoutModalState = 1;
        vm.showPaypalErrorMsg = false;
        vm.showPaypalLoading = false;
        vm.isAnonymous = false;
        vm.paypalLoginClickFn = paypalLoginClickFn;
        vm.paypalURL = $sce.trustAsResourceUrl(ENV.paypalCheckoutURL);
        vm.facebookClientID = ENV.facebookClientID;
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
        vm.checkCardNumber = checkCardNumber;
        vm.checkCardName = checkCardName;
        vm.checkCardCvv = checkCardCvv;
        vm.checkCardExpiry = checkCardExpiry;
        vm.makeCartPayment = makeCartPayment;
        vm.deleteOrderFn = deleteOrderFn;
        vm.getDonations = getDonations;
        vm.augmentCompletePercentage = augmentCompletePercentage;
        vm.total = null;
        vm.percentage = null;
        vm.product = {};
        vm.close = close;
        //vm.parseFBShare = parseFBShare;
        vm.shareUrl = $location.url;
        vm.getProduct = getProduct;
        vm.getCredentials = getCredentials;
        vm.setInitialCheckoutState = setInitialCheckoutState;
        vm.setDefaultValues = setDefaultValues;
        vm.checkDateValidityFn = checkDateValidityFn;

        vm.nthRow = 'nth-row';

        vm.isEditing = $scope.$parent.vm && $scope.$parent.vm.uiState;


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
            if(field && field.fieldsPerRow){
                styleString = "min-width:" + Math.floor(100/field.fieldsPerRow) + '%';
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
            else{
                if(vm.formBuilder.FirstName){
                    first_name = vm.formBuilder.FirstName;
                }
                 if(vm.formBuilder.LastName){
                    last_name = vm.formBuilder.LastName;
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
            else{
                if(vm.formBuilder.FirstName){
                    first_name = vm.formBuilder.FirstName;
                }
                 if(vm.formBuilder.LastName){
                    last_name = vm.formBuilder.LastName;
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
                contact_type: vm.component.contact_type,
                tags: vm.component.tags,
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
                "isAnonymous": vm.isAnonymous,
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
                        //vm.parseFBShare();
                        vm.failedOrderMessage = failedOrderMessage;
                        return;
                    }
                    console.log('order, ', order);
                    vm.checkoutModalState = 3;
                    localStorageService.set(orderCookieKey, data);
                    vm.paypalKey = data.payment_details.payKey;
                    // vm.formBuilder = {};
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

        function checkCardNumber() {
            vm.failedOrderMessage = "";
            var card_number = $(vm.element).find('#donation-card-details #number').val();
            if (!card_number) {
                $(vm.element).find("#donation-card-details #card_number .error").html("Card Number Required");
                $(vm.element).find("#donation-card-details #card_number").addClass('has-error');
                $(vm.element).find("#donation-card-details #card_number .glyphicon").addClass('glyphicon-remove');
            } else {
                $(vm.element).find("#donation-card-details #card_number .error").html("");
                $(vm.element).find("#donation-card-details #card_number").removeClass('has-error').addClass('has-success');
                $(vm.element).find("#card_number .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
            }
        };

        function checkCardName() {
            vm.failedOrderMessage = "";
            var name = $(vm.element).find('#donation-card-details #card_name #name').val();
            if (!name) {
                $(vm.element).find("#donation-card-details #card_name .error").html("Card Name Required");
                $(vm.element).find("#donation-card-details #card_name").addClass('has-error');
                $(vm.element).find("#donation-card-details #card_name .glyphicon").addClass('glyphicon-remove');
            } else {
                $(vm.element).find("#donation-card-details #card_name .error").html("");
                $(vm.element).find("#donation-card-details #card_name").removeClass('has-error').addClass('has-success');
                $(vm.element).find("#donation-card-details #card_name .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
            }

        };

        function checkCardExpiry() {
            vm.failedOrderMessage = "";
            var expiry = $(vm.element).find('#donation-card-details #expiry').val();
            var card_expiry = expiry.split("/");
            var exp_month = card_expiry[0].trim();
            var exp_year;
            if (card_expiry.length > 1) {
                exp_year = card_expiry[1].trim();
            }

            if (!expiry || !exp_month || !exp_year) {
                if (!expiry) {
                    $(vm.element).find("#donation-card-details #card_expiry .error").html("Expiry Required");
                } else if (!exp_month) {
                    $(vm.element).find("#donation-card-details #card_expiry .error").html("Expiry Month Required");
                } else if (!exp_year) {
                    $(vm.element).find("#donation-card-details #card_expiry .error").html("Expiry Year Required");
                }
                $(vm.element).find("#donation-card-details #card_expiry").addClass('has-error');
                $(vm.element).find("#donation-card-details #card_expiry .glyphicon").addClass('glyphicon-remove');
            } else {
                $(vm.element).find("#donation-card-details #card_expiry .error").html("");
                $(vm.element).find("#donation-card-details #card_expiry .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
                $(vm.element).find("#donation-card-details #card_expiry").removeClass('has-error').addClass('has-success');
            }
        };

        function checkCardCvv() {
            vm.failedOrderMessage = "";
            var card_cvc = $(vm.element).find('#donation-card-details #cvc').val();
            if (!card_cvc) {
                $(vm.element).find("#donation-card-details #card_cvc .error").html("CVC Required");
                $(vm.element).find("#donation-card-details #card_cvc").addClass('has-error');
                $(vm.element).find("#donation-card-details #card_cvc .glyphicon").addClass('glyphicon-remove');
            } else {
                $(vm.element).find("#donation-card-details #card_cvc .error").html("");
                $(vm.element).find("#donation-card-details #card_cvc").removeClass('has-error').addClass('has-success');
                $(vm.element).find("#donation-card-details #card_cvc .glyphicon").removeClass('glyphicon-remove').addClass('glyphicon-ok');
            }
        };

        function makeCartPayment() {
            if ($injector.has('orderService')) {
                vm.failedOrderMessage = "";
                vm.checkoutModalState = 6;

                var expiry = $(vm.element).find('#donation-card-details #expiry').val().split("/");
                var exp_month = expiry[0].trim();
                var exp_year = "";
                if (expiry.length > 1) {
                    exp_year = expiry[1].trim();
                }
                var cardInput = {
                    name: $(vm.element).find('#donation-card-details #card_name #name').val(),
                    number: $(vm.element).find('#donation-card-details #number').val(),
                    cvc: $(vm.element).find('#donation-card-details #cvc').val(),
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
                    vm.checkCardName();
                    vm.checkCardNumber();
                    vm.checkCardExpiry();
                    vm.checkCardCvv();
                    vm.checkoutModalState = 4;
                    return;
                }
                var orderService = $injector.get('orderService');
                var order = _formattedOrder();
                if (order.customer) {
                    cardInput.name = order.customer.first + ' ' + order.customer.last;
                    // cardInput.address_line1 = order.customer.details[0].addresses.length ? order.customer.details[0].addresses[0].address : '';
                    // cardInput.address_city = order.customer.details[0].addresses ? order.customer.details[0].addresses[0].city : '';
                    // cardInput.address_state = order.customer.details[0].addresses ? order.customer.details[0].addresses[0].state : '';
                    // if (!vm.isAnonymous) {
                    //     cardInput.address_zip = order.customer.details[0].addresses ? order.customer.details[0].addresses[0].zip : '';
                    // }
                    // cardInput.address_country = order.customer.details[0].addresses ? order.customer.details[0].addresses[0].country : 'US';
                    // if (order.customer.details[0].addresses.length && order.customer.details[0].addresses[0].address2) {
                    //     cardInput.address_line2 = order.customer.details[0].addresses[0].address2;
                    // }
                }

                if ($injector.has('paymentService')) {
                    var paymentService = $injector.get('paymentService');
                    paymentService.getStripeCardToken(cardInput, function(token, error) {
                        if (error) {
                            switch (error.param) {
                                case "number":
                                    $(vm.element).find("#donation-card-details #card_number .error").html(error.message);
                                    $(vm.element).find("#donation-card-details #card_number").addClass('has-error');
                                    $(vm.element).find("#donation-card-details #card_number .glyphicon").addClass('glyphicon-remove');
                                    break;
                                case "exp_month":
                                    $(vm.element).find("#donation-card-details #card_expiry .error").html(error.message);
                                    $(vm.element).find("#donation-card-details #card_expiry").addClass('has-error');
                                    $(vm.element).find("#donation-card-details #card_expiry .glyphicon").addClass('glyphicon-remove');
                                    break;
                                case "exp_year":
                                    $(vm.element).find("#donation-card-details #card_expiry .error").html(error.message);
                                    $(vm.element).find("#donation-card-details #card_expiry").addClass('has-error');
                                    $(vm.element).find("#donation-card-details #card_expiry .glyphicon").addClass('glyphicon-remove');
                                    break;
                                case "cvc":
                                    $(vm.element).find("#donation-card-details #card_cvc .error").html(error.message);
                                    $(vm.element).find("#donation-card-details #card_cvc").addClass('has-error');
                                    $(vm.element).find("#donation-card-details #card_cvc .glyphicon").addClass('glyphicon-remove');
                                    break;
                                case "name":
                                    $(vm.element).find("#donation-card-details #card_name .error").html(error.message);
                                    $(vm.element).find("#donation-card-details #card_name").addClass('has-error');
                                    $(vm.element).find("#donation-card-details #card_name .glyphicon").addClass('glyphicon-remove');

                            }
                            vm.checkoutModalState = 4;
                            return;
                        }

                        order.payment_details.card_token = token;
                        orderService.createOrder(order, function(data) {
                            if (data && !data._id) {
                                var failedOrderMessage = "Error in order processing";
                                console.log(failedOrderMessage);
                                if (data.message)
                                    failedOrderMessage = data.message;
                                vm.checkoutModalState = 4;
                                vm.failedOrderMessage = failedOrderMessage;
                                return;
                            }
                            console.log('order, ', order);
                            //vm.parseFBShare();
                            vm.checkoutModalState = 5;
                            // vm.formBuilder = {};
                        });
                    });
                }
            }
        }

        function augmentCompletePercentage(percentage) {

            vm.completePercentageStyle = percentage + '%';

        }

        function getDonations(id) {
            if (vm.component.productSettings.goal) {
                productService.getAllOrdersForProduct(id, function(data) {
                    if (data.total) {
                        var percentage = data.total / vm.component.productSettings.goal * 100;
                        vm.augmentCompletePercentage(percentage);
                        vm.total = data.total;
                        vm.percentage = percentage.toFixed(0);
                    } else {
                        vm.setDefaultValues();
                    }
                })
            } else {
                vm.setDefaultValues();
            }
        }

        function close() {
            vm.formBuilder = {};
            vm.checkoutModalState = 1;
            vm.getDonations(vm.product._id);
        }

        function deleteOrderFn(order) {
            if ($injector.has('orderService')) {
              var orderService = $injector.get('orderService');
              orderService.deletePaypalOrder(order, function (data) {
                if (data.deleted) {
                  $('#form-donate-modal-' + vm.component._id).modal('hide');
                  vm.checkoutModalState = 1;
                }
              });
            }
        };

        function getProduct() {
            if (productService) {
                if (vm.component.productSettings.product) {
                    productService.getProduct(vm.component.productSettings.product.data, function(product) {
                        vm.product = product;
                        vm.getDonations(vm.product._id);
                    });
                } else {
                    vm.setDefaultValues();
                }

            }
        }

        function setDefaultValues() {
            vm.total = "0";
            vm.percentage = "0";
        }

        function getCredentials() {
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
        }

        function setInitialCheckoutState() {
            if ($routeParams && $routeParams.state && $routeParams.comp == 'donation') {
                vm.checkoutModalState = parseInt($routeParams.state);
                $timeout(function() {
                    $('#form-donate-modal-' + vm.component._id).modal('show');
                }, 1000);
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

        function checkDateValidityFn() {
          if (!angular.isDefined(vm.component.productSettings.timePeriod))  {
            return true;
          }

          if (vm.component.productSettings.timePeriod.startDate && vm.component.productSettings.timePeriod.endDate) {
            return (moment().isAfter(vm.component.productSettings.timePeriod.startDate) && moment().isBefore(vm.component.productSettings.timePeriod.endDate));
          } else if (vm.component.productSettings.timePeriod.startDate) {
            return moment().isAfter(vm.component.productSettings.timePeriod.startDate);
          } else if (vm.component.productSettings.timePeriod.endDate) {
            return moment().isBefore(vm.component.productSettings.timePeriod.endDate);
          } else {
            return true;
          }
        };

        function init(element) {
            vm.element = element;

            //vm.parseFBShare();

            $(vm.element).find('.modal').on('hidden.bs.modal', function () {
                vm.close();
            })

            if ($.card) {
                vm.card = $(vm.element).find('#donation-card-details').card({
                    container: $(vm.element).find('.card-wrapper')
                });
            }

            $scope.$watch('vm.component.productSettings.product', function(val) {
                if (val) {
                    vm.getProduct();
                }
            });

            if (vm.component.productSettings) {

                vm.getProduct();

                vm.getCredentials();

                vm.setInitialCheckoutState();

            }
        }

    }


})();

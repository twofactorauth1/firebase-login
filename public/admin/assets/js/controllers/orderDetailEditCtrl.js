'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
(function (angular) {
    app.controller('OrderDetailEditCtrl', ["$scope", "toaster", "$modal", "$filter", "$stateParams", "$location", "OrderService", "ContactService", "UserService", "ProductService", "SweetAlert", "orderConstant", "productConstant", function ($scope, toaster, $modal, $filter, $stateParams, $location, OrderService, ContactService, UserService, ProductService, SweetAlert, orderConstant, productConstant) {

            $scope.dataLoaded = false;
            $scope.billing = {sameAsBilling: false};

            //TODO
            // - $q all api calls
            // 1. getCustomers
            // 2. getUsers
            // 3. getProducts
            // 4. get Order
            if (orderConstant) {
                $scope.FailedStatus = orderConstant.order_status.FAILED;
            }

            /*
             * @dateOptions
             * -
             */

            $scope.dateOptions = {
                formatYear: 'yy',
                startingDay: 1
            };

            $scope.maxOrderDate = moment();
            $scope.maxOrderDate.add(orderConstant.MAX_ORDER_DAYS || 15, 'days');
            /*
             * @getCustomers
             * get all customers to for customer select
             */

            ContactService.getContacts(function (customers) {
                $scope.customers = customers;
                $scope.getUsers();
            });

            /*
             * @closeModal
             * -
             */

            $scope.closeModal = function () {
                $scope.modalInstance.close();
            };

            /*
             * @openModal
             * -
             */

            $scope.openModal = function (modal) {
                $scope.modalInstance = $modal.open({
                    templateUrl: modal,
                    keyboard: false,
                    backdrop: 'static',
                    scope: $scope
                });
            };

            $scope.formatOrderStatus = function (status) {
                return OrderService.formatOrderStatus(status);
            };

            /*
             * @getUsers
             * get all users for this account
             */

            $scope.getUsers = function () {
                UserService.getUsers(function (users) {
                    $scope.users = users;
                    $scope.getProducts();
                });
            };

            /*
             * @getProducts
             * get all products
             */

            $scope.getProducts = function () {
                ProductService.getProducts(function (products) {
                    $scope.products = products;
                    $scope.activeProducts = products.filter(function (product) {
                        return product.status === productConstant.product_status_types.ACTIVE
                    });
                    $scope.getOrder();
                });
            };

            $scope.eliminateUsedProducts = function () {
                $scope.filterProducts = angular.copy($scope.activeProducts);
                _.each($scope.order.line_items, function (line_item) {
                    var matchProduct = _.find($scope.filterProducts, function (product) {
                        return product._id === line_item.product_id;
                    });
                    if (matchProduct) {
                        var index = _.indexOf($scope.filterProducts, matchProduct);
                        if (index > -1) {
                            $scope.filterProducts.splice(index, 1);
                        }
                    }
                });
            };

            /*
             * @getOrder
             * get order based on the orderId in url
             */

            /*
             * @compareAddress
             * compare order shipping and billing address
             */

            $scope.compareAddress = function () {
                if ($scope.order.shipping_address && $scope.order.billing_address && $scope.order.billing_address.hasOwnProperty("address_1") && angular.equals($scope.order.shipping_address, $scope.order.billing_address)) {
                    $scope.billing.sameAsBilling = true;
                }
            };

            $scope.getOrder = function () {
                OrderService.getOrders(function (orders) {
                    if ($stateParams.orderId) {
                        var order = _.find(orders, function (order) {
                            return order._id === $stateParams.orderId;
                        });
                        //add customer obj to each note
                        // var notes = order.notes;
                        order.notes = $scope.matchUsers(order);
                        order.line_items = $scope.matchProducts(order);
                        $scope.currentStatus = order.status;

                        order.locked = true; // TODO: remove this when server sends 'locked' property
                        $scope.order = order;
                        console.info('order >>>', order);
                        $scope.eliminateUsedProducts();
                        $scope.selectedCustomer = _.find($scope.customers, function (customer) {
                            return customer._id === $scope.order.customer_id;
                        });
                        $scope.calculateTotals();
                        $scope.compareAddress();
                    } else {
                        $scope.order = {
                            created: {
                                date: new Date().toISOString()
                            },
                            order_id: orders.length + 1,
                            status: 'pending_payment',
                            line_items: [],
                            notes: []
                        };
                        $scope.eliminateUsedProducts();
                        console.log('$scope.order ', $scope.order);

                    }
                    $scope.originalOrder = angular.copy($scope.order);
                    $scope.dataLoaded = true;
                });
            };

            $scope.checkIfDirty = function () {
                var isDirty = false;
                if ($scope.newNote)
                    isDirty = true;
                if ($scope.originalOrder && !angular.equals($scope.originalOrder, $scope.order))
                    isDirty = true;
                return isDirty;
            }

            $scope.resetDirty = function () {
                $scope.originalOrder = null;
                $scope.order = null;
            }

            /*
             * @calculateTotals
             * -
             */

            $scope.calculateTotals = function () {
                console.log('calculateTotals >>>');
                var _subtotal = 0;
                var _total = 0;
                var _discount = 0;
                var _tax = 0;
                var _taxrate = $scope.order.tax_rate || 0;
                var _subtotalTaxable = 0;

                _.each($scope.order.line_items, function (line_item) {
                    if (!line_item.product) {
                        return;
                    }
                    var item_price = line_item.on_sale ? line_item.sale_price : line_item.regular_price;
                    if (line_item.quantity) {
                        line_item.total = item_price * line_item.quantity;
                    }
                    if (line_item.discount) {
                        var _dc = parseFloat(line_item.discount);
                        line_item.total -= _dc;
                        _discount += _dc;
                        _total -= _dc;
                    }
                    _subtotal += parseFloat(item_price) * parseFloat(line_item.quantity);
                    _total += parseFloat(item_price) * parseFloat(line_item.quantity);
                    if (line_item.taxable) {
                        _subtotalTaxable += parseFloat(item_price) * parseFloat(line_item.quantity);
                    }
                });

                $scope.order.subtotal = _subtotal;
                $scope.order.total_discount = _discount;
                if (_discount) {
                    $scope.calculatedDiscountPercent = ((parseFloat(_discount) * 100) / parseFloat(_subtotal)).toFixed(2);
                } else {
                    $scope.calculatedDiscountPercent = '';
                }
                if (_subtotalTaxable > 0) {
                    $scope.order.total_tax = (_subtotalTaxable - _discount) * _taxrate;
                } else {
                    $scope.order.total_tax = 0;
                }

                $scope.order.total = ((_subtotal + $scope.order.total_tax) - _discount);
            };

            /*
             * @totalWithDiscount
             * -
             */

            $scope.totalWithDiscount = function (total, discount) {
                return parseFloat(total) + parseFloat(discount);
            };

            var checkBeforeRedirect = function (cust) {

                SweetAlert.swal({
                    title: "Are you sure?",
                    text: "You have unsaved data that will be lost",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "Yes, save changes!",
                    cancelButtonText: "No, do not save changes!",
                    closeOnConfirm: true,
                    closeOnCancel: true
                }, function (isConfirm) {
                    if (isConfirm) {
                        $scope.saveOrder(1, cust);
                    } else {
                        SweetAlert.swal("Cancelled", "Your edits were NOT saved.", "error");
                    }
                });
            };

            /*
             * @navToCustomer
             */
            $scope.navToCustomer = function (cust) {
                if ($stateParams.orderId) {
                    var cust_url = '/contacts/' + cust._id;
                    $location.url(cust_url).search({
                        order: "true",
                        id: $scope.order._id
                    });
                } else {
                    checkBeforeRedirect(cust);
                }

            };


            /*
             * @clearCustomer
             * - clear the customer
             */

            $scope.clearCustomer = function () {
                $scope.selectedCustomer = null;
            };

            /*
             * @clearProduct
             * - clear the product
             */

            $scope.clearProduct = function () {
                $scope.selectedProduct = null;
            };

            /*
             * @matchUsers
             * match users to the order notes
             */
            $scope.matchUsers = function (order) {

                var notes = order.notes;

                if (notes && notes.length > 0 && $scope.users) {

                    _.each(notes, function (_note) {

                        var matchingUser = _.find($scope.users, function (_user) {
                            return _user._id === _note.user_id;
                        });

                        if (matchingUser) {

                            _note.user = {
                                _id: matchingUser._id,
                                first: matchingUser.first,
                                last: matchingUser.last,
                                email: matchingUser.email,
                                profilePhotos: matchingUser.profilePhotos
                            };

                        }

                    });
                }

                return notes;
            };


            /*
             * @matchProducts
             * match products to the order line items
             */

            $scope.matchProducts = function (order) {
                var lineitems = order.line_items || {};
                if (lineitems.length > 0) {
                    _.each(lineitems, function (item) {
                        var matchProduct = _.find($scope.products, function (product) {
                            return product._id === item.product_id;
                        });
                        item.product = matchProduct;
                        if (!$stateParams.orderId) {
                            item.discount = 0.00;
                        }
                    });
                }

                return lineitems;
            };

            /*
             * @addNote
             * add a note to an order
             */

            $scope.addNote = function () {

                if (!$scope.order.notes) {
                    $scope.order.notes = [];
                }

                var date = moment();
                var _noteToPush = {
                    note: $scope.newNote,
                    user_id: $scope.currentUser._id,
                    date: date.toISOString()
                };

                $scope.order.notes.push(_noteToPush);

                $scope.pushLocalNote($scope.order, true);

                if ($scope.order && $scope.order._id) {
                    OrderService.updateOrder($scope.order, function (updatedOrder) {
                        toaster.pop('success', 'Note added to order.');
                        $scope.newNote = '';
                        $scope.order = updatedOrder;
                        angular.copy($scope.order, $scope.originalOrder);
                    });
                } else if ($scope.order) {
                    $scope.newNote = '';
                }

            };

            /*
             * @pushLocalNote
             * push a recently created note to the ui
             */

            $scope.pushLocalNote = function (order, new_order) {
                order.notes = $scope.matchUsers(order);
                if (!new_order) {
                    var noteToPush = order.notes[order.notes.length - 1];
                    $scope.order.notes.push(noteToPush);
                }
            };

            /*
             * @addProductLineItem
             * add a product line item to the order
             */

            $scope.checkOnSaleFn = function (_product) {
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
            };

            $scope.addProductLineItem = function (selected) {
                console.log('selected ', selected);
                var _line_item = {
                    "product_id": selected._id,
                    "quantity": 1,
                    "regular_price": selected.regular_price,
                    "sale_price": selected.on_sale ? selected.sale_price : null,
                    "on_sale": $scope.checkOnSaleFn(selected),
                    "taxable": selected.taxable || false,
                    "sku": selected.sku,
                    "total": selected.regular_price,
                    "name": selected.name,
                    "product": selected,
                    "type": selected.type
                };
                $scope.order.line_items.push(_line_item);
                $scope.calculateTotals();
                $scope.clearProduct();
                $scope.eliminateUsedProducts();
                $scope.closeModal();
            };

            /*
             * @removeLineItem
             * remove a product line item from the order
             */

            $scope.removeLineItem = function (index) {
                var lineItems = $scope.order.line_items;
                var filteredLineItems = [];
                _.each(lineItems, function (item, i) {
                    if (i !== index) {
                        filteredLineItems.push(item);
                    }
                });
                $scope.order.line_items = filteredLineItems;
                $scope.eliminateUsedProducts();
                $scope.calculateTotals();
            };

            /*
             * @openProductLineItemModal
             * add a product line item modal
             */

            $scope.openProductLineItemModal = function () {
                console.log('openProductLineItemModal');
                $scope.openModal('add-product-lineitem-modal');
            };

            /*
             * @formatInput
             * format the customer input to show "First Last (#ID email)"
             */

            $scope.formatInput = function (model) {
                if (model) {
                    var email = 'No Email';
                    if (model.details[0] && model.details[0].emails.length > 0) {
                        email = model.details[0].emails[0].email;
                    }
                    return (model.first || '') + ' ' + (model.last || '') + ' (#' + model._id + ' ' + email + ') ';
                }

                return '';
            };

            /*
             * @open
             * -
             */

            $scope.open = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.opened = !$scope.opened;
            };

            /*
             * @endOpen
             * -
             */

            $scope.endOpen = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.startOpened = false;
                $scope.endOpened = !$scope.endOpened;
            };

            /*
             * @startOpen
             * -
             */

            $scope.startOpen = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.endOpened = false;
                $scope.startOpened = !$scope.startOpened;
            };

            /*
             * @customerSync
             * sync order shipping and billing information with selected customer
             */

            $scope.customerSync = function (type) {
                var customer = $scope.selectedCustomer;
                var addresses = customer.details[0].addresses;
                var emails = customer.details[0].emails;
                var phones = customer.details[0].phones;
                var defaultBilling, defaultShipping;
                //find default address else get first
                var i = 0;
                for (i; i < addresses.length; i++) {
                    if (addresses[i].defaultBilling) {
                        defaultBilling = addresses[i];
                    }
                    if (addresses[i].defaultShipping) {
                        defaultShipping = addresses[i];
                    }
                }

                if (!defaultBilling) {
                    defaultBilling = addresses[0];
                }
                if (!defaultShipping) {
                    defaultShipping = addresses[0];
                }

                //check if exists and set defaults

                var first = '';
                if (customer.first) {
                    first = customer.first;
                }

                var last = '';
                if (customer.last) {
                    last = customer.last;
                }

                var phone = '';
                if (phones.length > 0) {
                    phone = phones[0].number;
                }

                var email = '';
                if (emails.length > 0) {
                    email = emails[0].email;
                }

                var company = '';
                if (customer.company) {
                    company = customer.company;
                }

                var billingAddress1 = '';
                var billingAddress2 = '';
                var billingCity = '';
                var billingState = '';
                var billingPostcode = '';
                var billingCountry = '';

                if (defaultBilling) {

                    if (defaultBilling.address) {
                        billingAddress1 = defaultBilling.address;
                    }

                    if (defaultBilling.address2) {
                        billingAddress2 = defaultBilling.address2;
                    }

                    if (defaultBilling.city) {
                        billingCity = defaultBilling.city;
                    }

                    if (defaultBilling.state) {
                        billingState = defaultBilling.state;
                    }

                    if (defaultBilling.zip) {
                        billingPostcode = defaultBilling.zip;
                    }

                    if (defaultBilling.country) {
                        billingCountry = defaultBilling.country;
                    }

                }

                var shippingAddress1 = '';
                var shippingAddress2 = '';
                var shippingCity = '';
                var shippingState = '';
                var shippingPostcode = '';
                var shippingCountry = '';

                if (defaultShipping) {

                    if (defaultShipping.address) {
                        shippingAddress1 = defaultShipping.address;
                    }

                    if (defaultShipping.address2) {
                        shippingAddress2 = defaultShipping.address2;
                    }

                    if (defaultShipping.city) {
                        shippingCity = defaultShipping.city;
                    }

                    if (defaultShipping.state) {
                        shippingState = defaultShipping.state;
                    }

                    if (defaultShipping.zip) {
                        shippingPostcode = defaultShipping.zip;
                    }

                    if (defaultShipping.country) {
                        shippingCountry = defaultShipping.country;
                    }

                }

                if (type === 'billing') {
                    var newBillingAddress = {
                        "first_name": first,
                        "last_name": last,
                        "phone": phone,
                        "email": email,
                        "company": company,
                        "address_1": billingAddress1,
                        "address_2": billingAddress2,
                        "city": billingCity,
                        "state": billingState,
                        "postcode": billingPostcode,
                        "country": billingCountry
                    };
                    $scope.order.billing_address = newBillingAddress;
                }

                if (type === 'shipping') {
                    var newShippingAddress = {
                        "first_name": first,
                        "last_name": last,
                        "phone": phone,
                        "email": email,
                        "company": company,
                        "address_1": shippingAddress1,
                        "address_2": shippingAddress2,
                        "city": shippingCity,
                        "state": shippingState,
                        "postcode": shippingPostcode,
                        "country": shippingCountry
                    };
                    $scope.order.shipping_address = newShippingAddress;
                }
            };

            /*
             * @statusUpdated
             * the order status has been updated
             */

            $scope.statusUpdated = function (newStatus) {
                if ($scope.order.status === newStatus) {
                    return;
                }
                var toasterMsg = 'Status has been updated to ';
                var note = 'Order status changed from ' + $scope.order.status + ' to ' + newStatus;
                if (newStatus === 'processing') {
                    toaster.pop('success', toasterMsg + ' "Processing"');
                    //send processing email
                }

                if (newStatus === 'on_hold') {
                    toaster.pop('success', toasterMsg + '"On Hold"');
                }


                if (newStatus === 'pending_payment') {
                    toaster.pop('success', toasterMsg + '"Pending Payment"');
                }

                if (newStatus === 'completed') {
                    if ($scope.order._id) {
                        OrderService.completeOrder($scope.order._id, note, function (completedOrder) {
                            toaster.pop('success', toasterMsg + '"Completed"');
                            $scope.originalOrder.status = 'completed';
                            var update = false;
                            if (angular.equals($scope.order, $scope.originalOrder))
                                update = true;
                            $scope.pushLocalNote(completedOrder);
                            if (update)
                                angular.copy($scope.order, $scope.originalOrder);
                        });
                    } else {
                        toaster.pop('success', toasterMsg + '"Completed"');
                    }

                }

                if (newStatus === 'cancelled') {
                    toaster.pop('success', toasterMsg + '"Cancelled"');
                }

                if (newStatus === 'refunded') {
                    SweetAlert.swal({
                        title: "Are you sure?",
                        text: "This order will be refunded and all funds will be returned.",
                        type: "warning",
                        showCancelButton: true,
                        confirmButtonColor: "#DD6B55",
                        confirmButtonText: "Yes, refund it.",
                        cancelButtonText: "No, cancel!",
                        closeOnConfirm: false,
                        closeOnCancel: false
                    }, function (isConfirm) {
                        if (isConfirm) {
                            OrderService.refundOrder($scope.order._id, $scope.reasonData, function (data, error) {
                                if (error) {
                                    SweetAlert.swal(error.status, error.message, "error");
                                } else {
                                    console.log('data ', data);
                                    if ($scope.order.payment_details.payKey) {
                                        SweetAlert.swal("Refunded", "Order has been refunded.", "success");
                                        toaster.pop('warning', 'We currently do not support refunding payments from Paypal. Please log into your paypal account and initiate the refund from there.');
                                    } else {
                                        SweetAlert.swal("Refunded", "Order has been refunded.", "success");
                                    }
                                    $scope.order.status = newStatus;
                                    $scope.currentStatus = newStatus;
                                }
                            });
                        } else {
                            SweetAlert.swal("Cancelled", "Order refund cancelled.", "error");
                        }
                    });
                }

                if (newStatus === 'failed') {
                    toaster.pop('success', toasterMsg + '"Failed"');
                }
                if (newStatus !== 'refunded') {
                    $scope.order.status = newStatus;
                    $scope.currentStatus = newStatus;
                }

            };

            /*
             * @sendEmail
             * re-send a variety of emails
             */

            $scope.sendEmail = function (type) {
                console.log('sending email type: ', type);
                // if (type === 'new-order') {}
                // if (type === 'cancelled-order') {}
                // if (type === 'processing-order') {}
                // if (type === 'completed-order') {}
                // if (type === 'customer-invoice') {}
            };

            /*
             * @print
             * print a variety of things
             */

            $scope.print = function (type) {
                console.log('printing type: ', type);
                // if (type === 'invoice') {}
                // if (type === 'packing-slip') {}
            };

            /*
             * @saveOrder
             * -
             */

            $scope.saveOrder = function (flag, cust, invalid) {
                $scope.pageSaving = true;
                $scope.formSubmitted = true;
                $scope.saveLoading = true;
                // Set order customer Id
                if ($scope.selectedCustomer) {
                    $scope.order.customer_id = $scope.selectedCustomer._id;
                } else {
                    $scope.order.customer_id = null;
                }

                //validate

                if (!$scope.order) {
                    toaster.pop('error', 'Orders can not be blank.');
                    $scope.saveLoading = false;
                    return;
                }

                if (!$scope.order.created.date) {
                    $scope.order.created.date = new Date().toISOString();
                }

                if (!$scope.order.customer_id) {
                    toaster.pop('error', 'Orders must contain a customer.');
                    $scope.saveLoading = false;
                    return;
                }
                if ($scope.order.line_items.length <= 0) {
                    toaster.pop('error', 'Products cannot be blank');
                    $scope.saveLoading = false;
                    return;
                }
                if (!$scope.order.billing_address || invalid) {
                    $scope.billingEdit = true;
                    toaster.pop('error', 'Billing details cannot be blank');
                    $scope.saveLoading = false;
                    return;
                }
                if ($stateParams.orderId) {
                    OrderService.updateOrder($scope.order, function (updatedOrder) {
                        $scope.saveLoading = false;
                        angular.copy($scope.order, $scope.originalOrder);
                        console.log('updatedOrder ', updatedOrder);
                        toaster.pop('success', 'Order updated successfully.');
                        $scope.pageSaving = false;
                        
                    });
                } else {
                    OrderService.createOrder($scope.order, function (updatedOrder) {
                        toaster.pop('success', 'Order created successfully.');
                        angular.copy($scope.order, $scope.originalOrder);
                        $scope.saveLoading = false;
                        $scope.pageSaving = false;
                        if (flag == 1) {
                            SweetAlert.swal("Saved!", "Your edits were saved to the page.", "success");
                            var cust_url = '/customers/' + cust._id;
                            $location.url(cust_url).search({
                                order: "true",
                                id: updatedOrder._id,
                            });
                        }
                    });
                }
            };

            $scope.isDonationOrderFn = function () {
                if (!$scope.order) {
                    return isDonation;
                }

                var isDonation = _.findWhere($scope.order.line_items, {type: 'DONATION'}) ? true : false;
                return isDonation;
            };

        }]);
}(angular));

'use strict';
/**
 * controller for orders
 */
(function(angular) {
    app.controller('OrderDetailCtrl', ["$scope", "toaster", "$modal", "$filter", "$stateParams", "OrderService", "CustomerService", "UserService", "ProductService", function($scope, toaster, $modal, $filter, $stateParams, OrderService, CustomerService, UserService, ProductService) {

    	//TODO
    	// - $q all api calls
    	// 1. getCustomers
    	// 2. getUsers
    	// 3. getProducts
    	// 4. get Order

        /*
         * @getCustomers
         * get all customers to for customer select
         */

        CustomerService.getCustomers(function(customers) {
            console.log('customers >>> ', customers);
            $scope.customers = customers;
            $scope.getUsers();
        });

        /*
         * @getUsers
         * get all users for this account
         */

        $scope.getUsers = function() {
            UserService.getUsers(function(users) {
                console.log('users >>> ', users);
                $scope.users = users;
                $scope.getProducts();
            });
        };

        /*
         * @getProducts
         * get all products
         */

        $scope.getProducts = function() {
        	ProductService.getProducts(function(products) {
        		console.log('products >>> ', products);
        		$scope.products = products;
        		$scope.getOrder();
        	});
        };

        /*
         * @getOrder
         * get order based on the orderId in url
         */

        $scope.getOrder = function() {
            OrderService.getOrder($stateParams.orderId, function(order) {
                //add customer obj to each note
                var notes = order.notes;
                order.notes = $scope.matchUsers(order);
                order.line_items = $scope.matchProducts(order);
                $scope.order = order;
            });
        };

        /*
         * @matchUsers
         * match users to the order notes
         */

        $scope.matchUsers = function(order) {
            var notes = order.notes;
            if (notes.length > 0) {
                for (var i = 0; i < notes.length; i++) {
                    for (var j = 0; j < $scope.users.length; j++) {
                        if (notes[i].user_id == $scope.users[j]._id) {
                            notes[i].user = $scope.users[j];
                        }
                    };
                }
            }

            return notes;
        };

        /*
         * @matchProducts
         * match products to the order line items
         */

        $scope.matchProducts = function(order) {
            var lineitems = order.line_items;
            if (lineitems.length > 0) {
                for (var i = 0; i < lineitems.length; i++) {
                    for (var j = 0; j < $scope.products.length; j++) {
                        if (lineitems[i].product_id == $scope.products[j]._id) {
                            lineitems[i].product = $scope.products[j];
                        }
                    };
                }
            }

            return lineitems;
        };

        /*
         * @addNote
         * add a note to an order
         */

        $scope.addNote = function() {
            OrderService.completeOrder($scope.order._id, $scope.newNote, function(updatedOrder) {
                toaster.pop('success', 'Note added to order.');
                $scope.newNote = '';
                $scope.pushLocalNote(updatedOrder);
            });
        };

        /*
         * @pushLocalNote
         * push a recently created note to the ui
         */

        $scope.pushLocalNote = function(order) {
            order.notes = $scope.matchUsers(order);
            var noteToPush = order.notes[order.notes.length - 1];
            $scope.order.notes.push(noteToPush);
        };

        /*
         * @formatInput
         * format the customer input to show "First Last (#ID email)"
         */

        $scope.formatInput = function(model) {
            console.log('model >>> ', model);
            var email = model.email || 'No Email';
            return model.first + ' ' + model.last + ' (#' + model._id + ' ' + email + ') ';
        };

        /*
         * @customerSync
         * sync order shipping and billing information with selected customer
         */

        $scope.customerSync = function(type) {
            var customer = $scope.selectedCustomer;
            var addresses = customer.details[0].addresses;
            var emails = customer.details[0].emails;
            var phones = customer.details[0].phones;
            var defaultBilling, defaultShipping;
            //find default address else get first
            for (var i = 0; i < addresses.length; i++) {
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

            if (type == 'billing') {
                var newBillingAddress = {
                    "first_name": customer.first,
                    "last_name": customer.last,
                    "phone": phones[0].phone,
                    "email": emails[0].email,
                    "company": customer.company,
                    "address_1": defaultBilling.address_1,
                    "address_2": defaultBilling.address_2,
                    "city": defaultBilling.city,
                    "state": defaultBilling.state,
                    "postcode": defaultBilling.postcode,
                    "country": defaultBilling.country
                };
                $scope.order.billing_address = newBillingAddress;
            }

            if (type == 'shipping') {
                var newShippingAddress = {
                    "first_name": customer.first,
                    "last_name": customer.last,
                    "phone": phones[0].phone,
                    "email": emails[0].email,
                    "company": customer.company,
                    "address_1": defaultShipping.address_1,
                    "address_2": defaultShipping.address_2,
                    "city": defaultShipping.city,
                    "state": defaultShipping.state,
                    "postcode": defaultShipping.postcode,
                    "country": defaultShipping.country
                };
                $scope.order.shipping_address = newShippingAddress;
            }
        };

        /*
         * @statusUpdated
         * the order status has been updated
         */

        $scope.statusUpdated = function() {
            var newStatus = $scope.newStatus;
            var toasterMsg = 'Status has been updated to ';
            var note = 'Order status changed from ' + $scope.order.status + ' to ' + newStatus;
            if (newStatus == 'processing') {
                toaster.pop('success', toasterMsg + ' "Processing"');
                //send processing email
            }

            if (newStatus == 'on_hold') {
                toaster.pop('success', toasterMsg + '"On Hold"');
            }

            if (newStatus == 'completed') {
                OrderService.completeOrder($scope.order._id, note, function(completedOrder) {
                    toaster.pop('success', toasterMsg + '"Completed"');
                    $scope.pushLocalNote(completedOrder);
                });
            }

            if (newStatus == 'cancelled') {
                toaster.pop('success', toasterMsg + '"Cancelled"');
            }

            if (newStatus == 'refunded') {
                toaster.pop('success', toasterMsg + '"Refunded"');
            }

            if (newStatus == 'failed') {
                toaster.pop('success', toasterMsg + '"Failed"');
            }
            $scope.order.status = newStatus;
        };

        /*
         * @refundOrder
         * refund the order
         */

        $scope.refundOrder = function() {
            console.log('refund order');
        };

        /*
         * @duplicateOrder
         * duplicate the order
         */

        $scope.duplicateOrder = function() {
            console.log('duplicate order');
        };

        /*
         * @sendEmail
         * re-send a variety of emails
         */

        $scope.sendEmail = function(type) {
            console.log('sending email type: ', type);
            if (type == 'new-order') {}
            if (type == 'cancelled-order') {}
            if (type == 'processing-order') {}
            if (type == 'completed-order') {}
            if (type == 'customer-invoice') {}
        };

        /*
         * @print
         * print a variety of things
         */

        $scope.print = function(type) {
            console.log('printing type: ', type);
            if (type == 'invoice') {}
            if (type == 'packing-slip') {}
        };



    }]);
})(angular);

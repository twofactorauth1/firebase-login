'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('OrderDetailCtrl', ["$scope", "toaster", "$modal", "$filter", "$stateParams", "OrderService", "CustomerService", "UserService", "ProductService", "SweetAlert", function ($scope, toaster, $modal, $filter, $stateParams, OrderService, CustomerService, UserService, ProductService, SweetAlert) {

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

    CustomerService.getCustomers(function (customers) {
      console.log('customers >>> ', customers);
      $scope.customers = customers;
      $scope.getUsers();
    });

    /*
     * @getUsers
     * get all users for this account
     */

    $scope.getUsers = function () {
      UserService.getUsers(function (users) {
        console.log('users >>> ', users);
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
        console.log('products >>> ', products);
        $scope.products = products;
        $scope.getOrder();
      });
    };

    /*
     * @getOrder
     * get order based on the orderId in url
     */

    $scope.getOrder = function () {
      OrderService.getOrder($stateParams.orderId, function (order) {
        //add customer obj to each note
        // var notes = order.notes;
        order.notes = $scope.matchUsers(order);
        order.line_items = $scope.matchProducts(order);
        $scope.currentStatus = order.status;
        $scope.order = order;
        $scope.selectedCustomer = _.find($scope.customers, function(customer) {
          return customer._id = $scope.order.customer_id;
        });
      });
    };

    /*
     * @clearCustomer
     * - clear the customer
     */

    $scope.clearCustomer = function() {
      $scope.selectedCustomer = null;
    };

    /*
     * @matchUsers
     * match users to the order notes
     */

    $scope.matchUsers = function (order) {
      var notes = order.notes;
      if (notes.length > 0) {
        var i = 0;
        var j = 0;
        for (i; i < notes.length; i++) {
          for (j; j < $scope.users.length; j++) {
            if (notes[i].user_id === $scope.users[j]._id) {
              notes[i].user = $scope.users[j];
            }
          }
        }
      }

      return notes;
    };

    /*
     * @matchProducts
     * match products to the order line items
     */

    $scope.matchProducts = function (order) {
      var lineitems = order.line_items;
      if (lineitems.length > 0) {
        var i = 0;
        var j = 0;
        for (i; i < lineitems.length; i++) {
          for (j; j < $scope.products.length; j++) {
            if (lineitems[i].product_id === $scope.products[j]._id) {
              lineitems[i].product = $scope.products[j];
            }
          }
        }
      }

      return lineitems;
    };

    /*
     * @addNote
     * add a note to an order
     */

    $scope.addNote = function () {
      OrderService.completeOrder($scope.order._id, $scope.newNote, function (updatedOrder) {
        toaster.pop('success', 'Note added to order.');
        $scope.newNote = '';
        $scope.pushLocalNote(updatedOrder);
      });
    };

    /*
     * @pushLocalNote
     * push a recently created note to the ui
     */

    $scope.pushLocalNote = function (order) {
      order.notes = $scope.matchUsers(order);
      var noteToPush = order.notes[order.notes.length - 1];
      $scope.order.notes.push(noteToPush);
    };

    /*
     * @formatInput
     * format the customer input to show "First Last (#ID email)"
     */

    $scope.formatInput = function (model) {
      console.log('model >>> ', model);
      if (model) {

        var email = 'No Email';
        if (model.email) {
          email = model.email;
        }

        return model.first + ' ' + model.last + ' (#' + model._id + ' ' + email + ') ';
      }

      return '';
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
        phone = phones[0].phone;
      }

      var email = '';
      if (emails.length > 0) {
        email = emails[0].email;
      }

      var company = '';
      if (customer.company) {
        company = customer.company;
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

        if (defaultBilling.address_1) {
          billingAddress1 = defaultBilling.address_1;
        }

        if (defaultBilling.address_2) {
          billingAddress2 = defaultBilling.address_2;
        }

        if (defaultBilling.city) {
          billingCity = defaultBilling.city;
        }

        if (defaultBilling.state) {
          billingState = defaultBilling.state;
        }

        if (defaultBilling.postcode) {
          billingPostcode = defaultBilling.postcode;
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

        if (defaultShipping.address_1) {
          shippingAddress1 = defaultShipping.address_1;
        }

        if (defaultShipping.address_2) {
          shippingAddress2 = defaultShipping.address_2;
        }

        if (defaultShipping.city) {
          shippingCity = defaultShipping.city;
        }

        if (defaultShipping.state) {
          shippingState = defaultShipping.state;
        }

        if (defaultShipping.postcode) {
          shippingPostcode = defaultShipping.postcode;
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
      var toasterMsg = 'Status has been updated to ';
      var note = 'Order status changed from ' + $scope.order.status + ' to ' + newStatus;
      if (newStatus === 'processing') {
        toaster.pop('success', toasterMsg + ' "Processing"');
        //send processing email
      }

      if (newStatus === 'on_hold') {
        toaster.pop('success', toasterMsg + '"On Hold"');
      }

      if (newStatus === 'completed') {
        OrderService.completeOrder($scope.order._id, note, function (completedOrder) {
          toaster.pop('success', toasterMsg + '"Completed"');
          $scope.pushLocalNote(completedOrder);
        });
      }

      if (newStatus === 'cancelled') {
        toaster.pop('success', toasterMsg + '"Cancelled"');
      }

      if (newStatus === 'refunded') {
        SweetAlert.swal({
            title: "Are you sure?",
            text: "This order will be refunded and funds will be returned.",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, refund it.",
            cancelButtonText: "No, cancel!",
            closeOnConfirm: false,
            closeOnCancel: false
        }, function (isConfirm) {
            if (isConfirm) {
                $scope.reasonData = {
                  note: 'Order has been refunded $42.68',
                  amount: '$42.68',
                  reason: "duplicate" //duplicate, fraudulent, requested_by_customer
                };

                OrderService.refundOrder($scope.order._id, $scope.reasonData, function (data) {
                  console.log('data ', data);
                  SweetAlert.swal("Refunded", "Order has been refunded.", "success");
                });
            } else {
                SweetAlert.swal("Cancelled", "Order refund cancelled.)", "error");
            }
        });
      }

      if (newStatus === 'failed') {
        toaster.pop('success', toasterMsg + '"Failed"');
      }
      $scope.order.status = newStatus;
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



  }]);
}(angular));

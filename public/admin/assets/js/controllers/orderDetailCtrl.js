'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('OrderDetailCtrl', ["$scope", "toaster", "$modal", "$filter", "$stateParams", "OrderService", "CustomerService", "UserService", "ProductService", "SweetAlert", "orderConstant", function ($scope, toaster, $modal, $filter, $stateParams, OrderService, CustomerService, UserService, ProductService, SweetAlert, orderConstant) {

    //TODO
    // - $q all api calls
    // 1. getCustomers
    // 2. getUsers
    // 3. getProducts
    // 4. get Order

    $scope.taxPercent = 0.08;

    $scope.FailedStatus = orderConstant.order_status.FAILED;

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
        scope: $scope
      });
    };

    $scope.formatOrderStatus = function (status) {
      return OrderService.formatOrderStatus(status);
    };

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
          $scope.order = order;
          $scope.selectedCustomer = _.find($scope.customers, function (customer) {
            return customer._id === $scope.order.customer_id;
          });
          $scope.calculateTotals();
        } else {
          $scope.order = {
            created: {
              date: new Date().toISOString()
            },
            order_id: orders.length,
            status: 'pending_payment',
            line_items: [],
            notes: []
          };
          console.log('$scope.order ', $scope.order);
        }
      });
    };

    /*
     * @calculateTotals
     * -
     */

    $scope.calculateTotals = function () {
      console.log('calculateTotals >>>');
      var _subtotal = 0;
      var _total = 0;
      var _discount = 0;
      _.each($scope.order.line_items, function (line_item) {
        if (line_item.quantity) {
          line_item.total = line_item.regular_price * line_item.quantity;
        }
        if (line_item.discount) {
          var _dc = parseFloat(line_item.discount);
          line_item.total -= _dc;
          _discount += _dc;
          _total -= _dc;
        }
        _subtotal += parseFloat(line_item.regular_price) * parseFloat(line_item.quantity);
        _total += parseFloat(line_item.regular_price) * parseFloat(line_item.quantity);
      });
      $scope.calculatedSubTotal = _subtotal;
      $scope.calculatedDiscount = _discount;
      if (_discount) {
        $scope.calculatedDiscountPercent = ((parseFloat(_discount) * 100) / parseFloat(_subtotal)).toFixed(2);
      } else {
        $scope.calculatedDiscountPercent = '';
      }
      //todo add tax selected currently using 0.08 or 1.08
      $scope.calculatedTax = _total * $scope.taxPercent;
      $scope.calculatedTotal = _total * ($scope.taxPercent + 1);
    };

    /*
     * @totalWithDiscount
     * -
     */

    $scope.totalWithDiscount = function (total, discount) {
      return parseFloat(total) + parseFloat(discount);
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
      if (notes.length > 0) {
        var i = 0;
        var j = 0;
        for (i; i < notes.length; i++) {
          if($scope.users)
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
      var lineitems = order.line_items || {};
      if (lineitems.length > 0) {
        _.each(lineitems, function (item) {
          var matchProduct = _.find($scope.products, function (product) {
            return product._id === item.product_id;
          });
          item.product = matchProduct;
          item.discount = 0.00;
        });
      }

      return lineitems;
    };

    /*
     * @addNote
     * add a note to an order
     */

    $scope.addNote = function () {
      if($scope.order && $scope.order._id)
      {
          OrderService.completeOrder($scope.order._id, $scope.newNote, function (updatedOrder) {
          toaster.pop('success', 'Note added to order.');
          $scope.newNote = '';
          $scope.pushLocalNote(updatedOrder);
        });
      }
      else if($scope.order)
      {
        $scope.order.notes.push({note:$scope.newNote})
        $scope.newNote = '';
      }
      
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
     * @addProductLineItem
     * add a product line item to the order
     */


    $scope.addProductLineItem = function (selected) {
      console.log('selected ', selected);
      var _line_item = {
        "product_id": selected._id,
        "quantity": 1,
        "regular_price": selected.regular_price,
        "sku": selected.sku,
        "total": selected.regular_price,
        "name": selected.name,
        "product": selected
      };
      $scope.order.line_items.push(_line_item);
      $scope.calculateTotals();
      $scope.clearProduct();
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

        return model.first + ' ' + model.last + ' (#' + model._id + ' ' + email + ') ';
      }

      return '';
    };

    /*
     * @formatProductInput
     * -
     */

    $scope.formatProductInput = function (model) {
      if (model) {

        var email = 'No Email';
        if (model.email) {
          email = model.email;
        }

        var _sku = '';
        if (model.sku) {
          _sku = '#'+model.sku
        }

        var _name = '';
        if (model.name) {
          _name = model.name;
        }

        var _price = '';
        if (model.regular_price) {
          _price = ' ($' + model.regular_price + ') ';
        }

        return _sku + ' ' + _name + _price;

      }

      return '';
    };

    /*
     * @dateOptions
     * -
     */

    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
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
      if ($scope.order.status == newStatus)
        return;
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
      $scope.currentStatus = newStatus;
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

    $scope.saveOrder = function () {

      // Set order customer Id
      if($scope.selectedCustomer)
        $scope.order.customer_id = $scope.selectedCustomer._id;
      else        
        $scope.order.customer_id = null;

      //validate

      if (!$scope.order) {
        toaster.pop('error', 'Orders can not be blank.');
        return;
      }

      if (!$scope.order.customer_id) {
        toaster.pop('error', 'Orders must contain a customer.');
        return;
      }

      if ($stateParams.orderId) {
        OrderService.updateOrder($scope.order, function (updatedOrder) {
          console.log('updatedOrder ', updatedOrder);
          toaster.pop('success', 'Order updated successfully.');
        });
      } else {
        OrderService.createOrder($scope.order, function (updatedOrder) {
          console.log('order updated');
          toaster.pop('success', 'Order updated successfully.');
        });
      }
    };

  }]);
}(angular));

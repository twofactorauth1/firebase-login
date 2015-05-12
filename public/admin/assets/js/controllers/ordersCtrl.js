'use strict';
/*global app, moment, angular, window*/
/*jslint unparam:true*/
(function (angular) {
  app.controller('OrdersCtrl', ["$scope", "toaster", "$modal", "$filter", "$state", "OrderService", "CustomerService", function ($scope, toaster, $modal, $filter, $state, OrderService, CustomerService) {
    
    $scope.tableView = 'list';

    /*
     * @openModal
     * -
     */
    $scope.openModal = function (template) {
      $scope.modalInstance = $modal.open({
        templateUrl: template,
        scope: $scope
      });
    };

    /*
     * @closeModal
     * -
     */

    $scope.closeModal = function () {
      $scope.modalInstance.close();
    };

    /*
     * @getCustomers
     * get all customers to for customer select
     */

    CustomerService.getCustomers(function (customers) {
      console.log('customers >>> ', customers);
      $scope.customers = customers;
    });

    /*
     * @newOrder
     * -
     */

    $scope.newOrder = function () {
      $state.go('app.commerce.orderdetail');
    };

    /*
     * @formatInput
     * format the customer input to show "First Last (#ID email)"
     */

    $scope.formatInput = function (model) {
      console.log('model >>> ', model);
      var email;
      if (model && model.email) {
        email = model.email;
      } else {
        email = 'No Email';
      }

      return model.first + ' ' + model.last + ' (#' + model._id + ' ' + email + ') ';
    };

    /*
     * @getOrders
     * - get all the orders for this account and create line_items_total
     *   and add decimal point to total then create scope
     */

    OrderService.getOrders(function (orders) {
      console.log('orders >>> ', orders);
      _.each(orders, function (order) {
        if (order.line_items) {
          order.line_items_total = order.line_items.length;
        } else {
          order.line_items_total = 0;
        }

        order.total = order.total;
      });
      $scope.orders = orders;
    });

    /*
     * @orderStatusOptions
     * - an array of order status types for use in a select
     */

    $scope.orderStatusOptions = [{
      name: 'Pending Payment',
      value: 'pending_payment'
    }, {
      name: 'Processing',
      value: 'processing'
    }, {
      name: 'On Hold',
      value: 'on_hold'
    }, {
      name: 'Completed',
      value: 'completed'
    }, {
      name: 'Cancelled',
      value: 'cancelled'
    }, {
      name: 'Refunded',
      value: 'refunded'
    }, {
      name: 'Falied',
      value: 'failed'
    }];

    /*
     * @getters
     * - getters for the sort on the table
     */

    $scope.orderStatus = '';
    $scope.line_items = '';
    $scope.filterorder = {};

    $scope.getters = {
      customerName: function (value) {
        return value.customer.first + ' ' + value.customer.last;
      },
      line_items: function (value) {
        return value.line_items.length;
      },
      created: function (value) {
        return value.created.date;
      },
      modified: function (value) {
        return value.modified.date;
      }
    };

    /*
     * @triggerInput
     * - trigger the hidden input to trick smart table into activating filter
     */

    $scope.triggerInput = function (element) {
      angular.element(element).trigger('input');
    };

    /*
     * @viewSingle
     * - view a single order redirect on click
     */

    $scope.viewSingle = function (order) {
      if (order) {
        window.location = '/admin/#/commerce/orders/' + order._id;
      } else {
        window.location = '/admin/#/commerce/orders/neworder';
      }
    };

    /*
     * @clear
     * - clear the filter box to bring back original list
     */

    //TODO: Not clearing table
    $scope.clear = function ($event) {
      $event.stopPropagation();
      $scope.filterorder = undefined;
    };


  }]);
}(angular));

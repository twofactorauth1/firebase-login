/*global app, $$*/
/*jslint unparam: true*/
'use strict';
(function (angular) {
  app.service('ChartCommerceService', ['PaymentService', function (PaymentService) {

    //local variables
    var customers = [];
    var totalCustomers = [];

    this.calculatePercentage = function (oldval, newval) {
      var result;
      oldval = parseInt(oldval, 10);
      newval = parseInt(newval, 10);
      if (oldval === 0 && newval === 0) {
        return 0;
      }
      if (newval < oldval) {
        result = ((oldval - newval) / oldval) * 100;
      } else {
        result = ((newval - oldval) / newval) * 100;
      }

      if (newval === oldval) {
        result = 100;
      }
      return Math.round(result * 100) / 100;
    };

    this.queryReports = function () {
      var queryData = {};
      // ======================================
      // Monthly Recurring Revenue Metric
      // Monthly Recurring = Avg Revenue Per Customer * # of Customers
      // ======================================



      return queryData;
    };

    this.runReports = function (fn) {
      var self = this;

      var reportData = {};

      PaymentService.getCustomers(function (data) {
        self.customers = data;

        // ======================================
        // Total Customer Metric
        // ======================================

        self.totalCustomers = data.length;

        fn(reportData);
      }); //end PaymentService.getCustomers


    };

    this.queryNetRevenueReport = function () {
      var queryData = {};

      // ======================================
      // Net Revenue Metric
      // Net revenue = gross revenue – damages/coupons/returns
      // ======================================

      queryData.netRevenueThisMonth = new Keen.Query("sum", {
        eventCollection: "Stripe_Events",
        targetProperty: 'data.object.amount',
        timeframe: 'this_month',
        interval: "daily",
        filters: [{
          'property_name': 'type',
          'operator': 'eq',
          'property_value': 'charge.succeeded'
        }, {
          "property_name": "accountId",
          "operator": "eq",
          "property_value": $$.server.accountId
        }]
      });

      queryData.netRevenueCharges = new Keen.Query("count", {
        eventCollection: "Stripe_Events",
        timeframe: 'this_month',
        filters: [{
          'property_name': 'type',
          'operator': 'eq',
          'property_value': 'charge.succeeded'
        }, {
          "property_name": "accountId",
          "operator": "eq",
          "property_value": $$.server.accountId
        }]
      });

      queryData.lastCharge = new Keen.Query("extraction", {
        eventCollection: "Stripe_Events",
        latest: 1,
        filters: [{
          'property_name': 'type',
          'operator': 'eq',
          'property_value': 'charge.succeeded'
        }, {
          "property_name": "accountId",
          "operator": "eq",
          "property_value": $$.server.accountId
        }]
      });

      return queryData;
    };

    this.runNetRevenuReport = function (fn) {
      var self = this;

      PaymentService.getCustomers(function (data) {
        self.customers = data;

        // ======================================
        // Total Customer Metric
        // ======================================

        self.totalCustomers = data.length;
        fn(data);

      }); //end PaymentService.getCustomers


    };

    this.customerOverview = function (totalCustomerData, customerStart, cancelSubscriptionData, cancelstart, fn) {
      var customerOverviewConfig = {
        options: {
          chart: {
            spacing: [25, 25, 25, 25]
          },
          colors: ['#41b0c7', '#fcb252', '#309cb2', '#f8cc49'],
          title: {
            text: ''
          },
          tooltip: {
            pointFormat: '<b>{point.y}</b>'
          },
          exporting: {
            enabled: false
          }
        },
        xAxis: {
          type: 'datetime',
          labels: {
            format: "{value:%b %d}"
          },
          minRange: 30 * 24 * 3600000 // fourteen days
        },
        yAxis: {
          min: 0,
          max: Math.max.apply(Math, totalCustomerData) + 100,
          title: {
            text: ''
          }
        },
        series: [{
          type: 'area',
          name: 'Customers',
          pointInterval: 24 * 3600 * 1000,
          pointStart: Date.parse(customerStart),
          data: totalCustomerData
        }, {
          type: 'area',
          name: 'Cancellations',
          pointInterval: 24 * 3600 * 1000,
          pointStart: Date.parse(cancelstart),
          data: cancelSubscriptionData
        }],
        credits: {
          enabled: false
        }
      };

      fn(customerOverviewConfig);
    };

  }]);
}(angular));

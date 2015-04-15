'use strict';
/**
 * service for toaster
 */
(function(angular) {
  app.service('ToasterService', ['toaster', function(toaster) {
    var queue = [];

    var htmlQueue = [];

    this.show = function(status, msg) {
      toaster.pop(status, msg);
    };

    this.setPending = function(status, msg) {
      queue.push([status, msg]);
    };

    this.processPending = function() {
      queue.forEach(function(value, index) {
        toaster.pop(value[0], value[1]);
      });
      queue = [];
    };

    this.setHtmlPending = function(status, msg, body, timeout, options) {
      htmlQueue.push([status, msg, body, timeout, options]);
    };

    this.processHtmlPending = function() {
      htmlQueue.forEach(function(value, index) {
        toaster.pop(value[0], value[1], value[2], value[3], value[4]);
      });
      htmlQueue = [];
    };

  }]);
})(angular);

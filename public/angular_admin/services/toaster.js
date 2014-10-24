define(['app', 'toaster'], function (app) {
  app.register.service('ToasterService', ['toaster', function (toaster) {
    var queue = [];

    this.show = function (status, msg) {
      toaster.pop(status, msg);
    };

    this.setPending = function (status, msg) {
      queue.push([status, msg]);
    };

    this.processPending = function () {
      queue.forEach(function (value, index) {
          toaster.pop(value[0], value[1]);
      });
      queue = [];
    };

  }]);
});

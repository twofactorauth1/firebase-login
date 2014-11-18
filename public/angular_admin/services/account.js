define(['app'], function(app) {
  app.register.service('AccountService', [function() {
    this.accountTab = 'account_information';

    this.getActiveTab = function () {
      return this.accountTab;
    };

    this.setActiveTab = function (tab) {
      this.accountTab = tab;
    };
  }]);
});

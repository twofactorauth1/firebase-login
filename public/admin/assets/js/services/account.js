(function (angular) {
  app.service('AccountService', ['$http', function ($http) {
    var baseUrl = '/api/1.0/account/';

    this.mainAccount = null;
    this.getMainAccount = function () {
      return this.mainAccount;
    };

    this.setMainAccount = function (account) {
      this.mainAccount = account;
    };

    this.getAccount = function (fn) {
      var apiUrl = baseUrl;
      $http.get(apiUrl)
        .success(function (data, status, headers, config) {
          fn(data);
        });
    };

    //:id/setting
    this.updateAccount = function (account, fn) {
      var apiUrl = baseUrl + [account._id].join('/');
          $http.put(apiUrl, account)
            .success(function (data, status, headers, config) {
                fn(data);
            }) 
            .error(function (error) {
              fn(null, error);
            });
    };

  }]);
}(angular));

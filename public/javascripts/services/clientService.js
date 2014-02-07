(function () {

    var clientService = function ($http, $q) {
        var  clientFactory = {};

        clientFactory.loginClient = function (credential, success, error) {
            $http.post('/login/', credential).success(success).error(error);
        };
        clientFactory.logoutClient = function (success, error) {
            $http.get('/logout/').success(success).error(error);
        };

        return clientFactory;
    };

    customersManager.customersApp.factory('clientService', ['$http', '$q', clientService]);

}());

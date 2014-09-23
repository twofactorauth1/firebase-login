define(['app', 'customerService', 'stateNavDirective', 'underscore', 'commonutils'], function(app) {
    app.register.controller('CustomerAddCtrl', ['$scope', 'CustomerService', function ($scope, CustomerService) {
        $scope.customer = {
            _id: null,
            accountId: $$.server.accountId,
            devices: [{_id: $$.u.idutils.generateUniqueAlphaNumericShort(), serial: ''}]
        };

        $scope.$watch('fullName', function (newValue, oldValue) {
            if (newValue) {
                var nameSplit = newValue.split(' ');
                if (nameSplit.length >= 3) {
                    $scope.customer.first = nameSplit[0];
                    $scope.customer.middle = nameSplit[1];
                    $scope.customer.last = nameSplit[2];
                } else if (nameSplit.length == 2) {
                    $scope.customer.first = nameSplit[0];
                    $scope.customer.middle = '';
                    $scope.customer.last = nameSplit[1];
                } else if (nameSplit.length == 1) {
                    $scope.customer.first = nameSplit[0];
                    $scope.customer.middle = '';
                    $scope.customer.last = '';
                } else {
                    $scope.customer.first = '';
                    $scope.customer.middle = '';
                    $scope.customer.last = '';
                }
            }
        });

        $scope.twoNetSubscribe = function () {
            CustomerService.twoNetSubscribe($scope.customer._id, function (data) {
            });
        };

        $scope.customerSave = function () {
            CustomerService.saveCustomer($scope.customer, function (customer) {
                $scope.customer = customer;
            });
        };
        $scope.addDevice = function () {
            $scope.customer.devices.push({_id: $$.u.idutils.generateUniqueAlphaNumericShort(), serial: ''});
        };
    }]);
});

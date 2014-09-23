define(['app', 'customerService', 'stateNavDirective', 'underscore', 'commonutils'], function(app) {
    app.register.controller('CustomerAddCtrl', ['$scope', 'CustomerService', function ($scope, CustomerService) {
        var displayAddressCharLimit = 8;
        $scope.modifyAddress = {};
        $scope.customer = {
            _id: null,
            accountId: $$.server.accountId,
            devices: [{_id: $$.u.idutils.generateUniqueAlphaNumericShort(), serial: ''}],
            details: [
                {
                    _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
                    type: 'lo',
                    phones: [
                        {
                            _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
                            type: 'm',
                            number: '',
                            default: false
                        }
                    ],
                    addresses: [
                        {
                            _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
                            address: '',
                            address2: '',
                            state: '',
                            zip: '',
                            country: '',
                            defaultShipping: false,
                            defaultBilling: false,
                            city: '',
                            countryCode: '',
                            displayName: '',
                            lat: '',
                            lon: ''
                        }
                    ]

                }
            ],
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

        $scope.twoNetSubscribeFn = function () {
            CustomerService.postTwoNetSubscribe($scope.customer._id, function (data) {
            });
        };

        $scope.customerSaveFn = function () {
            CustomerService.saveCustomer($scope.customer, function (customer) {
                $scope.customer = customer;
            });
        };
        $scope.addDeviceFn = function () {
            $scope.customer.devices.push({_id: $$.u.idutils.generateUniqueAlphaNumericShort(), serial: ''});
        };

        $scope.customerPhoneTypeSaveFn = function (index, type) {
            var typeLabel = null;
            if (type == 'm')
                typeLabel = 'mobile';
            if (type == 'h')
                typeLabel = 'home';
            if (type == 'w')
                typeLabel = 'work';
            $('#customer-phone-type-' + index).html(typeLabel);
            $scope.customer.details[0].phones[index].type = type;
        };

        $scope.addCustomerContactFn = function () {
            $scope.customer.details[0].phones.push({_id: $$.u.idutils.generateUniqueAlphaNumericShort(), number: '', default: false, type: 'm'});
        };

        $scope.customerAddressWatchFn = function (index) {
            $scope.$watch('customer.details[0].addresses[' + index + '].displayName', function (newValue, oldValue) {
                if (newValue && newValue.length > displayAddressCharLimit) {
                    CustomerService.getGeoSearchAddress(newValue, function (data) {
                        if (data.error === undefined) {
                            data['displayName'] = newValue;
                            $scope.customer.details[0].addresses[index] = data;
                        }
                    });
                }
            });
        };

        $scope.customerAddressWatchFn(0);

        $scope.customerAddAddressFn = function () {
            $scope.customer.details[0].addresses.push(
                {
                    _id: $$.u.idutils.generateUniqueAlphaNumericShort(),
                    address: '',
                    address2: '',
                    state: '',
                    zip: '',
                    country: '',
                    defaultShipping: false,
                    defaultBilling: false,
                    city: '',
                    countryCode: '',
                    displayName: '',
                    lat: '',
                    lon: ''
                }
            );
            $scope.customerAddressWatchFn($scope.customer.details[0].addresses.length-1);
        };

        $scope.getModifyAddressFn = function (index) {
            return $scope.modifyAddress[index];
        };

        $scope.setModifyAddressFn = function (index, state) {

            $scope.modifyAddress[index] = state;
        };


    }]);
});

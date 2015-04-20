'use strict';
/** 
 * controller for personal business page
 */
(function(angular) {
    app.controller('ProfileBusinessCtrl', ["$scope", "$modal", "$timeout", "toaster", "$stateParams", "UserService", "CommonService", "hoursConstant", function($scope, $modal, $timeout, toaster, $stateParams, UserService, CommonService, hoursConstant) {
        console.log('profile business >>> ');

        $scope.hours = hoursConstant;
        //account API call for object population
        //account API call for object population
        UserService.getAccount(function(account) {
            $scope.account = account;
            console.log('$scope.account >>> ', $scope.account);
            $scope.setDefaults();
        });

        //user API call for object population
        UserService.getUser(function(user) {
            $scope.user = user;
            $scope.fullName = [user.first, user.middle, user.last].join(' ');
            if (!$scope.user.business) {
                $scope.user.business = [];
            }
            if (!$scope.user.business.phones) {
                $scope.user.business.phones = [];
            }
            if (!$scope.user.business.addresses) {
                $scope.user.business.addresses = [];
            }
        });

        // Add remove photo
        $scope.insertPhoto = function(asset) {
            $scope.account.business.logo = asset.url;
        };

        $scope.removePhoto = function(asset) {
            $scope.account.business.logo = null;
        };

        // Add/Remove email adresses
        $scope.accountAddEmailFn = function() {
            $scope.account.business.emails.push({
                _id: CommonService.generateUniqueAlphaNumericShort(),
                email: ''
            });
        };
        $scope.removeEmail = function(index) {
            $scope.account.business.emails.splice(index, 1);
        };

        $scope.showAddEmail = function(email) {
            return email._id === $scope.account.business.emails[0]._id;
        };

        // Add/Remove phone numbers        
        $scope.accountAddPhoneFn = function() {
            $scope.account.business.phones.push({
                _id: CommonService.generateUniqueAlphaNumericShort(),
                number: ''
            });
        };
        $scope.removePhone = function(index) {
            $scope.account.business.phones.splice(index, 1);
        };

        $scope.showAddPhone = function(phone) {
            return phone._id === $scope.account.business.phones[0]._id;
        };

        // Add/Remove phone numbers
        $scope.removeAddress = function(index) {
            $scope.account.business.addresses.splice(index, 1);
        };

        $scope.showAddAddress = function(address) {
            return address._id === $scope.account.business.addresses[0]._id;
        };

        $scope.accountAddAddressFn = function() {
            $scope.account.business.addresses.push({
                _id: CommonService.generateUniqueAlphaNumericShort(),
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
            });
        };
        $scope.setDefaults = function() {
            if (!$scope.account.business.phones)
                $scope.account.business.phones = [];

            if (!$scope.account.business.emails)
                $scope.account.business.emails = [];

            if (!$scope.account.business.addresses)
                $scope.account.business.addresses = [];

            if (!$scope.account.business.phones.length)
                $scope.accountAddPhoneFn();

            if (!$scope.account.business.emails.length)
                $scope.accountAddEmailFn();

            if (!$scope.account.business.addresses.length)
                $scope.accountAddAddressFn();
        };

        $scope.profileSaveFn = function() {
            console.log('profileSaveFn ', $scope.checkProfileValidity());
            UserService.putAccount($scope.account, function(account) {
                $scope.account = account;
                toaster.pop('success', 'Profile Saved.');
                $scope.setDefaults();
            });
        };

        $scope.checkProfileValidity = function() {
            var name = $scope.account.business.name;
            var email = _.filter($scope.account.business.emails, function(mail) {
                return mail.email !== "";
            });
            console.log('name ', name);
            if (name !== "" && email.length > 0)
                return true;
            else
                return false;
        };

    }]);
})(angular);

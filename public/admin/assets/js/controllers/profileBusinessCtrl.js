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

        $scope.accountAddHoursFn = function() {
            $scope.account.business.splitHours = false;
            $scope.account.business.hours = [
                    {day: "Mon", start:"9:00 am",end:"5:00 pm", start2:"9:00 am", end2:"5:00 pm", closed:false, split:false},
                    {day: "Tue", start:"9:00 am",end:"5:00 pm", start2:"9:00 am", end2:"5:00 pm", closed:false, split:false},
                    {day: "Wed", start:"9:00 am",end:"5:00 pm", start2:"9:00 am", end2:"5:00 pm", closed:false, split:false},
                    {day: "Thu", start:"9:00 am",end:"5:00 pm", start2:"9:00 am", end2:"5:00 pm", closed:false, split:false},
                    {day: "Fri", start:"9:00 am",end:"5:00 pm", start2:"9:00 am", end2:"5:00 pm", closed:false, split:false},
                    {day: "Sat", start:"",end:"", start2:"", end2:"", closed:true, split:false},
                    {day: "Sun", start:"",end:"", start2:"", end2:"", closed:true, split:false}];
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

            if (!$scope.account.business.hours || !$scope.account.business.hours.length)
                $scope.accountAddHoursFn();
        };

        $scope.profileSaveFn = function() {
            console.log('profileSaveFn ', $scope.checkProfileValidity());
            UserService.putAccount($scope.account, function(account) {
                $scope.account = account;
                toaster.pop('success', 'Profile Saved.');
                $scope.minRequirements = true;
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

        $scope.validateHours = function(hours)
        {
            if(!hours.closed)
            {
                var startTime = hours.start;
                var endTime = hours.end;
                startTime = startTime.split(" ")[1] == 'pm' && startTime.split(":")[0] != '12' ? parseInt(startTime.split(":")[0]) + 12 : parseInt(startTime.split(":")[0])
                endTime = endTime.split(" ")[1] == 'pm' && endTime.split(":")[0] != '12' ? parseInt(endTime.split(":")[0]) + 12 : parseInt(endTime.split(":")[0])
                startTime = parseInt(hours.start.split(":")[1]) == 30 ? startTime + 0.5 : startTime;
                endTime = parseInt(hours.end.split(":")[1]) == 30 ? endTime + 0.5 : endTime;
                if(hours.split && $scope.account.business.splitHours)
                {
                    var startTime2 = hours.start2;
                    var endTime2 = hours.end2;
                    startTime2 = startTime2.split(" ")[1] == 'pm' && startTime2.split(":")[0] != '12' ? parseInt(startTime2.split(":")[0]) + 12 : parseInt(startTime2.split(":")[0])
                    endTime2 = endTime2.split(" ")[1] == 'pm' && endTime2.split(":")[0] != '12' ? parseInt(endTime2.split(":")[0]) + 12 : parseInt(endTime2.split(":")[0])
                    startTime2 = parseInt(hours.start2.split(":")[1]) == 30 ? startTime2 + 0.5 : startTime2;
                    endTime2 = parseInt(hours.end2.split(":")[1]) == 30 ? endTime2 + 0.5 : endTime2;
                    if(startTime > endTime || startTime > startTime2 || startTime > endTime2 || endTime > startTime2 || endTime > endTime2 || startTime2 > endTime2)
                    {
                        var msg = ""
                        if(startTime > endTime)
                            msg = "Start time 1 can not be greater than end time 1";
                        else if(startTime > startTime2)
                            msg = "Start time 1 can not be greater than start time 2";
                        else if(startTime > endTime2)
                            msg = "Start time 1 can not be greater than end time 2";
                        else if(endTime > startTime2)
                            msg = "End time 1 can not be greater than start time 2";
                        else if(startTime > endTime2)
                            msg = "Start time 1 can not be greater than end time 2";
                        else if(startTime2 > endTime2)
                            msg = "Start time 2 can not be greater than end time 2";

                        toaster.pop("warning", msg);
                    }
                }
                else
                {                
                    if(startTime > endTime)
                    {
                        toaster.pop("warning", "Start time can not be greater than end time");
                    }
                }
            }
        }

    }]);
})(angular);

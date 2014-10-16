define(['app', 'userService', 'underscore', 'commonutils','adminValidationDirective', 'ngProgress', 'skeuocard'], function(app) {
    app.register.controller('AccountChoosePlanCtrl', ['$scope', '$stateParams', 'UserService', 'ngProgress', function ($scope, $stateParams, UserService, ngProgress) {
        ngProgress.start();

        //back button click function
        $scope.$back = function() {window.history.back();};

        //user API call for object population
        UserService.getUser(function (user) {
    		$scope.user = user;
    	});

        //account API call for object population
        UserService.getAccount(function (account) {
            $scope.account = account;
            ngProgress.complete();
        });

        UserService.getAccountBilling(function (billing) {
            $scope.billing = billing;
        });

        $scope.$watch('selectedPlan', function (newValue, oldValue) {
            console.log(newValue, oldValue);
        });
        var card = new Skeuocard($("#skeuocard"));
    }]);
});

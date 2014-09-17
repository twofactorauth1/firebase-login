define(['app'], function(app) {
    app.register.controller('CommerceEditCtrl', ['$scope', function ($scope) {
    	//back button click function
        $scope.$back = function() {window.history.back();};
    }]);
});

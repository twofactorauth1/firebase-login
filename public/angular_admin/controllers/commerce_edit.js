define(['app', 'ngProgress'], function(app) {
    app.register.controller('CommerceEditCtrl', ['$scope', 'ngProgress', function ($scope, ngProgress) {
        ngProgress.start();
    	//back button click function
        $scope.$back = function() {window.history.back();};
        ngProgress.complete();
    }]);
});

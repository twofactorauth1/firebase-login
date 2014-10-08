define(['app', 'ngProgress', 'stateNavDirective'], function(app) {
    app.register.controller('CommerceEditCtrl', ['$scope', 'ngProgress', '$stateParams', function ($scope, ngProgress, $stateParams) {
        ngProgress.start();
    	//back button click function
        $scope.$back = function() {window.history.back();};
        ngProgress.complete();


        $scope.productId = $stateParams.id;

    }]);
});

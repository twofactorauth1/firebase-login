define(['app', 'ngProgress', 'stateNavDirective', 'productService', 'angularUI', 'ngAnimate', 'angularBootstrapSwitch'], function(app) {
    app.register.controller('CommerceEditCtrl', ['$scope', 'ngProgress', '$stateParams', 'ProductService', function ($scope, ngProgress, $stateParams, ProductService) {
        ngProgress.start();
    	//back button click function
        $scope.$back = function() {window.history.back();};
        ngProgress.complete();


        $scope.productId = $stateParams.id;
        ProductService.getProduct($scope.productId, function (product) {
            $scope.product = product;
        });

    }]);
});

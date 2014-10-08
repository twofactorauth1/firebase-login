define(['app', 'ngProgress', 'stateNavDirective', 'productService', 'angularUI', 'ngAnimate', 'angularBootstrapSwitch', 'jquery', 'bootstrap-iconpicker'], function(app) {
    app.register.controller('CommerceEditCtrl', ['$scope', 'ngProgress', '$stateParams', 'ProductService', function ($scope, ngProgress, $stateParams, ProductService) {
        ngProgress.start();
    	//back button click function
        $scope.$back = function() {window.history.back();};
        ngProgress.complete();

        $('#convert').iconpicker({ 
		    iconset: 'fontawesome',
		    icon: 'fa-key', 
		    rows: 5,
		    cols: 5,
		    placement: 'right',
		});

		$('#convert').on('change', function(e) {
			$scope.$apply(function() {
				$scope.product.icon = 'fa '+e.icon;
			});
		});



        $scope.productId = $stateParams.id;
        ProductService.getProduct($scope.productId, function (product) {
            $scope.product = product;
        });

    }]);
});

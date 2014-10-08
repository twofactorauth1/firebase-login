define(['app', 'ngProgress', 'stateNavDirective', 'productService', 'paymentService', 'angularUI', 'ngAnimate', 'angularBootstrapSwitch', 'jquery', 'bootstrap-iconpicker'], function(app) {
    app.register.controller('CommerceEditCtrl', ['$scope', 'ngProgress', '$stateParams', 'ProductService', 'PaymentService', function ($scope, ngProgress, $stateParams, ProductService, PaymentService) {
        ngProgress.start();
    	//back button click function
        $scope.$back = function() {window.history.back();};
        ngProgress.complete();

        PaymentService.getListPlans(function (plans) {
            $scope.plans = plans;
        });

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

		$scope.addSubscriptionFn = function () {
			console.log('$scope.newSubscription >>> ', $scope.newSubscription);
    		PaymentService.postCreatePlan($scope.newSubscription, function (subscription) {
    			$scope.plans.push(subscription);
    			$scope.newSubscription = {};
    		});
    	};



        $scope.productId = $stateParams.id;
        ProductService.getProduct($scope.productId, function (product) {
            $scope.product = product;
        });

    }]);
});

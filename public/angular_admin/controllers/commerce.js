define(['app', 'paymentService', 'ngProgress'], function(app) {
    app.register.controller('CommerceCtrl', ['$scope', 'PaymentService', 'ngProgress', function ($scope, PaymentService, ngProgress) {
        ngProgress.start();
    	PaymentService.getListPlans(function (products) {
    		$scope.products = products;
            ngProgress.complete();
    	});
    	$scope.addProductFn = function () {
    		PaymentService.postCreatePlan($scope.newProduct, function (product) {
    			$scope.products.data.push(product);
    			$('#commerce-add-product').modal('hide');
    		});
    	};
    }]);
});

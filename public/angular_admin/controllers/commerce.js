define(['app', 'paymentService'], function(app) {
    app.controller('CommerceCtrl', ['$scope', 'PaymentService', function ($scope, PaymentService) {
    	PaymentService.getListPlans(function (products) {
    		$scope.products = products;
    	});
    	$scope.addProductFn = function () {
    		PaymentService.postCreatePlan($scope.newProduct, function (product) {
    			$scope.products.data.push(product);
    			$('#commerce-add-product').modal('hide');
    		});
    	};
    }]);
});

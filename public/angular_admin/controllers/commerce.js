define(['app', 'productService', 'paymentService', 'headroom','ngHeadroom', 'ngProgress'], function(app) {
    app.register.controller('CommerceCtrl', ['$scope', 'ProductService', 'PaymentService', 'ngProgress', function ($scope, ProductService, PaymentService, ngProgress) {
        ngProgress.start();
    	ProductService.getProducts(function (products) {
    		$scope.products = products;
            ngProgress.complete();
    	});
    	$scope.addProductFn = function () {
    		ProductService.postProduct($scope.newProduct, function (product) {
    			$scope.products.push(product);
    			$('#commerce-add-product').modal('hide');
    		});
    	};
    }]);
});

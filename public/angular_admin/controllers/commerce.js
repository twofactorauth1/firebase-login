define(['app', 'productService', 'paymentService', 'headroom','ngHeadroom', 'ngProgress'], function(app) {
    app.register.controller('CommerceCtrl', ['$scope', 'ProductService', 'PaymentService', 'ngProgress', function ($scope, ProductService, PaymentService, ngProgress) {
        ngProgress.start();
    	ProductService.getProducts(function (products) {
    		$scope.products = products;
            ngProgress.complete();
    	});
    	$scope.addProductFn = function () {
            $scope.newProduct.websiteId = 'bogusID';
            $scope.newProduct.sku = 'sku-0001';
            $scope.newProduct.regular_price = 100;
            $scope.newProduct.sales_price = 90;
            /*
            accountId: 1,
            websiteId: 'bogusID',
            sku: 'sku-0001',
            product_name: 'Test Product',
            product_type: 'digital',
            regular_price: 100,
            sales_price: 90
            */
    		ProductService.postProduct($scope.newProduct, function (product) {
    			$scope.products.data.push(product);
    			$('#commerce-add-product').modal('hide');
    		});
    	};
    }]);
});

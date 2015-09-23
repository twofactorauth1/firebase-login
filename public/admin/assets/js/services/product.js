'use strict';
/**
 * service for products
 */
(function(angular) {
    app.service('ProductService',  ['$http', 'productConstant', function($http, productConstant) {
        var baseUrl = '/api/1.0/';

        this.getProducts = function(fn) {
            var apiUrl = baseUrl + ['products'].join('/');
            $http.get(apiUrl)
                .success(function(data, status, headers, config) {
                    fn(data);
                });
        };

        this.postProduct = function(product, fn) {
            var apiUrl = baseUrl + ['products'].join('/');
            $http({
                    url: apiUrl,
                    method: "POST",
                    data: angular.toJson(product)
                })
                .success(function(data, status, headers, config) {
                    fn(data);
                })
                .error(function(error) {
                    console.error('ProductService: postProduct error >>> ', error);
                });
        };

        this.getProduct = function(productId, fn) {
            var apiUrl = baseUrl + ['products', productId].join('/');
            $http.get(apiUrl)
                .success(function(data, status, headers, config) {
                    fn(data);
                });
        };

        this.getIndigenousProducts = function(fn) {
            ///api/1.0/products/indigenous
            var apiUrl = baseUrl + ['products', 'indigenous'].join('/');
            $http.get(apiUrl)
                .success(function(data, status, headers, config) {
                    fn(data);
                });
        };

        this.saveProduct = function(product, fn) {
            var apiUrl = baseUrl + ['products', product._id].join('/');
            $http({
                    url: apiUrl,
                    method: "POST",
                    data: angular.toJson(product)
                })
                .success(function(data, status, headers, config) {                    
                    fn(data);
                });
        };

        this.getTax = function(postcode, fn) {
            var apiUrl = baseUrl + ['tax', postcode].join('/');
            $http.get(apiUrl)
                .success(function(data, status, headers, config) {
                    fn(data);
                });
        };

        this.deleteProduct = function (id, fn) {
            var apiUrl = baseUrl + ['Products', id].join('/');
            $http.delete(apiUrl)
            .success(function (data, status, headers, config) {
                fn(data);
            });
        };


        this.getActiveProducts = function (fn) {            
            var apiUrl = baseUrl + ['products', 'active'].join('/');
            console.log(apiUrl);
            $http.get(apiUrl)
            .success(function(data, status, headers, config) {
                fn(data);
            });
        };

        
        this.productStatusTypes = function (fn) {
          var productStatusTypes = productConstant.product_status_types.dp;
          fn(productStatusTypes);
        };

        // this.postCustomer = function (customer, fn) {
        //     var apiUrl = baseUrl + ['contact'].join('/');
        //     $http.post(apiUrl, customer)
        //     .success(function (data, status, headers, config) {
        //         fn(data);
        //     });
        // };

        // this.putCustomer = function (customer, fn) {
        //     var apiUrl = baseUrl + ['contact'].join('/');
        //     $http.put(apiUrl, customer)
        //     .success(function (data, status, headers, config) {
        //         fn(data);
        //     });
        // };

        // this.saveCustomer = function (customer, fn) {
        //     var apiFn = null;
        //     if (customer._id) {
        //         apiFn = this.putCustomer;
        //     } else {
        //         apiFn = this.postCustomer;
        //     }
        //     apiFn(customer, fn);
        // };
    }]);
})(angular);

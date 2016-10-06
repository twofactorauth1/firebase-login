'use strict';
/**
 * service for products
 */
(function(angular) {
    app.service('ProductService',  ['$http', 'productConstant', '$q', function($http, productConstant, $q) {
        var baseUrl = '/api/1.0/';

        this.getProducts = function(fn) {
            var apiUrl = baseUrl + ['products'].join('/');
            $http.get(apiUrl)
                .success(function(data, status, headers, config) {
                    fn(data);
                });
        };

        this.getProductsWithSort = function(sort, fn) {
            var apiUrl = baseUrl + ['products'].join('/');
            $http({
                url: apiUrl + '?hash_id=' + Math.random(),
                params: {
                    sortFields: _.keys(sort),
                    sortDirections: _.values(sort)
                }
            }).success(function(data, status, headers, config) {
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

        this.getSingleProduct = function(productId, fn) {
            var deferred = $q.defer();
            var apiUrl = baseUrl + ['products', productId].join('/');
            $http.get(apiUrl)
            .success(function(data, status, headers, config) {
                deferred.resolve(fn(data));
            }).error(function (err) {
                  console.warn('END:Campaign Service with ERROR');
                  fn(err, null);
            });
            return deferred.promise;
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

        this.getAllOrdersForProduct = function (id, fn) {
            var apiUrl = baseUrl + ['products', id, 'orders'].join('/');
            $http.get(apiUrl)
                .success(function (data, status, headers, config) {
                    fn(data);
                });
        };

        this.cloneProduct = function (id, fn) {
          var apiUrl = baseUrl + ['products', id, 'clone'].join('/');
          $http.post(apiUrl)
            .success(function (data) {
              fn(data);
            });
        };

    }]);
})(angular);

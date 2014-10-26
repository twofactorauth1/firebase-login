define(['app'], function (app) {
	app.register.service('ProductService', function ($http) {
		var baseUrl = '/api/1.0/';

		this.getProducts = function (fn) {
            var apiUrl = baseUrl + ['products'].join('/');
            $http.get(apiUrl)
            .success(function (data, status, headers, config) {
                fn(data);
            });
        };

        this.postProduct = function (product, fn) {
        	console.log('postProduct >>> ', product);
            var apiUrl = baseUrl + ['products'].join('/');
            $http({
			    url: apiUrl,
			    method: "POST",
			    data: angular.toJson(product)
			})
            .success(function (data, status, headers, config) {
                fn(data);
            })
            .error(function(error) {
            	console.log('ProductService: postProduct error >>> ', error);
            });
        };

        this.getProduct = function (productId, fn) {
            var apiUrl = baseUrl + ['products', productId].join('/');
            $http.get(apiUrl)
            .success(function (data, status, headers, config) {
                fn(data);
            });
        };

        this.saveProduct = function (product, fn) {
            var apiUrl = baseUrl + ['products', product._id].join('/');
            $http({
                url: apiUrl,
                method: "POST",
                data: angular.toJson(product)
            })
            .success(function (data, status, headers, config) {
                fn(data);
            });
        };

        // this.deleteCustomer = function (id, fn) {
        //     var apiUrl = baseUrl + ['contact', id].join('/');
        //     $http.delete(apiUrl)
        //     .success(function (data, status, headers, config) {
        //         fn(data);
        //     });
        // };

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

	});
});

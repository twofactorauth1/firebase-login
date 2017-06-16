'use strict';
/*global app, window, $$*/
/*jslint unparam:true*/
(function () {

	app.factory('SecurematicsProductService', SecurematicsProductService);

	SecurematicsProductService.$inject = ['$http', '$q', '$timeout', 'pagingConstant'];
	/* @ngInject */
	function SecurematicsProductService($http, $q, $timeout, pagingConstant) {

        var productService = {
            
        };

        var baseProductAPIUrl = '/api/1.0/integrations/zi/inventory';
        

        productService.loading = {value: 0};

        productService.getProducts = getProducts;        

        function productRequest(fn) {
            productService.loading.value = productService.loading.value + 1;
            console.info('service | loading +1 : ' + productService.loading.value);
            fn.finally(function () {
                productService.loading.value = productService.loading.value - 1;
                console.info('service | loading -1 : ' + productService.loading.value);
            });
            return fn;
        }

        /**
            * Get list of all Products
        */
        function getProducts(pagingParams) {
            var urlParts = [baseProductAPIUrl];
            function success(data) {
                productService.products = data;
            }

            function error(error) {
                console.error('productService getProducts error: ', JSON.stringify(error));
            }

            var _qString = "?limit="+pagingParams.limit+"&skip="+ pagingParams.skip;

            if(pagingParams.sortBy){
                _qString += "&sortBy=" + pagingParams.sortBy + "&sortDir=" + pagingParams.sortDir;
            }
            if(checkIfFieldSearch()){
                if(pagingParams.globalSearch){
                    _qString += "&term=" + encodeURIComponent(pagingParams.globalSearch);
                }
                _.each(pagingParams.fieldSearch, function (value, key) {
                    if(value != null){
                        _qString += '&' + key + '=' + encodeURIComponent(value);
                    }
                });
                urlParts.push('search');
            }
            else if(pagingParams.globalSearch){
                _qString += "&term=" + encodeURIComponent(pagingParams.globalSearch);
                urlParts.push('filter');
            }
            return (
                productRequest($http({
                  url: urlParts.join('/') + _qString,
                  method: "GET"
                }).success(success).error(error))
            );

        }

        function checkIfFieldSearch(){
            var isFieldSearch = false;
            var fieldSearch = productService.fieldSearch;
            if(!_.isEmpty(fieldSearch)){
                for(var i=0; i <= Object.keys(fieldSearch).length - 1; i++){
                    var key = Object.keys(fieldSearch)[i];
                    var value = fieldSearch[key];

                    if(value){
                       isFieldSearch = true;
                    }
                }
            }
            return isFieldSearch;
        }

		(function init() {
            
           
		})();


		return productService;
	}

})();

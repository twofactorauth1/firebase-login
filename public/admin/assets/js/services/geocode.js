(function(angular) {
    app.service('GeocodeService', function($http) {
		var baseUrl = '/api/1.0/';

	    this.getGeoSearchAddress = function(addressStr, fn) {
	        var apiUrl = baseUrl + ['geo', 'search', 'address', addressStr].join('/');
	        $http.get(apiUrl)
	            .success(function(data, status, headers, config) {
	                fn(data);
	        });
		}

	});
})(angular);
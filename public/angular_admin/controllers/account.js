define(['app', 'apiService'], function(app) {
    app.controller('AccountCtrl', ['$scope', 'ApiService', function ($scope, ApiService) {
    	ApiService.getUser(function (user) {
    		$scope.user = user;
    		$scope.activeTab = 'account';
    	});
    }]);
});

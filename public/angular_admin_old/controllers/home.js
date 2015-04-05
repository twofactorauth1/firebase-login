define(['app', 'userService'], function(app) {
    app.register.controller('HomeCtrl', ['$scope', 'UserService', function($scope, UserService) {
    	console.log('home control');
    	UserService.getAccounts(function(accounts){
    		console.log('accounts ', accounts);
    		var avaliableAccounts = [];
    		for (var i = 0; i < accounts.accounts.length; i++) {

    			UserService.getSingleAccount(accounts.accounts[i], function(data){
    				avaliableAccounts.push(data);
    			});
    		};

    		$scope.avaliableAccounts = avaliableAccounts;
    		var activeAccount = accounts.activeAccount;
    	});
  }]);
});

define(['app', 'customerService', 'stateNavDirective','truncateDirective'], function(app) {
    app.register.controller('CustomerCtrl', ['$scope', 'CustomerService', function ($scope, CustomerService) {
        $scope.customerFilter = {};
        $scope.customerOrder = 'first';
        $scope.customerSortReverse = false;
		
		$scope.contactLabel = function(contact) {
			return CustomerService.contactLabel(contact);
		}; 
		
		$scope.checkBestEmail = function(contact) {
			var returnVal =  CustomerService.checkBestEmail(contact);
			this.email = contact.email;
			return returnVal;
		}; 
		
		$scope.checkFacebookId = function(contact) {
			var returnVal =  CustomerService.checkFacebookId(contact);
			this.facebookId = contact.facebookId;
			return returnVal;
		}; 
		
		$scope.checkTwitterId = function(contact) {
			var returnVal =   CustomerService.checkTwitterId(contact);
			this.twitterId = contact.twitterId;
			return returnVal;
		}; 
		
		$scope.checkLinkedInId = function(contact) {
			var returnVal = CustomerService.checkLinkedInId(contact);
			this.linkedInUrl = contact.linkedInUrl;
			this.linkedInId = contact.linkedInId;
			return returnVal;
		}; 
		
		$scope.checkAddress = function(contact) {
			var returnVal = CustomerService.checkAddress(contact);
			this.address = contact.address;
			return returnVal;
		}; 

        CustomerService.getCustomers(function (customers) {
            $scope.customers = customers;
            
            $scope.$watch('searchBar', function (newValue, oldValue) {
                if (newValue) {
                    var searchBarSplit = newValue.split(' ');
                    if (searchBarSplit.length >= 3) {
                        $scope.customerFilter.first = searchBarSplit[0];
                        $scope.customerFilter.middle = searchBarSplit[1];
                        $scope.customerFilter.last = searchBarSplit[2];
                    } else if (searchBarSplit.length == 2) {
                        $scope.customerFilter.first = searchBarSplit[0];
                        $scope.customerFilter.last = searchBarSplit[1];
                    } else if (searchBarSplit.length == 1) {
                        $scope.customerFilter.first = searchBarSplit[0];
                    }
                }
            });

            $scope.alphaFilter = function (alpha) {
                if (alpha) {
                    $scope.customerFilter.first = alpha;
                } else {
                    $scope.customerFilter = {};
                }
            };
            
            


			
            $scope.$watch('sortOrder', function (newValue, oldValue) {
                if (newValue) {
                    newValue = parseInt(newValue);
                    if (newValue === 0) {
                        $scope.customerOrder = 'first';
                        $scope.customerSortReverse = false;
                    } else if (newValue == 1) {
                        $scope.customerOrder = 'first';
                        $scope.customerSortReverse = false;
                    } else if (newValue == 2) {
                        $scope.customerOrder = 'first';
                        $scope.customerSortReverse = true;
                    } else if (newValue == 3) {
                        $scope.customerOrder = 'created.date';
                        $scope.customerSortReverse = false;
                    }
                }
            });
        });
    }]);
});

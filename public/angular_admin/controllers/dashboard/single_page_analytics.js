define(['app', 'ngProgress', 'formatCurrency', 'highcharts', 'highcharts-ng', 'websiteService', 'userService'], function(app) {
    app.register.controller('SinglePageAnalyticsCtrl', ['$scope', '$location', 'ngProgress', 'WebsiteService', 'UserService', function($scope, $location, ngProgress, WebsiteService, UserService) {
        ngProgress.start();

        console.log('$route.current.params.postname >>> ', $location.$$search['pageurl']);
        var pageurl = $location.$$search['pageurl'];
        if (pageurl.indexOf('/page/') != -1  && pageurl.indexOf('blog') == -1) {
        	var handle = pageurl.replace('/page/', '');
        }
        //determine if page or post
        //get single page object
        UserService.getAccount(function(account) {
	        WebsiteService.getSinglePage(account.website.websiteId, handle, function(data) {
	        	console.log('data >>> ', data);
	        	$scope.page = data;
	        	ngProgress.complete();
	        });
		});
        //get single page analytics
        //show heatmap

    }]);
});

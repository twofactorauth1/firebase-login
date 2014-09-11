define(['app'], function(app) {
    app.controller('DashboardCtrl', ['$scope', function ($scope) {
    	$('.header.accordion').click(function (e) {
    		var self = $(e.target);
            self.next().toggleClass('open');
            self.find('.arrow').toggleClass('open closed');
    	});
    }]);
});

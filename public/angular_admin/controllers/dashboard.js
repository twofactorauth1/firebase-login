define(['app', 'jqueryGridster'], function(app) {
    app.controller('DashboardCtrl', ['$scope', function ($scope) {
    	$('.header.accordion').click(function (e) {
    		var self = $(e.target);
            self.next().toggleClass('open');
            self.find('.arrow').toggleClass('open closed');
    	});
    	var chartGrid = $(".gridster ul").gridster({
    		widget_margins: [2, 2],
        	widget_base_dimensions: [140, 140]
    	}).data('gridster');
    }]);
});

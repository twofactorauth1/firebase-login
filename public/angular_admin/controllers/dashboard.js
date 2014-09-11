define(['app', 'jqueryGridster'], function(app) {
    app.controller('DashboardCtrl', ['$scope', function ($scope) {
    	$('.header.accordion').click(function (e) {
    		var self = $(e.target);
            self.next().toggleClass('open');
            self.find('.arrow').toggleClass('open closed');
    	});
    	var chartGrid = $(".gridster ul").gridster({
    		widget_margins: [10, 10],
        	widget_base_dimensions: [140, 140]
    	}).data('gridster');
    	//chartGrid.add_widget('<li class="new">The HTML of the widget...</li>', 2, 1);
    	
    	//console.log(chartGrid.serialize());
    }]);
});

define(['app', 'c3', 'jqueryGridster', 'jqueryUI'], function(app, c3) {
    app.controller('DashboardCtrl', ['$scope', function ($scope) {
    	$('.header.accordion').click(function (e) {
    		var self = $(e.target);
            self.next().toggleClass('open');
            self.find('.arrow').toggleClass('open closed');
    	});
    	
    	$('.module_sidebar').draggable({
    		helper: 'clone', 
    		revert: true
    	});
    	
    	var chartGrid = $(".gridster ul").gridster({
    		widget_margins: [2, 2],
        	widget_base_dimensions: [420, 220]
    	}).data('gridster');
    	
    	$('.gridster').droppable({
    		drop: function (event, ui) {
    			console.info(ui.draggable.attr('data-name'), ui.draggable.attr('data-width'), ui.draggable.attr('data-type'));
    			chartGrid.add_widget('<li style="border: 2px solid red;" class="' + ui.draggable.attr('data-name') + '"></li>', 1, 1);
    			c3.generate({
    				bindto: '.' + ui.draggable.attr('data-name'),
    				data: {
      					columns: [
        					['data1', 30, 200, 100, 400, 150, 250],
        					['data2', 50, 20, 10, 40, 15, 25]
      					]
    				}
				});
    		}
    	});
    }]);
});

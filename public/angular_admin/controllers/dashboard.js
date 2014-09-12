define(['app', 'jqueryGridster', 'jqueryUI'], function(app) {
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
    			console.log(ui.draggable.attr('data-name'), ui.draggable.attr('data-width'), ui.draggable.attr('data-type'));
    			chartGrid.add_widget('<li style="border: 2px solid red;" class="new"><img src="http://thinkblueprint.com.au/wp-content/uploads/2013/06/blueprint-cogs-cmyk-80x80.jpg" /></li>', 1, 1);
    		}
    	});
    	
    	
    }]);
});

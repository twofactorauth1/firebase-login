define(['app', 'c3', 'jqueryGridster', 'jqueryUI', 'paymentService'], function(app, c3) {
    app.controller('DashboardCtrl', ['$scope', 'PaymentService', function ($scope, PaymentService) {
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
    	
    	var charts = {};
    	charts.ST_plan_creations = function (boxId) {
    		PaymentService.getListPlans(function (plans) {
    			var xAxis = ['x'];
    			var xValue = ['Plans'];
    			var chartData = {};
    			plans.data.forEach(function (value, index) {
    				var d = new Date(value.created);
    				var entryDate = d.toISOString().slice(0, 10);
    				if (entryDate in chartData) {
    					chartData[entryDate] += 1;
    				} else {
    					chartData[entryDate] = 1;
    				}
    			});
    			
    			$.each(chartData, function (k, v) {
    				xAxis.push(k);
    				xValue.push(v);
    			});
    			
	    		c3.generate({
					bindto: '.' + boxId,
					data: {
						x: 'x',
	  					columns: [
	  						xAxis,
	    					xValue
	  					]
					},
					axis: {
						x: {
							type: 'timeseries',
							tick: {
								format: '%Y-%m-%d'
							}
						}
					}
				});
    		});
    	};
    	
    	$('.gridster').droppable({
    		drop: function (event, ui) {
    			var boxId = ui.draggable.attr('data-name') + '-' + Math.floor((Math.random() * 100) + 1);
    			chartGrid.add_widget('<li style="border: 2px solid red;" class="' + boxId + '"></li>', 1, 1);
    			charts[ui.draggable.attr('data-name')](boxId);
    		}
    	});
    }]);
});

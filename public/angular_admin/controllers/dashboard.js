define(['app', 'c3', 'jqueryGridster', 'jqueryUI', 'paymentService', 'twoNetService'], function(app, c3) {
    app.register.controller('DashboardCtrl', ['$scope', 'PaymentService', 'TwoNetService', function ($scope, PaymentService, TwoNetService) {
    
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
        	widget_base_dimensions: [400, 200]
    	}).data('gridster');
    	
    	var charts = {};
    	charts.ST_plan_creations = function (boxId) {
    		PaymentService.getListPlans(function (plans) {
    			var xAxis = ['x'];
    			var xValue = ['Plans'];
    			var chartData = {};
    			plans.data.forEach(function (value, index) {
    				var d = new Date(value.created*1000);
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
    	
    	charts.ST_plan_subscriptions = function (boxId) {
    		var planData = {};
    		PaymentService.getListPlans(function (plans) { //TODO: add promise lib here
    			plans.data.forEach(function (value, index) {
    				planData[value.id] = 0;
    			});
    			PaymentService.getStripeCustomer(function (customers) {
    				customers.forEach(function (value, index) {
    					PaymentService.getListStripeSubscriptions(value.id, function (subscriptions) {
    						subscriptions.data.forEach(function (value, index) {
    							planData[value.id] += 1;
    						});
    					});
    				});
    				var chartPlans = 0;
    				var chartHasSubscriptions = 0;
    				$.each(planData, function (key, val) {
    					chartPlans += 1;
    					if (val > 0)
    						chartHasSubscriptions += 1;
    				});
    				c3.generate({
    					bindto: '.' + boxId,
    					data: {
    						columns: [
    							['Total Plans', chartPlans],
    							['Plans Having Subscriptions', chartHasSubscriptions]
    						],
    						type : 'donut'
    					},
    					donut: {
    						title: 'Subscriptions'
    					}
    				});
    			});
    		});
    	};
    	
        charts.TN_prolific_bio = function (boxId) {
    		TwoNetService.getBodyMeasurement(824, function (bios) {
    			var xAxis = ['x'];
    			var xValue = ['Pounds'];
    			var chartData = {};
    			bios.forEach(function (value, index) {
    				var d = new Date(parseInt(value.time)*1000);
    				var entryDate = d.toISOString().slice(0, 10);
                    xAxis.push(entryDate);
                    xValue.push(parseFloat(value.values[0].value));
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
                                count: 30,
								format: '%Y-%m-%d'
							}
						}
					}
				});
    		});
    	};

        charts.TN_debbie_abbot_bio = function (boxId) {
    		TwoNetService.getBodyMeasurement(515, function (bios) {
    			var xAxis = ['x'];
    			var xValue = ['Pounds'];
    			var chartData = {};
    			bios.forEach(function (value, index) {
    				var d = new Date(parseInt(value.time)*1000);
    				var entryDate = d.toISOString().slice(0, 10);
                    xAxis.push(entryDate);
                    xValue.push(parseFloat(value.values[0].value));
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
                                count: 30,
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
    			chartGrid.add_widget('<li class="' + boxId + '"></li>', 1, 1);
    			charts[ui.draggable.attr('data-name')](boxId);
    		}
    	});
    }]);
});

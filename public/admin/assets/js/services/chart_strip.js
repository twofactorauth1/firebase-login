define(['app','c3','paymentService'], function (app,c3) {
	app.register.service('ChartStripService',['PaymentService', function (PaymentService) {
		this.getPlanCreations = function (boxId) {
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

	this.getPlanSubscriptions = function (boxId) {
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
	}]);
});

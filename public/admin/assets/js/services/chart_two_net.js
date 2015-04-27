define(['app','c3','twoNetService'], function (app,c3) {
	app.register.service('ChartTwoNetService',['TwoNetService', function (TwoNetService) {
		this.getProlificBio = function (boxId) {
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

        this.getDebbieAbbotBio = function (boxId) {
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
	}]);
});

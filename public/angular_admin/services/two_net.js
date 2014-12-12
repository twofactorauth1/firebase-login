define(['app'], function (app) {
	app.register.service('TwoNetService', function ($http, ENV) {
		this.postBodyMeasurement = function (startDate, endDate, fn) {
			var query = {
				measureRequest: {
					guid: ENV.twonetUserGuid,
					trackGuid: ENV.twonetTrackGuid,
					filter: {
						startDate: startDate,
						endDate: endDate
					}
				}
			};
			$http.post('https://twonetcom.qualcomm.com/kernel/partner/measure/body/filtered', query)
			.success(function (data, status, headers, config) {
				fn(data);
			});
		};
        
        this.getBodyMeasurement = function (customerId, fn) {
			$http.get('/api/1.0/biometrics/readings?contactId=' + customerId)
			.success(function (data, status, headers, config) {
				fn(data);
			});
		};

	});
});

define(['app'], function (app) {
	app.service('TwoNetService', function ($http) {
		this.postBodyMeasurement = function (startDate, endDate, fn) {
			var query = {
				measureRequest: {
					guid: '50f97bb9-a38d-46eb-8e5a-d1716aed1da3',
					trackGuid: 'b64d7234-2398-021d-2b64-b5999a31aaff',
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
	});
});

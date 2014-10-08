define(['app', 'constants'], function(app) {
	app.register.service('ImportContactService', function($http) {
		var baseUrl = '/api/1.0/';
		this.importContacts = function(socialType, fn) {
			var api = "social/";
			switch(socialType) {
				case $$.constants.social.types.FACEBOOK:
					api += "facebook/";
					break;
				case $$.constants.social.types.GOOGLE:
					api += "google/";
					break;
				case $$.constants.social.types.LINKEDIN:
					api += "linkedin/";
					break;
			}
			var apiUrl = baseUrl + api + ['checkaccess'].join('/');
			$http.get(apiUrl)
			.success(function(data, status, headers, config) {
				var path = "";
				api = "social/";
				switch(socialType) {
					case $$.constants.social.types.FACEBOOK:
						api += "facebook/";
						path = "friends/import/"
						break;
					case $$.constants.social.types.GOOGLE:
						api += "google/";
						path = "contacts/import/";
						break;
					case $$.constants.social.types.LINKEDIN:
						api += "linkedin/";
						path = "connections/import/";
						break;
				}
				apiUrl = baseUrl + api + path;
				$http.get(apiUrl).success(function(data, status, headers, config) {
					fn(data);
				}).error(function(data, status, headers, config) {
					fn(data);
				});
			}).error(function(data, status, headers, config) {
					fn(data);
				});
		}
	});
});

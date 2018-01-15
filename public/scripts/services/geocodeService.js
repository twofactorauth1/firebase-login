/*
 * Verifying Account According to Subdomain
 * */


/*global mainApp , google*/
mainApp.service('geocodeService', ['$http', function ($http) {

	'use strict';
	var baseUrl = '/api/1.0/';

	this.getGeoSearchAddress = function (addressStr, fn) {
		var apiUrl = baseUrl + ['geo', 'search', 'address', addressStr].join('/');
		$http.get(apiUrl)
			.success(function (data) {
				fn(data);
			});
	};

	this.stringifyAddress = function (address, breakLine) {
		if (address && (address.address || address.address2 || address.city || address.state || address.zip)) {
			//var address = scope.htmlToPlaintext(address);
			var separator = ' ',
				_topline = _.filter([address.address, address.address2], function (str) {
					return str !== "";
				}).join(", "),
				_bottomline = _.filter([address.city, address.state, address.zip], function (str) {
					return str !== "";
				}).join(", ");
			if (_topline) {
				if (breakLine) {
					separator = ' <br> ';
				}
				return _topline + separator + _bottomline;
			}
			return _bottomline;
		}
	};

	this.validateAddress = function (location, fn) {
		if (typeof google === 'object') {
			var geocoder = new google.maps.Geocoder(),
				myLatLng = new google.maps.LatLng(location.lat, location.lon),
				address = this.stringifyAddress(location);
			if (!(location.city || location.state || location.zip)) {
				fn(false, null);
			} else {
				geocoder.geocode({
					latLng: myLatLng,
					'address': address
				}, function (results, status) {
					if (status === google.maps.GeocoderStatus.OK) {
						fn(true, results);
					} else {
						fn(false, null);
					}
				});
			}
		} else {
			fn(false, null);
		}

	};

	this.getLocations = function (lat, long, radius) {
		var apiUrl = baseUrl + 'geo/locations?lat=' + lat + '&lon=' + long + '&d=' + radius;
		return $http.get(apiUrl);
	};

	this.getAllLocations = function () {
		var apiUrl = baseUrl + 'geo/all/locations';
		return $http.get(apiUrl);
	};

	this.getDirectionsLinkGoogle = function (startAddress, destinationAddress) {
		var urlEncodedStartAddress = encodeURIComponent(startAddress || ''),
			urlEncodedDestinationAddress = encodeURIComponent(destinationAddress);
		return '//maps.google.com/maps?saddr=' + urlEncodedStartAddress + '&daddr=' + urlEncodedDestinationAddress;
	};

	this.getAddressWithZip = function (zip, fn) {
		if(!zip){
			fn(false. null);
		}
		if (typeof google === 'object') {
			var geocoder = new google.maps.Geocoder()			
			geocoder.geocode({					
				'address': zip
			}, function (results, status) {
				if (status === google.maps.GeocoderStatus.OK) {
					fn(true, results);
				} else {
					fn(false, null);
				}
			});
		}
	}

}]);

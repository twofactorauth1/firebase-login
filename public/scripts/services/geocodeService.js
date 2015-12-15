/*
 * Verifying Account According to Subdomain
 * */


'use strict';
mainApp.service('geocodeService', ['$http', function ($http) {
    var baseUrl = '/api/1.0/';

    this.getGeoSearchAddress = function(addressStr, fn) {
        var apiUrl = baseUrl + ['geo', 'search', 'address', addressStr].join('/');
        $http.get(apiUrl)
            .success(function(data, status, headers, config) {
                fn(data);
        });
    };

    this.stringifyAddress = function (address, breakLine) {
      if (address && (address.address || address.address2 || address.city || address.state || address.zip)) {
          //var address = scope.htmlToPlaintext(address);
          var separator = ' ';
          var _topline = _.filter([address.address, address.address2], function (str) {
            return str !== "";
          }).join(", ");
          var _bottomline = _.filter([address.city, address.state, address.zip], function (str) {
            return str !== "";
          }).join(", ");
          if (_topline) {
            if(breakLine)
              separator = ' <br> '
            return _topline + separator + _bottomline;
          }
          return _bottomline;
        }
    };

    this.validateAddress = function (location, fn) {
      var geocoder = new google.maps.Geocoder();
      var myLatLng = new google.maps.LatLng(location.lat, location.lon);
      var address = this.stringifyAddress(location);
      if (!((location.city && location.state) || location.zip)) {
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
    };

}]);
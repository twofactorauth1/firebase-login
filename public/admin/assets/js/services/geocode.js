'use strict';
/*global app, Keen, $$, google*/
/*jslint unparam: true*/
(function (angular) {
  app.service('GeocodeService', function ($http) {
    var baseUrl = '/api/1.0/';

    this.stringifyAddress = function (address) {
      var _bottomline = "";
      var _topline = "";
      if (address) {
        _bottomline = _.filter([address.city, address.state], function (str) {
          return str !== "";
        }).join(", ");
        _topline = _.filter([address.address, _bottomline, address.zip], function (str) {
          return str !== "";
        }).join(" ");
      }
      return _topline;
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

    this.getGeoSearchAddress = function (addressStr, fn) {
      var apiUrl = baseUrl + ['geo', 'search', 'address', addressStr].join('/');
      $http.get(apiUrl)
        .success(function (data) {
          fn(data);
        });
    };

  });
}(angular));

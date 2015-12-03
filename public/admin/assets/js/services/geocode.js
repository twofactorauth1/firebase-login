'use strict';
/*global app, Keen, $$, google*/
/*jslint unparam: true*/
(function (angular) {
  app.service('GeocodeService', function ($http) {
    var baseUrl = '/api/1.0/';

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

    this.validateAddress = function (location, locationObj, fn) {
      var geocoder = new google.maps.Geocoder();
      var myLatLng = null;
      if(locationObj)
        myLatLng = new google.maps.LatLng(locationObj.geometry.location.lat(), locationObj.geometry.location.lng());
      else
        myLatLng = new google.maps.LatLng(location.lat, location.lon);

      var address = locationObj ? locationObj.formatted_address : this.stringifyAddress(location);
      
      if (!((location.city && location.state) || location.zip)) {
        fn(false, null);
      } else {
        geocoder.geocode({
          latLng: myLatLng,
          'address': address
        }, function (results, status) {
          if (status === google.maps.GeocoderStatus.OK) {
            if(results.length > 1 && address)
            {
              results = _.where(results, {
                formatted_address: address
              });
            }
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

/*global app, moment, angular, window, L*/
/*jslint unparam:true*/
app.directive('contactUsComponent', ['customerService', 'leafletData', '$timeout', function (customerService, leafletData, $timeout) {
  return {
    scope: {
      component: '=',
      version: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {
      scope.stringifyAddress = function (address) {
        if (address) {
          //var address = scope.htmlToPlaintext(address);
          var _topline = _.filter([address.address, address.address2], function (str) {
            return str !== "";
          }).join(", ");
          var _bottomline = _.filter([address.city, address.state, address.zip], function (str) {
            return str !== "";
          }).join(", ");
          if (_topline) {
            return _topline + ' <br> ' + _bottomline;
          }

          return _bottomline;
        }
      };
      function hexToRgb(hex, opacity) {      
        var c;
        opacity = opacity || 1;
        c = hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+','+ opacity +')';
      };
      scope.boxColor = hexToRgb(scope.component.boxColor, scope.component.boxOpacity);

      scope.updateContactUsAddress = function () {
        scope.contactAddress = scope.stringifyAddress(scope.component.location);
        if (scope.component.location.lat && scope.component.location.lon) {
          angular.extend(scope, {
            mapLocation: {
              lat: parseFloat(scope.component.location.lat),
              lng: parseFloat(scope.component.location.lon),
              zoom: 10
            },
            markers: {
              mainMarker: {
                lat: parseFloat(scope.component.location.lat),
                lng: parseFloat(scope.component.location.lon),
                focus: false,
                message: scope.contactAddress,
                draggable: false
              }
            }
          });
          leafletData.getMap('leafletmap-' + scope.component._id).then(function (map) {
            $timeout(function () {
              map.invalidateSize();
              map.setView(new L.LatLng(scope.component.location.lat, scope.component.location.lon), 10);
              $(window).trigger("resize");
            }, 1000);
          });
        } else {
          customerService.getGeoSearchAddress(scope.contactAddress, function (data) {
            if (data.lat && data.lon) {
              scope.component.location.lat = data.lat;
              scope.component.location.lon = data.lon;
              angular.extend(scope, {
                mapLocation: {
                  lat: parseFloat(scope.component.location.lat),
                  lng: parseFloat(scope.component.location.lon),
                  zoom: 10
                },
                markers: {
                  mainMarker: {
                    lat: parseFloat(scope.component.location.lat),
                    lng: parseFloat(scope.component.location.lon),
                    focus: false,
                    message: scope.contactAddress,
                    draggable: false
                  }
                }
              });
              leafletData.getMap('leafletmap-' + scope.component._id).then(function (map) {
                $timeout(function () {
                  map.invalidateSize();
                  map.setView(new L.LatLng(scope.component.location.lat, scope.component.location.lon), 10);
                  $(window).trigger("resize");
                }, 1000);
              });
            }
          });
        }
      };
      angular.extend(scope, {
        mapLocation: {
          lat: 51,
          lng: 0,
          zoom: 10
        },
        defaults: {
          scrollWheelZoom: false
        },
        markers: {

        }
      });
      scope.updateContactUsAddress();
    }
  };
}]);

/*global app, moment, angular, window, CKEDITOR*/
/*jslint unparam:true*/
app.directive('contactUsComponent', ['GeocodeService', 'leafletData', '$timeout', '$window', function (GeocodeService, leafletData, $timeout, $window) {
  return {
    scope: {
      component: '=',
      version: '=',
      control: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {
      scope.isEditing = true;
      if (!scope.component.map) {
        scope.component.map = {};
        if (!scope.component.map.zoom) {
          scope.component.map.zoom = 10;
        }
      }
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

      scope.updateContactUsAddress = function (timeout) {
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
            map.setView(new L.LatLng(scope.component.location.lat, scope.component.location.lon), 10);
            $timeout(function () {
              map.invalidateSize();
              angular.element($window).triggerHandler('resize');
            }, timeout);
          });
        } else {
          GeocodeService.getGeoSearchAddress(scope.contactAddress, function (data) {
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
                map.setView(new L.LatLng(scope.component.location.lat, scope.component.location.lon), 10);
                $timeout(function () {
                  map.invalidateSize();
                  angular.element($window).triggerHandler('resize');
                }, timeout);
              });
            }
          });
        }
      };
      angular.extend(scope, {
        mapLocation: {
          lat: 51,
          lng: 0,
          zoom: scope.component.map.zoom
        },
        defaults: {
          scrollWheelZoom: false
        },
        markers: {

        }
      });
      scope.$watch('component.map.zoom', function (newValue, oldValue) {
        if (newValue) {
          $timeout(function () {
            scope.mapLocation.zoom = newValue;
          });
        }
      });
      $(document).ready(function () {
        scope.updateContactUsAddress(3000);
      });
      scope.control.refreshMap = function () {
        scope.updateContactUsAddress(100);
      }
      scope.control.updateAddressString = function () {
        scope.contactAddress = scope.stringifyAddress(scope.component.location);
      }
    }
  };
}]);

'use strict';
/*global app, moment, angular, window, CKEDITOR, L*/
/*jslint unparam:true*/
app.directive('contactUsComponent', ['AccountService', 'GeocodeService', 'leafletData', '$timeout', '$window', function (AccountService, GeocodeService, leafletData, $timeout, $window) {
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
      scope.$watch('component.boxColor', function (newValue, oldValue) {
        if (newValue) {
          scope.boxColor = hexToRgb(scope.component.boxColor, scope.component.boxOpacity);
        }
      });
      scope.$watch('component.boxOpacity', function (newValue, oldValue) {
        if (newValue) {
          scope.boxColor = hexToRgb(scope.component.boxColor, scope.component.boxOpacity);
        }
      });
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

      scope.checkBusinessAddress = function (fn) {
        AccountService.getAccount(function (account) {
          if (account.business.addresses.length > -1) {
            scope.component.location = account.business.addresses[0];
            if (fn) {
              fn();
            }
          }
        });
      };

      scope.updateContactUsAddress = function (timeout) {
        scope.contactAddress = scope.stringifyAddress(scope.component.location);
        if (scope.component.location && scope.component.location.lat && scope.component.location.lon) {
          angular.extend(scope, {
            mapLocation: {
              lat: parseFloat(scope.component.location.lat),
              lng: parseFloat(scope.component.location.lon),
              zoom: scope.component.map.zoom
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
          var _bottomline = "";
          var _topline = "";
          if(scope.component.location)
          {
            _bottomline = _.filter([scope.component.location.city, scope.component.location.state], function (str) {
              return str !== "";
            }).join(", ");

            _topline = _.filter([scope.component.location.address, _bottomline, scope.component.location.zip], function (str) {
              return str !== "";
            }).join(" ");
          }
          GeocodeService.getGeoSearchAddress(_topline, function (data) {
            console.log('data >>> ', data);
            if (data.lat && data.lon) {
              scope.component.location.lat = data.lat;
              scope.component.location.lon = data.lon;
              angular.extend(scope, {
                mapLocation: {
                  lat: parseFloat(scope.component.location.lat),
                  lng: parseFloat(scope.component.location.lon),
                  zoom: scope.component.map.zoom
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
            if(scope.component.location && scope.component.location.lat && scope.component.location.lon)
            {
              scope.mapLocation.lat = parseFloat(scope.component.location.lat);
              scope.mapLocation.lng = parseFloat(scope.component.location.lon);
            }            
          });
        }
      });

      $(document).ready(function () {
        if (!scope.component.location.address && !scope.component.location.address2 && !scope.component.location.city && !scope.component.location.state && !scope.component.location.zip) {
          scope.checkBusinessAddress(function () {
            scope.updateContactUsAddress(3000);
          });
        } else {
          scope.updateContactUsAddress(3000);
        }
      });

      scope.control.refreshMap = function () {
        if (!scope.component.location.address && !scope.component.location.address2 && !scope.component.location.city && !scope.component.location.state && !scope.component.location.zip) {
          scope.checkBusinessAddress(function () {
            scope.updateContactUsAddress(3000);
          });
        } else {
          scope.updateContactUsAddress(3000);
        }
      };

      scope.control.updateAddressString = function () {
        scope.contactAddress = scope.stringifyAddress(scope.component.location);
      };

    }
  };
}]);
'use strict';
/*global app, moment, angular, window, CKEDITOR, L*/
/*jslint unparam:true*/
app.directive('contactUsComponent', ['AccountService', 'GeocodeService', '$timeout', '$window', function (AccountService, GeocodeService, $timeout, $window) {
  return {
    scope: {
      component: '=',
      control: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {
      scope.showInfo = false;
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
        if (newValue && scope.component.boxColor) {
          scope.boxColor = hexToRgb(scope.component.boxColor, scope.component.boxOpacity);
        }
      });
      scope.$watch('component.boxOpacity', function (newValue, oldValue) {
        if (newValue && scope.component.boxColor) {
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

      scope.reloadMap = function()
      {
         google.maps.event.trigger(scope.map, 'resize');
         scope.map.setCenter(new google.maps.LatLng(scope.component.location.lat, scope.component.location.lon));
      }

      scope.updateContactUsAddress = function () {
        scope.contactAddress = scope.stringifyAddress(scope.component.location);

        if (scope.component.location.lat && scope.component.location.lon) {
          scope.reloadMap();
        } else {
          GeocodeService.getGeoSearchAddress(scope.contactAddress, function (data) {
            if (data.lat && data.lon) {
              scope.component.location.lat = data.lat;
              scope.component.location.lon = data.lon;
              scope.reloadMap();
            }
            else
              GeocodeService.validateAddress(scope.component.location, function (data, results) {
                if (data && results.length === 1) {
                  scope.component.location.lat = results[0].geometry.location.G;
                  scope.component.location.lon = results[0].geometry.location.K;
                  scope.reloadMap();
                } 
              });
          });
        }
      };
      scope.$on('mapInitialized', function(event, map) {
        scope.map = map;
        google.maps.event.trigger(scope.map, 'resize');
        scope.map.setCenter(new google.maps.LatLng(51, 0));
      });
      scope.control.refreshMap = function () {
        if (!scope.component.location.address && !scope.component.location.address2 && !scope.component.location.city && !scope.component.location.state && !scope.component.location.zip) {
          scope.checkBusinessAddress(function () {
              scope.updateContactUsAddress();
          });
        } else {
          scope.updateContactUsAddress();
        }
      };

      scope.control.updateAddressString = function () {
        scope.contactAddress = scope.stringifyAddress(scope.component.location);
      };

      scope.$parent.$watch('ckeditorLoaded', function (newValue, oldValue) {
        if(newValue)
        {
          if (!scope.component.location.address && !scope.component.location.address2 && !scope.component.location.city && !scope.component.location.state && !scope.component.location.zip) {
            scope.checkBusinessAddress(function () {
              $timeout(function () {
                scope.updateContactUsAddress();
              },500);
            });
        } else {
          $timeout(function () {
            scope.updateContactUsAddress();
          },500);
        }
        }
      })

    }
  };
}]);
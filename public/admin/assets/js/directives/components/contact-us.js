'use strict';
/*global app, moment, angular, window, CKEDITOR, L*/
/*jslint unparam:true*/
app.directive('contactUsComponent', ['AccountService', 'GeocodeService', '$timeout', '$window', function (AccountService, GeocodeService, $timeout, $window) {
  return {
    scope: {
      component: '=',
      control: '=',
      ssbEditor: '='
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
      if(!scope.component.custom)
      {
        scope.component.custom = {
          hours: true, address: true
        };
      }
      if(!scope.component.boxProperties)
      {
        scope.component.boxProperties = {};
      }
      
      // Set bg image show always false for contact component

      if(!angular.isDefined(scope.component.bg))
        scope.component.bg = {};
      if(!angular.isDefined(scope.component.bg.img))
        scope.component.bg.img = {};   
      if(!angular.isDefined(scope.component.bg.img.show))
        scope.component.bg.img.show = false;   
           
      scope.component.bg.img.show = false;

      function hexToRgb(hex, opacity) {      
        var c;
        opacity = angular.isDefined(opacity) ? opacity : 1;
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
        if (angular.isDefined(newValue) && scope.component.boxColor) {
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

      scope.setBusinessDetails = function(is_address, fn)
      {
        if(is_address){
          if (scope.account.business.addresses && scope.account.business.addresses.length > -1) {
           angular.copy(scope.account.business.addresses[0], scope.component.location);
          }
        }
        else if (scope.account.business.hours) {
          angular.copy(scope.account.business.hours, scope.component.hours);
          var _splitHours = scope.account.business.splitHours;
          scope.component.splitHours = _splitHours;
        }
        fn();
      }

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
              GeocodeService.validateAddress(scope.component.location, null, function (data, results) {
                if (data && results.length === 1) {
                  scope.component.location.lat = results[0].geometry.location.lat();
                  scope.component.location.lon = results[0].geometry.location.lng();
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
      if(!scope.ssbEditor){
        scope.control.refreshMap = function () {
          if ((!scope.component.location.address && !scope.component.location.address2 && !scope.component.location.city && !scope.component.location.state && !scope.component.location.zip) || !scope.component.custom.address) {
            scope.setBusinessDetails(true, function () {
                scope.updateContactUsAddress();
            });
          } else {
            scope.updateContactUsAddress();
          }
        };

        scope.control.refreshHours = function () {
          if (!scope.component.custom.hours)
            scope.setBusinessDetails(false, function () {
              console.log("hours refreshed");
            });
        };
      }
      

      scope.$parent.$watch('ckeditorLoaded', function (newValue, oldValue) {
        if(newValue)
        {
          AccountService.getAccount(function (account) {
            scope.account = account;
            if(!scope.component.custom.hours)
            {
              scope.setBusinessDetails(false, function () {
                console.log("hours refreshed");
              });
            }
            if ((!scope.component.location.address && !scope.component.location.address2 && !scope.component.location.city && !scope.component.location.state && !scope.component.location.zip) || !scope.component.custom.address) {
            scope.setBusinessDetails(true, function () {
              $timeout(function () {
                scope.updateContactUsAddress();
              },500);
            });
            } else {
              $timeout(function () {
                scope.updateContactUsAddress();
              },500);
            }
          });
        }
      })

      scope.$on("angular-resizable.resizeEnd", function (event, args) {
        var calculated_size = args;
        if(calculated_size.width === false)
        {
          scope.component.boxProperties.height = calculated_size.height;
        }
        else if(calculated_size.height === false)
        {
          scope.component.boxProperties.width = calculated_size.width;
        }
      })
    }
  };
}]);
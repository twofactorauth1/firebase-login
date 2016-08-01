/*global app, moment, angular, window, L*/
/*jslint unparam:true*/
app.directive('contactUsComponent', ['geocodeService', 'accountService', '$timeout', function (geocodeService, accountService, $timeout) {
  return {
    scope: {
      component: '='
    },
    templateUrl: '/components/component-wrap.html',
    link: function (scope, element, attrs) {
      scope.reloadMap = function()
      {
        if(scope.map){
         google.maps.event.trigger(scope.map, 'resize');
         scope.map.setCenter(new google.maps.LatLng(scope.component.location.lat, scope.component.location.lon));
       }
      }
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

      // Set bg image show always false for contact component

      if(!angular.isDefined(scope.component.bg))
        scope.component.bg = {};
      if(!angular.isDefined(scope.component.bg.img))
        scope.component.bg.img = {};
      if(!angular.isDefined(scope.component.bg.img.show))
        scope.component.bg.img.show = false;

      if(scope.component.boxColor)
        scope.boxColor = hexToRgb(scope.component.boxColor, scope.component.boxOpacity);

      scope.updateContactUsAddress = function () {
        scope.contactAddress = geocodeService.stringifyAddress(scope.component.location, true);
        if (scope.component.location.lat && scope.component.location.lon) {
          $timeout(function () {
              scope.reloadMap();
          }, 500);
        }
        else{
          geocodeService.validateAddress(scope.component.location, function (data, results) {
            if (data && results.length === 1) {
              scope.component.location.lat = results[0].geometry.location.lat();
              scope.component.location.lon = results[0].geometry.location.lng();
              $timeout(function () {
                scope.reloadMap();
              }, 3000);
            }
            else{
              if (scope.contactAddress) {
                geocodeService.getGeoSearchAddress(scope.contactAddress, function (data) {
                if (data.lat && data.lon) {
                  scope.component.location.lat = data.lat;
                  scope.component.location.lon = data.lon;
                  $timeout(function () {
                    scope.reloadMap();
                  }, 500);
                }
              });
              }
            }
          });
        }


      };

      scope.$on('mapInitialized', function(event, map) {
        scope.map = map;
        google.maps.event.trigger(scope.map, 'resize');
        scope.map.setCenter(new google.maps.LatLng(51, 0));
      });


      if(!scope.component.custom){
        scope.component.custom = {
          hours: true, address: true
        };
      };

      scope.setBusinessDetails = function(is_address, account, fn){
        if(is_address){
          if (account.business.addresses && account.business.addresses.length > -1) {
            scope.component.location = account.business.addresses[0];
          }
        }
        else if(account.business.hours){
          scope.component.hours = account.business.hours;
          scope.component.splitHours = account.business.splitHours;
        }
        fn();
      };

      accountService(function (err, account) {
        if(!scope.component.custom.hours)
        {
          scope.setBusinessDetails(false, account, function () {});
        }
        if ((!scope.component.location.address && !scope.component.location.address2 && !scope.component.location.city && !scope.component.location.state && !scope.component.location.zip) || !scope.component.custom.address) {
          scope.setBusinessDetails(true, account, function () {
            scope.updateContactUsAddress();
          });
        } else {
           scope.updateContactUsAddress();
        }
      });

        scope.calcMaxWidth = function(element){
            var el = angular.element("."+element);
            if(el.length){
                var w = el.width();
                // - 100 margin-left
                // -50 margin right
                return (w - 100 - 50) + 'px';
            }
        }
    }
  };
}]);

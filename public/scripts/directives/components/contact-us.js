/*global app, moment, angular, window, L*/
/*jslint unparam:true*/
app.directive('contactUsComponent', ['customerService', '$timeout', function (customerService, $timeout) {
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
      scope.reloadMap = function()
      {
        if(scope.map){
         google.maps.event.trigger(scope.map, 'resize');
         scope.map.setCenter(new google.maps.LatLng(scope.component.location.lat, scope.component.location.lon));
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
      if(scope.component.boxColor)
        scope.boxColor = hexToRgb(scope.component.boxColor, scope.component.boxOpacity);

      scope.updateContactUsAddress = function () {
        scope.contactAddress = scope.stringifyAddress(scope.component.location);
        if (scope.component.location.lat && scope.component.location.lon) {
          $timeout(function () {
              scope.reloadMap();
          }, 500);
        } else {
          customerService.getGeoSearchAddress(scope.contactAddress, function (data) {
            if (data.lat && data.lon) {
              scope.component.location.lat = data.lat;
              scope.component.location.lon = data.lon;
              $timeout(function () {
                scope.reloadMap();
              }, 3000);
            }
          });
        }
      };
      scope.$on('mapInitialized', function(event, map) {
        scope.map = map;
        google.maps.event.trigger(scope.map, 'resize');
        scope.map.setCenter(new google.maps.LatLng(51, 0));
      });
      scope.updateContactUsAddress();
    }
  };
}]);

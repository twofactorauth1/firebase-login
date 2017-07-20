app.directive('indiDatepicker',function($compile,$timeout){
    return {
        replace:true,
        restrict: "E",
        scope: {
            ngModel: '=',
            popup: '@',
            readOnly: '@',
            clickInput: '@'
        },
        template:
            '<div class="input-group">'     +
                    '<input type="text" ng-click="clickInputFn($event)" readonly="{{readOnly}}" class="form-control" datepicker-popup="{{popup}}" ng-model="ngModel" is-open="datePicker.isOpen" min-date="minDate" close-text="Close"/>' +
                    '<span class="input-group-btn">' +
                        '<button type="button" class="btn btn-default" ng-click="open($event)">' +
                            '<i class="glyphicon glyphicon-calendar"></i>' +
                        '</button>' +
                    '</span>' +
            '</div>',

        link: function(scope, element, attrs){
            scope.datePicker = {};
            scope.dateOptions = {
                formatYear: 'yy',
                startingDay: 1
            };

          /*
           * @open
           * -
           */

          scope.open = function ($event) {
            var ele = element;
            $event.preventDefault();
            $event.stopPropagation();
            if($("div[click-input][show-single] ul.dropdown-menu").length){
              $("div[click-input][show-single] ul.dropdown-menu").hide();
              $timeout(function() {
                scope.datePicker.isOpen = true;
                $(element).find("ul.dropdown-menu").show();
              }, 0);
            }
            else            
              scope.datePicker.isOpen = true;
          };

          /*
           * @endOpen
           * -
           */

          scope.endOpen = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            scope.startOpened = false;
            scope.endOpened = !scope.endOpened;
          };

          /*
           * @startOpen
           * -
           */

          scope.startOpen = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            scope.endOpened = false;
            scope.startOpened = !scope.startOpened;
          };

          scope.clickInputFn = function($event){
            if(scope.clickInput){
              scope.open($event);
            }
          }
        }

        
    };
});

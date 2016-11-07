app.directive('indiDatepicker',function($compile,$timeout){
    return {
        replace:true,
        restrict: "E",
        scope: {
            ngModel: '=',
            popup: '@',
            readOnly: '@'
        },
        template:
            '<div class="input-group">'     +
                    '<input type="text" readonly="{{readOnly}}" class="form-control" datepicker-popup="{{popup}}" ng-model="ngModel" is-open="datePicker.isOpen" min-date="minDate" close-text="Close"/>' +
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
            $event.preventDefault();
            $event.stopPropagation();
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
        }
    };
});

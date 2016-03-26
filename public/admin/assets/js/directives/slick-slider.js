app.directive('slickSlider', function() {
    return {
        restrict: 'A',
        scope: {
            objects: '=',
            config: '='
        },
        link: function(scope, element, attrs) {
            scope.$watch('objects', function(newValue, oldValue) {
                if ($(element).hasClass('slick-initialized')) {
                    $(element).slick('unslick');
                }
                $(element).slick(scope.config);
            }, true);
        }
    }
});

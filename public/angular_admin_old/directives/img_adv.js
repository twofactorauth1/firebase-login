define(['angularAMD'], function (angularAMD) {
    angularAMD.directive('img', [function () {
            return {
                // restrict: 'E',
                // link: function (scope, element, attrs) {
                //   element.error(function () {
                //     var w = element.width();
                //     var h = element.height();
                //     if (w <= 20)
                //       w = 100;
                //     if (h <= 20)
                //       h = 100;
                //     var url = '' + w + 'x' + h;
                //     element.prop('src', url);
                //   });
                // }
            };
    }]);
});

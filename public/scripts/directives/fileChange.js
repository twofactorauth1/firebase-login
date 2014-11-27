'use strict';

angular.module('mainApp').

directive('customOnChange', function() {
    'use strict';

    return {
        restrict: "A",
        scope: {
            gallery: '=galleryList'
        },
        link: function (scope, element, attrs) {
            var onChangeFunc = element.scope()[attrs.customOnChange];
            element.bind('change', function () {
                console.log("file Changed");
                if (this.files && this.files[0]) {
                    var reader = new FileReader();
                    reader.onload = imageIsLoaded;
                    reader.readAsDataURL(this.files[0]);
                }
            });
            function imageIsLoaded(e) {
                console.log(e);
                console.log(scope.gallery);
                $(scope.gallery).attr('src', e.target.result);
            };

        }
    };
});
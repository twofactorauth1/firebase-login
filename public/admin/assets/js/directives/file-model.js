app.directive('fileModel', ['$parse', 'toaster', function ($parse, toaster) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            var acceptedFormats = attrs.acceptedFormats;
            element.bind('change', function(){
                scope.$apply(function(){
                    if(element && element[0] && element[0].files && element[0].files[0] && acceptedFormats){
                        if(_.contains(acceptedFormats.split(","), element[0].files[0].type)){
                            modelSetter(scope, element[0].files[0]);
                        }
                        else{
                            console.log("invalid file format");
                            toaster.pop("warning", "Invalid file format");
                        }
                    }
                    else{
                        modelSetter(scope, element[0].files[0]);
                    }

                });
            });
        }
    };
}]);

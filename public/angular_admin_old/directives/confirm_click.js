define(['angularAMD', 'ngSweetAlert'], function (angularAMD) {
    angularAMD.directive('ngConfirmClick', ['SweetAlert',
        function(SweetAlert){
        return {
            link: function (scope, element, attr) {
                var msg = attr.ngConfirmClick || "Are you sure?";
                var clickAction = attr.confirmedClick;
                element.bind('click',function (event) {
                    SweetAlert.swal({
                       title: "Are you sure?",
                       text: "All the edits you have made will be lost.",
                       type: "warning",
                       showCancelButton: true,
                       cancelButtonText: "Continue Editing",
                       confirmButtonColor: "#DD6B55",
                       confirmButtonText: "Yes, Cancel Now."
                    },
                    function(){
                       scope.$eval(clickAction);
                    });
                });
            }
        };
    }]);
});
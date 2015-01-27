define([
    'app',
    'ngSweetAlert',
], function(app) {
    app.register.controller('LogoutCtrl', [
        '$scope',
        'SweetAlert',
        function($scope, SweetAlert) {
            SweetAlert.swal({
                title: "Are you sure?",
                text: "Do you want to logout?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, want to logout!",
                cancelButtonText: "No, do not want to logout!",
                closeOnConfirm: false,
                closeOnCancel: false
            },
            function(isConfirm) {
                console.log(isConfirm);
            });
        }
    ]);
});

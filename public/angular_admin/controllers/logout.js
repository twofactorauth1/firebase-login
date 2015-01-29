define([
    'app',
    'ngSweetAlert',
], function(app) {
    app.register.controller('LogoutCtrl', [
        '$scope',
        'SweetAlert',
        '$state',
        function($scope, SweetAlert, $state) {
            SweetAlert.swal({
                title: "Are you sure?",
                text: "Do you want to logout?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, I want to logout!",
                cancelButtonText: "No, I do not want to logout!",
                closeOnConfirm: true,
                closeOnCancel: true
            },
            function(isConfirm) {
                console.log(isConfirm);
                if (isConfirm) {
                    window.location = '/logout';
                } else {
                    window.history.back();
                }
            });
        }
    ]);
});

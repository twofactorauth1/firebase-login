angular.module('app').controller('MainController', ['$scope', '$rootScope', '$location' , '$modal', 'security', function ($scope, $rootScope, $location, $modal, security) {
    $scope.isAuthenticated = security.isAuthenticated;
    $scope.view = $location.path();
    // auth
    $rootScope.$on('auth:loginRequired', function (evt) {
        $scope.changeView("/");
        global.showLoginModal();
    });
    var global = {};
    $scope.$root.global = global;
    global.showLoginModal = function () {
        var modalInstance = $modal.open({
            templateUrl: '/views/modal/loginModal.html',
            controller: 'LoginModalController',
            resolve: {
            }
        });
        modalInstance.result.then(function () {
        }, function () {
        });
    }
    global.showSignupModal = function () {
        var modalInstance = $modal.open({
            templateUrl: '/views/modal/signupModal.html',
            controller: 'SignupModalController',
            resolve: {
            }
        });
        modalInstance.result.then(function (signedUp) {
            if (signedUp && singupButtonsModal) {
                singUpButtonsModal.dismiss();
            }
        }, function () {
        });
    }
    var singUpButtonsModal;
    global.showSignupButtonsModal = function () {
        singUpButtonsModal = $modal.open({
            templateUrl: '/views/modal/signupButtonsModal.html',
            controller: 'SignupModalController',
            resolve: {
            }
        });
        singUpButtonsModal.result.then(function () {
        }, function () {
        });
    }
    // navigation
    $scope.navClass = function (navView, curView) {
        return navView === curView ? 'active' : '';
    };
    $rootScope.changeView = $scope.changeView = function (view) {
        var splitView = view.split("#");
        view = splitView[0];
        var scrollToEl = splitView[1];
        if (view != $location.path()) {
            $location.path(view);
        }
        $scope.view = view;
        if (scrollToEl) {
            scrollTo($('#' + scrollToEl));
        }
        if ($scope.view == "/admin/pipeshift/" && !scrollToEl) {
            scrollTo($('#top'));
        }
    }
    function scrollTo(el) {
        if (el && el.offset()) {
            $('html, body').animate({
                scrollTop: el.offset().top - 72
            }, 1000);
        }
    };
}
])
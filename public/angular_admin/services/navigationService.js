define([
    'app',
    'userService'
], function (app) {
    app.register.service('NavigationService', ['$http', 'UserService', '$state', function ($http, UserService, $state) {
        var _updateNavigation, fn;

        fn = function (){ };
        _updateNavigation = function (last, single_view, showToaster) {
            UserService.getUserPreferences(function(preferences){
                last && (preferences.last = last);
                single_view && (preferences.single_view = single_view);
                UserService.updateUserPreferences(preferences, showToaster, fn );
            });
        };

        this.updateNavigation = function () {
            _updateNavigation($state.current.name, null, false);
        };
        this.updateNavigation2 = function (preferences) {
            _updateNavigation($state.current.name, preferences.single_view, true);
        };
    }]);
});
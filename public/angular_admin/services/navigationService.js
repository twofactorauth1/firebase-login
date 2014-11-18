define([
    'app',
    'userService'
], function (app) {
    app.register.service('NavigationService', ['$http', 'UserService', '$state', function ($http, UserService, $state) {
        var _updateNavigation = function (last, single_view) {
            UserService.getUser(function(user){
                //support old users ***start***
                user.app_preferences = user.app_preferences || {};
                user.app_preferences.tab = user.app_preferences.tab || {};
                //support old users *** end ***

                last && (user.app_preferences.tab.last = last);
                single_view && (user.app_preferences.tab.single_view = single_view)
                UserService.putUser(user, function(){});
            });

        };
        this.updateNavigation = function () {
            _updateNavigation($state.current.name);
        };
        this.updateNavigation2 = function (user) {
            _updateNavigation(null, user.app_preferences.tab.single_view );
        };
    }]);
});
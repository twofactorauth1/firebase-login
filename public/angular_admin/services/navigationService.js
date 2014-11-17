define([
    'app',
    'userService'], function (app) {
    app.register.service('NavigationService', ['$http', 'UserService', '$state', function ($http, UserService, $state) {
        this.updateNavigation = function () {
            UserService.getUser(function(user){
                user.app_preferences = user.app_preferences || {};
                user.app_preferences.tab = user.app_preferences.tab || {};
                user.app_preferences.tab.current=$state.current.name;
                UserService.putUser(user, function(){});
            });
        };
    }])

});
'use strict';

angular.module('app.security', [])
    .factory('security', ['$http', '$q', 'host', function ($http, $q, host) {

        var that = this;

        function populateUserAccessLevels(role) {
            service.currentUserAccessLevels = {};
            _.each(securityConfig.accessLevels, function (value, key) {
                service.currentUserAccessLevels[key] = _.contains(value, role) || value === "*";
            });
        };

        // The public API of the service
        var service = {

            // Information about the current user
            currentUserAccessLevels: null,
            currentUser: null,
            authenticated: false,

            authorize: function (accessLevelReq) {
                if (_.isNull(service.currentUserAccessLevels)) {
                    populateUserAccessLevels('public');
                }

                var authenticated = false;
                _.each(accessLevelReq, function (value) {
                    if (service.currentUserAccessLevels[value]) {
                        authenticated = true;
                    }
                });
                return authenticated;
            },

            // Ask the backend to see if a user is already authenticated - this may be from a previous session.
            requestCurrentUser: function () {
                if (_.isNull(service.currentUserAccessLevels)) {
                    populateUserAccessLevels('public');
                }

                if (service.isAuthenticated()) {
                    return $q.when(service.currentUser);
                } else {
                    return $http.get(host + '/current-user').then(function (response) {
                        service.currentUser = response.data.user;
                        if (service.currentUser) {
                            service.currentUser.role = 'user';
                            populateUserAccessLevels(service.currentUser.role);
                        } else {
                            populateUserAccessLevels(null);
                        }
                        return service.currentUser;
                    }, function () {
                        service.currentUser = null;
                        populateUserAccessLevels(null);
                        return null;
                    });
                }
            },

            // Is the current user authenticated?
            isAuthenticated: function () {
                service.authenticated = !!service.currentUser;
                return service.authenticated;
            },

            resetUser: function () {
                service.currentUser = null;
            }
        };

        return service;

    }]);
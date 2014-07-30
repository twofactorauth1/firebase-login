angular.module('app.services').factory('playlistService', ['$resource', 'host', function ($resource, host) {
    var Playlist = $resource(host + "/api/playlists/:id", {
        id: '@id'
    }, {
        'query': {method: 'GET', isArray: false},
        'isSubdomainFree': {url: host + "/api/playlists/free/:subdomain", method: 'GET'}
    });
    return Playlist;
}]);
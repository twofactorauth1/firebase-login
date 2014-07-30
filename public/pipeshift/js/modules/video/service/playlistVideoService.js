angular.module('app.services').factory('playlistVideoService', ['$resource', 'host', function ($resource, host) {
    var Playlist = $resource(host + "/api/playlists/:playlistId/video/:videoId", {
        playlistId: '@playlistId',
        videoId: '@id'
    }, {
        'query': {method: 'GET', isArray: false}
    });
    return Playlist;
}]);
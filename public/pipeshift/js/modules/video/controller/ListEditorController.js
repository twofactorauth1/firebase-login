/**
 * The controller used when editing video playlists
 */
angular.module('app.modules.video').controller('ListEditorController', ['$scope', '$routeParams', '$location', '$modal', '$http', 'youtube', 'playlistService', 'playlistVideoService', 'host', function ($scope, $routeParams, $location, $modal, $http, youtube, playlistService, playlistVideoService, host) {
    $scope.location = $location;
    $scope.playlistBlocked = false;
    $scope.searchsort = $location.search()['searchsort'] || false;
    $scope.searchduration = $location.search()['searchduration'] || false;
    $scope.searchtime = $location.search()['searchtime'] || false;
    $scope.section = $location.path().split('/')[2];
    $scope.playlistBlocked = true;
    //todo: might need to replace this with only certain template get, when needed - for example on popup open(if a lot of templates will be used)
    $http.post(host + "/api/email/templates").success(function (result) {
        $scope.playlistBlocked = false;
        $scope.templates = result;
    }).error(function (data) {
        alert("Error on templates get.")
    });
    $scope.ui = {};
    $scope.playlists = [];
    playlistService.query({}, function (resp) {
        if (resp.success) {
            $scope.playlists = resp.result;
            if ($scope.playlists.length > 0) {
                $scope.ui.selectedPlaylistId = $scope.playlists[0]._id;
                $scope.playlistSelected();
            }
        } else {
            alert(resp.error);
        }
    }, function (error) {
        alert("Some error happened");
    });

    console.log($scope.section);
    $scope.searchtype = $location.search()['searchtype'] || 'videos';

    window.searchCallback = function (data) {
        if (!$scope.videos) {
            $scope.videos = data.feed.entry;
        } else {
            $scope.videos.push.apply($scope.videos, data.feed.entry);
        }
    }

    window.userCallback = function (data) {
        $scope.user = data.entry;
    }

    $scope.getLink = function (video, index) {
        if ($scope.resulttype == 'playlists') {
            return '/video/playlist/' + video.yt$playlistId.$t;
        }
        return '/video/view/' + youtube.urlToID(video.media$group.yt$videoid.$t);
    }

    $scope.playlistSelected = function () {
        var result = null;
        var playlists = $scope.playlists;
        for (var i = 0; i < playlists.length; i++) {
            if (playlists[i]._id == $scope.ui.selectedPlaylistId) {
                result = playlists[i];
                break;
            }
        }
        $scope.playlist = result;
    }

    $scope.page = 0;
    $scope.loadMore = function () {
        $scope.page = $scope.page + 1;
        $scope.search();
    }

    $scope.findVideo = function (query) {
        $scope.page = 0;
        $scope.videos = [];
        $routeParams.query = query;
        $scope.search();
    }

    $scope.search = function () {
        youtube.setPage($scope.page);
        youtube.setCallback('searchCallback');
        if ($routeParams.query !== undefined && $routeParams.query !== "" && $routeParams.query !== "0") {
            // This is a search with a specific query.
            $scope.query = $routeParams.query;
            youtube.getVideos('search', $scope.query);

        } else if ($routeParams.category !== undefined) {
            // This is a category page.
            youtube.getVideos('category', $routeParams.category);

        } else if ($routeParams.username !== undefined) {
            // This is a user page.
            var type = 'user';
            if ($routeParams.feed !== undefined) {
                type += '_' + $routeParams.feed;
                if ($routeParams.feed === 'playlists') {
                    $scope.resulttype = 'playlists'
                }
            }
            youtube.getVideos(type, $routeParams.username);
            youtube.setCallback('userCallback');
            youtube.getItem('users', $routeParams.username);

        } else {
            youtube.getVideos('browse', '');
        }
    }

    $scope.$watch('searchsort + searchtime + searchduration + searchtype', function () {
        $scope.videos = false;
        youtube.setSort($scope.searchsort);
        youtube.setTime($scope.searchtime);
        youtube.setDuration($scope.searchduration);
        youtube.setType($scope.searchtype);
        $scope.resulttype = $scope.searchtype;
        $scope.search();
    })

    $scope.urlToID = function (url) {
        return youtube.urlToID(url);
    }
    $scope.formatDuration = function (seconds) {
        return youtube.formatDuration(seconds);
    }

    $scope.showVideo = function (video) {
        var modalInstance = $modal.open({
            templateUrl: '/views/video/modal/view.html',
            controller: 'VideoViewModalController',
            size: 'lg',
            resolve: {
                video: function () {
                    return video;
                }
            }
        });
    };

    $scope.showAddPlaylistModal = function () {
        var modalInstance = $modal.open({
            templateUrl: '/views/video/modal/playlistEdit.html',
            controller: 'AddPlaylistModalController',
            resolve: {
                templates: function () {
                    return $scope.templates;
                }
            }
        });
        modalInstance.result.then(function (newPlaylist) {
            playlistService.save({}, newPlaylist, function (resp) {
                if (resp.success) {
                    var createPlaylist = resp.result;
                    $scope.playlists.push(createPlaylist);
                    $scope.ui.selectedPlaylistId = createPlaylist._id;
                    $scope.playlistSelected();
                } else {
                    alert(resp.error);
                }
            }, function (error) {
                alert("Some error happened");
            });
        }, function () {
        });
    };

    $scope.showPlaylistInfoModal = function (playlist) {
        var modalInstance = $modal.open({
            templateUrl: '/views/video/modal/playlistEdit.html',
            controller: 'EditPlaylistModalController',
            size: 'lg',
            resolve: {
                playlist: function () {
                    return playlist;
                }, templates: function () {
                    return $scope.templates;
                }
            }
        });
        modalInstance.result.then(function (result) {
            if (result.isRemove) {
                playlistService.delete({id: playlist._id}, {}, function (resp) {
                    if (resp.success) {
                        var playlists = $scope.playlists;
                        var index = playlists.indexOf(playlist);
                        if (index > -1) {
                            playlists.splice(index, 1);
                        }
                        var indexToSelect = Math.min($scope.playlists.length - 1, index);
                        if (indexToSelect >= 0) {
                            var playlistToSelect = $scope.playlists[indexToSelect];
                            $scope.ui.selectedPlaylistId = playlistToSelect._id;
                            $scope.playlistSelected();
                        }
                    } else {
                        alert(resp.error);
                    }
                }, function (error) {
                    alert("Some error happened");
                });
            } else {
                var updatedPlaylist = result.playlist;
                playlistService.save({id: updatedPlaylist._id}, updatedPlaylist, function (resp) {
                    if (resp.success) {
                        playlist.template.name = updatedPlaylist.template.name;
                        playlist.title = updatedPlaylist.title;
                        playlist.subtitle = updatedPlaylist.subtitle;
                        playlist.body = updatedPlaylist.body;
                        playlist.description = updatedPlaylist.description;
                        playlist.subdomain = updatedPlaylist.subdomain;
                        playlist.price = updatedPlaylist.price;
                    } else {
                        alert(resp.error);
                    }
                }, function (error) {
                    alert("Some error happened");
                });
            }
        }, function () {
        });
    };
    $scope.showRemoveVideoModal = function (video) {
        var modalInstance = $modal.open({
            templateUrl: '/views/modal/removeModal.html',
            controller: 'RemoveModalController',
            resolve: {
                video: function () {
                    return video;
                }, message: function () {
                    return "Are you sure you want to remove this video from playlist?";
                }
            }
        });
        modalInstance.result.then(function () {
            $scope.playlistBlocked = true;
            playlistVideoService.delete({playlistId: $scope.playlist._id, videoId: video.videoId}, {}, function (resp) {
                $scope.playlistBlocked = false;
                if (resp.success) {
                    var videos = $scope.playlist.videos;
                    var index = videos.indexOf(video);
                    if (index > -1) {
                        videos.splice(index, 1);
                    }
                } else {
                    alert(resp.error);
                }
            }, function (error) {
                $scope.playlistBlocked = false;
                alert("Some error happened");
            })
        }, function () {
        });
    }
    $scope.addVideo = function (video) {
        $scope.playlistBlocked = true;
        playlistVideoService.save({playlistId: $scope.playlist._id}, video, function (resp) {
            $scope.playlistBlocked = false;
            if (resp.success) {
                $scope.playlist.videos.push(video);
            } else {
                alert(resp.error);
            }
        }, function (error) {
            $scope.playlistBlocked = false;
            alert("Some error happened");
        })
    }

    $scope.showSearchOptionsModal = function () {
        var modalInstance = $modal.open({
            templateUrl: '/views/video/modal/searchOptions.html',
            controller: 'SearchOptionsModalController',
            resolve: {
                searchOptions: function () {
                    return $scope.searchOptions;
                }
            }
        });
        modalInstance.result.then(function (searchOptions) {
            $scope.searchOptions = searchOptions;
            //todo: functionality to apply search options
        }, function () {
        });
    }
    $scope.showTimelineItemModal = function (video) {
        var modalInstance = $modal.open({
            templateUrl: '/views/video/modal/timelineItem.html',
            controller: 'TimelineItemModalController',
            size: 'lg',
            resolve: {
                video: function () {
                    return video;
                }, template: function () {
                    return findTemplateByName($scope.playlist.template.name);
                }
            }
        });
        modalInstance.result.then(function (updatedVideo) {
            $scope.playlistBlocked = true;
            playlistVideoService.save({playlistId: $scope.playlist._id, videoId: video.videoId}, updatedVideo, function (resp) {
                $scope.playlistBlocked = false;
                if (resp.success) {
                    video.subject = updatedVideo.subject;
                    video.videoTitle = updatedVideo.videoTitle
                    video.videoSubtitle = updatedVideo.videoSubtitle
                    video.videoBody = updatedVideo.videoBody
                    video.scheduledHour = updatedVideo.scheduledHour;
                    video.scheduledMinute = updatedVideo.scheduledMinute;
                    video.scheduledDay = updatedVideo.scheduledDay;
                    video.isPremium = updatedVideo.isPremium;
                } else {
                    alert(resp.error);
                }
            }, function (error) {
                $scope.playlistBlocked = false;
                alert("Some error happened");
            })
        }, function () {
        });
    }
    $scope.dayTimeSort = function (video) {
        return video.scheduledDay * 24 * 60 + video.scheduledHour * 60 + video.scheduledMinute;
    }
    function findTemplateByName(templateName) {
        var resultTemplate = null;
        for (var i = 0; i < $scope.templates.length; i++) {
            var curTemplate = $scope.templates[i];
            if (curTemplate.name == templateName) {
                resultTemplate = curTemplate;
                break;
            }
        }
        return resultTemplate;
    }
}]);

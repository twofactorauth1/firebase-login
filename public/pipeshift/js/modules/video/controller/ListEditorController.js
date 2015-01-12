/**
 * The controller used when editing video courses
 */
define(['angularAMD', 'app', 'varMainModule', 'courseService', 'courseVideoService', 'addCourseModalController', 'editCourseModalController', 'navigationService',
  'timelineItemController', 'removeModalController', 'searchOptionsModalController', 'videoViewModalController', 'subscribersCvsUploadController', 'ngOnboarding'
], function(angularAMD, app) {
  app.register.controller('ListEditorController', ['$scope', '$routeParams', '$location', '$modal', '$http', 'youtube', 'Course', 'CourseVideo', 'NavigationService', '$templateCache', '$filter', function($scope, $routeParams, $location, $modal, $http, youtube, Course, CourseVideo, NavigationService, $templateCache, $filter) {
    NavigationService.updateNavigation();
    $scope.location = $location;
    $scope.courseBlocked = false;
    $scope.searchsort = $location.search()['searchsort'] || false;
    $scope.searchduration = $location.search()['searchduration'] || false;
    $scope.searchtime = $location.search()['searchtime'] || false;
    $scope.section = $location.path().split('/')[2];
    $scope.courseBlocked = true;

    $scope.searchLabels = {
      1: 'Youtube',
      2: 'Vimeo',
      3: 'Dropbox',
      4: 'Email'
    };
    $scope.searchType = 1;
    //todo: might need to replace this with only certain template get, when needed - for example on popup open(if a lot of templates will be used

    $scope.templates = [{
      name: 'minimalist',
      code: function() {return $templateCache.get('/pipeshift/views/directives/videoPreview.html')[1];}
    }];

    $http.get("/api/1.0/campaignmanager/pipeshift/templates").success(function(result) {
      $scope.courseBlocked = false;
      // $scope.templates += result;
    }).error(function(data) {
      alert("Error on templates get.");
    });
    $scope.beginOnboarding = function(type) {
      if (type == 'create-campaign') {
        $scope.stepIndex = 0;
        $scope.showOnboarding = true;
        $scope.onboardingSteps = [{
          overlay: true,
          title: 'Task: Create First Campaign',
          description: "Create your first campaign that will funnel your potential customers.",
          position: 'centered',
          width: 400
        }];
      }
    };

    $scope.finishOnboarding = function() {
      console.log('were finished');
    };

    if ($location.$$search['onboarding']) {
      $scope.beginOnboarding($location.$$search['onboarding']);
    }
    $scope.ui = {};
    $scope.courses = [];
    $scope.allCourses = [];
    Course.query({}, function(resp) {
      $scope.allCourses = resp;
      $scope.courses = $filter('filter')(resp, {
        type: $scope.searchType
      });
      if ($scope.courses.length > 0) {
        $scope.ui.selectedCourseId = $scope.courses[0]._id;
        $scope.courseSelected();
      } else {
        $scope.ui.selectedCourseId = null;
      }
    }, function(error) {
      alert("Some error happened");
    });

    $scope.$watch('searchType', function(newValue, oldValue) {
      if (newValue) {
        $scope.courses = $filter('filter')($scope.allCourses, {
          type: newValue
        });
        if ($scope.courses.length > 0) {
          $scope.ui.selectedCourseId = $scope.courses[0]._id;
          $scope.courseSelected();
        } else {
          $scope.ui.selectedCourseId = null;
        }
      }
    });

    console.log($scope.section);
    $scope.searchtype = $location.search()['searchtype'] || 'videos';

    window.searchCallback = function(data) {
      if (!$scope.videos) {
        $scope.videos = data.feed.entry;
      } else {
        $scope.videos.push.apply($scope.videos, data.feed.entry);
      }
    }

    window.userCallback = function(data) {
      $scope.user = data.entry;
    }

    $scope.getLink = function(video, index) {
      if ($scope.resulttype == 'playlists') {
        return '/video/playlist/' + video.yt$playlistId.$t;
      }
      return '/video/view/' + youtube.urlToID(video.media$group.yt$videoid.$t);
    }

    $scope.courseSelected = function() {
      var result = null;
      var courses = $scope.courses;
      for (var i = 0; i < courses.length; i++) {
        if (courses[i]._id == $scope.ui.selectedCourseId) {
          result = courses[i];
          break;
        }
      }
      $scope.course = result;
    }

    $scope.page = 0;
    $scope.loadMore = function() {
      $scope.page = $scope.page + 1;
      $scope.search();
    }

    $scope.findVideo = function(query) {
      $scope.page = 0;
      $scope.videos = [];
      $routeParams.query = query;
      $scope.search();
    }

    $scope.search = function() {
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

    $scope.$watch('searchsort + searchtime + searchduration + searchtype', function() {
      $scope.videos = false;
      youtube.setSort($scope.searchsort);
      youtube.setTime($scope.searchtime);
      youtube.setDuration($scope.searchduration);
      youtube.setType($scope.searchtype);
      $scope.resulttype = $scope.searchtype;
      $scope.search();
    })

    $scope.urlToID = function(url) {
      return youtube.urlToID(url);
    }
    $scope.formatDuration = function(seconds) {
      return youtube.formatDuration(seconds);
    }

    $scope.showVideo = function(video) {
      var modalInstance = $modal.open({
        templateUrl: '/pipeshift/views/video/modal/view.html',
        controller: 'VideoViewModalController',
        size: 'lg',
        resolve: {
          video: function() {
            return video;
          }
        }
      });
    };

    $scope.showAddCourseModal = function() {
      var modalInstance = $modal.open({
        templateUrl: '/pipeshift/views/video/modal/courseEdit.html',
        controller: 'AddCourseModalController',
        size: 'lg',
        resolve: {
          templates: function() {
            return $scope.templates;
          },
          searchType: function() {
            return $scope.searchType;
          }
        }
      });
      modalInstance.result.then(function(newCourse) {
        Course.save({}, newCourse, function(resp) {
          var createdCourse = resp;
          $scope.courses.push(createdCourse);
          $scope.ui.selectedCourseId = createdCourse._id;
          $scope.courseSelected();
        }, function(error) {
          alert("Some error happened");
        });
      }, function() {});
    };

    $scope.showCourseInfoModal = function(course) {
      var modalInstance = $modal.open({
        templateUrl: '/pipeshift/views/video/modal/courseEdit.html',
        controller: 'EditCourseModalController',
        size: 'lg',
        resolve: {
          course: function() {
            return course;
          },
          templates: function() {
            return $scope.templates;
          }
        }
      });
      modalInstance.result.then(function(result) {
        if (result.isRemove) {
          Course.delete({
            id: course._id
          }, {}, function(resp) {
            var courses = $scope.courses;
            var index = courses.indexOf(course);
            if (index > -1) {
              courses.splice(index, 1);
            }
            var indexToSelect = Math.min($scope.courses.length - 1, index);
            if (indexToSelect >= 0) {
              var coursesToSelect = $scope.courses[indexToSelect];
              $scope.ui.selectedCourseId = coursesToSelect._id;
              $scope.courseSelected();
            }
          }, function(error) {
            alert("Some error happened");
          });
        } else {
          var updatedCourse = result.course;
          Course.update({
            id: updatedCourse._id
          }, updatedCourse, function(resp) {
            course.template.name = updatedCourse.template.name;
            course.title = updatedCourse.title;
            course.subtitle = updatedCourse.subtitle;
            course.body = updatedCourse.body;
            course.description = updatedCourse.description;
            course.subdomain = updatedCourse.subdomain;
            course.price = updatedCourse.price;
            course.showExitIntentModal = updatedCourse.showExitIntentModal;
          }, function(error) {
            alert("Some error happened");
          });
        }
      }, function() {});
    };
    $scope.showRemoveVideoModal = function(video) {
      var modalInstance = $modal.open({
        templateUrl: '/pipeshift/views/modal/removeModal.html',
        controller: 'RemoveModalController',
        resolve: {
          video: function() {
            return video;
          },
          message: function() {
            return "Are you sure you want to remove this video from course?";
          }
        }
      });
      modalInstance.result.then(function() {
        $scope.courseBlocked = true;
        CourseVideo.delete({
          courseId: $scope.course._id,
          videoId: video.videoId
        }, {}, function(resp) {
          $scope.courseBlocked = false;
          var videos = $scope.course.videos;
          var index = videos.indexOf(video);
          if (index > -1) {
            videos.splice(index, 1);
          }
        }, function(error) {
          $scope.courseBlocked = false;
          alert("Some error happened");
        })
      }, function() {});
    }
    $scope.addVideo = function(video) {
      $scope.courseBlocked = true;
      CourseVideo.save({
        courseId: $scope.course._id
      }, video, function(resp) {
        $scope.courseBlocked = false;
        $scope.course.videos.push(video);
      }, function(error) {
        $scope.courseBlocked = false;
        alert("Some error happened");
      })
    }

    $scope.showSearchOptionsModal = function() {
      var modalInstance = $modal.open({
        templateUrl: '/pipeshift/views/video/modal/searchOptions.html',
        controller: 'SearchOptionsModalController',
        resolve: {
          searchOptions: function() {
            return $scope.searchOptions;
          }
        }
      });
      modalInstance.result.then(function(searchOptions) {
        $scope.searchOptions = searchOptions;
        //todo: functionality to apply search options
      }, function() {});
    }
    $scope.showTimelineItemModal = function(video, index, totalNumber) {
      var modalInstance = $modal.open({
        templateUrl: '/pipeshift/views/video/modal/timelineItem.html',
        controller: 'TimelineItemModalController',
        size: 'lg',
        resolve: {
          video: function() {
            return $.extend({}, video, {
              percents: Math.round(100 * (index + 1) / totalNumber),
              videoIndex: index + 1,
              totalVideos: totalNumber
            });
          },
          template: function() {return findTemplateByName('minimalist');}
        }
      });
      modalInstance.result.then(function(updatedVideo) {
        $scope.courseBlocked = true;
        CourseVideo.update({
          courseId: $scope.course._id,
          videoId: video.videoId
        }, updatedVideo, function(resp) {
          $scope.courseBlocked = false;
          video.subject = updatedVideo.subject;
          video.videoTitle = updatedVideo.videoTitle
          video.videoSubtitle = updatedVideo.videoSubtitle
          video.videoBody = updatedVideo.videoBody
          video.scheduledHour = updatedVideo.scheduledHour;
          video.scheduledMinute = updatedVideo.scheduledMinute;
          video.scheduledDay = updatedVideo.scheduledDay;
          video.isPremium = updatedVideo.isPremium;
        }, function(error) {
          $scope.courseBlocked = false;
          alert("Some error happened");
        })
      }, function() {});
    }
    $scope.dayTimeSort = function(video) {
      return video.scheduledDay * 24 * 60 + video.scheduledHour * 60 + video.scheduledMinute;
    }

    function findTemplateByName(templateName) {
      var resultTemplate = null;
      $scope.templates.forEach(function(value, index) {
        if (value.name == templateName) {
          resultTemplate = value;
        }
      });
      return resultTemplate;
    }
  }]);
});

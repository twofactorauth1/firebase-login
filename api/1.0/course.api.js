/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var courseDao = require('../../dao/course.dao');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "courses",

    dao: courseDao,

    initialize: function () {
        //courses
        app.get(this.url(''), this.isAuthApi, this.listCourses.bind(this));
        app.get(this.url(':id'), this.isAuthApi, this.getCourseById.bind(this));
        app.post(this.url(''), this.isAuthApi, this.createCourse.bind(this));
        app.put(this.url(':id'), this.isAuthApi, this.updateCourse.bind(this));
        app.delete(this.url(':id'), this.isAuthApi, this.deleteCourse.bind(this));
        //videos
        app.get(this.url(':id/video'), this.isAuthApi, this.listCourseVideos.bind(this));
        app.get(this.url(':id/video/:videoId'), this.isAuthApi, this.getCourseVideoById.bind(this));
        app.post(this.url(':id/video'), this.isAuthApi, this.addVideoToCourse.bind(this));
        app.put(this.url(':id/video/:videoId'), this.isAuthApi, this.updateVideoInCourse.bind(this));
        app.delete(this.url(':id/video/:videoId'), this.isAuthApi, this.deleteVideoFromCourse.bind(this));
        //other
        app.get(this.url('free/:subdomain'), this.isAuthApi, this.isSubdomainFree.bind(this));
    },

    listCourses: function (req, resp) {
        var self = this;
        courseDao.findMany({userId: self.userId(req), _id: { $ne: "__counter__" }}, function (err, value) {
            self.sendResultOrError(resp, err, value, "Error getting courses");
        });
    },

    getCourseById: function (req, resp) {
        var self = this;
        var courseId = req.params.id;

        if (!courseId) {
            return this.wrapError(resp, 400, null, "Invalid parameter for ID");
        }

        courseId = parseInt(courseId);

        courseDao.getCourseById(courseId, self.userId(), function (err, course) {
            self.sendResultOrError(resp, err, course, "Error getting course");
        });
    },

    createCourse: function (req, resp) {
        var self = this;
        var newCourse = new $$.m.Course(req.body);
        newCourse.set('_id', null);
        newCourse.set('userId', self.userId(req));
        courseDao.saveOrUpdate(newCourse, function (err, createdCourse) {
            self.sendResultOrError(resp, err, createdCourse, "Error creating course");
        });

    },
    updateCourse: function (req, resp) {
        var self = this;
        var newCourseValues = req.body;
        var courseId = req.params.id;

        if (!courseId) {
            return this.wrapError(resp, 400, null, "Invalid parameter for ID");
        }

        courseId = parseInt(courseId);

        courseDao.getById(courseId, function (err, course) {
            if (!err && course != null) {
                if (course.get('userId') != self.userId(req)) {
                    return self.wrapError(resp, 403, null, null, "Not allowed");
                } else {
                    course.set('title', newCourseValues.title);
                    course.set('template', newCourseValues.template);
                    course.set('subtitle', newCourseValues.subtitle);
                    course.set('body', newCourseValues.body);
                    course.set('description', newCourseValues.description);
                    course.set('subdomain', newCourseValues.subdomain);
                    course.set('price', newCourseValues.price);
                    courseDao.saveOrUpdate(course, function (err, updatedCourse) {
                        self.sendResultOrError(resp, err, updatedCourse, "Error updating course");
                    });
                }
            } else {
                return self.wrapError(resp, 401, null, err, "Error updating course");
            }
        });
    },
    deleteCourse: function (req, resp) {
        var self = this;
        var courseId = req.params.id;

        if (!courseId) {
            return this.wrapError(resp, 400, null, "Invalid parameter for ID");
        }

        courseId = parseInt(courseId);

        courseDao.getById(courseId, function (err, course) {
            if (!err && course != null) {
                if (course.get('userId') != self.userId(req)) {
                    return self.wrapError(resp, 403, null, null, "Not allowed");
                } else {
                    courseDao.remove(course, function (err, removedCourse) {
                        self.sendResultOrError(resp, err, null, "Error removing course");
                    });
                }
            } else {
                return self.wrapError(resp, 401, null, err, "Error removing course");
            }
        });
    },

    //videos

    listCourseVideos: function (req, resp) {
        var self = this;
        var courseId = req.params.id;

        if (!courseId) {
            return self.wrapError(resp, 400, null, "Invalid parameter for ID");
        }

        courseId = parseInt(courseId);

        courseDao.getById(courseId, function (err, course) {
            var videos = course.get("videos");
            if (course.get('userId') != self.userId(req)) {
                _.forEach(videos, clearVideoFieldsForUnauthorizedUser);
            }
            self.sendResultOrError(resp, err, course.get("videos"), "Error getting course videos");
        });
    },
    getCourseVideoById: function (req, resp) {
        var self = this;
        var courseId = req.params.id;
        var videoId = req.params.videoId;

        if (!courseId) {
            return this.wrapError(resp, 400, null, "Invalid parameter for ID");
        }
        if (!videoId) {
            return this.wrapError(resp, 400, null, "Invalid parameter for video ID");
        }

        courseId = parseInt(courseId);

        courseDao.getById(courseId, function (err, course) {
            var videos = course.get("videos");
            var video = _.findWhere(videos, {videoId: videoId});
            if (video == null) {
                return self.wrapError(resp, 400, null, "Can't find video");
            } else {
                if (course.get('userId') != self.userId(req) && !isUserPaidForCourse(req.user, course)) {
                    clearVideoFieldsForUnauthorizedUser(video);
                }
                self.sendResultOrError(resp, err, video, "Error getting course videos");
            }
        });
    },
    addVideoToCourse: function (req, resp) {
        var self = this;
        var courseId = req.params.id;
        var videoToAdd = req.body;

        if (!courseId) {
            return self.wrapError(resp, 400, null, "Invalid parameter for ID");
        }
        if (!videoToAdd) {
            return self.wrapError(resp, 400, null, "Invalid body");
        }

        courseId = parseInt(courseId);
        videoToAdd._id = null;


        courseDao.getById(courseId, function (err, course) {
            if (course.get('userId') != self.userId(req)) {
                return self.wrapError(resp, 403, null, null, "Not allowed");
            } else {
                var videos = course.get("videos");
                videos.push(videoToAdd);
                courseDao.saveOrUpdate(course, function (err, course) {
                    self.sendResultOrError(resp, err, videoToAdd, "Error adding video to course");
                });
            }
        });
    },
    updateVideoInCourse: function (req, resp) {
        var self = this;
        var courseId = req.params.id;
        var videoId = req.params.videoId;
        var newVideoValues = req.body;

        if (!courseId || !videoId) {
            return this.wrapError(resp, 400, null, "Invalid parameter for ID");
        }
        if (!newVideoValues) {
            return this.wrapError(resp, 400, null, "Invalid body");
        }

        courseId = parseInt(courseId);

        courseDao.getById(courseId, function (err, course) {
            if (course.get('userId') != self.userId(req)) {
                return self.wrapError(resp, 403, null, null, "Not allowed");
            } else {
                var videos = course.get("videos");
                var video = _.findWhere(videos, {videoId: videoId});
                if (video == null) {
                    return self.wrapError(resp, 400, null, "Can't find video");
                } else {
                    video.videoTitle = newVideoValues.videoTitle;
                    video.videoSubtitle = newVideoValues.videoSubtitle;
                    video.videoBody = newVideoValues.videoBody;
                    video.scheduledHour = newVideoValues.scheduledHour;
                    video.scheduledMinute = newVideoValues.scheduledMinute;
                    video.scheduledDay = newVideoValues.scheduledDay;
                    video.subject = newVideoValues.subject;
                    video.isPremium = newVideoValues.isPremium;
                    courseDao.saveOrUpdate(course, function (err, course) {
                        self.sendResultOrError(resp, err, video, "Error updating video in course");
                    });
                }
            }
        });
    },
    deleteVideoFromCourse: function (req, resp) {
        var self = this;
        var courseId = req.params.id;
        var videoId = req.params.videoId;
        var newVideoValues = req.body;

        if (!courseId || !videoId) {
            return this.wrapError(resp, 400, null, "Invalid parameter for ID");
        }
        if (!newVideoValues) {
            return this.wrapError(resp, 400, null, "Invalid body");
        }

        courseId = parseInt(courseId);

        courseDao.getById(courseId, function (err, course) {
            if (course.get('userId') != self.userId(req)) {
                return self.wrapError(resp, 403, null, null, "Not allowed");
            } else {
                var videos = course.get("videos");
                var video = _.findWhere(videos, {videoId: videoId});
                if (video == null) {
                    return self.wrapError(resp, 400, null, "Can't find video");
                } else {
                    var index = _.indexOf(videos, video);

                    if (index > -1) {
                        videos.splice(index, 1);
                    }
                    courseDao.saveOrUpdate(course, function (err, course) {
                        self.sendResultOrError(resp, err, video, "Error removing video from course");
                    });
                }
            }
        });
    },
    isSubdomainFree: function (req, resp) {
    }

});

function clearVideoFieldsForUnauthorizedUser(video) {
    //todo: check if some other params should be removed
    video.videoUrl = null;
}
function isUserPaidForCourse(user, course) {
    //todo: implement in dao
    return true;
}

module.exports = new api();


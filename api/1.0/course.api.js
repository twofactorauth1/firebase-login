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
        self.log.debug('>> listCourses');
        var accountId = parseInt(self.accountId(req));
        //TODO: Add Security - VIEW_COURSE
        var userId = self.userId(req);
        courseDao.listUserCourses(userId, function (err, courses) {
            self.log.debug('<< listCourses');
            self.sendResultOrError(resp, err, courses, "Error getting courses");
        });
    },

    getCourseById: function (req, resp) {
        var self = this;
        self.log.debug('>> getCourseById');
        var courseId = req.params.id;

        if (!courseId) {
            return this.wrapError(resp, 400, null, "Invalid parameter for ID");
        }

        courseId = parseInt(courseId);

        courseDao.getCourseById(courseId, self.userId(req), function (err, course) {
            var accountId = parseInt(self.accountId(req));
            //TODO: Add Security - VIEW_COURSE
            //TODO: ADD accountId to course
            self.log.debug('<< getCourseById');
            self.sendResultOrError(resp, err, course, "Error getting course");
        });
    },

    createCourse: function (req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = parseInt(self.accountId(req));
        //TODO: Add Security - MODIFY_COURSE
        courseDao.createCourse(req.body, userId, function (err, createdCourse) {
            self.sendResultOrError(resp, err, createdCourse, "Error creating course");
        });

    },

    updateCourse: function (req, resp) {
        var self = this;
        var updatedCourseData = req.body;
        var courseId = req.params.id;

        if (!courseId) {
            return this.wrapError(resp, 400, null, "Invalid parameter for ID");
        }

        courseId = parseInt(courseId);
        var userId = self.userId(req);
        var accountId = parseInt(self.accountId(req));
        //TODO: Add Security - MODIFY_COURSE

        courseDao.updateCourse(updatedCourseData, courseId, userId, function (err, value) {
            return self.sendResultOrError(resp, err, value, "Error updating course");
        });
    },

    deleteCourse: function (req, resp) {
        var self = this;
        var courseId = req.params.id;

        if (!courseId) {
            return this.wrapError(resp, 400, null, "Invalid parameter for ID");
        }

        courseId = parseInt(courseId);
        var userId = self.userId(req);
        var accountId = parseInt(self.accountId(req));
        //TODO: Add Security - MODIFY_COURSE

        courseDao.deleteCourse(courseId, userId, function (err, value) {
            return self.sendResultOrError(resp, err, value, "Error removing course");
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
        var userId = self.userId(req);

        //TODO: Get accountId from Course
        //TODO: Add Security - VIEW_COURSE

        courseDao.listCourseVideos(courseId, userId, function (err, videos) {
            self.sendResultOrError(resp, err, videos, "Error getting course videos");
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
        var userId = self.userId(req);

        //TODO: Get accountId from Course
        //TODO: Add Security - VIEW_COURSE

        courseDao.findCourseVideoById(courseId, videoId, userId, function (err, video) {
            self.sendResultOrError(resp, err, video, "Error getting course video");
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
        var userId = self.userId(req);
        //TODO: Get accountId from Course
        //TODO: Add Security - MODIFY_COURSE

        courseDao.addVideoToCourse(videoToAdd, courseId, userId, function (err, video) {
            self.sendResultOrError(resp, err, video, "Error adding video to course");
        })
    },
    updateVideoInCourse: function (req, resp) {
        var self = this;
        var courseId = req.params.id;
        var videoId = req.params.videoId;
        var updatedVideoValues = req.body;

        if (!courseId || !videoId) {
            return this.wrapError(resp, 400, null, "Invalid parameter for ID");
        }
        if (!updatedVideoValues) {
            return this.wrapError(resp, 400, null, "Invalid body");
        }

        courseId = parseInt(courseId);
        var userId = self.userId(req);

        //TODO: Get accountId from Course
        //TODO: Add Security - MODIFY_COURSE

        courseDao.updateVideoInCourse(videoId, updatedVideoValues, courseId, userId, function (err, video) {
            self.sendResultOrError(resp, err, video, "Error updating video in course");
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
        var userId = self.userId(req);

        //TODO: Get accountId from Course
        //TODO: Add Security - MODIFY_COURSE

        courseDao.deleteVideoFromCourse(videoId, courseId, userId, function (err, video) {
            self.sendResultOrError(resp, err, video, "Error deleting video from course");
        });
    },
    isSubdomainFree: function (req, resp) {
        var self = this;
        var subdomain = req.params.subdomain;
        courseDao.isSubdomainFree(subdomain, function (err, isFree) {
            self.sendResultOrError(resp, err, {result: isFree}, "Error while checking subdomain");
        });
    }

});
function isUserPaidForCourse(user, course) {
    //todo: implement in dao
    return true;
}

module.exports = new api();


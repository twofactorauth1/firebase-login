/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('./base.dao');
var constants = requirejs('constants/constants');
require('../models/course');


var dao = {

        options: {
            name: "course.dao",
            defaultModel: $$.m.Course
        },

        getCourseById: function (courseId, curUserId, fn) {
            this.getById(courseId, function (err, course) {
                if (!err && course) {
                    var videos = course.get("videos");
                    if (course.get("userId") != curUserId) {
                        _.forEach(videos, clearVideoFieldsForUnauthorizedUser);
                    }
                }
                return fn(err, course);
            });
        },

        getCourseByIdForSubscriber: function (courseId, fn) {
            this.getById(courseId, function (err, course) {
                if (!err && course) {
                    var videos = course.get("videos");

                }
                return fn(err, course);
            });
        },

        listUserCourses: function (userId, fn) {
            this.findMany({userId: userId, _id: { $ne: "__counter__" }}, fn);
        },

        listCoursesByAccount: function(accountId, fn) {
            var self = this;
            this.findMany({accountId: accountId, _id: {$ne: "__counter__"}}, fn);
        },

        createCourse: function (courseData, userId, accountId, fn) {
            var newCourse = new $$.m.Course(courseData);
            newCourse.set('_id', null);
            newCourse.set('userId', userId);
            newCourse.set('accountId', accountId);
            this.saveOrUpdate(newCourse, fn);
        },

        updateCourse: function (updatedCourseData, courseId, curUserId, fn) {
            var self = this;
            self.getById(courseId, function (err, course) {
                if (!err && course != null) {
                    if (course.get('userId') != curUserId) {
                        fn({message: "Not allowed", status: 403}, null);
                    } else {
                        course.set('title', updatedCourseData.title);
                        course.set('template', updatedCourseData.template);
                        course.set('subtitle', updatedCourseData.subtitle);
                        course.set('body', updatedCourseData.body);
                        course.set('description', updatedCourseData.description);
                        course.set('subdomain', updatedCourseData.subdomain);
                        course.set('price', updatedCourseData.price);
                        course.set('showExitIntentModal', updatedCourseData.showExitIntentModal);
                        self.saveOrUpdate(course, fn);
                    }
                } else {
                    fn(err || {message: "Error updating course", status: 400}, null);
                }
            });
        },

        deleteCourse: function (courseId, curUserId, fn) {
            var self = this;
            self.getById(courseId, function (err, course) {
                if (!err && course != null) {
                    if (course.get('userId') != curUserId) {
                        fn({message: "Not allowed", status: 403}, null);
                    } else {
                        self.remove(course, function (err, value) {
                            fn(err, course);
                        });
                    }
                } else {
                    fn(err || {message: "Error removing course", status: 400}, null)
                }
            });
        },

        listCourseVideos: function (courseId, curUserId, fn) {
            var self = this;
            self.getById(courseId, function (err, course) {
                if (err || !course) {
                    fn(err | !course);
                } else {
                    var videos = course.get("videos");
                    if (course.get('userId') != curUserId) {
                        _.forEach(videos, clearVideoFieldsForUnauthorizedUser);
                    }
                    fn(null, videos);
                }
            });
        },

        findCourseVideoById: function (courseId, videoId, curUseId, fn) {
            var self = this;
            self.getById(courseId, function (err, course) {
                if (err || !course) {
                    fn(err || !course);
                } else {
                    var videos = course.get("videos");
                    var video = _.findWhere(videos, {videoId: videoId});
                    if (video == null) {
                        fn({message: "Can't find video", status: 400}, null);
                    } else {
                        if (course.get('userId') != curUseId && !self.isUserPaidForCourse(curUseId, courseId)) {
                            clearVideoFieldsForUnauthorizedUser(video);
                        }
                        fn(null, video);
                    }
                }
            });
        },

        isUserPaidForCourse: function (userId, courseId, fn) {
            //todo: implement method
            return true;
        },

        addVideoToCourse: function (videoToAdd, courseId, curUserId, fn) {
            var self = this;

            videoToAdd._id = null;

            self.getById(courseId, function (err, course) {
                if (course.get('userId') != curUserId) {
                    fn({message: "Not allowed", status: 403}, null);
                } else {
                    if (err || !course) {
                        fn(err || !course);
                    } else {
                        var videos = course.get("videos");
                        videos.push(videoToAdd);
                        self.saveOrUpdate(course, function (err, course) {
                            fn(err, videoToAdd);
                        });
                    }
                }
            });
        },

        updateVideoInCourse: function (videoId, updatedVideoValues, courseId, curUserId, fn) {
            var self = this;
            self.getById(courseId, function (err, course) {
                if (course.get('userId') != curUserId) {
                    fn({message: "Not allowed", status: 403}, null);
                } else {
                    if (err || !course) {
                        fn(err || !course);
                    } else {
                        var videos = course.get("videos");
                        var video = _.findWhere(videos, {videoId: videoId});
                        if (video == null) {
                            fn({message: "Can't find video", status: 400}, null);
                        } else {
                            video.videoTitle = updatedVideoValues.videoTitle;
                            video.videoSubtitle = updatedVideoValues.videoSubtitle;
                            video.videoBody = updatedVideoValues.videoBody;
                            video.scheduledHour = updatedVideoValues.scheduledHour;
                            video.scheduledMinute = updatedVideoValues.scheduledMinute;
                            video.scheduledDay = updatedVideoValues.scheduledDay;
                            video.subject = updatedVideoValues.subject;
                            video.isPremium = updatedVideoValues.isPremium;
                            self.saveOrUpdate(course, function (err, course) {
                                fn(err, video);
                            });
                        }
                    }
                }
            });
        },

        deleteVideoFromCourse: function (videoId, courseId, curUserId, fn) {
            var self = this;
            self.getById(courseId, function (err, course) {
                if (course.get('userId') != curUserId) {
                    fn({message: "Not allowed", status: 403}, null);
                } else {
                    if (err || !course) {
                        fn(err || !course);
                    } else {
                        var videos = course.get("videos");
                        var video = _.findWhere(videos, {videoId: videoId});
                        if (video == null) {
                            fn({message: "Can't find video", status: 400}, null);
                        } else {
                            var index = _.indexOf(videos, video);

                            if (index > -1) {
                                videos.splice(index, 1);
                            }
                            self.saveOrUpdate(course, function (err, course) {
                                fn(err, video);
                            });
                        }
                    }
                }
            });
        },

        isSubdomainFree: function (subdomain, fn) {
            var self = this;
            var query = { "subdomain": subdomain};
            this.findOne(query, function (err, course) {
                if (err) {
                    fn(err);
                } else {
                    fn(null, course == null);
                }
            });
        },

        findCourseBySubdomain: function (subdomain, curUserId, fn) {
            var query = { "subdomain": subdomain};
            this.findOne(query, function (err, course) {
                if (!err && course) {
                    var videos = course.get("videos");
                    if (course.get("userId") != curUserId) {
                        _.forEach(videos, clearVideoFieldsForUnauthorizedUser);
                    }
                }
                return fn(err, course);
            });
        },

        findCourseAndVideo: function (courseSubdomain, videoId, fn) {
            var query = { "subdomain": courseSubdomain};
            this.findOne(query, function (err, course) {
                if (!err && course) {
                    var videos = course.get("videos");
                    var video = _.findWhere(videos, {videoId: videoId});
                }
                return fn(err, course, video);
            });
        },

        deleteCourseByUser: function(userId, fn) {
            var self = this;
            self.removeByQuery({'userId': userId}, $$.m.Course, fn);
        }


    }
    ;

function clearVideoFieldsForUnauthorizedUser(video) {
    //todo: check if some other params should be removed
    video.videoUrl = null;
}

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.CourseDao = dao;

module.exports = dao;

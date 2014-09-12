/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var courseDao = require('../../dao/course.dao');
var subscriberDao = require('../../dao/subscriber.dao');
var csv = require("fast-csv");
var campaignManager = require('../../campaign/campaign_manager');


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
        app.get(this.url(':id/subscribers'), this.isAuthApi, this.getSubscribersList.bind(this));
        app.get(this.url(':id/subscribers/video/:videoId'), this.isAuthApi, this.getVideoForCurrentUser.bind(this));
        app.post(this.url(':id/subscribers/upload'), this.isAuthApi, this.subscribeEmailsFromFile.bind(this));
    },

    listCourses: function (req, resp) {
        var self = this;
        var userId = self.userId(req);
        courseDao.listUserCourses(userId, function (err, courses) {
            self.sendResultOrError(resp, err, courses, "Error getting courses");
        });
    },

    getCourseById: function (req, resp) {
        var self = this;
        var courseId = req.params.id;

        if (!courseId) {
            return this.wrapError(resp, 400, null, "Invalid parameter for ID");
        }

        courseId = parseInt(courseId);

        courseDao.getCourseById(courseId, self.userId(req), function (err, course) {
            self.sendResultOrError(resp, err, course, "Error getting course");
        });
    },

    createCourse: function (req, resp) {
        var self = this;
        var userId = self.userId(req);
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
    },
    getSubscribersList: function (req, resp) {
        var courseId = req.params.id;
        if (!courseId) {
            return this.wrapError(resp, 400, null, "Invalid parameter for ID");
        }
        var self = this;
        var userId = self.userId(req);
        courseDao.getCourseById(courseId, userId, function (err, course) {
            if (err || !course) {
                return self.wrapError(resp, 500, null, err, "No course found");
            } else {
                if (course.userId != userId) {
                    return self.wrapError(resp, 403, null, "Not allowed", "Not allowed");
                } else {
                    subscriberDao.listCourseSubscribers(courseId, function (err, docs) {
                        self.sendResultOrError(resp, err, docs, "Error while getting subscribers");
                    });
                }
            }
        });

    },
    getVideoForCurrentUser: function (req, resp) {
        var courseId = req.params.id;
        var videoId = req.params.videoId;
        var self = this;
        if (courseId) {
            courseDao.findById(courseId, function (error, course) {
                    if (error || !course) {
                        var msg = "Error getting course: " + (error != null ? error.message : "");
                        return self.wrapError(resp, 500, msg, msg, msg);
                    } else {
                        subscriberDao.find({courseId: courseId, email: self.user.email}, function (error, docs) {
                            if (error) {
                                return self.wrapError(resp, 500, error);
                            } else if (docs == null || docs.length == 0) {
                                return self.wrapError(resp, 500, "Error: not subscribed.");
                            } else {
                                var subscriber = docs[0];
                                var video = getVideoById(course, videoId);
                                if (video == null) {
                                    return self.wrapError(resp, 500, "Error: video not found.");
                                } else {
                                    if (!checkIfVideoAlreadySent(subscriber, video)) {
                                        video.videoId = null;
                                        video.videoUrl = null;
                                    }
                                    return self.sendResultOrError(resp, null, video);
                                }
                            }
                        });
                    }
                }
            );
        } else {
            return self.wrapError(resp, 500, "Error: Course id should be provided");
        }
    },
    subscribeEmailsFromFile: function (req, resp) {
        var courseId = req.params.id;
        req.pipe(req.busboy);
        var emailsToSubscribe = [];
        var subscribed = 0;
        var subscribersResultCounter = 0;
        var self = this;
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);
            csv.fromStream(file)
                .on("data", function (data) {
                    if (data.length > 0) {
                        var email = data[0];
                        emailsToSubscribe.push(email);
                    }
                })
                .on("end", function () {
                    var emailsCount = emailsToSubscribe.length;
                    for (var i = 0; i < emailsCount; i++) {
                        var email = emailsToSubscribe[i];
                        courseDao.findById(courseId, function (error, course) {
                            if (error || !course) {
                                self.wrapError(resp, 500, error, "Error finding course");
                            } else {
                                campaignManager.subscribeToVARCourse(email, course, 0, self.userId, function (result) {
                                    subscribersResultCounter++;
                                    if (!result.success) {
                                        console.log(result.error);
                                    } else {
                                        subscribed++;
                                    }
                                    if (subscribersResultCounter == emailsCount) {
                                        var msg = subscribed + " email(s) were subscribed to course(out of " + emailsCount + ")";
                                        console.log(msg);
                                        return  self.sendResult(resp, msg);
                                    }
                                });
                            }
                        });
                    }
                });
        });
    }


});
function isUserPaidForCourse(user, course) {
    //todo: implement in dao
    return true;
}

function getVideoById(course, videoId) {
    var result = null;
    for (var i = 0; i < course.videos.length; i++) {
        var video = course.videos[i];
        if (video._id == videoId) {
            result = video;
            break;
        }
    }
    return result;
}

function checkIfVideoAlreadySent(subscriber, video) {
    var subscribeDate = subscriber.subscribeDate;
    var timezoneOffset = subscriber.timezoneOffset == null ? 0 : subscriber.timezoneOffset;
    return checkIfDateAlreadyPassed(subscribeDate, video.scheduledDay, video.scheduledHour, video.scheduledMinute, timezoneOffset);
}

function checkIfDateAlreadyPassed(startDate, daysShift, hoursValue, minutesValue, timezoneOffset) {
    var shiftedUtcDate = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate() + daysShift, startDate.getUTCHours(), startDate.getUTCMinutes(), startDate.getUTCSeconds());
    shiftedUtcDate.setUTCHours(hoursValue);
    shiftedUtcDate.setUTCMinutes(minutesValue + timezoneOffset);
    shiftedUtcDate.setUTCSeconds(0);
    return (new Date()) >= shiftedUtcDate;
}

module.exports = new api();


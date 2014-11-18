/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var accountDao = require('../../dao/account.dao');
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

        //PUBLIC (no security) APIs
        app.get(this.url(''), this.setup.bind(this), this.listCoursesBySubdomain.bind(this));


        //courses
        //app.get(this.url(''), this.isAuthApi, this.listCourses.bind(this));
        app.get(this.url(':id'), this.isAuthApi, this.getCourseById.bind(this));
        app.post(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.createCourse.bind(this));
        app.put(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.updateCourse.bind(this));
        app.delete(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.deleteCourse.bind(this));
        //videos
        app.get(this.url(':id/video'), this.isAuthApi, this.listCourseVideos.bind(this));
        app.get(this.url(':id/video/:videoId'), this.isAuthApi, this.getCourseVideoById.bind(this));
        app.post(this.url(':id/video'), this.isAuthAndSubscribedApi.bind(this), this.addVideoToCourse.bind(this));
        app.put(this.url(':id/video/:videoId'), this.isAuthAndSubscribedApi.bind(this), this.updateVideoInCourse.bind(this));
        app.delete(this.url(':id/video/:videoId'), this.isAuthAndSubscribedApi.bind(this), this.deleteVideoFromCourse.bind(this));
        //other
        app.get(this.url('free/:subdomain'), this.isAuthAndSubscribedApi.bind(this), this.isSubdomainFree.bind(this));
        app.get(this.url(':id/subscribers'), this.isAuthAndSubscribedApi.bind(this), this.getSubscribersList.bind(this));
        app.get(this.url(':id/subscribers/video/:videoId'), this.isAuthAndSubscribedApi.bind(this), this.getVideoForCurrentUser.bind(this));
        app.post(this.url(':id/subscribers/upload'), this.isAuthAndSubscribedApi.bind(this), this.subscribeEmailsFromFile.bind(this));
        app.post(this.url(':id/subscribe'), this.setup, this.subscribeToCourse.bind(this));
    },

    listCoursesBySubdomain: function(req, res) {
        var self = this;
        self.log.debug('>> listCoursesBySubdomain');
        /*
         * this.setup was called.  We should have an accountId based on the subdomain
         */
        var accountId = parseInt(self.accountId(req));
        self.log.debug('listing courses for account: ' + accountId);

        courseDao.listCoursesByAccount(accountId, function(err, courses){
            self.log.debug('<< listCoursesBySubdomain');
            self.sendResultOrError(res, err, courses, "Error getting courses");
        });
    },

    listCourses: function (req, resp) {
        var self = this;
        self.log.debug('>> listCourses');
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_COURSE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var userId = self.userId(req);
                courseDao.listUserCourses(userId, function (err, courses) {
                    self.log.debug('<< listCourses');
                    self.sendResultOrError(resp, err, courses, "Error getting courses");
                });
            }
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

            self.log.debug('<< getCourseById');
            self.checkPermissionAndSendResponse(req, self.sc.privs.VIEW_COURSE, resp, course);
            self.sendResultOrError(resp, err, course, "Error getting course");
        });
    },

    createCourse: function (req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_COURSE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                courseDao.createCourse(req.body, userId, accountId, function (err, createdCourse) {
                    self.sendResultOrError(resp, err, createdCourse, "Error creating course");
                });
            }
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

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_COURSE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                courseDao.updateCourse(updatedCourseData, courseId, userId, function (err, value) {
                    return self.sendResultOrError(resp, err, value, "Error updating course");
                });
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
        var userId = self.userId(req);
        var accountId = parseInt(self.accountId(req));

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_COURSE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                courseDao.deleteCourse(courseId, userId, function (err, value) {
                    return self.sendResultOrError(resp, err, value, "Error removing course");
                });
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
        var userId = self.userId(req);

        //TODO: Get accountId from Course
        var accountId = parseInt(self.accountId(req));
        self.checkPermissionForAccount(req, self.sc.privs.VIEW_COURSE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                courseDao.listCourseVideos(courseId, userId, function (err, videos) {
                    self.sendResultOrError(resp, err, videos, "Error getting course videos");
                });
            }
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
        var accountId = parseInt(self.accountId(req));
        self.checkPermissionForAccount(req, self.sc.privs.VIEW_COURSE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                courseDao.findCourseVideoById(courseId, videoId, userId, function (err, video) {
                    self.sendResultOrError(resp, err, video, "Error getting course video");
                });
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
        var userId = self.userId(req);
        //TODO: Get accountId from Course

        var accountId = parseInt(self.accountId(req));
        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_COURSE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                courseDao.addVideoToCourse(videoToAdd, courseId, userId, function (err, video) {
                    self.sendResultOrError(resp, err, video, "Error adding video to course");
                });
            }
        });

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
        var accountId = parseInt(self.accountId(req));
        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_COURSE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                courseDao.updateVideoInCourse(videoId, updatedVideoValues, courseId, userId, function (err, video) {
                    self.sendResultOrError(resp, err, video, "Error updating video in course");
                });
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
        var userId = self.userId(req);

        //TODO: Get accountId from Course
        var accountId = parseInt(self.accountId(req));
        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_COURSE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                courseDao.deleteVideoFromCourse(videoId, courseId, userId, function (err, video) {
                    self.sendResultOrError(resp, err, video, "Error deleting video from course");
                });
            }
        });


    },

    /**
     * NO security needed.  Any logged in user may call this method
     * @param req
     * @param resp
     */
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
        courseId = parseInt(courseId);
        var self = this;
        var userId = self.userId(req);
        var accountId = parseInt(self.accountId(req));
        self.checkPermissionForAccount(req, self.sc.privs.VIEW_COURSE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                courseDao.getCourseById(courseId, userId, function (err, course) {
                    if (err || !course) {
                        return self.wrapError(resp, 500, null, err, "No course found");
                    } else {
                        if (course.get("userId") != userId) {
                            return self.wrapError(resp, 403, null, "Not allowed", "Not allowed");
                        } else {
                            subscriberDao.listCourseSubscribers(courseId, function (err, docs) {
                                self.sendResultOrError(resp, err, docs, "Error while getting subscribers");
                            });
                        }
                    }
                });
            }
        });



    },


    getVideoForCurrentUser: function (req, resp) {
        var courseId = req.params.id;
        var videoId = req.params.videoId;
        //
        if (!courseId) {
            return this.wrapError(resp, 400, null, "Invalid parameter for ID");
        }
        courseId = parseInt(courseId);
        //
        var self = this;

        var accountId = parseInt(self.accountId(req));
        self.checkPermissionForAccount(req, self.sc.privs.VIEW_COURSE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                if (courseId) {
                    courseDao.getCourseByIdForSubscriber(courseId, function (error, course) {
                            if (error || !course) {
                                var msg = "Error getting course: " + (error != null ? error.message : "");
                                return self.wrapError(resp, 500, msg, msg, msg);
                            } else {
                                subscriberDao.findOne({courseId: courseId, email: req.user.get("email")}, function (error, subscriber) {
                                    if (error) {
                                        return self.wrapError(resp, 500, error);
                                    } else if (subscriber == null) {
                                        return self.wrapError(resp, 500, "Error: not subscribed.");
                                    } else {
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
            }
        });

    },

    subscribeToCourse: function(req, resp) {
        var self = this;
        self.log.debug('>> subscribeToVARCourse');
        var accountId = 0;
        accountDao.getAccountByHost(req.get("host"), function(err, value) {
            if (!err && value != null) {
                if (value === true) {
                    accountId = 0;
                } else {
                    accountId = value.id();
                }
            }
            var toEmail = req.body.email;
            var course = req.body.course;
            var timezoneOffset = req.body.timezoneOffset;

            if (!course) {
                self.wrapError(resp,400,"","No course provided","");
            } else {
                campaignManager.subscribeToCourse(toEmail, course, accountId, timezoneOffset, function(err, result){
                    self.log.debug('<< subscribeToVARCourse');
                    self.sendResultOrError(resp, err, result, "Could not send the course-scheduled emails.", 500);
                });
            }
        });
    },

    subscribeEmailsFromFile: function (req, resp) {
        var courseId = req.params.id;
        req.pipe(req.busboy);
        var emailsToSubscribe = [];
        var subscribed = 0;
        var subscribersResultCounter = 0;
        var self = this;
        var accountId = parseInt(self.accountId(req));
        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_COURSE, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
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
                                courseDao.getCourseById(courseId, null, function (error, course) {
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


    }


});
function isUserPaidForCourse(user, course) {
    //todo: implement in dao
    return true;
}

function getVideoById(course, videoId) {
    var result = null;
    var videos = course.get("videos");
    for (var i = 0; i < videos.length; i++) {
        var video = videos[i];
        if (video.videoId == videoId) {
            result = video;
            break;
        }
    }
    return result;
}

function checkIfVideoAlreadySent(subscriber, video) {
    var subscribeDate = subscriber.get("subscribeDate");
    var timezoneOffset = subscriber.get("timezoneOffset") == null ? 0 : subscriber.get("timezoneOffset");
    return checkIfDateAlreadyPassed(subscribeDate, video.scheduledDay, video.scheduledHour, video.scheduledMinute, timezoneOffset);
}

function checkIfDateAlreadyPassed(startDate, daysShift, hoursValue, minutesValue, timezoneOffset) {
    if (typeof startDate == 'string' || startDate instanceof String) {
        startDate = new Date(startDate);
    }
    var shiftedUtcDate = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate() + daysShift, startDate.getUTCHours(), startDate.getUTCMinutes(), startDate.getUTCSeconds());
    shiftedUtcDate.setUTCHours(hoursValue);
    shiftedUtcDate.setUTCMinutes(minutesValue + timezoneOffset);
    shiftedUtcDate.setUTCSeconds(0);
    return (new Date()) >= shiftedUtcDate;
}

module.exports = new api();


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
                    if (course.userId != curUserId) {
                        _.forEach(videos, clearVideoFieldsForUnauthorizedUser);
                    }
                }
                return fn(err, course);
            });
        },

        findCourseBySubdomain: function (subdomain, curUserId, fn) {
            var query = { "subdomain": subdomain};
            this.findOne(query, function (err, course) {
                if (!err && course) {
                    var videos = course.get("videos");
                    if (course.userId != curUserId) {
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
        }


    }
    ;

function clearVideoFieldsForUnauthorizedUser(video) {
    //todo: check if some other params should be removed
    video.videoUrl = null;
}

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.UserDao = dao;

module.exports = dao;

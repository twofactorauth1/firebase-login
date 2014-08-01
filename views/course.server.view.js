/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var BaseView = require('./base.server.view');

var courseDao = require('../dao/course.dao');

var view = function (req, resp, options) {
    this.init.apply(this, arguments);
};

_.extend(view.prototype, BaseView.prototype, {

    show: function (courseSubdomain) {
        //todo: implement
        var data = {
            router: "course",
            root: "course",
            location: "course",
            includeHeader: false,
            includeFooter: false
        };

        var self = this;
        courseDao.findCourseBySubdomain(courseSubdomain, this.userId(), function (err, course) {
            if (!err && course != null) {
                data.course = JSON.stringify(course);
                data.includeJs = false;
                data = self.baseData(data);

                self.resp.render('courses/course', data);
                self.cleanUp();
                data = self = null;
            } else {
                self.resp.redirect("/");
            }
        });
    },

    showVideo: function (courseSubdomain, videoId) {
        //todo: implement
        var data = {
            router: "course",
            root: "course",
            location: "course",
            includeHeader: true,
            includeFooter: true
        };

        var self = this;
        courseDao.findVideoByCourseSubdomainAndId(courseSubdomain, videoId, this.userId(), function (err, video) {
            if (!err && video != null) {
                data.video = video.toJSON();
            }

            data.includeJs = false;
            data = self.baseData(data);

            self.resp.render('courses/video', data);
            self.cleanUp();
            data = self = null;
        });
    }
});

$$.v.CourseView = view;

module.exports = view;

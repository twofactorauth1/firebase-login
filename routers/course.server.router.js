/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var BaseRouter = require('./base.server.router.js');
var CourseView = require('../views/course.server.view.js');

var router = function () {
    this.init.apply(this, arguments);
};

_.extend(router.prototype, BaseRouter.prototype, {

    base: "course",

    initialize: function () {

        //-------------------------------------------------
        //  COURSE
        //-------------------------------------------------
        app.get("/campaign/:courseSubdomain", this.setup.bind(this), this.showCourse.bind(this));
        app.get("/campaign/:courseSubdomain/video/:videoId", this.setup.bind(this), this.showVideo.bind(this));
        app.get("/course/:courseSubdomain", this.setup.bind(this), this.showCourse.bind(this));
        app.get("/course/:courseSubdomain/:videoId", this.setup.bind(this), this.showVideo.bind(this));
        return this;
    },

    showCourse: function (req, resp) {
        var self = this;

        //todo: implement method

        new CourseView(req, resp).show(req.params.courseSubdomain);
    },
    showVideo: function (req, resp) {
        var self = this;
        self.log.debug('>> showVideo');
        //todo: implement method

        new CourseView(req, resp).showVideo(req.params.courseSubdomain, req.params.videoId);
    }

});

module.exports = new router();
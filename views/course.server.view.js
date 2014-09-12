/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var BaseView = require('./base.server.view');

var courseDao = require('../dao/course.dao');
var subscriberDao = require('../dao/subscriber.dao');
var campaignManager = require('../campaign/campaign_manager')

var view = function (req, resp, options) {
    this.init.apply(this, arguments);
};

_.extend(view.prototype, BaseView.prototype, {

    log: $$.g.getLogger("course.server.view"),

    show: function (courseSubdomain) {
        //todo: implement
        var data = {
            router: "course",
            root: "course",
            location: "course",
            includeHeader: false,
            includeFooter: false
        };

        function renderCourse(course, isLoggedInAndSubscribed) {
            data.title = course.title;
            data.course = JSON.stringify(course);
            data.isLoggedInAndSubscribed = isLoggedInAndSubscribed;
            self.resp.render('courses/course', data);
        }

        var self = this;
        courseDao.findCourseBySubdomain(courseSubdomain, this.userId(), function (err, course) {
            if (!err && course != null) {
                data.course = JSON.stringify(course);
                data = self.baseData(data);

                self.resp.render('courses/course', data);
                self.cleanUp();
                data = self = null;
                if (self.user != null) {
                    subscriberDao.find({courseId: course._id, email: self.user.email}, function (error, docs) {
                        if (error || !docs || !docs.length > 0) {
                            renderCourse(course, false);
                        } else {
                            renderCourse(course, true);
                        }
                    })
                } else {
                    renderCourse(course, false);
                }

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


        courseDao.findCourseAndVideo(courseSubdomain, videoId, function (err, course, video) {
                if (!err && course != null && video != null) {
                    campaignManager.getPipeshiftTemplateByName(course.get('template').name, function (err, template) {
                        if (!err && template != null) {
                            if (video.isPremium) {
                                //ToDo: implement purchases
                                //ToDo: think about video ids
                                Purchase.find({userId: self.userId(req), courseId: course.id()},
                                    function (error, docs) {
                                        if (error) {
                                            respondWithVideo(video, true);
                                        } else {
                                            if (docs.length > 0) {
                                                respondWithVideo(video);
                                            } else {
                                                respondWithVideo(video, true);
                                            }
                                        }
                                    }
                                )
                                ;
                            }
                            else {
                                respondWithVideo(video);
                            }
                            function respondWithVideo(video, imageOnly) {
                                if (imageOnly) {
                                    //need to strip out video info and not send it to client side if course not purchased
                                    video.videoId = null;
                                    video.videoUrl = null;
                                }
                                data = {
                                    title: video.videoTitle,
                                    video: JSON.stringify(video),
                                    courseDetails: JSON.stringify({title: course.get('title'), courseId: course.id(), description: course.get('description'), price: course.get('price')}),
                                    template: JSON.stringify({code: template.code})
                                }
                                data = self.baseData(data);

                                self.resp.render('courses/video', data);
                                self.cleanUp();
                                data = self = null;
                            }
                        } else {
                            self.log.warn("Template not found: " + err);
                            self.resp.redirect("/");
                        }
                    })

                }
                else {
                    self.resp.redirect("/");
                }
            }
        )
        ;
    }
})
;

$$.v.CourseView = view;

module.exports = view;

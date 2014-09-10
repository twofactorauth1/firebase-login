/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'views/base.view',
    '/pipeshift/js/theme.js',
    '/pipeshift/js/constants.js',
    '/pipeshift/js/app.js',
    '/pipeshift/js/config.js',
    "/pipeshift/js/controller/RemoveModalController.js",
    "/pipeshift/js/service/securityConfig.js",
    "/pipeshift/js/service/security.js",
    "/pipeshift/js/modules/home/controller/HomeController.js",
    "/pipeshift/js/modules/profile/controller/ProfileController.js",
    "/pipeshift/js/modules/video/filter/htmlify.js",
    "/pipeshift/js/modules/video/service/youtube.js",
    "/pipeshift/js/modules/video/service/Course.js",
    "/pipeshift/js/modules/video/service/CourseVideo.js",
    "/pipeshift/js/modules/video/controller/EditCourseModalController.js",
    "/pipeshift/js/modules/video/controller/ListEditorController.js",
    "/pipeshift/js/modules/video/controller/TimelineItemController.js",
    "/pipeshift/js/modules/video/controller/SearchOptionsModalController.js",
    "/pipeshift/js/modules/video/controller/VideoViewModalController.js",
    "/pipeshift/js/modules/video/controller/AddCourseModalController.js",
    "/pipeshift/js/modules/video/directive/whenUiScrolled.js",
    "/pipeshift/js/modules/video/directive/whenScrolled.js",
    "/pipeshift/js/modules/video/directive/videoDrop.js",
    "/pipeshift/js/modules/video/directive/videoDraggable.js",
    "/pipeshift/js/modules/video/directive/coursePreview.js",
    "/pipeshift/js/modules/video/directive/videoTitle.js",
    "/pipeshift/js/modules/video/directive/videoPreview.js",
    "/pipeshift/js/modules/video/directive/videoPlayer.js",
    "/pipeshift/js/modules/video/directive/psEditable.js",
    "/pipeshift/js/controller/LoginModalController.js",
    "/pipeshift/js/controller/SignupModalController.js",
    "/pipeshift/js/modules/account/controller/LoginController.js",
    "/pipeshift/js/directive/stripePayButton.js",
], function (BaseView, pipeshiftApp) {

    var view = BaseView.extend({

        templateKey: "account/pipeshift",

        accounts: null,

        events: {

        },


        render: function () {
            var self = this
                , p1 = this.getAccount()
                , p2 = this.getUser();

            $.when(p1, p2)
                .done(function () {
                    var tmpl = $$.templateManager.get("pipeshift-main", self.templateKey);
                    var html = tmpl({});

                    self.show(html);
                    angular.bootstrap($('#pipeshiftDiv'), ['app']);
                });
        }
    });

    $$.v.account = $$.v.account || {};
    $$.v.account.PipeshiftView = view;

    return view;
});
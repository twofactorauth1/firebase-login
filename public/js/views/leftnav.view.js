define([
    'namespaces'
], function () {

    var view = Backbone.View.extend({

        el: "#leftnav",

        events: {
            "click .nav.nav-pills li": "setActiveNav",
            "click .nav-parent > a": "toggleLeftNavMenu"
        },


        initialize: function() {
            // Add class everytime a mouse pointer hover over it
            $('.nav-bracket > li').hover(function() {
                $(this).addClass('nav-hover');
            }, function() {
                $(this).removeClass('nav-hover');
            });
        },


        toggleLeftNavMenu: function(event) {
            var parent = $(event.currentTarget).parent();
            var sub = parent.find('> ul', event.currentTarget);

            // Dropdown works only when leftpanel is not collapsed
            if (!$('body').hasClass('leftpanel-collapsed')) {
                if (sub.is(':visible')) {
                    sub.slideUp(200, function() {
                        parent.removeClass('nav-active');
                        $('.mainpanel').css({
                            height: ''
                        });
                        adjustmainpanelheight();
                    });
                } else {
                    closeVisibleSubMenu();
                    parent.addClass('nav-active');
                    sub.slideDown(200, function() {
                        adjustmainpanelheight();
                    });
                }
            }
            return false;
        },


        setActiveNav: function (event) {
            var liClass = $(event.currentTarget).attr('class').split(" ")[0];
            if ( liClass === 'logout-li') {
                $('#preloader').show();
                window.location.href = '/logout';
            } else {
                var parent = $(event.currentTarget).parents(".nav.nav-pills").eq(0);
                $("li", parent).removeClass("active");
                $(event.currentTarget).addClass("active");
            }
        },


        updateActiveNav: function (type) {
            var nav;
            switch (type) {
                case "dashboard":
                    nav = "dashboard-li";
                    break;
                case "contacts":
                    nav = "contacts-li";
                    break;
                case "activity":
                    nav = "activity-li";
                    break;
                case "marketing":
                    nav = "marketing-li";
                    break;
                case "website":
                    nav = "website-li";
                    break;
                case "store":
                case "commerce":
                    nav = "store-li";
                    break;
                case "settings":
                    nav = "settings-li";
                    break;
                case "support":
                    nav = "support-li";
                    break;
                default:
                    nav = type + "-li";
                    break;
            }

            $(".nav li", this.$el).removeClass("active");
            var selector = ".nav li." + nav;
            $(selector, this.$el).addClass("active");
        }
    });

    $$.v.LeftNav = view;
    return view;
});
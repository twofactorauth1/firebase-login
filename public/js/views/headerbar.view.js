define([
    'utils/storageutils',
    'namespaces',
], function () {

    var view = Backbone.View.extend({

        el: "#headerbar",

        events: {
            "click .menutoggle" : "toggleLeftMenu",
            "click .menutoggle-right" : "toggleRightMenu"
        },


        initialize: function() {
            var leftNavExpanded = storageutils.get("state_leftnav", "session");
            if (leftNavExpanded === "open") {
                this.openLeftMenu();
            } else if (leftNavExpanded === "closed") {
                this.closeLeftMenu();
            }
        },


        toggleLeftMenu: function(state) {
            var body = jQuery('body');
            var bodypos = body.css('position');
            if (bodypos != 'relative') {
                if (!body.hasClass('leftpanel-collapsed')) {
                    this.closeLeftMenu();
                } else {
                    this.openLeftMenu();
                }
            } else {
                if (body.hasClass('leftpanel-show')) {
                    this.closeLeftMenu();
                }else {
                    this.openLeftMenu()
                }
            }
        },


        openLeftMenu: function() {
            var body = jQuery('body');
            var bodypos = body.css('position');
            if (bodypos != 'relative') {
                body.removeClass('leftpanel-collapsed rightmenu-open');
                $('.nav-bracket li.active ul').css({
                    display: 'block'
                });

                $(this).removeClass('menu-collapsed');
                storageutils.set("state_leftnav", "open", "session");
            } else {
                body.addClass('leftpanel-show');
                storageutils.set("state_leftnav", "open", "session");
                adjustmainpanelheight();
            }
        },


        closeLeftMenu: function() {
            var body = jQuery('body');
            var bodypos = body.css('position');
            if (bodypos != 'relative') {
                body.addClass('leftpanel-collapsed');
                $('.nav-bracket ul').attr('style', '');

                $(this).addClass('menu-collapsed');
                storageutils.set("state_leftnav", "closed", "session");
            } else {
                body.removeClass('leftpanel-show');
                storageutils.set("state_leftnav", "closed", "session");
                adjustmainpanelheight();
            }
        },


        toggleRightMenu: function() {
            var body = $('body');
            var bodypos = body.css('position');

            if (bodypos != 'relative') {
                if (!body.hasClass('rightmenu-open')) {
                    body.addClass('leftpanel-collapsed rightmenu-open');
                    jQuery('.nav-bracket ul').attr('style', '');
                } else {
                    body.removeClass('rightmenu-open');

                    if (!jQuery('.menutoggle').hasClass('menu-collapsed')) {
                        jQuery('body').removeClass('leftpanel-collapsed');
                        jQuery('.nav-bracket li.active ul').css({
                            display: 'block'
                        });
                    }
                }
            } else {

                if (!body.hasClass('chat-relative-view')) {
                    body.addClass('chat-relative-view');
                    body.css({left: ''});
                } else {
                    body.removeClass('chat-relative-view');
                }
            }
        },


        hideRightMenuToggle: function() {
            $(".menutoggle-right", this.el).hide();
        },


        showRightMenuToggle: function() {
            $(".menutoggle-right", this.el).show();
        },


        setHeaderActionButtons: function(html) {
            $("#header-actions", this.el).html(html);
        }
    });

    $$.v.HeaderBar = view;
    return view;
});
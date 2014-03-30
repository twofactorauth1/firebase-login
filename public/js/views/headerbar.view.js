define([
    'namespaces'
], function () {

    var view = Backbone.View.extend({

        el: "#headerbar",

        events: {
            "click .menutoggle" : "toggleLeftMenu",
            "click .menutoggle-right" : "toggleRightMenu"
        },


        toggleLeftMenu: function() {
            var body = jQuery('body');
            var bodypos = body.css('position');

            if (bodypos != 'relative') {

                if (!body.hasClass('leftpanel-collapsed')) {
                    body.addClass('leftpanel-collapsed');
                    jQuery('.nav-bracket ul').attr('style', '');

                    jQuery(this).addClass('menu-collapsed');

                } else {
                    body.removeClass('leftpanel-collapsed rightmenu-open');
                    jQuery('.nav-bracket li.active ul').css({
                        display: 'block'
                    });

                    jQuery(this).removeClass('menu-collapsed');

                }
            } else {

                if (body.hasClass('leftpanel-show'))
                    body.removeClass('leftpanel-show');
                else
                    body.addClass('leftpanel-show');

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
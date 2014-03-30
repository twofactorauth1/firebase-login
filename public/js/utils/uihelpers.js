// Toggle Left Menu
jQuery('.nav-parent > a').click(function() {

    var parent = jQuery(this).parent();
    var sub = parent.find('> ul');

    // Dropdown works only when leftpanel is not collapsed
    if (!jQuery('body').hasClass('leftpanel-collapsed')) {
        if (sub.is(':visible')) {
            sub.slideUp(200, function() {
                parent.removeClass('nav-active');
                jQuery('.mainpanel').css({
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
});

function closeVisibleSubMenu() {
    jQuery('.nav-parent').each(function() {
        var t = jQuery(this);
        if (t.hasClass('nav-active')) {
            t.find('> ul').slideUp(200, function() {
                t.removeClass('nav-active');
            });
        }
    });
}

function adjustmainpanelheight() {
    // Adjust mainpanel height
    var docHeight = jQuery(document).height();
    if (docHeight > jQuery('.mainpanel').height())
        jQuery('.mainpanel').height(docHeight);
}


// Menu Toggle
jQuery('.menutoggle').click(function() {

    var body = jQuery('body');
    var bodypos = body.css('position');

    if (bodypos != 'relative') {

        if (!body.hasClass('leftpanel-collapsed')) {
            body.addClass('leftpanel-collapsed');
            jQuery('.nav-bracket ul').attr('style', '');

            jQuery(this).addClass('menu-collapsed');

        } else {
            body.removeClass('leftpanel-collapsed chat-view');
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

});

// Chat View
jQuery('.menutoggle-right').click(function() {

    var body = jQuery('body');
    var bodypos = body.css('position');

    if (bodypos != 'relative') {

        if (!body.hasClass('chat-view')) {
            body.addClass('leftpanel-collapsed chat-view');
            jQuery('.nav-bracket ul').attr('style', '');

        } else {

            body.removeClass('chat-view');

            if (!jQuery('.menutoggle').hasClass('menu-collapsed')) {
                jQuery('body').removeClass('leftpanel-collapsed');
                jQuery('.nav-bracket li.active ul').css({
                    display: 'block'
                });
            } else {

            }
        }

    } else {

        if (!body.hasClass('chat-relative-view')) {

            body.addClass('chat-relative-view');
            body.css({
                left: ''
            });

        } else {
            body.removeClass('chat-relative-view');
        }
    }

});

reposition_searchform();

jQuery(window).resize(function() {

    if (jQuery('body').css('position') == 'relative') {

        jQuery('body').removeClass('leftpanel-collapsed chat-view');

    } else {

        jQuery('body').removeClass('chat-relative-view');
        jQuery('body').css({
            left: '',
            marginRight: ''
        });
    }

    reposition_searchform();

});

function reposition_searchform() {
    if (jQuery('.searchform').css('position') == 'relative') {
        jQuery('.searchform').insertBefore('.leftpanelinner .userlogged');
    } else {
        jQuery('.searchform').insertBefore('.header-right');
    }
}


//Set dashboard LI to active
jQuery(document).ready(function () {
    //setActiveNav("dashboard");

    $(".nav.nav-pills li").click(function(event) {
        var parent = $(event.currentTarget).parents(".nav.nav-pills").eq(0);
        $("li", parent).removeClass("active");
        $(event.currentTarget).addClass("active");
    })
});


function setActiveNav(type) {
    var nav;
    switch(type) {
        case "dashboard":
            nav = "dashboard-li"; break;
        case "contacts":
            nav = "contacts-li"; break;
        case "activity":
            nav = "activity-li"; break;
        case "marketing":
            nav = "marketing-li"; break;
        case "website":
            nav = "website-li"; break;
        case "store":
        case "commerce":
            nav = "store-li"; break;
        case "settings":
            nav = "settings-li"; break;
        case "support":
            nav = "support-li"; break;
        default:
            nav = type + "-li"; break;
    }

    jQuery('.leftpanel .nav li').removeClass("active");
    var selector = ".leftpanel .nav li." + nav;
    jQuery(selector).addClass("active");
}
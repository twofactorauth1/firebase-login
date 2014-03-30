// Toggle Left Menu
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


reposition_searchform();

jQuery(window).resize(function() {

    if (jQuery('body').css('position') == 'relative') {

        jQuery('body').removeClass('leftpanel-collapsed rightmenu-open');

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
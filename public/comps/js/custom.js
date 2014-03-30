jQuery(window).load(function() {
    // Page Preloader
    jQuery('#status').fadeOut();
    jQuery('#preloader').delay(350).fadeOut(function() {
        jQuery('body').delay(350).css({
            'overflow': 'visible'
        });
    });
});

jQuery(document).ready(function() {

     $('#nestable').on('click', '.fa-pencil', function(e) {
        window.location.href = 'page_edit.html';
    });

    $('#nestable-menu').on('click', 'a', function(e)
    {
        e.preventDefault();
        var target = $(this),
            action = target.data('action');
            console.log('clicked'+action);
        if (action === 'expand-all') {
            $('.dd').nestable('expandAll');
        }
        if (action === 'collapse-all') {
            $('.dd').nestable('collapseAll');
        }
    });


    $('a#add-page').on('click', function(){
        if ($('#nestable>ol>li.dd-last-item-added').length > 0) {
            console.log($('#nestable>ol>li.dd-last-item-added').html());
            if($('#nestable>ol>li.dd-last-item-added .dd3-content').text().length <= 0) {
                $('#nestable .dd-list li').first().find('.dd3-content').trigger('click').addclass('test');
                return false;
            }
        }
        $('.dd-last-item-added').removeClass('dd-last-item-added');
        var page = '<li class="dd-item dd-last-item-added dd3-item"><div class="dd-handle dd3-handle"><i class="fa fa-arrows"></i></div><div class="dd3-content"></div><div class="dd3-actions" style="display: none;"><i class="fa fa-edit"></i><i class="fa fa-times"></i></div></li>';
        var newPage = $(page).prependTo('#nestable ol');
        $('#nestable .dd-list li').first().find('.dd3-content').trigger('click');
    });

    $('.dd3-item').hoverIntent(
           function(){ $(this).find('.dd3-actions').first().show() },
           function(){ $(this).find('.dd3-actions').first().hide() }
    );

    function divClicked() {
        var divHtml = $(this).html();
        var editableText = $("<input type='text' class='dd3-content'/>");
        editableText.val(divHtml);
        $(this).replaceWith(editableText);
        editableText.focus();
        // setup the blur event for this new textarea
        editableText.blur(editableTextBlurred);
    }

    function editableTextBlurred() {
        var html = $(this).val();
        var viewableText = $("<div class='dd3-content'>");
        viewableText.html(html);
        $(this).replaceWith(viewableText);
        // setup the click event for this new div
        viewableText.click(divClicked);
    }

    $(".dd").on('click', '.dd3-content', divClicked);

    // Tags Input
    jQuery('#tags').tagsInput({width:'auto'});

    // Input Masks
    jQuery(".phone").mask("(999) 999-9999");

    jQuery('#contact-cat').click(function() {
        $('.contact-cat').toggle();
    });

    jQuery('#calls-made').click(function() {
        $('.calls-made').toggle();
    });

    jQuery('#customer-since').click(function() {
        $('.customer-since').toggle();
    });

    jQuery('#emails-opened').click(function() {
        $('.emails-opened').toggle();
    });

    jQuery('#purchased').click(function() {
        $('.purchased').toggle();
    });

    jQuery('#last-active').click(function() {
        $('.last-active').toggle();
    });

    jQuery('.people-item').click(function() {
        var href = $(this).data('href');
        window.location.href = href;
    });

    $(".important-star").on('hover', function() {
        $(this).find('i').removeClass("fa-star-o").addClass("fa-star");
    }, function() {
        $(this).find('i').addClass("fa-star").removeClass("fa-star-o");
    });

    $(".important-star").click(function(e) {
        e.stopImmediatePropagation();
        if($(this).hasClass("fa-star-o")) {
            $(this).find('i').removeClass("fa-star-o").addClass("fa-star");
        } else if($(this).hasClass("fa-star")) {
            $(this).find('i').removeClass("fa-star").addClass("fa-star-o");
        } else {
            $(this).find('i').addClass("fa-star").removeClass("fa-star-o");
        }
    });

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

    // Tooltip
    jQuery('.tooltips').tooltip({
        container: 'body'
    });
    // Popover
    jQuery('.popovers').popover();
    // Close Button in Panels
    jQuery('.panel .panel-close').click(function() {
        jQuery(this).closest('.panel').fadeOut(200);
        return false;
    });
    // Form Toggles
    jQuery('.toggle').toggles({
        on: true
    });

    jQuery('.toggle-chat1').toggles({
        on: false
    });

    // Minimize Button in Panels
    jQuery('.minimize').click(function() {
        var t = jQuery(this);
        var p = t.closest('.panel');
        if (!jQuery(this).hasClass('maximize')) {
            p.find('.panel-body, .panel-footer').slideUp(200);
            t.addClass('maximize');
            t.html('&plus;');
        } else {
            p.find('.panel-body, .panel-footer').slideDown(200);
            t.removeClass('maximize');
            t.html('&minus;');
        }
        return false;
    });


    // Add class everytime a mouse pointer hover over it
    jQuery('.nav-bracket > li').hover(function() {
        jQuery(this).addClass('nav-hover');
    }, function() {
        jQuery(this).removeClass('nav-hover');
    });


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

    });

    // Chat View
    jQuery('.menutoggle-right').click(function() {

        var body = jQuery('body');
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


    // // Sticky Header
    // if(jQuery.cookie('sticky-header'))
    //    jQuery('body').addClass('stickyheader');

    // // Sticky Left Panel
    // if(jQuery.cookie('sticky-leftpanel')) {
    //    jQuery('body').addClass('stickyheader');
    //    jQuery('.leftpanel').addClass('sticky-leftpanel');
    // }

    // Left Panel Collapsed
    if(jQuery.cookie('leftpanel-collapsed')) {
       jQuery('body').addClass('leftpanel-collapsed');
       jQuery('.menutoggle').addClass('menu-collapsed');
    }

    // Changing Skin
    // var c = jQuery.cookie('change-skin');
    // if(c) {
    //    jQuery('head').append('<link id="skinswitch" rel="stylesheet" href="css/style.'+c+'.css" />');
    // }


});

$(document).ready(function () {
    $('.toggle-menu').jPushMenu();
    var jPushMenu = {
            close: function (o) {
                $('.jPushMenuBtn,body,.cbp-spmenu').removeClass('disabled active cbp-spmenu-open cbp-spmenu-push-toleft cbp-spmenu-push-toright');
            }
        }
	function openLeftMenu() {
	    var body = $('body');
	    var bodypos = body.css('position');
        body.removeClass('leftpanel-collapsed');
        body.addClass('leftpanel-show');
        storageutils.set("state_leftnav", "open", "session");
	    // if (bodypos != 'relative') {
	    //     body.removeClass('leftpanel-collapsed rightmenu-open');
	    //     $('.nav-bracket li.active ul').css({
	    //         display: 'block'
	    //     });

	    //     $(this).removeClass('menu-collapsed');
	    //     storageutils.set("state_leftnav", "open", "session");
	    // } else {
     //        body.removeClass('leftpanel-collapsed');
	    //     body.addClass('leftpanel-show');
	    //     storageutils.set("state_leftnav", "open", "session");
	    //     // adjustmainpanelheight();
	    // }
    }

    function closeLeftMenu () {
            var body = $('body');
            var bodypos = body.css('position');
            body.addClass('leftpanel-collapsed');
            if (bodypos != 'relative') {
                body.addClass('leftpanel-collapsed');
                $('.nav-bracket ul').attr('style', '');

                $(this).addClass('menu-collapsed');
                storageutils.set("state_leftnav", "closed", "session");
            } else {
                body.removeClass('leftpanel-show');
                storageutils.set("state_leftnav", "closed", "session");
                // adjustmainpanelheight();
            }
    }
    
    function toggleLeftMenu (state) {
            var body = $('body');
            var bodypos = body.css('position');
            if (bodypos != 'relative') {
                if (!body.hasClass('leftpanel-collapsed')) {
                    closeLeftMenu();
                } else {
                    openLeftMenu();
                }
            } else {
                if (body.hasClass('leftpanel-show')) {
                    closeLeftMenu();
                }else {
                    openLeftMenu()
                }
            }
    }

    function toggleRightMenu () {
            var body;
            $('body').each(function(i,v){
                if(!v.inframe)
                    body=$(v)
            });

                if (!body.hasClass('rightmenu-open')) {
                    body.addClass('leftpanel-collapsed rightmenu-open');
                    body.removeClass('leftpanel-show');
                    $('.nav-bracket ul').attr('style', '');
                } else {
                    body.removeClass('rightmenu-open');
                    jPushMenu.close();
                    // if (!$('.menutoggle').hasClass('menu-collapsed')) {
                    //     $('body').removeClass('leftpanel-collapsed').addClass('leftpanel-open');
                    //     $('.nav-bracket li.active ul').css({
                    //         display: 'block'
                    //     });
                    // }
                }
    }

	var leftNavExpanded = storageutils.get("state_leftnav", "session");
    if (leftNavExpanded === "open") {
    	openLeftMenu();
    } else if (leftNavExpanded === "closed") {
        closeLeftMenu();
    }
    
	$('.menutoggle').click(function () {
		toggleLeftMenu();
	});

    $(document).click(function() {
        closeLeftMenu();
     });
	
	$('.menutoggle-right').click(function () {
		toggleRightMenu();
	});

    setTimeout(function() {
        var $el, leftPos,
            $mainNav = $("#leftnav ul");

        $mainNav.append("<li id='magic-line'></li>");
        var $magicLine = $("#magic-line");

        $magicLine
            .height('63px')
            .css("top", $("#leftnav ul li.active").position().top)
            .data("origTop", $magicLine.position().top)

        $("#leftnav ul li").hover(function() {
            $el = $(this);
            topPos = $el.position().top;
            $magicLine.stop().animate({
                top: topPos
            });
        }, function() {
            $magicLine.stop().animate({
                top: $magicLine.data("origTop")
            });
        });
    }, 2000);
});
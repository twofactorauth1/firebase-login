$(document).ready(function () {
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
                    $('.nav-bracket ul').attr('style', '');
                } else {
                    body.removeClass('rightmenu-open');

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
	
	$('.menutoggle-right').click(function () {
		toggleRightMenu();
	});
});
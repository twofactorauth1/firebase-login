CKEDITOR.plugins.add( "scroll", {
    init: function( editor ) {
        editor.on( 'contentDom', function() {
            var attr = $("#editor-toolbar").parent().attr("sticky");
            var setComponentPosition = function()
            {
                var element = $(".cke_panel.cke_panel");
                if(element && element.is(":visible"))
                {
                    setTimeout(function(){
                        var offset = 50;
                        var setPos = $("#editor-toolbar").position().top + offset + "px";
                        element.css({ top: offset });
                    },0)
                }
            }
            
            if (typeof attr !== typeof undefined && attr !== false) {
                $(window).scroll(function(){
                    setComponentPosition();
                })
            }else
            {
                var element = $(".cke_combo_button, .cke_button__textcolor, .cke_button__table" );
                element.on('click', function() {
                    setTimeout(function(){
                        console.log($(".cke_panel.cke_panel"));
                        $(".cke_panel.cke_panel").css({ top: 50 });
                    },100)
                }); 
            }
        });
    }
});
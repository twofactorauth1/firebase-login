CKEDITOR.plugins.add( "scroll", {
    init: function( editor ) {
        editor.on( 'contentDom', function() {
            $(window).scroll(function(){
                var element = $(".cke_panel.cke_panel");
                if(element && element.is(":visible"))
                {
                    setTimeout(function(){
                        var offset = 50;
                        var setPos = $("#editor-toolbar").position().top + offset + "px";
                        element.css({ top: setPos });
                    },0)
                }
                
            })
        });
    }
});
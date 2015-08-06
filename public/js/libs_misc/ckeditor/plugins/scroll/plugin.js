CKEDITOR.plugins.add( "scroll", {
    init: function( editor ) {
        editor.on( 'contentDom', function() {
            var editable = editor.editable();
            editable.attachListener( editable.getDocument(), 'scroll', function() {
                setTimeout(function(){
                    $(".cke_combopanel").hide();
                },0)                    
            });
        });
    }
});
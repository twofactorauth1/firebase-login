CKEDITOR.plugins.add( "tooltip", {
    init: function( editor ) {

        editor.on( "instanceReady", function() {
            var toolbox = editor.ui.space( 'toolbox' );
            $( 'a.cke_button, a.cke_combo_button' ).each( function(id, button) {
                $( button ).tooltip({
                    placement : 'bottom',
                    container : 'body',
                    viewport  : {
                        'selector' : 'body',
                        'padding'  : 10
                    }
                });
            });
        });

    }
});
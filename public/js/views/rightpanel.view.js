define([
    'namespaces'
], function () {

    var view = Backbone.View.extend({

        el: "#rightpanel",

        events: {

        },


        renderHtml: function(html) {
            this.show(html);
        }
    });

    $$.v.RightPanel = view;
    return view;
});
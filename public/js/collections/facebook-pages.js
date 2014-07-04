$$.Collection.FacebookPages = Backbone.Collection.extend({
    model: $$.Model.FacebookPage
    , url: function(){ return $$.settings.baseURL + '/fbpage' }
});
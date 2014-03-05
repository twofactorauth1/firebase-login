var baseApi = require('../base.api');
var SampleDao = require('../dao/sample.dao');


var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "sample",

    dao: SampleDao,

    initialize: function() {
        //GET
        app.get(this.url(':id'), this.isAuthApi, this.getContactById.bind(this));
    },


    getContactById: function(req,resp) {
        var id = req.params.id;
        //...
    }
});

module.exports = new api();


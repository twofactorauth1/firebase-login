var baseApi = require('../base.api');
var emailDataDao = require('../../dao/emaildata.dao');


var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "emaildata",

    dao: emailDataDao,

    initialize: function() {

    }
});

module.exports = new api();


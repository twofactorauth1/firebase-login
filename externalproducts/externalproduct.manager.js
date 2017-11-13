
var dao = require('./dao/externalproduct.dao');

var log = $$.g.getLogger("externalproduct_manager");

var manager = {
    log:log,

    listExternalProducts: function(fn) {
        dao.listNativeExternalProducts(fn);
    }
};

module.exports = manager;
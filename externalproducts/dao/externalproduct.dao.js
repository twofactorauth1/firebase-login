/*
 publishedPageObj: {
 db:{
 storage:'mongo',
 table:'published_pages'
 }
 }
 */

require('../../dao/base.dao.js');
require('../model/externalproduct');

var dao = {

    nativeExternalProduct : {
        db:{
            storage:'mysql',
            table:'vw_client_products_main'
        }
    },

    listNativeExternalProducts: function(fn) {
        var self = this;
        self.findMany(null, self.nativeExternalProduct, fn);
    },

    options: {
        name:"externalproduct.dao",
        defaultModel: $$.m.ExternalProduct
    }


};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.ExternalProductDao = dao;

module.exports = dao;
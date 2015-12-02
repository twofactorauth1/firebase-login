/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('./../../dao/base.dao.js');
var block = require('../model/block.js');

var dao = {

    list: function(fn) {
        var self = this;
        var query = {_id: {$ne:'__counter__'}};
        self.findMany(query, $$.m.Block, fn);
    },

    options: {
        name: "block.dao",
        defaultModel: $$.m.Block
    }

};


dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.BlockDao = dao;

module.exports = dao;

/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../dao/base.dao.js');
require('../model/scheduledjob');

var dao = {

    markJobAsExecuting: function(id, fn) {
        var self = this;
        var query = {_id:id, executing:false, runAt:null};
        var sort = null;
        var remove = false;
        var update = {$set:{runAt: new Date(), executing:true}};
        var isNew = true;
        var fields = null;
        var upsert = false;
        var bypassDocumentValidation = null;
        var writeConcern = null;

        var collection = self.getTable($$.m.ScheduledJob);

        self._findAndModifyMongo(collection, query, sort, remove, update, isNew, fields, upsert,
            bypassDocumentValidation, writeConcern, fn);
    },

    options: {
        name:"scheduledjob.dao",
        defaultModel: $$.m.ScheduledJob
    }


};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.ScheduledJobDao = dao;

module.exports = dao;
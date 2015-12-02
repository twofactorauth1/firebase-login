/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('./../../dao/base.dao.js');
var workstream = require('../model/workstream.js');
var async = require('async');

var dao = {

    saveWorkstreams: function(workstreamAry, fn) {
        var self = this;
        var savedAry = [];
        async.eachSeries(workstreamAry, function(workstream, cb){
            self.saveOrUpdate(workstream, function(err, savedWorkstream){
                if(err) {
                    self.log.error('Error saving workstream:', err);
                    cb(err);
                } else {
                    savedAry.push(savedWorkstream);
                    cb();
                }
            });
        }, function done(err){
            fn(err, savedAry);
        });
    },

    options: {
        name: "workstream.dao",
        defaultModel: $$.m.Workstream
    }

};


dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.WorkstreamDao = dao;

module.exports = dao;

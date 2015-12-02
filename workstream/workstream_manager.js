/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var logger = $$.g.getLogger("workstream_manager");
var workstreamDao = require('./dao/workstream.dao');
var blockDao = require('./dao/block.dao');
var accountDao = require('../dao/account.dao');

module.exports = {
    log: logger,

    listBlocks: function(fn){
        var self = this;
        self.log.debug('>> listBlocks');
        blockDao.findMany({}, $$.m.Block, function(err, blocks){
            if(err) {
                self.log.error('Error listing blocks:', err);
                return fn(err);
            } else {
                self.log.debug('<< listBlocks');
                return fn(null, blocks);
            }
        });
    },

    listWorkstreams: function(accountId, fn){
        var self = this;
        self.log.debug('>> listWorkstreams');

        var query = {accountId:accountId};

        workstreamDao.findMany(query, $$.m.Workstream, function(err, workstreams){
            if(err) {
                self.log.error('Error listing workstreams:', err);
                return fn(err);
            } else {
                self.log.debug('<< listWorkstreams');
                return fn(null, workstreams);
            }
        });
    },

    getWorkstream: function(accountId, workstreamId, fn) {
        var self = this;
        self.log.debug('>> getWorkstream');

        var query = {_id:workstreamId, accountId:accountId};

        workstreamDao.findOne(query, $$.m.Workstream, function(err, workstream){
            if(err) {
                self.log.error('Error getting workstream:', err);
                return fn(err);
            } else {
                self.log.debug('<< getWorkstream');
                return fn(null, workstream);
            }
        });
    },

    unlockWorkstream: function(accountId, workstreamId, fn) {
        var self = this;
        self.log.debug('>> unlockWorkstream');

        var query = {_id:workstreamId, accountId:accountId};
        workstreamDao.findOne(query, $$.m.Workstream, function(err, workstream){
            if(err) {
                self.log.error('Error getting workstream:', err);
                return fn(err);
            } else {
                workstream.set('unlocked', true);
                workstreamDao.saveOrUpdate(workstream, function(err, updatedWorkstream){
                    if(err) {
                        self.log.error('Error updating workstream:', err);
                        return fn(err);
                    } else {
                        self.log.debug('<< unlockWorkstream');
                        return fn(null, updatedWorkstream);
                    }
                });

            }
        });

    },


    _getCompletedBlocks: function(accountId, fn) {
        //TODO: this
    }


};
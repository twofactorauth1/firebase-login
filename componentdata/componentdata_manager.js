/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var dao = require('./dao/componentdata.dao');

var log = $$.g.getLogger('componentdata_manager');

module.exports = {

    log:log,
    getComponentData: function(accountId, userId, type, key, fn){
        var self = this;
        self.log.debug(accountId, userId, '>> getComponentData');
        var query = {
            accountId:accountId,
            type:type,
            key:key
        };

        dao.findOne(query, $$.m.ComponentData, function(err, value){
            if(err) {
                self.log.error(accountId, userId, 'Error finding component data:', err);
                return fn(err);
            } else {
                self.log.debug(accountId, userId, '<< getComponentData');
                return fn(null, value);
            }
        });
    },

    saveComponentData: function(accountId, userId, type, key, componentData, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> saveComponentData');
        var query = {
            accountId:accountId,
            type:type,
            key:key
        };
        dao.findOne(query, $$.m.ComponentData, function(err, value){
            if(err) {
                self.log.error(accountId, userId, 'Error finding component data:', err);
                return fn(err);
            } else if(value){
                componentData.id(value.id());
                componentData.set('created', value.get('created'));
                componentData.set('modified', {date:new Date(), by:userId});
                dao.saveOrUpdate(componentData, function(err, savedData){
                    if(err) {
                        self.log.error(accountId, userId, 'Error saving data:', err);
                        return fn(err);
                    } else {
                        self.log.debug(accountId, userId, '<< saveComponentData');
                        return fn(null, savedData);
                    }
                });
            } else {
                componentData.set('created', {date:new Date(), by:userId});
                componentData.set('modified', {date:new Date(), by:userId});
                dao.saveOrUpdate(componentData, function(err, savedData){
                    if(err) {
                        self.log.error(accountId, userId, 'Error saving data:', err);
                        return fn(err);
                    } else {
                        self.log.debug(accountId, userId, '<< saveComponentData');
                        return fn(null, savedData);
                    }
                });
            }
        });
    },

    deleteComponentData: function(accountId, userId, type, key, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> deleteComponentData');
        var query = {
            accountId:accountId,
            type:type,
            key:key
        };
        dao.remove(query, $$.m.ComponentData, function(err, value){
            if(err) {
                self.log.error(accountId, userId, 'Error removing data:', err);
                return fn(err);
            } else {
                self.log.debug(accountId, userId, '<< deleteComponentData');
                return fn(null, value);
            }
        });
    }


};

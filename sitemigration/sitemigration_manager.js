/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('./dao/sitemigration.dao.js');
var dao = require('./dao/sitemigration.dao.js');
var log = $$.g.getLogger("sitemigration_manager");


module.exports = {

    getMigrationByDomain: function(domain, fn) {
        var self = this;
        log.debug('>> getMigrationByDomain');
        var query = {
            domain: domain
        };

        dao.findOne(query, $$.m.SiteMigration, fn);
    },

    updateRedirectAccessCount: function(domain, path, fn) {
        var self = this;
        log.debug('>> updateRedirectAccessCount');
        var query = {
            domain: domain
        };
        dao.findOne(query, $$.m.SiteMigration, function(err, migration){
            if(err) {
                log.error('Error finding sitemigration: ' + err);
                return fn(err, null);
            }
            _.each(migration.get('redirects'), function(redirect){
                if(redirect.path === path) {
                    redirect.accessCount +=1;
                    redirect.lastAccessed = new Date();
                }
            });
            log.debug('<< updateRedirectAccessCount');
            dao.saveOrUpdate(migration, fn);
        });
    },

    createSiteMigration: function(migration, fn) {
        var self = this;
        log.debug('>> createSiteMigration');
        dao.saveOrUpdate(migration, fn);
    },

    addPathToMigration: function(domain, path, destination, fn) {
        var self = this;
        log.debug('>> addPathToMigration');
        var query = {
            domain: domain
        };

        dao.findOne(query, $$.m.SiteMigration, function(err, migration) {
            if (err) {
                log.error('Error finding sitemigration: ' + err);
                return fn(err, null);
            }
            var found = false;
            _.each(migration.redirects, function(redirect){
                if(redirect.path === path) {
                    redirect.destination = destination;
                    found = true;
                }
            });
            if(found !== true) {
                var redirect = {
                    path: path,
                    destination: destination,
                    accessCount: 0,
                    lastAccess: null
                };
                migration.redirects.push(redirect);
            }
            log.debug('<< addPathToMigration');
            dao.saveOrUpdate(migration, fn);
        });
    }

};
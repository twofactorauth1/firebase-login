/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('./../../dao/base.dao.js');
var section = require('../model/section.js');
var async = require('async');

var dao = {

    saveSections: function(sectionAry, fn) {
        var self = this;
        var savedAry = [];
        async.eachSeries(sectionAry, function(section, cb){
            //self.log.debug('Creating a new section from ', section);
            var sectionObj = new $$.m.ssb.Section(section);
            //self.log.debug('New section:', sectionObj.toJSON());
            self.saveOrUpdate(sectionObj, function(err, savedSection){
                if(err) {
                    self.log.error('Error saving section:',err);
                    cb(err);
                } else {
                    savedAry.push(savedSection);
                    cb();
                }
            });
        }, function done(err){
            fn(err, savedAry);
        });

    },

    dereferenceSections: function(sectionAry, fn) {
        var self = this;
        var deReffedAry = [];
        async.eachSeries(sectionAry, function(section, cb){
            self.log.debug('Section:', section);
            self.getById(section._id, $$.m.ssb.Section, function(err, section){
                if(err) {
                    cb(err);
                } else {
                    deReffedAry.push(section);
                    cb();
                }
            });
        }, function done(err){
            self.log.debug('Array:', deReffedAry);
            fn(err, deReffedAry);
        });
    },

    options: {
        name: "ssb.section.dao",
        defaultModel: $$.m.ssb.Section
    }

};


dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.SSBSectionDao = dao;

module.exports = dao;

/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

process.env.NODE_ENV = "testing";
var app = require('../../app');
var async = require('async');
var testHelpers = require('../../testhelpers/testhelpers');
var themeConfigDao = require('../dao/theme.dao.js');
var cmsManager = require('../cms_manager');
var _log = $$.g.getLogger("cms_manager.test");
var testcontext = {};

module.exports.group =  {


    setUp: function (cb) {
        _log.debug('>> setup');
        cb();
        _log.debug('<< setup');
    },

    tearDown: function (cb) {
        _log.debug('>> tearDown');
        cb();
        _log.debug('<< tearDown');
    },

    testGetThemeConfigById: function(test) {
        test.expect(1);
        var themeConfig = new $$.m.cms.ThemeConfig({
            name: 'testConfig',
            config: {'stuff': 'stuff', 'more_stuff': 'more stuff here'}
        });

        themeConfigDao.saveOrUpdate(themeConfig, function(err, value){
            if(err) {
                test.ok(false,'could not save test config');
                test.done();
            } else {
                testcontext.themeId = value.id();
                testcontext.themeName = value.get('name');
                testcontext.themeConfig = value;
                cmsManager.getThemeConfigById(testcontext.themeId, function(err, value){
                    if(err) {
                        test.ok(false, 'could not get theme config');
                        test.done();
                    } else {
                        test.equals('testConfig', value.get('name'));
                        test.done();
                    }
                });
            }
        });
    },

    testGetThemeConfigByName: function(test) {
        test.expect(1);
        cmsManager.getThemeConfigByName(testcontext.themeName, function(err, value){
            if(err) {
                test.ok(false, 'could not get theme config by name: ' + err);
                test.done();
            } else {
                test.equals(testcontext.themeName, value.get('name'));
                test.done();
            }
        });
    },

    testGetAllThemeConfigs: function(test) {
        cmsManager.getAllThemeConfigs(function(err, value){
            if(err) {
                test.ok(false, 'could not get all theme configs: ' + err);
                test.done();
            } else {
                console.dir(value);
                test.done();
            }
        });
    },

    testUpdateThemeConfig: function(test) {
        test.expect(1);
        var themeConfig = testcontext.themeConfig;
        themeConfig.set('name', 'newName');

        cmsManager.updateThemeConfig(themeConfig, function(err, value){
            if(err) {
                test.ok(false, 'could not update theme config');
                test.done();
            } else {
                test.equals('newName', value.get('name'));
                test.done();
            }
        });
    }

};
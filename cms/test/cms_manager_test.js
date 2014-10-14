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
var themeDao = require('../dao/theme.dao.js');
var cmsDao = require('../dao/cms.dao.js');
var cmsManager = require('../cms_manager');
var _log = $$.g.getLogger("cms_manager.test");
var testcontext = {};
var testAccountId = 0;
var objectsToDelete = [];

module.exports.group =  {


    setUp: function (cb) {
        _log.debug('>> setup');
        cb();
        _log.debug('<< setup');
    },

    tearDown: function (cb) {
        _log.debug('>> tearDown');
        if(objectsToDelete.length === 0) {
            _log.debug('<< tearDown (nothing to delete)');
            cb();
        } else {
            var promiseAry = [];
            while(objectsToDelete.length > 0) {
                var obj = objectsToDelete.pop();
                var x = $.Deferred();
                promiseAry.push(x);
                cmsDao.remove(obj, function(err, value){
                    x.resolve();
                });
            }
            $.when(promiseAry).done(function(){
                _log.debug('<< tearDown (cleared objectsToDelete)');
                cb();
            });
        }


    },

    testGetThemeById: function(test) {
        test.expect(1);
        var theme = new $$.m.cms.Theme({
            name: 'testConfig',
            accountId: testAccountId,
            config: {'stuff': 'stuff', 'more_stuff': 'more stuff here'}
        });

        themeDao.saveOrUpdate(theme, function(err, value){
            if(err) {
                test.ok(false,'could not save test config');
                test.done();
            } else {
                testcontext.themeId = value.id();
                testcontext.themeName = value.get('name');
                testcontext.themeConfig = value;
                cmsManager.getThemeById(testcontext.themeId, function(err, value){
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

    testGetThemeByName: function(test) {
        test.expect(1);
        cmsManager.getThemeByName(testcontext.themeName, function(err, value){
            if(err) {
                test.ok(false, 'could not get theme config by name: ' + err);
                test.done();
            } else {
                test.equals(testcontext.themeName, value.get('name'));
                test.done();
            }
        });
    },

    testGetAllThemes: function(test) {
        cmsManager.getAllThemes(testAccountId, function(err, value){
            if(err) {
                test.ok(false, 'could not get all theme configs: ' + err);
                test.done();
            } else {
                console.dir(value);
                test.done();
            }
        });
    },

    testUpdateTheme: function(test) {
        test.expect(1);
        var themeConfig = testcontext.themeConfig;
        themeConfig.set('name', 'newName');

        cmsManager.updateTheme(themeConfig, function(err, value){
            if(err) {
                test.ok(false, 'could not update theme config');
                test.done();
            } else {
                objectsToDelete.push(value);
                test.equals('newName', value.get('name'));
                test.done();
            }
        });
    },

    testCreateThemeFromWebsite: function(test) {
        var self = this;
        test.expect(1);
        var websiteId = null;

        var sampleWebsite = {
            "_id" : "9b212b68-bb90-41a3-ab4f-dd3ce7dfdd6a",
            "accountId" : 1,
            "settings" : {
                "favicon" : "/assets/images/indimain/favicon.ico",
                "primary_color" : "#3398df",
                "primary_highlight" : "#1e78d0",
                "nav_hover" : "#ffffff",
                "primary_text_color" : "#fff",
                "secondary_color" : "#3b9db7",
                "font_family" : "Lato",
                "font_family_2" : "Spinnaker",
                "primaryFontFamily" : "Lato",
                "secondaryFontFamily" : "Lato"
            },
            "title" : "Default Website Title",
            "seo" : null,
            "nav_version" : 2,
            "linkLists" : [],
            "footer" : {
                "type" : "thin",
                "data" : {
                    "textLeft" : "Left Footer Text",
                    "textRight" : "Right Footer Text",
                    "textCenter" : "Center Footer Text"
                }
            },
            "created" : {
                "date" : 1410378170643,
                "by" : 11
            },
            "modified" : {
                "date" : "",
                "by" : null
            }
        };

        var samplePage = {
            "_id" : "3aeaa152-2a33-409b-9cb4-614a2f43e553",
            "handle" : "index",
            "seo" : null,
            "title" : "Home",
            "visibility" : {
                "visible" : true,
                "asOf" : null,
                "displayOn" : null
            },
            "websiteId" : "9b212b68-bb90-41a3-ab4f-dd3ce7dfdd6a",
            "accountId" : 1,
            "components" : [
                {
                    "_id" : "76aae765-bda7-4298-b78c-f1db159eb9f4",
                    "anchor" : null,
                    "type" : "navigation",
                    "version" : 1,
                    "bg" : {
                        "img" : {
                            "url" : "",
                            "width" : 1235,
                            "height" : 935,
                            "parallax" : true,
                            "blur" : false
                        },
                        "color" : ""
                    },
                    "btn" : {
                        "text" : "",
                        "url" : "",
                        "icon" : ""
                    },
                    "url" : "/components/navigation_v1.html"
                },
                {
                    "_id" : "f43b987f-9164-4b08-8a27-57471e789016",
                    "anchor" : null,
                    "type" : "masthead",
                    "version" : 1,
                    "visibility" : true,
                    "maintitle" : "<h3>FIT STOP HUMAN PERFORMANCE &amp; HEALTH ENHANCEMENT LAB</h3>",
                    "subtitle" : " <h4>We are a fitness testing and guidance company that provides advanced assessment services to fitness minded organizations and individuals with programs that are designed for the novice as well as the experienced exerciser.<br><br> Our testing programs and exercise instruction provide practical information on how to manipulate your energy systems to optimize weight management, endurance performance, power production and stamina gains.</h4>",
                    "bg" : {
                        "img" : {
                            "url" : "https://s3.amazonaws.com/indigenous-account-websites/acct_12/home-top.jpg",
                            "width" : 1235,
                            "height" : 935,
                            "parallax" : true,
                            "blur" : false
                        },
                        "color" : ""
                    },
                    "btn" : {
                        "text" : "SIGN UP TODAY",
                        "url" : "http://google.com",
                        "icon" : "fa fa-envelope-o fa-lg",
                        "visibility" : true
                    },
                    "text" : "",
                    "url" : "/components/masthead_v1.html"
                }
            ],
            "created" : {
                "date" : 1410378194559,
                "by" : null
            },
            "modified" : {
                "date" : "",
                "by" : null
            }
        };

        var p1 = $.Deferred(), p2 = $.Deferred();

        cmsDao.saveOrUpdate(new $$.m.cms.Website(sampleWebsite), function(err, value){
            if(err) {
                test.ok(false, 'Error saving website');
                test.done();
            } else {
                websiteId = value.id();
                p1.resolve();
            }
        });

        cmsDao.saveOrUpdate(new $$.m.cms.Page(samplePage), function(err, value){
            if(err) {
                test.ok(false, 'Error saving page');
                test.done();
            } else {
                p2.resolve();
            }
        });

        $.when(p1,p2).done(function(){
            var themeObj = new $$.m.cms.Theme({
                accountId: 1,
                name: 'new_theme' + new Date().getTime()
            });


            cmsManager.createThemeFromWebsite(themeObj, websiteId, null, function(err, value){
                if(err) {
                    test.ok(false, 'Error creating Theme from website: ' + err);
                    test.done();
                } else {
                    objectsToDelete.push(value);
                    //console.dir(value);
                    test.ok(value.id() !== null);
                    test.done();
                }
            });

        });


    }

};
/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */
var STRIPE_CONFIG = require('./configs/stripe.config.js');
var GOOGLE_CONFIG = require('./configs/google.config');
var FACEBOOK_CONFIG = require('./configs/facebook.config');
var PAYPAL_CONFIG = require('./configs/paypal.config');

//var wiredepJSAry = require('wiredep')().js;

var hostfileGenerator = require('./utils/hostfile.generator');
var dbcopyutil = require('./utils/dbcopyutil');
//var wordpressConverter = require('./utils/wordpressconverter');
var jsincludeGenerator = require('./utils/jsincludegenerator');
var srcfiles = [];

var bowerLockdown = require('./utils/bowerlockdown');

var _ = require('underscore');
moment = require('moment');

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),


        copy: {
            main: {
                expand: true,
                src: ['./**'],
                dest: '../indigeweb-release/'
            }
        },


        compilehbs: {
            options: {
                source: "public/templates",
                output: "hbs",
                helpers: "public/js/compiled/hbshelpers.js"
            },
            main: {

            }
        },

        handlebars: {
            options: {
                amd: false,
                partialsUseNamespace: true,

                namespace: function(filename) {
                    var names = filename.replace(/hbs\/(.*)(\/\w+\.hbs)/, '$1');
                    names = names.split('/').join('.').replace(".hbs", "");
                    //grunt.log.write(names);
                    //grunt.log.writeln();
                    return names;
                },

                processName: function(filename) {
                    return "hbs";
                }
            },
            main: {
                files: { 'public/js/compiled/templates.js' : [ 'hbs/*/*.hbs'] } //compiled/templates.js
            },
            account: {
                files: { 'public/js/compiled/account/templates.js' : [ 'hbs/account/**/*.hbs' ]} //compiled/account/templates.js
            }
        },

        clean: {
            options: {
                force:true
            },
            hbs: {
                src: ["hbs"]
            },
            release: {
                src: ["../indigeweb-release"]
            },
            prebuild: {

            },
            postbuild: {
                src: ["../indigeweb-release/public/less", "../indigeweb-release/public/js", "../indigeweb-release/deploy",/*"../indigeweb-release/node_modules",*/"../indigeweb-release/Logs/*.log","../indigeweb-release/Logs/*.log-*"]
            }
        },


        less: {
            style: {
                files: {
                    // '../indigeweb/public/css/site.css': [ 'public/less/site.less' ],
                    // '../indigeweb/public/css/style.default.css': [ 'public/less/style.default.less' ],
                    // '../indigeweb/public/css/style.default.css_o': [ 'public/less/style.default_o.less' ],
                    // '../indigeweb/public/pipeshift/css/site.css': [ 'public/pipeshift/less/theme.less', 'public/pipeshift/less/main.less' ],
                    // '../indigeweb/public/css/angular-admin.css': [ 'public/less/angular-admin.less' ]
                    './public/admin/assets/css/frontend-admin.css': [ 'public/less/frontend-admin.less' ],
                    './public/css/styles.css': [ 'public/less/frontend.less' ],
                    './public/admin/assets/css/styles.css': [ 'public/less/styles.less' ],
                    './public/admin/assets/css/theme.css': [ 'public/less/theme.less' ],
                    './public/admin/assets/css/email.css': [ 'public/less/email.less' ],
                    // '../indigeweb/public/admin/assets/css/ssb-site-builder/styles.css': [ 'public/less/ssb-site-builder/frontend/styles.less' ],
                    './public/css/ssb-site-builder/ssb-themes/ssb-theme-young-soul.css': [ 'public/less/ssb-site-builder/ssb-frontend/ssb-themes/ssb-theme-young-soul.less' ]
                }
            }
        },

        csssplit: {
            split_style: {
              src: ['./public/css/styles.css'],
              dest: './public/css'
            }
        },

        watch: {
            less: {
                files: "./public/less/**/*.less",
                tasks: ["less", "postcss"]
            },
            html: {
                files: "./public/templates/**/*.html"
            },
            scripts: {
              files: './public/js/**/*.js'
            },
            options: {
              livereload: true
            }
        },

        requirejs: {
            compile: {
                options: {
                    baseUrl: "public/js", //relative to appdir

                    appDir: "",

                    dir: "../indigeweb-release/public/min",

                    optimize: grunt.option('optimize') || 'none',

                    mainConfigFile:"public/js/main.js",

                    modules: [
                        { name: "main",
                            excludeShallow: [],
                            include: [
                                'utils/cachemixin',
                                'compiled/hbshelpers',
                                'compiled/templates'
                                /*'compiled/apps/templates'*/ //this is part of example from above in handlebars task
                            ]
                        },

                        { name: "routers/home.router",
                            excludeShallow:['utils/cachemixin'],
                            include: [
                            ]
                        },

                        { name: "routers/signup.router",
                            excludeShallow:['utils/cachemixin'],
                            include: [
                            ]
                        },

                        { name: "routers/account/admin.router",
                            excludeShallow:['utils/cachemixin'],
                            include: [
                                'compiled/account/templates'
                            ]
                        }
                    ]
                }
            }
        },


        /*
         * This activity is called as part of the 'production' grunt task.
         * Put all non-angular js files here.
         */
         concat: {
            js: {
                src: jsincludeGenerator.buildJSArraySync('templates/snippets/index_body_scripts.jade'),
                dest: 'public/js/indigenous.js'
            },
            admin: {
                src: ['public/admin/assets/js/**/*.js'],
                dest: 'public/admin/assets/js/ng-admin-indigenous.js'
            },
            vendor: {
                src: jsincludeGenerator.buildJSArraySync('templates/snippets/admin_body_scripts.jade'),
                dest: 'public/admin/assets/js/admin-vendor-indigenous.js'
            },
            css: {
                src: [

                    'public/js/libs/bootstrap/dist/css/bootstrap.min.css',
                    'public/js/libs/bootstrap-social/bootstrap-social.css',
                    'public/js/libs/jqcloud2/dist/jqcloud.min.css',
                    'public/js/libs/angular-wizard/dist/angular-wizard.min.css',
                    'public/js/libs/animate.css/animate.min.css',
                    'public/js/libs/slick-carousel/slick/slick.css',
                    'public/js/libs/slick-carousel/slick/slick-theme.css',
                    'public/js/libs/perfect-scrollbar/css/perfect-scrollbar.min.css',
                    'public/js/libs/froala-wysiwyg-editor/css/froala_style.min.css',
                    'public/js/libs/blueimp-gallery/css/blueimp-gallery.min.css',
                    'public/js/libs/font-awesome/css/font-awesome.min.css',
                    'public/js/libs_misc/intl-tel-input/build/css/intlTelInput.css'
                ],
                dest:'public/css/vendor.css',
                nonull:true
            }
        },

        uglify: {
            options: {
                compress: {
                    drop_console: true
                }
            },
            js: {
                files: {
                    'public/js/indigenous.js': ['public/js/indigenous.js'],
                    'public/js/ng-indigenous.js': ['public/js/ng-indigenous.js'],
                    'public/admin/assets/js/ng-admin-indigenous.js': ['public/admin/assets/js/ng-admin-indigenous.js'],
                    'public/admin/assets/js/admin-vendor-indigenous.js': ['public/admin/assets/js/admin-vendor-indigenous.js'],
                    'public/js/scripts/collector-full.js':['public/js/scripts/collector-deps.js', 'public/js/scripts/collector.js']
                }
            }
        },

        /*
         * This is called as part of the production task.
         * Please put all angular files here.
         */
        ngAnnotate: {
            options: {

            },
            admin: {
                files: {
                    'public/admin/assets/js/ng-admin-indigenous.js': jsincludeGenerator.includeDirectory('public/admin/assets/js')
                }
            },
            frontend: {
                files: {
                    'public/js/ng-indigenous.js': jsincludeGenerator.includeDirectory('public/scripts')
                }
            }
        },



        //TESTING
        nodeunit: {
            all:['test/**/*_test.js'],
            analytics: ['analytics/tests/*_test.js'],
            analyticsCollater: ['analytics/tests/analytics_collater_test.js'],
            api:['api/test/*_test.js'],
            assets:['assets/test/*_test.js'],
            campaign:['campaign/test/*_test.js'],
            cms: ['cms/test/cms_manager_test.js'],
            contacts: ['test/contact.dao_test.js'],
            contactActivities: ['contactactivities/test/*_test.js'],
            contextio:['test/contextio_test.js'],
            facebook: ['test/facebook_test.js'],
            functionalPayments: ['payments/tests/payment_functional_test.js'],
            google: ['test/google.dao_test.js'],
            gtm: ['test/gtm.dao_test.js'],
            linkedin: ['test/linkedin.dao_test.js'],
            payments: ['payments/tests/*_test.js'],
            paymentEvents: ['payments/tests/stripe_event_handler_test.js'],
            products: ['products/tests/*_test.js'],
            twitter: ['test/twitter_test.js'],
            utils:['utils/test/*_test.js'],
            tzTests: ['test/tztest.js'],
            leads: ['test/pullLeadDynoData.js'],
            ssl: ['certificates/test/ssldotcom.dao_test.js'],
            ssl_manager: ['certificates/test/manager_test.js'],
            stripe_cleanup: ['payments/tests/stripe_cleanup.js'],
            ssb: ['ssb/test/ssb_manager_test.js'],
            scheduler: ['scheduledjobs/tests/manager_test.js'],
            selenium: ['test/selenium/*_test.js'],
            mlab:['test/mongo.dao_test.js'],
            backgroundjob:['backgroundjobs/test/*_test.js']
            //ngparse:['utils/test/ngparser_test.js']
        },

        // Running Karma from Grunt, with documentation from here:
        // https://github.com/karma-runner/grunt-karma
        karma: {
            options: {
                configFile: 'karma.conf.js',
                singleRun: false
            },
            unit: {
                singleRun: true,
                browsers: ['Chrome'],
                client: {
                    captureConsole: false
                },
                logLevel: 'DEBUG'
            },
            dev: {
                singleRun: true
            }
        },

        //NG-Constant for angular constants
        /*
         * Add environment specific constants in each section.  Use config files as necessary.
         */
        ngconstant: {
            // Options for all targets
            options: {
                space: '  ',
                wrap: '"use strict";\n\n {%= __ngModule %}',
                name: 'config'
            },
            // Environment targets
            development: {
                options: {
                    dest: 'public/admin/assets/js/config.js'
                },
                constants: {
                    ENV: {
                        name: 'development',
                        stripeKey: [STRIPE_CONFIG.STRIPE_PUBLISHABLE_KEY, STRIPE_CONFIG.RVLVR.STRIPE_PUBLISHABLE_KEY,null,null, STRIPE_CONFIG.RVLVR.STRIPE_PUBLISHABLE_KEY, STRIPE_CONFIG.RVLVR.STRIPE_PUBLISHABLE_KEY],
                        googleAnalyticsId: GOOGLE_CONFIG.ANALYTICS_ID,
                        googleAnalyticsScope: GOOGLE_CONFIG.ANALYTICS_SCOPE,
                        googleClientId: GOOGLE_CONFIG.CLIENT_ID,
                        googleClientSecret: GOOGLE_CONFIG.CLIENT_SECRET,
                        googleServerKey: GOOGLE_CONFIG.SERVER_KEY,
                        googleBrowserKey: GOOGLE_CONFIG.BROWSER_KEY,
                        facebookClientID: FACEBOOK_CONFIG.CLIENT_ID,
                        paypalCheckoutURL: PAYPAL_CONFIG.PAYPAL_CHECKOUT_URL
                    }
                }
            },
            production: {
                options: {
                    dest: 'public/admin/assets/js/config.js'
                },
                constants: {
                    ENV: {
                        name: 'production',
                        stripeKey: [STRIPE_CONFIG.STRIPE_PUBLISHABLE_KEY, STRIPE_CONFIG.RVLVR.STRIPE_PUBLISHABLE_KEY,null,null,STRIPE_CONFIG.RVLVR.STRIPE_PUBLISHABLE_KEY, STRIPE_CONFIG.RVLVR.STRIPE_PUBLISHABLE_KEY],
                        googleAnalyticsId: GOOGLE_CONFIG.ANALYTICS_ID,
                        googleAnalyticsScope: GOOGLE_CONFIG.ANALYTICS_SCOPE,
                        googleClientId: GOOGLE_CONFIG.PROD_CLIENT_ID,
                        googleClientSecret: GOOGLE_CONFIG.PROD_CLIENT_SECRET,
                        googleServerKey: GOOGLE_CONFIG.SERVER_KEY,
                        googleBrowserKey: GOOGLE_CONFIG.PROD_BROWSER_KEY,
                        facebookClientID: FACEBOOK_CONFIG.CLIENT_ID,
                        paypalCheckoutURL: PAYPAL_CONFIG.PROD_PAYPAL_CHECKOUT_URL
                    }
                }
            }
        },

        //Adds interactive prompt for grunt tasks
        prompt: {
            copyAccount: {
                options: {
                    questions: [
                        {
                            config: 'doCopyAccount.testToProd', // arbitray name or config for any other grunt task
                            type: 'list', // list, checkbox, confirm, input, password
                            message: 'Which direction are you copying?', // Question to ask the user, function needs to return a string,
                            default: true, // default value if nothing is entered
                            choices: [
                                { name: 'From Test to Production', value: 'test2prod' },
                                { name: 'From Test to Test (new account)', value: 'test2test' },
                                { name: 'From Production to Test', value: 'prod2test', checked:true },
                                { name: 'From Production to Production (new account)', value: 'prod2prod' }
                                ]
                            //validate: function(value), // return true if valid, error message if invalid
                            //filter:  function(value){if(value === 'Copy from Production to Test'){ return false} else {return true;}}, // modify the answer
                            //when: function(answers) // only ask this question when this function returns true
                        },
                        {
                            config: 'doCopyAccount.accountId', // arbitray name or config for any other grunt task
                            type: 'input', // list, checkbox, confirm, input, password
                            message: 'Enter the accountId to copy', // Question to ask the user, function needs to return a string,
                            //default: 0, // default value if nothing is entered
                            //choices: 'Array|function(answers)',
                            validate: function(value){
                                if(isNaN(parseInt(value))){
                                    return 'please enter a valid id. [' + value + ' is not valid.]';
                                } else {
                                    return true;
                                }
                            } // return true if valid, error message if invalid
                            //filter:  function(value), // modify the answer
                            //when: function(answers) // only ask this question when this function returns true
                        }
                    ]
                }
            },
            copyPage: {
                options: {
                    questions: [
                        {
                            config: 'doCopyPage.testToProd', // arbitray name or config for any other grunt task
                            type: 'list', // list, checkbox, confirm, input, password
                            message: 'Which direction are you copying?', // Question to ask the user, function needs to return a string,
                            default: true, // default value if nothing is entered
                            choices: [
                                { name: 'From Test to Production', value: 'test2prod' },
                                { name: 'From Test to Test', value: 'test2test' },
                                { name: 'From Production to Test', value: 'prod2test', checked:true },
                                { name: 'From Production to Production', value: 'prod2prod' }
                                ]
                        },
                        {
                            config: 'doCopyPage.pageId', // arbitray name or config for any other grunt task
                            type: 'input', // list, checkbox, confirm, input, password
                            message: 'Enter the PageId to copy', // Question to ask the user, function needs to return a string,
                            validate: function(value){
                                if(value == '') {
                                    return 'PageId should not be blank';
                                }else{
                                    return true;
                                }
                            }
                        },
                        {
                            config: 'doCopyPage.accountId', // arbitray name or config for any other grunt task
                            type: 'input', // list, checkbox, confirm, input, password
                            message: 'Enter the destination AccountID to copy', // Question to ask the user, function needs to return a string,
                            //default: 0, // default value if nothing is entered
                            //choices: 'Array|function(answers)',
                            validate: function(value){
                                if(isNaN(parseInt(value))){
                                    return 'please enter a valid id. [' + value + ' is not valid.]';
                                } else {
                                    return true;
                                }
                            } // return true if valid, error message if invalid
                            //filter:  function(value), // modify the answer
                            //when: function(answers) // only ask this question when this function returns true
                        }
                    ]
                }
            },
            renameEmailComponent: {
                options: {
                    questions: [
                        {
                            config: 'dorenameEmailComponent.db', // arbitray name or config for any other grunt task
                            type: 'list', // list, checkbox, confirm, input, password
                            message: 'Which db you want this operation ? ', // Question to ask the user, function needs to return a string,
                            default: true, // default value if nothing is entered
                            choices: [
                                { name: 'Test database', value: 'test' },
                                { name: 'Production database', value: 'prod', checked:true }
                                ]
                        },
                    ]
                }
            },
            enableSiteBuilderOnLegacyAccount: {
                options: {
                    questions: [
                        {
                            config: 'doEnableSiteBuilderOnLegacyAccount.isTestAccount', // arbitray name or config for any other grunt task
                            type: 'list', // list, checkbox, confirm, input, password
                            message: 'Which environment is the account?', // Question to ask the user, function needs to return a string,
                            default: true, // default value if nothing is entered
                            choices: [
                                { name: 'On Test', value: true, checked:true },
                                { name: 'On Production', value: false }
                            ]
                        },
                        {
                            config: 'doEnableSiteBuilderOnLegacyAccount.accountId', // arbitray name or config for any other grunt task
                            type: 'input', // list, checkbox, confirm, input, password
                            message: 'Enter the accountId to enable SB for.', // Question to ask the user, function needs to return a string,
                            validate: function(value){
                                if(isNaN(parseInt(value))){
                                    return 'please enter a valid id. [' + value + ' is not valid.]';
                                } else {
                                    return true;
                                }
                            }
                        }
                    ]
                }
            },
            enableSSBBlog: {
                options: {
                    questions: [
                        {
                            config: 'doEnableSSBBlog.isTestAccount', // arbitray name or config for any other grunt task
                            type: 'list', // list, checkbox, confirm, input, password
                            message: 'Which environment is the account?', // Question to ask the user, function needs to return a string,
                            default: true, // default value if nothing is entered
                            choices: [
                                { name: 'On Test', value: true, checked:true },
                                { name: 'On Production', value: false }
                            ]
                        },
                        {
                            config: 'doEnableSSBBlog.accountId', // arbitray name or config for any other grunt task
                            type: 'input', // list, checkbox, confirm, input, password
                            message: 'Enter the accountId to enable SB Blog for.', // Question to ask the user, function needs to return a string,
                            validate: function(value){
                                if(isNaN(parseInt(value))){
                                    return 'please enter a valid id. [' + value + ' is not valid.]';
                                } else {
                                    return true;
                                }
                            }
                        }
                    ]
                }
            },
            convertAccountToSiteTemplate: {
                options: {
                    questions: [
                        {
                            config: 'doConvertAccountToSiteTemplate.accountId', // arbitray name or config for any other grunt task
                            type: 'input', // list, checkbox, confirm, input, password
                            message: 'Enter the accountId to convert into a site template', // Question to ask the user, function needs to return a string,
                            validate: function(value){
                                if(isNaN(parseInt(value))){
                                    return 'please enter a valid id. [' + value + ' is not valid.]';
                                } else {
                                    return true;
                                }
                            }
                        }
                    ]
                }
            },
            logs: {
                options:{
                    questions:[
                        {
                            config:'doLogsearch.startDate',
                            type:'input',
                            message: 'Enter the start date in UTC with format MM-DD-YYYYTHH:mm:ss:',
                            default: moment().subtract(1, 'days').hours(0).minutes(0).format('MM-DD-YYYY[T]HH:mm')
                        },
                        {
                            config:'doLogsearch.endDate',
                            type:'input',
                            message: 'Enter the end date in UTC with format MM-DD-YYYYTHH:mm:ss:',
                            default: moment().subtract(1, 'days').hours(23).minutes(59).format('MM-DD-YYYY[T]HH:mm')
                        },
                        {
                            config:'doLogsearch.filter',
                            type: 'list', // list, checkbox, confirm, input, password
                            message: 'Filter type of log', // Question to ask the user, function needs to return a string,
                            default: 'node', // default value if nothing is entered
                            choices: [
                                { name: 'Node', value: 'node', checked:true },
                                { name: 'Nginx', value: 'nginx'},
                                { name: 'Any', value:null}
                            ]
                        }
                    ]
                }
            }
        },
        doUpdateBlogPages: {

        },
        doUpdateInnerIds:{

        },
        postcss: {
            options: {
                // map: true,
                map: {
                    inline: false, // save all sourcemaps as separate files...
                    annotation: 'public/admin/assets/css/' // ...to the specified directory
                },
                processors: [
                    // require('pixrem')(), // add fallbacks for rem units
                    require('autoprefixer')({browsers: 'last 2 versions'}), // add vendor prefixes
                    require('cssnano')({ discardDuplicates: false, safe: true }) // minify the result
                ]
            },
            dist: {
                src: ['public/admin/assets/css/*.css', 'public/css/*.css']
            }
        }


    });

    grunt.registerTask('generateHostfile', 'A simple task that generates host file entries based upon the database', function(){
        var done = this.async();
        hostfileGenerator.buildHostEntriesFromDB(done);
    });


    grunt.registerTask('doCopyAccount', 'A task to copy an account with website and pages from one db to another', function(){
        var done = this.async();
        var accountId = parseInt(grunt.config('doCopyAccount.accountId'));
        var isTestToProd = grunt.config('doCopyAccount.testToProd');
        if (isTestToProd === 'test2prod') {
            dbcopyutil.copyAccountFromTestToProd(accountId, done);
        } else if (isTestToProd === 'test2test') {
            dbcopyutil.copyAccountFromTestToTest(accountId, done);
        } else if (isTestToProd === 'prod2prod') {
            dbcopyutil.copyAccountFromProdToProd(accountId, done);
        } else if (isTestToProd === 'prod2test') {
            dbcopyutil.copyAccountFromProdToTest(accountId, done);
        }

    });

    grunt.registerTask('doCopyPage', 'A task to copy an page with its sections to an account from one db to another', function(){
        var done = this.async();
        var accountId = parseInt(grunt.config('doCopyPage.accountId'));
        var pageId = grunt.config('doCopyPage.pageId');
        var isTestToProd = grunt.config('doCopyPage.testToProd');
        if (isTestToProd === 'test2prod') {
            dbcopyutil.copyPageFromTestToProd(pageId, accountId, done);
        } else if (isTestToProd === 'test2test') {
            dbcopyutil.copyPageFromTestToTest(pageId, accountId, done);
        } else if (isTestToProd === 'prod2prod') {
            dbcopyutil.copyPageFromProdToProd(pageId, accountId, done);
        } else if (isTestToProd === 'prod2test') {
            dbcopyutil.copyPageFromProdToTest(pageId, accountId, done);
        }

    });

    grunt.registerTask('dorenameEmailComponent', 'A task to copy an page with its sections to an account from one db to another', function(){
        var done = this.async();
        var database = grunt.config('dorenameEmailComponent.db');

            dbcopyutil.copyEmailComponentName(database, done);


    });




    grunt.registerTask('doEnableSiteBuilderOnLegacyAccount', 'A task to enable SB on an account and update pages to be SB-compatible.', function(){

        var done = this.async();
        var accountId = parseInt(grunt.config('doEnableSiteBuilderOnLegacyAccount.accountId'));
        var isTestAccount = grunt.config('doEnableSiteBuilderOnLegacyAccount.isTestAccount');
        if(isTestAccount === true) {
            dbcopyutil.enableSiteBuilderOnLegacyAccountOnTest(accountId, done);
        } else {
            dbcopyutil.enableSiteBuilderOnLegacyAccountOnProd(accountId, done);
        }

    });

    grunt.registerTask('updateEmails', 'A task to update email collection', function(){
        var done = this.async();

        dbcopyutil.updateEmailCollection(done);
    });

    grunt.registerTask('updateFooterYearText', 'A task to update footer year text', function(){
        var done = this.async();

        dbcopyutil.updateFooterTextYear('2016', '2017', done);
    });

    grunt.registerTask('updateThumbnailImages', 'A task to update existing thumbnail slider images', function(){
        var done = this.async();

        dbcopyutil.updateThumbnailSliderImages(done);
    });


    grunt.registerTask('copyAccount',  ['prompt:copyAccount', 'doCopyAccount']);

    grunt.registerTask('copyPage',  ['prompt:copyPage', 'doCopyPage']);

    grunt.registerTask('renameEmailComponent',  ['prompt:renameEmailComponent', 'dorenameEmailComponent']);

    grunt.registerTask('enableSiteBuilderOnLegacyAccount',  ['prompt:enableSiteBuilderOnLegacyAccount', 'doEnableSiteBuilderOnLegacyAccount']);

    grunt.registerTask('syncSSB', 'A task to copy SSB artifacts from test to prod', function(){
        var done = this.async();
        dbcopyutil.syncSSBArtifacts(done);
    });

    grunt.registerTask('doConvertAccountToSiteTemplate', 'A task to convert an account to a sitetemplate', function(){

        var done = this.async();
        var accountId = parseInt(grunt.config('doConvertAccountToSiteTemplate.accountId'));
        dbcopyutil.convertAccountToSiteTemplate(accountId, done);

    });

    grunt.registerTask('doUpdateBlogPages', 'A task to update blog pages', function(){

        var done = this.async();
        dbcopyutil.updateBlogPages( done);

    });
    grunt.registerTask('doUpdateInnerIds', 'A task to update blog pages', function(){

        var done = this.async();
        dbcopyutil.updateInnerIds( done);

    });


    grunt.registerTask('doUpdatePlatformSectionsLeadSource', 'A task to update platform sections for leadsource', function(){

        var done = this.async();
        dbcopyutil.updatePlatformSectionsLeadSource( done);

    });

    grunt.registerTask('prepPublish', 'Prepare for publish functionality', function(){
        var done = this.async();
        var accountId = null;
        dbcopyutil.publishExistingPages(accountId, done);
    });

    grunt.registerTask('convertAccountToSiteTemplate', ['prompt:convertAccountToSiteTemplate', 'doConvertAccountToSiteTemplate']);

    grunt.registerTask('generateJS', 'Generate JS', function(){
        var done = this.async();
        jsincludeGenerator.buildJSArray('templates/snippets/index_body_scripts.jade', function(data){
            srcfiles = data;
            done();
        });
    });

    grunt.registerTask('buildNGList', 'Build Angular List', function(){
        var fileAry = jsincludeGenerator.includeDirectory('public/scripts');
        console.log('returned array: ', fileAry)
    });

    grunt.registerTask('bower-lock', 'Lockdown Bower Dependencies', function(){
        var done = this.async();
        bowerLockdown.lockVersions(done);

    });

    grunt.registerTask('activity-report', 'Account Activity Report', function(){
        var done = this.async();
        var accountActivity = require('./utils/accountActivity');
        accountActivity.runReport(done);
    });

    grunt.registerTask('cleanupAccounts', 'Cleanup Accounts', function(){
        var done = this.async();
        var accountActivity = require('./utils/accountActivity');
        accountActivity.cleanupAccounts(done);
    });

    grunt.registerTask('cleanupContacts', 'Cleanup Contacts', function(){
        var done = this.async();
        var accountActivity = require('./utils/accountActivity');
        accountActivity.cleanupContacts(done);
    });

    grunt.registerTask('loadLocations', 'Load Locations', function(){
        var done = this.async();
        var locationLoader = require('./utils/locationLoader');
        locationLoader.loadFromFile(done);
    });

    grunt.registerTask('blogMigrate',  ['prompt:enableSSBBlog', 'doEnableSSBBlog']);

    grunt.registerTask('doEnableSSBBlog', 'Enable SSB Blog', function(){
        var done = this.async();
        var accountId = parseInt(grunt.config('doEnableSSBBlog.accountId'));
        var isTestAccount = grunt.config('doEnableSSBBlog.isTestAccount');
        if(isTestAccount === true) {
            dbcopyutil.migrateToSSBBlogOnTest(accountId, done);
        } else {
            dbcopyutil.migateToSSBBlogOnProd(accountId, done);
        }
    });

    grunt.registerTask('testBlogMigrate', 'Test Blog Migrate', function(){
        var done = this.async();
        var accountId = 1700;
        dbcopyutil.migrateToSSBBlogOnTest(accountId, done);
    });

    grunt.registerTask('updateSessionEvents', 'Update Session Events', function(){
        var done = this.async();
        var accountId = 0;
        dbcopyutil.addMaxMindToSessionEvents(accountId, done);
    });

    grunt.registerTask('updatePageEvents', 'Update Page Events', function(){
        var done = this.async();
        dbcopyutil.addAccountIdToPageEvents( done);
    });

    grunt.registerTask('updatePageDates', 'Update Page Dates', function() {
        var done = this.async();
        dbcopyutil.fixPagesDates(done);
    });

    grunt.registerTask('archiveDB', 'Archive DB', function(){
        var done = this.async();
        var dbArchiveUtil = require('./utils/dbarchiveutil');

        dbArchiveUtil.archiveDB(done);

    });

    grunt.registerTask('s3UP', '(re)Upload archive to S3', function() {
        var done = this.async();
        var dbArchiveUtil = require('./utils/dbarchiveutil');
        var s3Config = require('./configs/aws.config');
        dbArchiveUtil.uploadToS3('archive', s3Config.AWS_ACCESS_KEY, s3Config.AWS_SECRET_ACCESS_KEY, s3Config.AWS_REGION, s3Config.BUCKETS.DB_ARCHIVES, done);
    });

    grunt.registerTask('dbperf', 'DB Performance', function() {
        var done = this.async();
        var dbPerfUtil = require('./utils/dbperfutil');
        dbPerfUtil.run(done);
    });

    grunt.registerTask('cleanupPings', 'Cleanup Pings', function(){
        var done = this.async();
        var dbArchiveUtil = require('./utils/dbarchiveutil');
        dbArchiveUtil.cleanupPingCollection(done);
    });

    grunt.registerTask('getUnsent', 'Get Unsent', function(){
        var done = this.async();
        var dbCopyUtil = require('./utils/dbcopyutil');
        dbCopyUtil.getUnsentContactIDs(done);
    });

    grunt.registerTask('getBouncedContactIDs', 'getBouncedContactIDs', function(){
        var done = this.async();
        var dbCopyUtil = require('./utils/dbcopyutil');
        dbCopyUtil.getBouncedContactIDs(done);
    });

    grunt.registerTask('updateContactActivityTypes', 'updateContactActivityTypes', function(){
        var done = this.async();
        var dbCopyUtil = require('./utils/dbcopyutil');
        dbCopyUtil.updateContactActivityTypes(done);
    });

    grunt.registerTask('updateAccountSignupDate', 'updateAccountSignupDate', function(){
        var done = this.async();
        var dbCopyUtil = require('./utils/dbcopyutil');
        dbCopyUtil.updateAccountSignupDate(done);
    });

    grunt.registerTask('sendWebhookData', 'sendWebhookData', function() {
        var done = this.async();
        var jsonldbuilder = require('./utils/jsonldbuilder');
        jsonldbuilder.sendWebhookData(done);
    });

    grunt.registerTask('finishDeploy', 'finishDeploy', function(){
        var done = this.async();
        var deployUtils = require('./utils/deployUtils');
        deployUtils.finishDeploy(done);
    });

    grunt.registerTask('rollbackDeploy', 'rollbackDeploy', function(){
        var done = this.async();
        var deployUtils = require('./utils/deployUtils');
        deployUtils.rollbackDeploy(done);
    });

    grunt.registerTask('updatePrivs', 'updatePrivs', function(){
        var done = this.async();
        var dbCopyUtil = require('./utils/dbcopyutil');
        dbCopyUtil.updatePrivs(done);
    });

    grunt.registerTask('updateUnsubedContacts', 'updateUnsubedContacts', function(){
        var done = this.async();
        var dbCopyUtil = require('./utils/dbcopyutil');
        dbCopyUtil.updateUnsubedContacts(done);
    });

    grunt.registerTask('doLogsearch', 'doLogsearch', function(){
        var done = this.async();
        var loggrabber = require('./utils/loggrabber');
        var startDate = moment.utc(grunt.config('doLogsearch.startDate'), 'MM-DD-YYYY[T]HH:mm').toDate();
        var endDate = moment.utc(grunt.config('doLogsearch.endDate'), 'MM-DD-YYYY[T]HH:mm').toDate();
        var filter = grunt.config('doLogsearch.filter');
        loggrabber.grab(startDate, endDate, filter, done);
    });
    grunt.registerTask('logs',  ['prompt:logs', 'doLogsearch']);

    grunt.registerTask('updateStripeIDs', 'updateStripeIDs', function(){
        var done = this.async();
        var dbCopyUtil = require('./utils/dbcopyutil');
        dbCopyUtil.updateStripeIDs(done);
    });

    // grunt.registerTask('serve', 'Start a custom web server.', function() {
    //     grunt.log.writeln('Starting web server on port 80.');
    //     require('./app.js');
    // });


    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-ng-constant');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-ng-annotate');
    //grunt.loadNpmTasks("grunt-jsdoc-to-markdown");
    grunt.loadNpmTasks('grunt-prompt');
    grunt.loadNpmTasks('grunt-csssplit');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-postcss');
    // grunt.loadNpmTasks('grunt-serve');
    //grunt.loadTasks('deploy/grunt/compile-handlebars-templates/tasks');

    grunt.registerTask('copyroot', ['clean:release','copy:main']);
    grunt.registerTask('compiletemplates', ['compilehbs', 'handlebars','clean:hbs']);


    grunt.registerTask('production',['clean:prebuild', 'less', 'csssplit', 'concat', 'postcss', 'ngAnnotate', 'uglify', 'clean:postbuild']);
    grunt.registerTask('local', ['less', 'concat:css', 'postcss']);

    /*
     * This task is run by CI.
     */
    grunt.registerTask('tests', ['nodeunit:contacts', 'nodeunit:utils',
            'nodeunit:products', 'nodeunit:cms', 'nodeunit:assets', 'nodeunit:contactActivities', 'nodeunit:payments',
            'nodeunit:analyticsCollater', 'nodeunit:stripe_cleanup', 'nodeunit:ssb' ]);

    grunt.registerTask('testContextio', ['nodeunit:contextio']);
    grunt.registerTask('testUtils', ['nodeunit:utils']);
    grunt.registerTask('testApi', ['nodeunit:api']);
    grunt.registerTask('testFacebook', ['nodeunit:facebook']);
    grunt.registerTask('testGoogle', ['nodeunit:google']);
    grunt.registerTask('testLinkedIn', ['nodeunit:linkedin']);
    grunt.registerTask('testTwitter', ['nodeunit:twitter']);
    grunt.registerTask('testContacts', ['nodeunit:contacts']);
    grunt.registerTask('testAnalytics', ['nodeunit:analytics']);
    grunt.registerTask('testProducts', ['nodeunit:products']);
    grunt.registerTask('testCms', ['nodeunit:cms']);
    grunt.registerTask('testAssets', ['nodeunit:assets']);
    grunt.registerTask('testContactActivities', ['nodeunit:contactActivities']);
    grunt.registerTask('testPayments', ['nodeunit:payments']);
    grunt.registerTask('testFunctionalPayments', ['nodeunit:functionalPayments']);
    grunt.registerTask('testCampaigns', ['nodeunit:campaign']);
    grunt.registerTask('testPaymentEvents', ['nodeunit:paymentEvents']);
    grunt.registerTask('testCollater', ['nodeunit:analyticsCollater']);
    grunt.registerTask('updateDocs', 'jsdoc2md');
    grunt.registerTask('testTz', ['nodeunit:tzTests']);
    grunt.registerTask('testGtm', ['nodeunit:gtm']);
    grunt.registerTask('leads', ['nodeunit:leads']);
    grunt.registerTask('ssl', ['nodeunit:ssl']);
    grunt.registerTask('ssl_manager', ['nodeunit:ssl_manager']);
    grunt.registerTask('stripe_cleanup', ['nodeunit:stripe_cleanup']);
    grunt.registerTask('ssb', ['nodeunit:ssb']);
    grunt.registerTask('scheduler', ['nodeunit:scheduler']);
};

/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */
var STRIPE_CONFIG = require('./configs/stripe.config.js');
var SEGMENTIO_CONFIG = require('./configs/segmentio.config.js');
var KEEN_CONFIG = require('./configs/keen.config');
var GOOGLE_CONFIG = require('./configs/google.config');
var TWONET_CONFIG = require('./configs/twonet.config');

//var wiredepJSAry = require('wiredep')().js;

var hostfileGenerator = require('./utils/hostfile.generator');
var dbcopyutil = require('./utils/dbcopyutil');
var wordpressConverter = require('./utils/wordpressconverter');
var jsincludeGenerator = require('./utils/jsincludegenerator');
var srcfiles = [];

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
                    '../indigeweb/public/css/site.css': [ 'public/less/site.less' ],
                    '../indigeweb/public/css/style.default.css': [ 'public/less/style.default.less' ],
                    '../indigeweb/public/css/style.default.css_o': [ 'public/less/style.default_o.less' ],
                    '../indigeweb/public/pipeshift/css/site.css': [ 'public/pipeshift/less/theme.less', 'public/pipeshift/less/main.less' ],
                    '../indigeweb/public/css/angular-admin.css': [ 'public/less/angular-admin.less' ]

                }
            }
        },

        csssplit: {
            your_target: {
              src: ['../indigeweb/public/css/style.default.css'],
              dest: '../indigeweb/public/css'
            }
        },

        watch: {
            less: {
                files: "../indigeweb/public/less/*",
                tasks: ["less"]
            },
            html: {
                files: "../indigeweb/public/templates/**/*.html"
            },
            scripts: {
              files: '../indigeweb/public/js/**/*.js'
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
                /*
                src: ['public/js/libs/jquery/dist/jquery.js',
                    'public/js/libs/bootstrap/dist/js/bootstrap.js',
                    'public/js/libs/angular/angular.js',
                    'public/js/scripts/config.js',
                    'public/js/libs/json3/lib/json3.js',
                    'public/js/libs/underscore/underscore.js',
                    'public/js/libs/angular-resource/angular-resource.js',
                    'public/js/libs/angular-cookie/angular-cookie.js',
                    'public/js/libs/angular-sanitize/angular-sanitize.js',
                    'public/js/libs/angular-animate/angular-animate.js',
                    'public/js/libs/angular-touch/angular-touch.js',
                    'public/js/libs/angular-route/angular-route.js',
                    'public/js/libs/angular-ui-router/release/angular-ui-router.js',
                    'public/js/libs/angular-parallax/scripts/angular-parallax.js',
                    'public/js/libs/blueimp-gallery/js/jquery.blueimp-gallery.min.js',
                    'public/js/libs/moment/moment.js',
                    'public/js/libs/angular-moment/angular-moment.js',
                    'public/js/libs/angular-scroll/angular-scroll.js',
                    'public/js/libs/angular-wizard/dist/angular-wizard.js',
                    'public/js/libs/isotope/jquery.isotope.js',
                    'public/js/libs/angular-isotope/dist/angular-isotope.js',
                    'public/js/libs/angular-timer/dist/angular-timer.js',
                    'public/js/libs/jquery-ui/jquery-ui.min.js',
                    'public/js/scripts/utils.js',
                    'public/js/libs/ng-tags-input/ng-tags-input.js',
                    'public/js/libs/videogular/videogular.js',
                    'public/js/libs/videogular-controls/controls.js',
                    'public/js/libs/videogular-overlay-play/overlay-play.js',
                    'public/js/libs/videogular-buffering/buffering.js',
                    'public/js/libs/videogular-poster/poster.js',
                    'public/js/libs/angular-input-date/src/angular-input-date.js',
                    'public/js/libs/skeuocard/lib/js/card.js',
                    'public/js/libs/fingerprint/fingerprint.js',
                    'public/js/libs/angular-bootstrap/ui-bootstrap-tpls.min.js',
                    'public/js/libs/purl/purl.js',
                    'public/js/libs/ua-parser-js/dist/ua-parser.min.js',
                    'public/js/libs_misc/uuid.js',
                    'public/js/libs_misc/angular-file-upload/angular-file-upload.js',
                    'public/js/libs/jqcloud2/dist/jqcloud.min.js',
                    'public/js/libs/angular-jqcloud/angular-jqcloud.js',
                    'public/js/libs_misc/jstimezonedetect/jstz.min.js',
                    'public/js/libs/angular-social-links/angular-social-links.js',
                    'public/js/libs/slick-carousel/slick/slick.js',
                    'public/js/libs/angular-slick/dist/slick.js',
                    'public/js/libs/leaflet/dist/leaflet.js',
                    'public/js/libs/angular-leaflet-directive/dist/angular-leaflet-directive.min.js'

                ],
                */

                src: jsincludeGenerator.buildJSArraySync('templates/snippets/index_body_scripts.jade'),
                /*src: wiredepJSAry,*/
                dest: 'public/js/indigenous.js'
            }
        },

        uglify: {
            js: {
                files: {
                    'public/js/indigenous.js': ['public/js/indigenous.js']
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
            app1: {
                files: {

                    /*
                    'public/js/ng-indigenous.js':[
                        'public/js/libs/angular-ui/build/angular-ui.min.js',
                        'public/js/libs/angular-ui/modules/directives/sortable/sortable.js',
                        'public/scripts/app.js',
                        'public/scripts/directives/angularparallax.js',
                        'public/scripts/directives/carousel.js',
                        'public/scripts/directives/convertHtml.js',
                        'public/scripts/directives/coursePreview.js',
                        'public/scripts/directives/dmStyle.js',
                        'public/scripts/directives/fileChange.js',
                        'public/scripts/directives/last.js',
                        'public/scripts/directives/ngEnter.js',
			            'public/scripts/directives/scrollTo.js',
                        'public/scripts/directives/skeuocard.js',
                        'public/scripts/services/accountService.js',
                        'public/scripts/services/analyticsService.js',
                        'public/scripts/services/courseService.js',
                        'public/scripts/services/customerService.js',
                        'public/scripts/services/pageService.js',
                        'public/scripts/services/pagesService.js',
                        'public/scripts/services/paymentService.js',
                        'public/scripts/services/postsService.js',
                        'public/scripts/services/postService.js',
                        'public/scripts/services/productService.js',
                        'public/scripts/services/themeService.js',
                        'public/scripts/services/userService.js',
                        'public/scripts/services/websiteService.js',
                        'public/scripts/filters/CreateUrlFilter.js',
                        'public/scripts/filters/generateURLforLinks.js',
                        'public/scripts/filters/getByProperty.js',
                        'public/scripts/filters/getByType.js',
                        'public/scripts/filters/offset.js',
                        'public/scripts/filters/trustHtml.js',
                        'public/scripts/controllers/blogCtrl.js',
                        'public/scripts/controllers/CourseSubscribeModalController.js',
                        'public/scripts/controllers/layoutCtrl.js',
                        'public/scripts/controllers/mainCtrl.js'
                    ]
                    */

                    'public/js/ng-indigenous.js': jsincludeGenerator.includeDirectory('public/scripts')
                }
            }
        },

        jsdoc2md: {

            separateOutputFilePerInput: {
                files: [
                    { src: "api/1.0/cms.api.js", dest: "../wiki-indigeweb/API-CMS.md" },
                    { src: "api/1.0/product.api.js", dest: "../wiki-indigeweb/API-Product.md" }
                ]
            }

        },


        //TESTING
        nodeunit: {
            all:['test/**/*_test.js'],
            analytics: ['analytics/tests/*_test.js'],
            analyticsCollater: ['analytics/tests/analytics_collater_test.js'],
            api:['api/test/*_test.js'],
            assets:['assets/test/*_test.js'],
            biometricsPlatform:['biometrics/platform/test/**/*_test.js'],
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
            twonet:['biometrics/twonet/adapter/test/**/*_test.js', 'biometrics/twonet/client/test/**/*_test.js',
                'biometrics/twonet/adapter/test/twonet_test_poll.js'],
            twonetadapter:['biometrics/twonet/adapter/test/**/*_test.js'],
            twonetclient:['biometrics/twonet/client/test/**/*_test.js'],
            twonetpoll:['biometrics/twonet/adapter/test/twonet_test_poll.js'],
            runkeeper:['biometrics/runkeeper/adapter/test/**/*_test.js', 'biometrics/runkeeper/adapter/test/runkeeper_test_poll.js'],
            runkeeperadapter:['biometrics/runkeeper/adapter/test/**/*_test.js'],
            runkeeperpoll:['biometrics/runkeeper/adapter/test/runkeeper_test_poll.js'],
            utils:['utils/test/*_test.js'],
            tzTests: ['test/tztest.js']
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
                    dest: 'public/js/scripts/config.js'
                },
                constants: {
                    ENV: {
                        name: 'development',
                        stripeKey: STRIPE_CONFIG.STRIPE_PUBLISHABLE_KEY,
                        segmentKey: SEGMENTIO_CONFIG.SEGMENT_WRITE_KEY,
                        keenWriteKey: KEEN_CONFIG.KEEN_WRITE_KEY,
                        keenReadKey: KEEN_CONFIG.KEEN_READ_KEY,
                        keenProjectId: KEEN_CONFIG.KEEN_PROJECT_ID,
                        googleAnalyticsId: GOOGLE_CONFIG.ANALYTICS_ID,
                        googleAnalyticsScope: GOOGLE_CONFIG.ANALYTICS_SCOPE,
                        googleClientId: GOOGLE_CONFIG.CLIENT_ID,
                        googleClientSecret: GOOGLE_CONFIG.CLIENT_SECRET,
                        googleServerKey: GOOGLE_CONFIG.SERVER_KEY,
                        twonetKey: TWONET_CONFIG.TWONET_KEY,
                        twonetSecret: TWONET_CONFIG.TWONET_SECRET,
                        twonetUserGuid: TWONET_CONFIG.TWONET_USERGUID,
                        twonetTrackGuid: TWONET_CONFIG.TWONET_TRACKGUID
                    }
                }
            },
            production: {
                options: {
                    dest: 'public/js/scripts/config.js'
                },
                constants: {
                    ENV: {
                        name: 'production',
                        stripeKey: STRIPE_CONFIG.STRIPE_PUBLISHABLE_KEY,
                        segmentKey: SEGMENTIO_CONFIG.SEGMENT_PROD_WRITE_KEY,
                        keenWriteKey: KEEN_CONFIG.KEEN_PROD_WRITE_KEY,
                        keenReadKey: KEEN_CONFIG.KEEN_PROD_READ_KEY,
                        keenProjectId: KEEN_CONFIG.KEEN_PROD_PROJECT_ID,
                        googleAnalyticsId: GOOGLE_CONFIG.ANALYTICS_ID,
                        googleAnalyticsScope: GOOGLE_CONFIG.ANALYTICS_SCOPE,
                        googleClientId: GOOGLE_CONFIG.PROD_CLIENT_ID,
                        googleClientSecret: GOOGLE_CONFIG.PROD_CLIENT_SECRET,
                        googleServerKey: GOOGLE_CONFIG.SERVER_KEY,
                        twonetKey: TWONET_CONFIG.TWONET_KEY,
                        twonetSecret: TWONET_CONFIG.TWONET_SECRET,
                        twonetUserGuid: TWONET_CONFIG.TWONET_USERGUID,
                        twonetTrackGuid: TWONET_CONFIG.TWONET_TRACKGUID
                    }
                }
            }
        },

        //Adds interactive prompt for grunt tasks
        prompt: {
            target: {
                options: {
                    questions: [
                        {
                            config: 'doCopyAccount.testToProd', // arbitray name or config for any other grunt task
                            type: 'list', // list, checkbox, confirm, input, password
                            message: 'Which direction are you copying?', // Question to ask the user, function needs to return a string,
                            default: true, // default value if nothing is entered
                            choices: [
                                { name: 'From Test to Production', value: true, checked:true},
                                { name: 'From Production to Test', value: false }
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
        if(isTestToProd === true) {
            dbcopyutil.copyAccountFromTestToProd(accountId, done);
        } else {
            dbcopyutil.copyAccountFromProdToTest(accountId, done);
        }

    });

    grunt.registerTask('convertWordpress', 'Convert blog', function(){
        var done = this.async();
        wordpressConverter.convertBlog('', 15,'a4bf6965-7ddd-4f4c-9f22-6986f16315fc','e6d3a8a4-5a2f-44d6-a16e-d5cf0759916f', done);
    });

    grunt.registerTask('copyAccount',  ['prompt', 'doCopyAccount']);

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
    grunt.loadNpmTasks("grunt-jsdoc-to-markdown");
    grunt.loadNpmTasks('grunt-prompt');
    grunt.loadNpmTasks('grunt-csssplit');
    grunt.loadTasks('deploy/grunt/compile-handlebars-templates/tasks');

    grunt.registerTask('copyroot', ['clean:release','copy:main']);
    grunt.registerTask('compiletemplates', ['compilehbs', 'handlebars','clean:hbs']);
    grunt.registerTask('production',['clean:prebuild', 'less', 'csssplit', 'concat', 'uglify', 'ngAnnotate','clean:postbuild']);

    /*
     * This task is run by CI.
     */
    grunt.registerTask('tests', ['nodeunit:biometricsPlatform', 'nodeunit:contacts', 'nodeunit:utils',
            'nodeunit:products', 'nodeunit:cms', 'nodeunit:assets', 'nodeunit:contactActivities', 'nodeunit:payments',
            'nodeunit:analyticsCollater']);

    grunt.registerTask('testContextio', ['nodeunit:contextio']);
    grunt.registerTask('testBiometricsPlatform', ['nodeunit:biometricsPlatform']);
    grunt.registerTask('testTwonetclient', ['nodeunit:twonetclient']);
    grunt.registerTask('testTwonetadapter', ['nodeunit:twonetadapter']);
    grunt.registerTask('testTwonetpoll', ['nodeunit:twonetpoll']);
    grunt.registerTask('testRunkeeperadapter', ['nodeunit:runkeeperadapter']);
    grunt.registerTask('testRunkeeperpoll', ['nodeunit:runkeeperpoll']);
    grunt.registerTask('testBiometrics', ['nodeunit:twonetclient','nodeunit:biometricsPlatform','nodeunit:twonetadapter','nodeunit:twonetpoll','nodeunit:runkeeperadapter','nodeunit:runkeeperpoll']);
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
};

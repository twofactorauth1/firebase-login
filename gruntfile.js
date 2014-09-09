/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */
var STRIPE_CONFIG = require('./configs/stripe.config.js');

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
                    grunt.log.write(names);
                    grunt.log.writeln();
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
                    '../indigeweb/public/pipeshift/css/site.css': [ 'public/pipeshift/less/theme.less', 'public/pipeshift/less/main.less' ]
                }
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


        //TESTING
        nodeunit: {
            all:['test/**/*_test.js'],
            analytics: ['analytics/tests/*_test.js'],
            api:['api/test/*_test.js'],
            biometricsPlatform:['biometrics/platform/test/**/*_test.js'],
            cms: ['cms/test/cms_manager_test.js'],
            contacts: ['test/contact.dao_test.js'],
            contextio:['test/contextio_test.js'],
            facebook: ['test/facebook_test.js'],
            products: ['products/tests/*_test.js'],
            twonet:['biometrics/twonet/adapter/test/**/*_test.js', 'biometrics/twonet/client/test/**/*_test.js',
                'biometrics/twonet/adapter/test/twonet_test_poll.js'],
            twonetadapter:['biometrics/twonet/adapter/test/**/*_test.js'],
            twonetclient:['biometrics/twonet/client/test/**/*_test.js'],
            twonetpoll:['biometrics/twonet/adapter/test/twonet_test_poll.js'],
            runkeeper:['biometrics/runkeeper/adapter/test/**/*_test.js', 'biometrics/runkeeper/adapter/test/runkeeper_test_poll.js'],
            runkeeperadapter:['biometrics/runkeeper/adapter/test/**/*_test.js'],
            runkeeperpoll:['biometrics/runkeeper/adapter/test/runkeeper_test_poll.js'],
            utils:['utils/test/*_test.js']
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
                        stripeKey: STRIPE_CONFIG.STRIPE_PUBLISHABLE_KEY
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
                        stripeKey: STRIPE_CONFIG.STRIPE_PUBLISHABLE_KEY
                    }
                }
            }
        }


    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-ng-constant');
    grunt.loadTasks('deploy/grunt/compile-handlebars-templates/tasks');

    grunt.registerTask('copyroot', ['clean:release','copy:main']);
    grunt.registerTask('compiletemplates', ['compilehbs', 'handlebars','clean:hbs']);
    grunt.registerTask('production',['clean:prebuild','less','requirejs','clean:postbuild']);

    grunt.registerTask('tests', ['nodeunit:biometricsPlatform', 'nodeunit:contacts', 'nodeunit:twonet', 'nodeunit:utils',
            'nodeunit:products', 'nodeunit:cms']);
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
    grunt.registerTask('testContacts', ['nodeunit:contacts']);
    grunt.registerTask('testAnalytics', ['nodeunit:analytics']);
    grunt.registerTask('testProducts', ['nodeunit:products']);
    grunt.registerTask('testCms', ['nodeunit:cms']);
    
};

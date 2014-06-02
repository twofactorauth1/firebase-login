/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

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
                files: {"../indigeweb-release/public/css/site.css":"public/less/site.less"}
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
            contextio:['test/contextio_test.js'],
            biometricsPlatform:['biometrics/platform/test/**/*_test.js'],
            twonetadapter:['biometrics/twonet/adapter/test/**/*_test.js'],
            twonetclient:['biometrics/twonet/client/test/**/*_test.js'],
            twonetpoll:['biometrics/twonet/adapter/test/twonet_test_poll.js'],
            runkeeperadapter:['biometrics/runkeeper/adapter/test/**/*_test.js'],
            runkeeperpoll:['biometrics/runkeeper/adapter/test/runkeeper_test_poll.js']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadTasks('deploy/grunt/compile-handlebars-templates/tasks');

    grunt.registerTask('copyroot', ['clean:release','copy:main']);
    grunt.registerTask('compiletemplates', ['compilehbs', 'handlebars','clean:hbs']);
    grunt.registerTask('production',['clean:prebuild','less','requirejs','clean:postbuild']);

    grunt.registerTask('tests', ['nodeunit:all']);
    grunt.registerTask('testContextio', ['nodeunit:contextio']);
    grunt.registerTask('testBiometricsPlatform', ['nodeunit:biometricsPlatform']);
    grunt.registerTask('testTwonetclient', ['nodeunit:twonetclient']);
    grunt.registerTask('testTwonetadapter', ['nodeunit:twonetadapter']);
    grunt.registerTask('testTwonetpoll', ['nodeunit:twonetpoll']);
    grunt.registerTask('testRunkeeperadapter', ['nodeunit:runkeeperadapter']);
    grunt.registerTask('testRunkeeperpoll', ['nodeunit:runkeeperpoll']);
    grunt.registerTask('testBiometrics', ['nodeunit:twonetclient','nodeunit:biometricsPlatform','nodeunit:twonetadapter','nodeunit:twonetpoll','nodeunit:runkeeperadapter','nodeunit:runkeeperpoll']);
};

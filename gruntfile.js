module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),


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
                amd: true,
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
                files: { 'public/js/compiled/templates.js' : [ 'hbs/*/*.hbs'] }
            },
            apps: {
                files: { 'public/js/compiled/apps/templates.js' : [ 'hbs/apps/**/*.hbs'] }
            }
        },

        copy: {
            main: {
                expand: true,
                src: ['!node_modules/','./**'],
                dest: '../bio-release/'
            }
        },

        clean: {
            options: {
                force:true
            },
            hbs: {
                src: ["hbs"]
            },
            biorelease: {
                src: ["../bio-release"]
            },
            release: {
                src: ["../bio-release/public/less","../bio-release/deploy", "../bio-release/public/css", "../bio-release/node_modules", "../bio-release/Logs/*.log", "../bio-release/public/js"]
            }
        },

        less: {
            style: {
                files: {"../bio-release/public/css/site.css":"public/less/site.less"}
            }
        },

        requirejs: {
            compile: {
                options: {
                    baseUrl: "public/js", //relative to appdir

                    appDir: "",

                    dir: "../bio-release/public/js",

                    optimize: grunt.option('optimize') || 'none',

                    mainConfigFile:"public/js/main.js",

                    modules: [
                        { name: "main",
                            excludeShallow: [],
                            include: [
                                'css', 'normalize','text'
                            ]},
                        { name: "routers/home.router", excludeShallow:['utils/cachemixin','libs/requirejs/plugins/text']}
                    ],


                    done: function(done, output) {
                        var duplicates = require('rjs-build-analysis').duplicates(output);

                        if (duplicates.length > 0) {
                            grunt.log.subhead('Duplicates found in requirejs build:');
                            grunt.log.warn(duplicates);
                            done(new Error('r.js built duplicate modules, please check the excludes option.'));
                        }

                        done();
                    }
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-handlebars');
    grunt.loadTasks('deploy/grunt/compile-handlebars-templates/tasks');

    grunt.registerTask('compiletemplates', ['compilehbs', 'handlebars','clean:hbs']);
    grunt.registerTask('copyroot', ['clean:biorelease','copy']);
    grunt.registerTask('default',['clean:release','less','requirejs']);

};

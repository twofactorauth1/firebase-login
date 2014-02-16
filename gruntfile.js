module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),


        copy: {
            main: {
                expand: true,
                src: ['./**'],
                dest: '../bio-release/'
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
            prebuild: {
                src: ["../bio-release/public/css"]
            },
            postbuild: {
                src: ["../bio-release/public/less", "../bio-release/public/js", "../bio-release/deploy",/*"../bio-release/node_modules",*/"../bio-release/Logs/*.log"]
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

                    dir: "../bio-release/public/min",

                    optimize: grunt.option('optimize') || 'none',

                    mainConfigFile:"public/js/main.js",

                    modules: [
                        { name: "main",
                            excludeShallow: [],
                            include: [
                                'css', 'normalize','text'
                            ]},
                        { name: "routers/home.router", excludeShallow:['utils/cachemixin','libs/requirejs/plugins/text']}
                    ]
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

    grunt.registerTask('copyroot', ['clean:biorelease','copy:main']);
    grunt.registerTask('compiletemplates', ['compilehbs', 'handlebars','clean:hbs']);
    grunt.registerTask('production',['clean:prebuild','less','requirejs','clean:postbuild']);

};

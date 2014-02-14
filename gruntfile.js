module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

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
                                'css', 'normalize','text',
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

    grunt.registerTask('default',['copy','clean','less','requirejs']);

};

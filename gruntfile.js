module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        requirejs: {
            compile: {
                options: {
                    baseUrl: "public/js",

                    appDir: "",

                    dir: "public/min",

                    mainConfigFile: "public/js/main.js",

                    optimize: "none",

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

    grunt.registerTask('default', ['requirejs']);
};

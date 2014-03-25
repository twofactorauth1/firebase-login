/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */


'use strict'

var fs = require('fs')
    , path = require('path')
    , jsdom = require('jsdom')
    , jquery = fs.readFileSync(path.join(__dirname, '../libs/jquery/jquery.js'), 'utf8');

module.exports = function(grunt) {

    grunt.registerMultiTask("compilehbs", "", function() {
        var options = this.options();

        var sourceDirectory = options.source || "public/templates";
        var outputDirectory = options.output || "hbs";
        var helpersPath = options.helpers || "public/js/hbshelpers.js";

        var cb = this.async();

        //Create an output file for javascript handlebars helpers
        var jsHelpersFile = process.cwd() + "/" + helpersPath;
        grunt.file.write(jsHelpersFile, "");

        var fileCount = 0;
        grunt.file.recurse(sourceDirectory, function(absPath, rootDir, subDir, filename) {
            fileCount = fileCount + 1;

            var directory = absPath.replace(sourceDirectory, outputDirectory).replace(".html", "");
            grunt.file.mkdir(directory);

            var html = grunt.file.read(absPath);

            grunt.log.write(html);
            jsdom.env({
                html:html,
                src:[jquery],
                done: function(err, window) {
                        var $ = window.$;
                        var templateScripts = $("script[type='text/x-handlebars-template']");

                        for (var i = 0; i < templateScripts.length; i++) {
                            var template = $(templateScripts[i]);
                            var name = template.attr("name");
                            if (name == null) {
                                name = template.attr("id");
                            }
                            var partial = template.attr("partial") == "true";

                            var contents = template.html();

                            var fileName = name + ".hbs";

                            if (partial) {
                                fileName = "_" + fileName;
                            }

                            var filePath = directory + "/" + fileName;

                            grunt.file.write(filePath, contents);
                            grunt.log.write(filePath + " created");
                            grunt.log.writeln();
                        }

                        var helperScripts = $("script[type='text/javascript']");

                        for (i = 0; i < helperScripts.length; i++) {
                            var script = $(helperScripts[i]);
                            var contents = script.html();

                            fs.appendFile(jsHelpersFile, contents);
                        }
                        fileCount = fileCount - 1;

                        if (fileCount == 0) {
                            return cb();
                        }
                    }
                }
            );
        });

        grunt.log.write("Completed Compiling Handlebars Templates");
    });
};
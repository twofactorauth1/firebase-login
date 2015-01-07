var fs = require('fs');
var _ = require('underscore');

var jsincludegenerator = {

    buildJSArray: function(file, done) {
        fs.readFile(file,{encoding:'utf-8'}, function (err, data) {
            if (err) throw err;
            //strip off the section before and after autoinclude
            data = data.replace(/[\s\S]*START AUTOINCLUDE SECTION/g,'');
            data = data.replace(/.*END AUTOINCLUDE SECTION[\s\S]*/g, '');

            //convert to an array and remove blank entries
            var dataAry = _.without(data.split('\n'), '');

            //remove 'script(src="   and  ")'
            dataAry = _.map(dataAry, function(line){
                line = line.replace(/[\"\']\)/g, '');
                return line.replace(/script\(src\=[\"\']/g, '');
            });

            //replace '../' with 'public/'
            dataAry = _.map(dataAry, function(line){
                return line.replace('../', 'public/');
            });

            //remove the lines that start with http
            dataAry = _.reject(dataAry, function(line){
                return line.lastIndexOf('http', 0) === 0;
            });


            console.dir(dataAry);
            done(dataAry);
        });

    },

    buildJSArraySync: function(file) {
        var data = fs.readFileSync(file, {encoding:'utf-8'});
        data = data.replace(/[\s\S]*START AUTOINCLUDE SECTION/g,'');
        data = data.replace(/.*END AUTOINCLUDE SECTION[\s\S]*/g, '');

        //convert to an array and remove blank entries
        var dataAry = _.without(data.split('\n'), '');

        //remove 'script(src="   and  ")'
        dataAry = _.map(dataAry, function(line){
            line = line.replace(/[\"\']\)/g, '');
            return line.replace(/script\(src\=[\"\']/g, '');
        });

        //replace '../' with 'public/'
        dataAry = _.map(dataAry, function(line){
            return line.replace('../', 'public/');
        });

        //remove the lines that start with http
        dataAry = _.reject(dataAry, function(line){
            return line.lastIndexOf('http', 0) === 0;
        });
        console.log('returning: ', dataAry);
        return dataAry;

    }



}

module.exports = jsincludegenerator;

var _ = require('underscore');
var async = require('async');
var fs = require('fs');

var bowerlockdown = {

    lockVersions: function(cb) {
        var self = this;
        fs.readFile('bower.json', 'utf-8', function(err, content){
            var contentObj = JSON.parse(content);
            //console.log(contentObj.dependencies);
            var dependencies = [];
            _.each(contentObj.dependencies, function(value, key){
                dependencies.push(key +':'+value);
            });

            var tildeCount = 0;
            async.eachSeries(dependencies,
                function(dep, callback){
                    var version = dep.substring( dep.indexOf(':') + 1 );
                    var name = dep.substring(0, dep.indexOf(':'));
                    if(version.indexOf('~')===0) {
                        //console.log(name + ' has a version ' + version);
                        tildeCount++;

                        //find the actual version
                        fs.readFile('public/js/libs/' + name + '/.bower.json', 'utf-8', function(err, bowerContent){
                            try {
                                var version = JSON.parse(bowerContent).version;
                                //console.log('should be ' + version);
                                contentObj.dependencies[name] = version;
                                callback();
                            } catch(exception) {
                                console.log('Exception for ' + name + ': ' + exception);
                                callback();
                            }

                        });
                    } else {
                        callback();
                    }
                }, function done(){
                    console.log('done. - ' + tildeCount);
                    if(tildeCount > 0) {
                        console.log('writing corrected file');
                        var stringJson = JSON.stringify(contentObj, null, 4);
                        fs.writeFile('bower.json', stringJson, 'utf-8', function(err, value){
                            cb();
                        });
                    } else {
                        console.log('nothing to write');
                        cb();
                    }


                }
            );
        });
    }

};

module.exports = bowerlockdown;
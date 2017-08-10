var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var moment = require('moment');
var AWS = require('aws-sdk');
var awsConfigs = require('../configs/aws.config');
var grabber = {

    grab:function(startDate, endDate, filter, fn) {
        //resources/environments/logs/publish/e-5gfb9fv5am/i-e4d0a251/_var_log_nodejs_rotated_nodejs.log-
        var params = {
            Bucket: 'elasticbeanstalk-us-west-1-213805526570',
            Prefix: 'resources/environments/logs/publish/',
            MaxKeys: 100
        };
        if(!startDate) {
            startDate = moment.utc('2017-08-05T00:00').toDate();
        }
        if(!endDate) {
            endDate = moment.utc('2017-08-05T03:00').toDate();
        }
        console.log('startDate:', startDate);
        console.log('endDate:', endDate);
        console.log('filter:', filter);

        AWS.config.update(awsConfigs);
        var s3 = new AWS.S3({params: params});
        s3.listObjects(params).
            on('success', function handlePage(r) {
                //... handle page of contents r.data.Contents
                async.eachSeries(r.data.Contents, function(content, cb){
                    var logName = content.Key.substr(content.Key.lastIndexOf('/') + 1);
                    var logNameParts = logName.split('.');
                    var logDate = moment.unix(logNameParts[1].substr(4));
                    if(logDate.isBetween(startDate, endDate)) {

                        if(!filter || (filter && logNameParts[0].indexOf(filter) > 0)) {
                            console.log(content.Key);
                            var file = fs.createWriteStream('./' + logName);
                            s3.getObject({Bucket: 'elasticbeanstalk-us-west-1-213805526570', Key:content.Key}).createReadStream().pipe(file);
                            file.on('finish', function(){cb();});
                        } else {
                            console.log('[skipped] ' + content.Key);
                            cb();
                        }
                    } else {
                        cb();
                    }
                }, function(err){
                    if(err) {
                        console.log('Error:', err);
                        fn();
                    }
                    if(r.hasNextPage()) {
                        // There's another page; handle it
                        //console.log('{more}');
                        r.nextPage().on('success', handlePage).send();
                    } else {
                        console.log('Done');
                        fn();
                    }
                });


            }).
            on('error', function(r) {
                console.log('Error:', r);
                fn();
            }).
            send();
    }

};

module.exports = grabber;
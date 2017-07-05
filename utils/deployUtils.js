var AWS = require('aws-sdk');
var blueEnvironment = 'indiwebTestB-env';
var greenEnvironment = 'indiwebTestB-Green';
var async = require('async');

var deployUtils = {

    finishDeploy: function(cb){
        /*
         * Promote deploy to Blue
         * Swap CNAMEs
         * Terminate Green
         */
        var elasticbeanstalk = new AWS.ElasticBeanstalk({apiVersion: '2010-12-01'});
        elasticbeanstalk.describeEnvironments({EnvironmentNames: [
            greenEnvironment
        ]}, function(err, value){
            if(err) {
                console.error('Error getting version:', err);
                cb(err);
            } else {
                var versionLabel = value.Environments[0].VersionLabel;
                var updateParams = {
                    EnvironmentName: blueEnvironment,
                    VersionLabel: versionLabel
                };
                console.log('Updating ' + blueEnvironment);
                elasticbeanstalk.updateEnvironment(updateParams, function(err, value){
                    if(err) {
                        console.error('Error updating environment:', err);
                        cb(err);
                    } else {
                        console.log('waiting to check the environment');
                        setTimeout(function(){
                            async.retry({times:30, interval:10000}, function(cb){
                                elasticbeanstalk.describeEnvironments({EnvironmentNames:[blueEnvironment]}, function(err, value){
                                    if(value && value.Environments && value.Environments[0] && value.Environments[0].Status && value.Environments[0].Status === 'Ready') {
                                        cb(value.Environments[0]);
                                    } else {
                                        console.log('Not ready:', value);
                                        cb('Not Ready');
                                    }
                                });
                            }, function(err, results){
                                console.log('Environment:', results);
                                console.log('Swapping CNAMEs');
                                var cnameParams = {
                                    DestinationEnvironmentName: blueEnvironment,
                                    SourceEnvironmentName: greenEnvironment
                                };
                                elasticbeanstalk.swapEnvironmentCNAMEs(params, function(err, data) {
                                    if(err) {
                                        console.log('Error swapping CNAMEs', err);
                                        cb(err);
                                    } else {
                                        var params = {
                                            EnvironmentName: greenEnvironment
                                        };
                                        console.log('Terminating ' + greenEnvironment);
                                        elasticbeanstalk.terminateEnvironment(params, function(err, data) {
                                            if(err) {
                                                console.error('Error terminating:', err);
                                            }
                                            cb(err);
                                        });
                                    }

                                });
                            });
                        }, 10000);
                    }
                });
            }


        });

    },

    rollbackDeploy: function(cb){
        /*
         * Swap CNAMEs
         * Terminate Green
         */
    }

};

module.exports = deployUtils;
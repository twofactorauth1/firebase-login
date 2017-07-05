var AWS = require('aws-sdk');
var blueEnvironment = 'indiwebTestB-env';
var greenEnvironment = 'indiwebTestB-Green';
var async = require('async');
var awsConfigs = require('../configs/aws.config');

var deployUtils = {

    finishDeploy: function(cb){
        /*
         * Promote deploy to Blue
         * Swap CNAMEs
         * Terminate Green
         */
        var options = {
            accessKeyId: 'AKIAIS2VFA3QL7JVKQQQ',
            secretAccessKey: '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',
            region: 'us-west-1',
            apiVersion: '2010-12-01'
        };
        var elasticbeanstalk = new AWS.ElasticBeanstalk(options);
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
                            async.retry({times:30, interval:10000}, function(callback){
                                elasticbeanstalk.describeEnvironments({EnvironmentNames:[blueEnvironment]}, function(err, value){
                                    if(value && value.Environments && value.Environments[0] && value.Environments[0].Status && value.Environments[0].Status === 'Ready') {
                                        callback(null, value.Environments[0]);
                                    } else {
                                        console.log('Not ready:', value);
                                        callback('Not Ready');
                                    }
                                });
                            }, function(err, results){
                                console.log('Environment:', results);
                                console.log('Swapping CNAMEs');
                                var cnameParams = {
                                    DestinationEnvironmentName: blueEnvironment,
                                    SourceEnvironmentName: greenEnvironment
                                };
                                elasticbeanstalk.swapEnvironmentCNAMEs(cnameParams, function(err, data) {
                                    if(err) {
                                        console.log('Error swapping CNAMEs', err);
                                        cb(err);
                                    } else {
                                        setTimeout(function(){
                                            console.log('waiting for CNAME swap');
                                            async.retry({times:30, interval:10000}, function(callback){
                                                elasticbeanstalk.describeEnvironments({EnvironmentNames:[greenEnvironment]}, function(err, value){
                                                    if(value && value.Environments && value.Environments[0] && value.Environments[0].Status && value.Environments[0].Status === 'Ready') {
                                                        callback(null, value.Environments[0]);
                                                    } else {
                                                        console.log('Not ready:', value);
                                                        callback('Not Ready');
                                                    }
                                                });
                                            }, function(err, results){
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
                                            });
                                        }, 5000);

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
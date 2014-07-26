/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseDao = require('./base.dao');
var constants = requirejs('constants/constants');
require('../models/course');


var dao = {

        options: {
            name: "course.dao",
            defaultModel: $$.m.Course
        },

        updateCourse: function (playlistId, playlistToUpdate) {
            this.findByIdAndUpdate(playlistId,
                {$set: {"title": playlistToUpdate.title,
                    "template": playlistToUpdate.template,
                    "subtitle": playlistToUpdate.subtitle,
                    "body": playlistToUpdate.body,
                    "description": playlistToUpdate.description,
                    "subdomain": playlistToUpdate.subdomain,
                    "price": playlistToUpdate.price}},
                {safe: true},
                function (error, updatedPlaylist) {
                    if (error) {
                        return res.json({success: false, error: error.message});
                    } else {
                        return res.json({success: true, result: updatedPlaylist});
                    }
                }
            );
        },

        deleteCourse: function (playlistToRemoveId) {

            return this.remove({_id: playlistToRemoveId});
        },

        getCoursesList: function (userId) {
            return this.find({userId: userId});
        },

        addVideoToCourse: function (req, res) {
            var playlistId = req.params.id;
            var videoToAdd = req.body;
            Playlist.findByIdAndUpdate(
                playlistId,
                {$push: {videos: videoToAdd}},
                {safe: true, upsert: true},
                function (error, playlist) {
                    if (error) {
                        return res.json({success: false, error: error.message});
                    } else {
                        return res.json({success: true, result: {}});
                    }
                }
            );
        },

        updateVideoInPlaylist: function (req, res) {
            var playlistId = req.params.id;
            var videoToUpdate = req.body;
            Playlist.findOneAndUpdate(
                { _id: playlistId, videos: { $elemMatch: { videoId: videoToUpdate.videoId} } },
                {$set: {"videos.$.videoTitle": videoToUpdate.videoTitle,
                    "videos.$.videoSubtitle": videoToUpdate.videoSubtitle,
                    "videos.$.videoBody": videoToUpdate.videoBody,
                    "videos.$.scheduledHour": videoToUpdate.scheduledHour,
                    "videos.$.scheduledMinute": videoToUpdate.scheduledMinute,
                    "videos.$.scheduledDay": videoToUpdate.scheduledDay,
                    "videos.$.subject": videoToUpdate.subject,
                    "videos.$.isPremium": videoToUpdate.isPremium}},
                {safe: true},
                function (error, updatedPlaylist) {
                    if (error) {
                        return res.json({success: false, error: error.message});
                    } else {
                        return res.json({success: true, result: videoToUpdate});
                    }
                }
            );
        },

        deleteVideoFromPlaylist: function (req, res) {
            var playlistId = req.params.id;
            var videoToRemoveId = req.params.videoId;
            this.findByIdAndUpdate(playlistId, {$pull: {videos: {videoId: videoToRemoveId}}}, function (error, playlist) {
                if (error) {
                    return res.json({success: false, error: error.message});
                } else {
                    return res.json({success: true, result: {}});
                }
            });
        },

        isSubdomainFree: function (req, res) {
            this.findOne({subdomain: req.query.subdomain}, function (error, playlist) {
                if (error) {
                    res.json({success: false, error: error.message});
                } else {
                    if (playlist == null) {
                        res.json({success: true, result: true});
                    } else {
                        res.json({success: true, result: false});
                    }
                }
            });
        }
    }
    ;

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.UserDao = dao;

module.exports = dao;

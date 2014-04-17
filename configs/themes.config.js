/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var awsConfig = require('./aws.config');

module.exports = {

    THEME_ID_SIGNATURE_SECRET: "my#super!signature$secret&",

    PATH_TO_THEMES: "templates/cms/themes",

    DEFAULT_ENGINE: "handlebars",

    getImageUrl: function(themeId, imageName) {
        return this._getAssetUrl(themeId, "images", imageName);
    },

    getVideoUrl: function(themeId, videoName) {
        return this._getAssetUrl(themeId, "videos", imageName);
    },

    getIconUrl: function(themeId, iconName) {
        return this._getAssetUrl(themeId, "icons", imageName);
    },

    _getAssetUrl: function(themeId, type, fileName) {
        var url = "https://s3.amazonaws.com/" + awsConfig.BUCKETS.THEMES;
        if (themeId != null) {
            url += "/" + themeId;
        }
        url += "/assets/" + type + "/" + fileName;
        return url;
    }
};

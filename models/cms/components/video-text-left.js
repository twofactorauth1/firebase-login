/**
 * The Video component.
 *
 * Stores data that supports the display of a single video and optional
 * text on the left of the video.  If text is available, it is either to the right or th left of the video.
 */
var VideoText = require('./video-text');

var component = VideoText.extend({

    initialize: function(options) {
        this.__super__.initialize(options);

        this.set({
            type:"video-text-left",
            inherits:"video-text",
            position:"left"
        });
    }
});


$$.m.cms = $$.m.cms || {};
$$.m.cms.modules = $$.m.cms.modules || {};
$$.m.cms.modules.VideoTextLeft = component;

module.exports = component;
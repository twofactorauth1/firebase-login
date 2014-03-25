/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

/**
 * The Video component.
 *
 * Stores data that supports the display of a single video and optional
 * text on the right of the video.  If text is available, it is either to the right or th left of the video.
 */
var VideoText = require('./video-text');

var component = VideoText.extend({

    initialize: function(options) {
        this.__super__.initialize(options);

        this.set({
            type:"video-text-right",
            inherits:"video-text",
            position:"right"
        });
    }
});


$$.m.cms = $$.m.cms || {};
$$.m.cms.modules = $$.m.cms.modules || {};
$$.m.cms.modules.VideoTextRight = component;

module.exports = component;
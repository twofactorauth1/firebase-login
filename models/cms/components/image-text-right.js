/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

/**
 * The Image component.
 *
 * Stores data that supports the display of a single image and optional
 * text on the right of the image.  If text is available, it is either to the right or th left of the video.
 */
var ImageText = require('./image-text');

var component = ImageText.extend({

    initialize: function(options) {
        this.__super__.initialize(options);

        this.set({
            type:"image-text-right",
            inherits:"image-text",
            position:"right"
        });
    }
});


$$.m.cms = $$.m.cms || {};
$$.m.cms.modules = $$.m.cms.modules || {};
$$.m.cms.modules.ImageTextRight = component;

module.exports = component;
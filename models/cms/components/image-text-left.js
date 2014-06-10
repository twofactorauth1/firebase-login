/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

/**
 * The Image component.
 *
 * Stores data that supports the display of a single image and optional
 * text on the left of th image.  If text is available, it is either to the right or th left of the video.
 */
var ImageText = require('./image-text');

var component = ImageText.extend({

    initialize: function(options) {
        this.__super__.initialize(options);

        this.set({
            type:"image-text-left",
            inherits:"image-text",
            position:"left"
        });
    }
});


$$.m.cms = $$.m.cms || {};
$$.m.cms.modules = $$.m.cms.modules || {};
$$.m.cms.modules.ImageTextLeft = component;

module.exports = component;
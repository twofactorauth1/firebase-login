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
 * text.  If text is available, it is either to the right or th left of the video.
 */

/*
    {
        "_id" : "w12b442s-0034-2f09-4h65-33423h8898767",
        "anchor" : "about-us",
        "type" : "image-text",
        "version" : 1,
        "visibility" : true,
        "title" : "<h2>About</h2>",
        "subtitle" : "Katya Meyers",
        "text" : "<h4 style='color:#26b69f;'>Katya Meyers</h4><p class='mb15'><b>Pro Triathlete</b></p><p>A ballerina at the age of four, her parents soon added gymnastics to the mix to keep her from bouncing off the walls.  After a serious knee injury her Senior year in high school ended her gymnastics career, Katya did not give up her dreams of competing as a Division I varsity athlete.  Picking up an oar, she rowed crew for the Stanford Cardinal for 3 years before stumbling upon the University Triathlon Team.  With just one practice under her belt, a collection of borrowed equipment, and no swimming or biking experience to speak of, Meyers entered her first race that same week.</p>",
        "imagePosition" : "left",

        "imgurl" : "http://s3.amazonaws.com/indigenous-digital-assets/account_15/about-section_1416293355812.png",
        "url" : "            <img ng-src=\"http://s3.amazonaws.com/indigenous-digital-assets/account_15/about-section_1416293355812.png\" class=\"img-responsive img-circle\" src=\"http://s3.amazonaws.com/indigenous-digital-assets/account_15/about-section_1416293355812.png\">        "
    }
*/
require('../../../models/base.model.js');

var component = $$.m.ModelBase.extend({

    defaults: function() {
        return {

            /**
             * The ID of this copmonent
             */
            _id: null,

            /**
             * Some themes may use this anchor to create
             * navigation directly to thise component
             */
            anchor: null,

            /**
             * The type of component this is
             */
            type: "image-text",

            /**
             * Version
             */
            version: 1,

            /**
             *
             *
             */
            title : "<h1>Intro</h1><h4 style=\"text-align: center;\">A LITTLE ABOUT US</h4>",

            /**
             *
             *
             */
            text : "<p><br></p><p>This is the Image Text component and it is very versatile. You can use it for an about us section or any image that may need a little more explanation. &nbsp;The image can be on the right or left side. The image doesn't even need to be an image! You can insert any icon in the images place.</p>",

            /**
             *
             *
             */
            txtcolor : "#ffffff",

            /**
             * The position of the image relative to the text, left, right, center
             *
             * @see $$.m.cms.modules.ImageText.IMAGE_POSITION
             */
            imagePosition: "left",

            /**
             * The url of the image
             */
            imgsection: "<p><img data-cke-saved-src=\"http://s3.amazonaws.com/indigenous-digital-assets/account_6/rocket-icon-512x512_1421971689163.png\" src=\"http://s3.amazonaws.com/indigenous-digital-assets/account_6/rocket-icon-512x512_1421971689163.png\" style=\"width: 175px; height: 175px;\">​​</p>",

            /**
             *
             *
             */
            bg: {
                img : {
                    url : "",
                    width : null,
                    height : null,
                    parallax : false,
                    blur : false,
                    overlay: false,
                    show: false
                },
                color : "#32373f"
            },

            /**
             *
             *
             */
            btn : {
                visibility: true,
                text : "Learn More",
                url : "#features",
                icon : "fa fa-rocket"
            },

            visibility: true
        }
    },


    initialize: function(options) {

    }


}, {

    IMAGE_POSITION: {
        LEFT: "left",
        RIGHT: "right",
        CENTER: "center"
    },


    validate: function() {

    }
});

$$.m.cms = $$.m.cms || {};
$$.m.cms.modules = $$.m.cms.modules || {};
$$.m.cms.modules.ImageText = component;

module.exports = component;

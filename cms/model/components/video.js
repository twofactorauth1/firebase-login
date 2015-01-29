/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

/**
 * The Contact Us Component
 *
 * Stores data that represents information required
 * to dispaly Contact Us information
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
            type: "video",

            /**
             * Version
             */
            version: 1,

            /**
             *
             *
             */
            title : "<h1>Video Title</h1>",

            /**
             *
             *
             */
            subtitle : "<h4>Lorem ipsum dolor sit amet, consectetur adipisicing elit. </h4>",

            /**
             *
             *
             */
            videoType: 'html5',
            /**
            *
            *
            */
            video : "",
            videoMp4: '',
            videoWebm: '',

            /**
             *
             *
             */
             videoAutoPlay: false,
             videoControls: true,
             videoBranding: true,
             videoWidth: 780,
             videoHeight: 320,
             videoImage: '',
            txtcolor : "#ffffff",

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
                color : "#4bb0cb"
            },

            /**
             *
             *
             */
            btn : {
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

    validate: function() {

    }
});

$$.m.cms = $$.m.cms || {};
$$.m.cms.modules = $$.m.cms.modules || {};
$$.m.cms.modules.Video = component;

module.exports = component;

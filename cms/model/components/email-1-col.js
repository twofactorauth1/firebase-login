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
            type: "email-1-col",


            /**
             * The version of the component
             *
             */
            version: 1,

            /**
             *
             *
             */
            txtcolor: '#888888',

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
                color : ""
            },

            spacing: {"pt":0,"pb":0,"pl":0,"pr":0,"mt":0,"mb":"0","mr":"auto","ml":"auto","mw":1024,"usePage":false},

            text: '<div style="text-align: left;"><br></div><div style="text-align: left;"><span style="font-family: Quicksand, sans-serif; color: rgb(0, 0, 0); font-size: 14px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam vitae justo lacinia, rhoncus nulla in, suscipit ipsum. Praesent eu faucibus arcu. Curabitur ac dui ut est rhoncus accumsan et non ex. Pellentesque porttitor nisi at scelerisque rutrum. Maecenas sit amet ornare orci, non rutrum ante. Fusce sed arcu ac tortor porta faucibus et non quam. Fusce placerat nunc pharetra lectus aliquam, nec sagittis arcu ornare. Interdum et malesuada fames ac ante ipsum primis in faucibus</span></div><div data-empty="true" style="text-align: center;"><br></div><div style="text-align: center;"><span style="font-family: Quicksand, sans-serif; font-size: 14px;"><a class="btn btn-primary ssb-theme-btn ssb-element ssb-element-button" data-ssb-active-style=" background-color: ;" data-ssb-class="{&quot;ssb-element&quot;:true,&quot;ssb-element-button&quot;:true,&quot;ssb-hide-during-load&quot;:false}" data-ssb-hover-style=" background-color: ;" data-ssb-style=" " href="www.indigenous.io" ng-attr-style="{{vm.elementStyle()}}" ng-class="vm.elementClass()" style=" "><strong>Full Menu</strong></a></span><br><br><br><br></div>'

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
$$.m.cms.modules.Email1Col = component;

module.exports = component;

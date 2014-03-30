/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

/**
 * Logo list component
 *
 * Stores data that represents a list of logos used for marketing purposes.
 */
require('../../base.model.js');

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
            type: "logo-list",

            /**
             * The label for the component
             * (optional)
             */
            label:"",

            /**
             * A description that appears at the top of the component
             * (optional)
             */
            description:"",

            /**
             * An array of logo objects of the form
             * [{
             *      label: "",              //The label to display beneat the icon
             *      description: "",        //The description to display beneath th elabel
             *      url: null               //The URL of the icon / image
             *      iconClass: null         //The classname of the icon to display
             * ]}
             */
            logos: []
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
$$.m.cms.modules.LogoList = component;

module.exports = component;

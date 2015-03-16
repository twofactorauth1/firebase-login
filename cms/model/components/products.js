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

            txtcolor : "#444",

            title : "<div style=\"text-align: center;\"><span style=\"font-size:28px;\">Welcome to Our Store<br></span><br></div>",

            text : "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Recusandae culpa reprehenderit porro quod repudiandae nisi fuga voluptatem commodi animi numquam aliquid corporis ea vero distinctio fugit error, maiores officiis vel id laboriosam nemo soluta. Vitae cum quae mollitia similique recusandae, voluptatum, debitis ipsam eaque libero, veniam rem rerum facilis id minima.&nbsp;",

            /**
             * The type of component this is
             */
            type: "products",

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
$$.m.cms.modules.Products = component;

module.exports = component;

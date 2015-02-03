/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

/**
 * The Social Component
 *
 * Stores data that represents information required
 * to dispaly Social information
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
            type: "text-only",


            /**
             * The version of the component
             *
             */
            version: 1,

            /**
             *
             *
             */
            txtcolor: '#ffffff',


            text: '<p><span style=\"font-size:24px;\">Some Text</span></p><p><span style=\"font-size:24px;\"></span>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nulla quae nesciunt, veritatis adipisci sit, consequatur accusamus in laboriosam amet repellendus ducimus mollitia ad labore quisquam voluptas porro esse. Dolore reiciendis, quos molestiae dolorum, officiis sapiente. Cumque vitae placeat aspernatur! Modi repellat, deleniti dolorum iste illum, esse excepturi magnam quibusdam, similique delectus est aliquam autem dolores possimus accusamus expedita nulla provident maxime eligendi ullam ad. Consequuntur ea officia nam quos, deserunt, nemo architecto repellat neque et ad natus! Asperiores pariatur distinctio amet repellendus aspernatur deleniti ipsa animi quis nesciunt quia quod eius, ex sapiente, neque quae quaerat labore. Debitis, quaerat, fugiat.<span style=\"font-size:18px;\"></span></p><p><span style=\"font-size: 24px;\">Some More Text</span></p><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nulla quae nesciunt, veritatis adipisci sit, consequatur accusamus in laboriosam amet repellendus ducimus mollitia ad labore quisquam voluptas porro esse. Dolore reiciendis, quos molestiae dolorum, officiis sapiente. Cumque vitae placeat aspernatur! Modi repellat, deleniti dolorum iste illum, esse excepturi magnam quibusdam, similique delectus est aliquam autem dolores possimus accusamus expedita nulla provident maxime eligendi ullam ad. Consequuntur ea officia nam quos, deserunt, nemo architecto repellat neque et ad natus! Asperiores pariatur distinctio amet repellendus aspernatur deleniti ipsa animi quis nesciunt quia quod eius, ex sapiente, neque quae quaerat labore. Debitis, quaerat, fugiat.</p>',

            /**
             * Background 
             *  - with url of background image, width/height of that image, if the image is parallax, if the image needs a blur, if the image has an overlay, if to show the the image, or image color
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
                color : "#044f67"
            },


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
$$.m.cms.modules.TextOnly = component;

module.exports = component;

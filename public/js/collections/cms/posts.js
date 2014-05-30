/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'models/post'
], function(Post) {

    var collection = Backbone.Collection.extend({

        model: $$.m.Post,

    });

    $$.c.Posts = collection;

    return collection;
});
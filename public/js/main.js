/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

if (typeof CACHEBUSTER === 'undefined') {
    CACHEBUSTER = "12345"
}

require.config({
    paths: {
        jquery: 'libs/jquery/jquery',
        jqueryvalidate: 'libs/jquery/jquery.validate',
        jqueryeasing: 'libs/jquery/jquery.easing',
        underscore: 'libs/underscore/underscore',
        json2: 'libs/json/json2',
        backbone: 'libs/backbone/backbone',
        backboneAssoc: 'libs/backbone/backbone-associations',
        backboneNested: 'libs/backbone/backbone-nested',
        backboneExtended: 'libs/backbone/backboneExtended',
        handlebars: 'libs/handlebars/handlebars',
        handlebarsHelpers: 'libs/handlebars/handlebarshelpers',
        indigenousHelpers: 'libs/handlebars/indigenoushelpers',
        bootstrap: 'libs/bootstrap/bootstrap',
        modernizr: 'libs/modernizr/modernizr',
        templates: '../templates',
        namespaces: 'utils/namespaces',
        commonutils: 'utils/commonutils',
        viewManager: 'utils/viewmanager',
        templateManager: 'utils/templatemanager',
        appsetup: 'utils/appsetup',
        pushStateUtils: 'utils/pushstateutils',
        usersData: 'global/users.data',
        app: 'app',
        text: "libs/requirejs/plugins/text",
        leaflet: 'libs/leaflet/leaflet',
        colorthief: 'libs/colorthief/colorthief',
        waypoints: 'libs/waypoints/waypoints.min',

        //UI SPECIFIC
        toggles: 'libs/misc/toggles.min'
    },

    shim: {
        jqueryvalidate: {
            deps: ['jquery']
        },
        jqueryeasing: {
            deps: ['jquery']
        },
        underscore: {
            deps: ['jquery'],
            exports: "_"
        },
        handlebars: {
            exports: "Handlebars"
        },
        backbone: {
            deps: ['jquery','underscore', 'json2'],
            exports: "Backbone"
        },
        backboneAssoc: {
            deps: ['backbone', 'backboneExtended']
        },
        backboneNested: {
            deps: ['backbone', 'backboneExtended']
        },
        backboneExtended: {
            deps: ['backbone']
        },
        bootstrap: {
            deps: ['jquery']
        },
        commonutils: {
            deps: ['underscore']
        },
        viewManager: {
            deps: ['backbone','backboneExtended']
        },
        handlebarsHelpers: {
            deps: ['underscore', 'handlebars','commonutils']
        },
        indigenousHelpers: {
            deps: ['underscore', 'handlebars', 'commonutils']
        },
        appsetup: {
            deps: ['commonutils']
        },
        pushStateUtils: {
            deps: []
        },
        toggles: {
            deps: ['jquery']
        },
        app: {
            deps: [
                'jquery',
                'jqueryvalidate',
                'jqueryeasing',
                'underscore',
                'backbone',
                'backboneExtended',
                'bootstrap',
                'handlebars',
                'modernizr',

                //UI SPECIFIC
                'toggles',
                'leaflet',
                'colorthief',
                'waypoints',
            ]
        }
    },

    map: {
        '*': {
            'css': "libs/requirejs/plugins/css",
            'normalize': "libs/requirejs/plugins/normalize",
            'text': "libs/requirejs/plugins/text"
        }
    }
});

require.config({
    baseUrl: '/js',

    urlArgs: "version=" + CACHEBUSTER,

    enforceDefine: false
});


define([
    'app'
], function (app) {
    $(document).ready(function(){
        app.initialize();
        // Page Preloader
    });
});

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
        jquery: 'libs/jquery/dist/jquery',
        jqueryvalidate: 'libs/jquery-validate/dist/jquery.validate',
        jqueryeasing: 'libs/jquery-easing/jquery.easing',
        jqueryUI: 'libs/jquery-ui/jquery-ui.min',
        underscore: 'libs/underscore/underscore',
        json2: 'libs/json2/json2',
        backbone: 'libs/backbone/backbone',
        backboneAssoc: 'libs/backbone-associations/backbone-associations',
        backboneNested: 'libs/backbone-nested-model/backbone-nested',
        backboneExtended: 'libs_misc/backbone/backboneExtended',
        handlebars: 'libs/handlebars/handlebars',
        handlebarsHelpers: 'libs_misc/handlebars/handlebarshelpers',
        indigenousHelpers: 'libs_misc/handlebars/indigenoushelpers',
        bootstrap: 'libs/bootstrap/dist/js/bootstrap',
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
        text: "libs/requirejs-plugins/lib/text",
        colorthief: 'libs/color-thief/dist/color-thief.min',
        waypoints: 'libs/jquery-waypoints/waypoints',
        nestable: 'libs/nestable/jquery.nestable',
        date: 'libs/datejs/build/production/date.min',
        d3: 'libs/d3/d3',
        moment: 'libs/moment/min/moment.min',
        daterangepicker: 'libs/bootstrap-daterangepicker/daterangepicker',
        jquerydragdrop: 'libs/jquerydraganddrop/jquery.drag-drop.plugin',

        //UI SPECIFIC
        toggles: 'libs_misc/toggles.min',
        datepicker: 'libs/bootstrap-datepicker/js/bootstrap-datepicker',
        leaflet: 'libs/leaflet/dist/leaflet',
        tagsinput: 'libs/jquery.tagsinput/jquery.tagsinput.min',
        gritter: 'libs/jquery.gritter/js/jquery.gritter.min'
    },

    shim: {
        jqueryvalidate: {
            deps: ['jquery']
        },
        jqueryeasing: {
            deps: ['jquery']
        },
        jqueryUI: {
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
        moment: {
            deps: ['jquery']
        },
        daterangepicker: {
            deps: ['jquery', 'moment']
        },
        jquerydragdrop: {
            deps: ['jquery']
        },

        tagsinput: {
            deps: ['jquery']
        },

        gritter: {
            deps: ['jquery']
        },

        waypoints: {
            deps: ['jquery']
        },

        app: {
            deps: [
                'jquery',
                'jqueryvalidate',
                'jqueryeasing',
                'jqueryUI',
                'underscore',
                'backbone',
                'backboneExtended',
                'bootstrap',
                'handlebars',
                'modernizr',
                'jquerydragdrop',

                //UI SPECIFIC
                'toggles',
                'leaflet',
                'colorthief',
                'waypoints',
                'nestable',
                'date',
                'moment',
                'daterangepicker',
                'datepicker',
                'tagsinput',
                'd3',
                'gritter'
            ]
        }
    },

    map: {
        '*': {
            'css': "libs/require-css/css",
            'normalize': "libs_misc/requirejs/normalize",
            'text': "libs/requirejs-plugins/lib/text"
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

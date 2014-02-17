if (typeof CACHEBUSTER === 'undefined') {
    CACHEBUSTER = '2014.02.15'
}

require.config({
    paths: {
        jqueryvalidate: 'libs/jquery/jquery.validate',
        underscore: 'libs/underscore/underscore',
        json2: 'libs/json/json2',
        backbone: 'libs/backbone/backbone',
        backboneAssoc: 'libs/backbone/backbone-associations',
        backboneExtended: 'libs/backbone/backboneExtended',
        handlebars: 'libs/handlebars/handlebars.runtime',
        handlebarsHelpers: 'libs/handlebars/handlebarshelpers',
        bootstrap: 'libs/bootstrap/bootstrap',
        templates: '../templates',
        namespaces: 'utils/namespaces',
        commonutils: 'utils/commonutils',
        viewManager: 'utils/viewmanager',
        templateManager: 'utils/templatemanager',
        appsetup: 'utils/appsetup',
        pushStateUtils: 'utils/pushstateutils',
        usersData: 'global/users.data',
        app: 'app'
    },

    shim: {
        jqueryvalidate: {
            deps: []
        },
        underscore: {
            exports: "_"
        },
        handlebars: {
            exports: "Handlebars"
        },
        backbone: {
            deps: ['underscore', 'json2'],
            exports: "Backbone"
        },
        backboneAssoc: {
            deps: ['backbone']
        },
        backboneExtended: {
            deps: ['backbone']
        },
        bootstrap: {
            //deps: []
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
        appsetup: {
            deps: ['commonutils']
        },
        pushStateUtils: {
            deps: []
        },
        app: {
            deps: [
                'jqueryvalidate',
                'underscore',
                'backbone',
                'backboneExtended',
                'handlebars',
                'bootstrap',
                'handlebars'
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
    'app',
], function (app) {
    $(document).ready(function(){
        app.initialize();
    });
});

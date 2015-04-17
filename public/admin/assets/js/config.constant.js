'use strict';

/**
 * Config constant
 */


app.constant('APP_MEDIAQUERY', {
    'desktopXL': 1200,
    'desktop': 992,
    'tablet': 768,
    'mobile': 480
});

app.constant('hoursConstant', {
    HOURS: ["5:00 am", "5:30 am", "6:00 am", "6:30 am", "7:00 am", "7:30 am", "8:00 am", "8:30 am", "9:00 am", "9:30 am", "10:00 am", "10:30 am", "11:00 am", "11:30 am", "12:00 pm", "12:30 pm", "1:00 pm", "1:30 pm", "2:00 pm", "2:30 pm", "3:00 pm", "3:30 pm", "4:00 pm", "4:30 pm", "5:00 pm", "5:30 pm", "6:00 pm", "6:30 pm", "7:00 pm", "7:30 pm", "8:00 pm", "8:30 pm", "9:00 pm", "9:30 pm", "10:00 pm", "10:30 pm", "11:00 pm", "11:30 pm", "12:00 am"]
});

app.constant('social', {
    types: {
        LOCAL: "lo",
        FACEBOOK: "fb",
        TWITTER: "tw",
        LINKEDIN: "li",
        GOOGLE: "go",
        FULL_CONTACT: "fc",

        dp: [{
                label: "Local",
                data: "lo"
            }, {
                label: "Facebook",
                data: "fb"
            }, {
                label: "Twitter",
                data: "tw"
            }, {
                label: "LinkedIn",
                data: "li"
            }, {
                label: "Google+",
                data: "go"
            }
            //{label:"Full Contacnt", data:"fc"}
        ]
    }
});

app.constant('contactConstant', {
    customer_activity_types: {
        PAGE_VIEW: "PAGE_VIEW",
        SUBSCRIBE: "SUBSCRIBE",
        CONTACT_CREATED: "CONTACT_CREATED",
        EMAIL: "EMAIL",
        PHONECALL: "PHONECALL",
        FACEBOOK_LIKE: "FACEBOOK_LIKE",
        TWEET: "TWEET",

        dp: [{
            label: "Page View",
            data: "PAGE_VIEW"
        }, {
            label: "Subscribe",
            data: "SUBSCRIBE"
        }, {
            label: "Contact Created",
            data: "CONTACT_CREATED"
        }, {
            label: "Emails",
            data: "EMAIL"
        }, {
            label: "Phone Calls",
            data: "PHONECALL"
        }, {
            label: "Facebook Likes",
            data: "FACEBOOK_LIKE"
        }, {
            label: "Tweets",
            data: "TWEET"
        }]
    }
});

app.constant('userConstant', {
    credential_types: {
        LOCAL: "lo",
        FACEBOOK: "fb",
        TWITTER: "tw",
        LINKEDIN: "li",
        GOOGLE: "go",
        FULL_CONTACT: "fc",
    },

    detail_types: {
        LOCAL: "lo",
        FACEBOOK: "fb",
        TWITTER: "tw",
        LINKEDIN: "li",
        GOOGLE: "go",
        FULL_CONTACT: "fc",
    },

    contact_types: {
        CUSTOMER: "cu",
        COLLEAGUE: "co",
        FRIEND: "fr",
        MEMBER: "mb",
        FAMILY: "fa",
        ADMIN: "ad",
        LEAD: 'ld',
        OTHER: "ot",

        dp: [{
            label: "Customer",
            data: "cu"
        }, {
            label: "Colleague",
            data: "co"
        }, {
            label: "Friend",
            data: "fr"
        }, {
            label: "Member",
            data: "mb"
        }, {
            label: "Family",
            data: "fa"
        }, {
            label: "Admin",
            data: "ad"
        }, {
            label: 'Lead',
            data: 'ld'
        }, {
            label: "Other",
            data: "ot"
        }]
    },

    phone_types: {
        MOBILE: "m",
        HOME: "h",
        WORK: "w",

        dp: [{
            label: "mobile",
            data: "m"
        }, {
            label: "home",
            data: "h"
        }, {
            label: "work",
            data: "w"
        }]
    },

    device_types: {
        scale: "2net_scale",
        HOME: "h",
        WORK: "w",

        dp: [{
            label: "2net_scale",
            data: "2net_scale"
        }, {
            label: "home",
            data: "h"
        }, {
            label: "work",
            data: "w"
        }]
    },

    activity_types: {
        PHONE: "p",
        EMAIL: "e"
    }
});

app.constant('ENV', {
    name: 'development',
    stripeKey: 'pk_test_EuZhZHVourE3RaRxELJaYEya',
    segmentKey: 'vVXdSwotRr',
    keenWriteKey: '98f22da64681d5b81e2abb7323493526d8d258f0d355e95f742335b4ff1b75af2709baa51d16b60f168158fe7cfd8d1de89d637ddf8a9ca721859b009c4b004d443728df52346307e456f0511b3e82be4a96efaa9f6dcb7f847053e97eee2b796fc3e2d1a57bb1a86fb07d2e00894966',
    keenReadKey: '16348ac352e49c12881e5a32ee37fdd6167ead382071330af9788d9c9e6cae41a8b3fb663bc59bb19e0ec0968bf1c4bdd9f62f29d6545663863932805ff6eac7df34c9202db4f294c0d8cd70d9c9846a99ea00d85f973dfa41e6448e9d05e9ecad9f9ffcb7a7e146dba7de20642e892a',
    keenProjectId: '547edcea46f9a776b6579e2c',
    googleAnalyticsId: 'ga:82461709',
    googleAnalyticsScope: 'ga:pageviews,ga:timeOnPage,ga:exits,ga:avgTimeOnPage,ga:entranceRate,ga:entrances,ga:exitRate,ga:uniquePageviews',
    googleClientId: '277102651227-koaeib7b05jjc355thcq3bqtkbuv1o5r.apps.googleusercontent.com',
    googleClientSecret: 'lg41TWgRgRfZQ22Y9Qd902pH',
    googleServerKey: 'AIzaSyCAkloYlXlZx_---WXevaNHv03ReYpnvLs',
    twonetKey: '36ODKJ1HdJD1y29hk203',
    twonetSecret: 'OMItCcxnrlI0db67HhPKkIM70ZhHZcJe',
    twonetUserGuid: '50f97bb9-a38d-46eb-8e5a-d1716aed1da3',
    twonetTrackGuid: 'b64d7234-2398-021d-2b64-b5999a31aaff'
});

app.constant('JS_REQUIRES', {
    //*** Scripts
    scripts: {
        //*** Javascript Plugins
        'modernizr': ['../js/libs/components-modernizr/modernizr.js'],
        'moment': ['../js/libs/moment/min/moment.min.js'],
        'spin': '../js/libs/spin.js/spin.js',
        'underscore': '../js/libs/underscore/underscore-min.js',

        'stripe': 'https://js.stripe.com/v2/?tmp',

        //*** jQuery Plugins
        'perfect-scrollbar-plugin': ['../js/libs/perfect-scrollbar/js/min/perfect-scrollbar.jquery.min.js', '../js/libs/perfect-scrollbar/css/perfect-scrollbar.min.css'],
        'ladda': ['../js/libs/ladda/dist/ladda.min.js', '../js/libs/ladda/dist/ladda-themeless.min.css'],
        'sweet-alert': ['../js/libs/sweetalert/lib/sweet-alert.min.js', '../js/libs/sweetalert/lib/sweet-alert.css'],
        'chartjs': '../js/libs/chartjs/Chart.min.js',
        'jquery-sparkline': '../js/libs/jquery.sparkline.build/dist/jquery.sparkline.min.js',
        'ckeditor-plugin': '../js/libs/ckeditor/ckeditor.js',
        'jquery-nestable-plugin': ['../js/libs/jquery-nestable/jquery.nestable.js'],
        'touchspin-plugin': ['../js/libs/bootstrap-touchspin/dist/jquery.bootstrap-touchspin.min.js', '../js/libs/bootstrap-touchspin/dist/jquery.bootstrap-touchspin.min.css'],
        'bootstrap': '../js/libs/bootstrap/dist/js/bootstrap.min.js',
        'bootstrap-icon-picker': ['../js/libs/bootstrap-icon-picker/bootstrap-iconpicker/js/bootstrap-iconpicker.min.js', '../js/libs/bootstrap-icon-picker/bootstrap-iconpicker/js/iconset/iconset-fontawesome-4.2.0.min.js'],
        'spectrum': ['../js/libs/spectrum/spectrum.js', '../js/libs/angular-spectrum-colorpicker/dist/angular-spectrum-colorpicker.min.js'],
        'uuid': '../js/libs_misc/uuid.js',
        'angular-cookie': '../js/libs/angular-cookie/angular-cookie.min.js',

        //*** Controllers
        'dashboardCtrl': 'assets/js/controllers/dashboardCtrl.js',
        'helpTopicsCtrl': 'assets/js/controllers/helpTopicsCtrl.js',
        'gettingStartedCtrl': 'assets/js/controllers/gettingStartedCtrl.js',
        'pagesCtrl': 'assets/js/controllers/pagesCtrl.js',
        'siteAnalyticsCtrl': 'assets/js/controllers/siteAnalyticsCtrl.js',
        'editorCtrl': 'assets/js/controllers/editorCtrl.js',
        'billingCtrl': 'assets/js/controllers/billingCtrl.js',
        'postsCtrl': 'assets/js/controllers/postsCtrl.js',
        'socialFeedCtrl': 'assets/js/controllers/socialFeedCtrl.js',
        'customersCtrl': 'assets/js/controllers/customersCtrl.js',
        'customerDetailCtrl': 'assets/js/controllers/customerDetailCtrl.js',
        'productsCtrl': 'assets/js/controllers/productsCtrl.js',
        'productsDetailCtrl': 'assets/js/controllers/productsDetailCtrl.js',
        'iconsCtrl': 'assets/js/controllers/iconsCtrl.js',
        'vAccordionCtrl': 'assets/js/controllers/vAccordionCtrl.js',
        'ckeditorCtrl': 'assets/js/controllers/ckeditorCtrl.js',
        'laddaCtrl': 'assets/js/controllers/laddaCtrl.js',

        'cropCtrl': 'assets/js/controllers/cropCtrl.js',
        'asideCtrl': 'assets/js/controllers/asideCtrl.js',
        'toasterCtrl': 'assets/js/controllers/toasterCtrl.js',
        'sweetAlertCtrl': 'assets/js/controllers/sweetAlertCtrl.js',
        'mapsCtrl': 'assets/js/controllers/mapsCtrl.js',
        'ordersCtrl': 'assets/js/controllers/ordersCtrl.js',
        'orderDetailCtrl': 'assets/js/controllers/orderDetailCtrl.js',
        'integrationsCtrl': 'assets/js/controllers/integrationsCtrl.js',
        'chartsCtrl': 'assets/js/controllers/chartsCtrl.js',
        'calendarCtrl': 'assets/js/controllers/calendarCtrl.js',
        'nestableCtrl': 'assets/js/controllers/nestableCtrl.js',
        'validationCtrl': ['assets/js/controllers/validationCtrl.js'],
        'userCtrl': ['assets/js/controllers/userCtrl.js'],
        'selectCtrl': 'assets/js/controllers/selectCtrl.js',
        'wizardCtrl': 'assets/js/controllers/wizardCtrl.js',
        'uploadCtrl': 'assets/js/controllers/uploadCtrl.js',
        'treeCtrl': 'assets/js/controllers/treeCtrl.js',
        'inboxCtrl': 'assets/js/controllers/inboxCtrl.js',
        'xeditableCtrl': 'assets/js/controllers/xeditableCtrl.js',
        'chatCtrl': 'assets/js/controllers/chatCtrl.js',

        //*** Services
        'productService': 'assets/js/services/product.js',
        'paymentService': 'assets/js/services/product.js',
        'toasterService': 'assets/js/services/toaster.js',
        'websiteService': 'assets/js/services/webiste.js',
        'userService': 'assets/js/services/user.js',
        'customerService': 'assets/js/services/customer.js',
        'ImportContactService': 'assets/js/services/import_contacts.js',
        'chartAnalyticsService': 'assets/js/services/chart_analytics.js',
        'keenService': 'assets/js/services/keen.js',
        'commonService': 'assets/js/services/common.js',
        'socialConfigService': 'assets/js/services/socialconfig.js',
        'orderService': 'assets/js/services/order.js',
        'assetsService': 'assets/js/services/assets.js',

        //*** Filters
        'htmlToPlaintext': 'assets/js/filters/htmlToPlaintext.js',
        'secTotime': 'assets/js/filters/secTotime.js',
        'formatText': 'assets/js/filters/formatText.js',
        'offset': 'assets/js/filters/offset.js',
        'timeAgoFilter': 'assets/js/filters/timeAgoFilter.js',

        //*** Directives
        'mediaModal': 'assets/js/directives/mediadirective.js',

        //*** Utils
        'namespaces': '../js/utils/namespaces.js',
    },
    //*** angularJS Modules
    modules: [{
        name: 'angularMoment',
        files: ['../js/libs/angular-moment/angular-moment.min.js']
    }, {
        name: 'angularFilter',
        files: ['../js/libs/angular-filter/dist/angular-filter.min.js']
    }, {
        name: 'toaster',
        files: ['../js/libs/AngularJS-Toaster/toaster.js', '../js/libs/AngularJS-Toaster/toaster.css']
    }, {
        name: 'angularBootstrapNavTree',
        files: ['../js/libs/angular-bootstrap-nav-tree/dist/abn_tree_directive.js', '../js/libs/angular-bootstrap-nav-tree/dist/abn_tree.css']
    }, {
        name: 'angular-ladda',
        files: ['../js/libs/angular-ladda/dist/angular-ladda.min.js']
    }, {
        name: 'smart-table',
        files: ['../js/libs/angular-smart-table/dist/smart-table.min.js']
    }, {
        name: 'ui.select',
        files: ['../js/libs/angular-ui-select/dist/select.min.js', '../js/libs/angular-ui-select/dist/select.min.css', '../js/libs/select2/dist/css/select2.min.css', '../js/libs/select2-bootstrap-css/select2-bootstrap.min.css', '../js/libs/selectize/dist/css/selectize.bootstrap3.css']
    }, {
        name: 'ui.mask',
        files: ['../js/libs/angular-ui-utils/mask.min.js']
    }, {
        name: 'ngImgCrop',
        files: ['../js/libs/ngImgCrop/compile/minified/ng-img-crop.js', '../js/libs/ngImgCrop/compile/minified/ng-img-crop.css']
    }, {
        name: 'angularFileUpload',
        files: ['../js/libs/angular-file-upload/angular-file-upload.min.js']
    }, {
        name: 'ngAside',
        files: ['../js/libs/angular-aside/dist/js/angular-aside.min.js', '../js/libs/angular-aside/dist/css/angular-aside.min.css']
    }, {
        name: 'highcharts',
        files: ['../js/libs/highcharts-release/adapters/standalone-framework.js', '../js/libs/highcharts-release/highcharts.js', '../js/libs/highcharts-ng/dist/highcharts-ng.min.js']
    }, {
        name: 'highmaps',
        files: ['../js/libs/highcharts-release/modules/funnel.js', '../js/libs/highmaps-release/modules/map.js', '../js/libs_misc/highmaps/us-all.js']
    }, {
        name: 'truncate',
        files: ['../js/libs/angular-truncate/src/truncate.js']
    }, {
        name: 'oitozero.ngSweetAlert',
        files: ['../js/libs/angular-sweetalert-promised/SweetAlert.min.js']
    }, {
        name: 'monospaced.elastic',
        files: ['../js/libs/angular-elastic/elastic.js']
    }, {
        name: 'ngMap',
        files: ['../js/libs/ngmap/build/scripts/ng-map.min.js']
    }, {
        name: 'tc.chartjs',
        files: ['../js/libs/tc-angular-chartjs/dist/tc-angular-chartjs.min.js']
    }, {
        name: 'flow',
        files: ['../js/libs/ng-flow/dist/ng-flow-standalone.min.js']
    }, {
        name: 'uiSwitch',
        files: ['../js/libs/angular-ui-switch/angular-ui-switch.min.js', '../js/libs/angular-ui-switch/angular-ui-switch.min.css']
    }, {
        name: 'ckeditor',
        files: ['../js/libs/angular-ckeditor/angular-ckeditor.min.js']
    }, {
        name: 'mwl.calendar',
        files: ['../js/libs/angular-bootstrap-calendar/dist/js/angular-bootstrap-calendar.js', '../js/libs/angular-bootstrap-calendar/dist/js/angular-bootstrap-calendar-tpls.js', '../js/libs/angular-bootstrap-calendar/dist/css/angular-bootstrap-calendar.min.css']
    }, {
        name: 'ng-nestable',
        files: ['../js/libs/ng-nestable/src/angular-nestable.js']
    }, {
        name: 'vAccordion',
        files: ['../js/libs/v-accordion/dist/v-accordion.min.js', '../js/libs/v-accordion/dist/v-accordion.min.css']
    }, {
        name: 'xeditable',
        files: ['../js/libs/angular-xeditable/dist/js/xeditable.min.js', '../js/libs/angular-xeditable/dist/css/xeditable.css', 'assets/js/config/config-xeditable.js']
    }, {
        name: 'checklist-model',
        files: ['../js/libs/checklist-model/checklist-model.js']
    }, {
        name: 'slugifier',
        files: ['../js/libs/angular-slugify/angular-slugify.js']
    }, {
        name: 'dateRangePicker',
        files: ['../js/libs/angular-daterangepicker/js/angular-daterangepicker.min.js', '../js/libs/bootstrap-daterangepicker/daterangepicker.js']
    }, {
        name: 'ui.sortable',
        files: ['../js/libs/ng-sortable/dist/ng-sortable.min.js']
    }, {
        name: 'wu.masonry',
        files: ['../js/libs/angular-masonry/angular-masonry.js', '../js/libs/masonry/dist/masonry.pkgd.min.js']
    }]
});

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

/*

  {
    type: "element",
    selector: ".edit-account a",
    heading: "Edit Account tab.",
    text: "Click Edit Account tab to upload your logo and enter your information. Remember to click Save in the upper right hand corner, and then review under the Profile tab.",
    placement: "bottom",
    scroll: false
  }

*/

app.constant('ONBOARDINGCONSTANT', {

  tasks: [{
    pane: {
      heading: "Sign up for Indigenous",
      text: "You have taken the first step in growing your business.",
      taskKey: 'sign_up',
      state: 'app.support.gettingstarted',
      minRequire: false
    },
    steps: []
  }, {
    pane: {
      heading: "Basic account information",
      text: "Enter basic information about your business like your address and logo.",
      taskKey: 'profile_business',
      state: 'app.account.profilebusiness',
      minRequire: true
    },
    steps: [{
      type: 'title',
      heading: "Basic account information",
      text: "Enter basic information about your business like your address and logo."
    }]
  }, {
    pane: {
      heading: "Billing",
      text: "Manage the type of account you have and your method of payment.",
      taskKey: 'billing',
      state: 'app.account.billing',
      minRequire: false
    },
    steps: [{
      type: 'title',
      heading: "Manage your account type and payment method",
      text: "Select your plan and enter your payment method for your Indigenous account."
    }]
  }, {
    pane: {
      heading: "Homepage",
      text: "Choose a template and begin customizing your site.",
      taskKey: 'single_page',
      state: 'app.website.pages',
      minRequire: true
    },
    steps: [{
      type: "title",
      heading: "Choose a template and customize your site",
      text: "Click on New Page in the upper right corner and select a template. Name the page and check the box by Add to Main Menu.",
    }]
  }, {
    pane: {
      heading: "Social accounts",
      text: "Connect your social accounts so you can import contacts and create targeted marketing campaigns.",
      taskKey: 'integrations',
      state: 'app.account.integrations',
      minRequire: true
    },
    steps: [{
      type: 'title',
      heading: "Social accounts",
      text: "Connect your social accounts so you can import contacts and create targeted marketing campaigns."
    }]
  }, {
    pane: {
      heading: "Contacts",
      text: "Import contacts from various accounts or create them individually.",
      taskKey: 'customers',
      state: 'app.customers',
      minRequire: true
    },
    steps: [{
      type: 'title',
      heading: "Contacts",
      text: "Import contacts from various accounts or create them individually."
    }]
  }, {
    pane: {
      heading: "Social Feed",
      text: "Add social feeds of your friends.",
      taskKey: 'social_feed',
      state: 'app.marketing.socialfeed',
      minRequire: true
    },
    steps: [{
      type: 'title',
      heading: "Social Feed",
      text: "Add social feeds of your friends."
    }]

  }, {
    pane: {
      heading: "Blog",
      text: "Keep everyone up to date and informed with a regular blog.",
      taskKey: 'single_post',
      state: 'app.website.posts',
      minRequire: true
    },
    steps: [{
      type: 'title',
      heading: "Blog",
      text: "Keep everyone up to date and informed with a regular blog."
    }]
  }, {
    pane: {
      heading: "Commerce",
      text: "Import or create new products to start selling and creating revenue.",
      taskKey: 'commerce',
      state: 'app.commerce.products',
      minRequire: true
    },
    steps: [{
      type: 'title',
      heading: "Commerce",
      text: "Import or create new products to start selling and creating revenue.",
    }]
  }, {
    pane: {
      heading: "Dashboard",
      text: "Now everything is set up. It's time to start tracking.",
      taskKey: 'dashboard',
      state: 'app.dashboard',
      minRequire: false
    },
    steps: [{
      type: 'title',
      heading: "Dashboard",
      text: "Now everything is set up. It's time to start tracking."
    }]
  }]

});

app.constant('orderConstant', {
  order_status: {
    PENDING_PAYMENT: "pending_payment",
    PROCESSING: "processing",
    ON_HOLD: "on_hold",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
    REFUNDED: "refunded",
    FAILED: "failed",

    dp: [{
        label: "Pending Payment",
        data: "pending_payment"
      }, {
        label: "Processing",
        data: "processing"
      }, {
        label: "On Hold",
        data: "on_hold"
      }, {
        label: "Completed",
        data: "completed"
      }, {
        label: "Refunded",
        data: "refunded"
      }, {
        label: "Failed",
        data: "failed"
      }, {
        label: "Cancelled",
        data: "cancelled"
      }
    ]
  }
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
    FORM_SUBMISSION: 'FORM_SUBMISSION',
    EMAIL_DELIVERED: 'EMAIL_DELIVERED',
    EMAIL_OPENED: 'EMAIL_OPENED',
    EMAIL_CLICKED: 'EMAIL_CLICKED',
    EMAIL_UNSUB: 'EMAIL_UNSUB',
    SUBSCRIPTION_PAID: 'SUBSCRIPTION_PAID',
    SUBSCRIBE_CANCEL: 'SUBSCRIBE_CANCEL',
    ACCOUNT_CREATED: 'ACCOUNT_CREATED',
    dp: [{
      label: "Account Created",
      data: "ACCOUNT_CREATED"
    },{
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
    }, {
      label: "Form Submission",
      data: "FORM_SUBMISSION"
    }, {
      label: "Email Delivered",
      data: "EMAIL_DELIVERED"
    }, {
      label: "Email Opened",
      data: "EMAIL_OPENED"
    }, {
      label: "Email Clicked",
      data: "EMAIL_CLICKED"
    }, {
      label: "Email UnSubscribe",
      data: "EMAIL_UNSUB"
    }, {
      label: "Subscription Paid",
      data: "SUBSCRIPTION_PAID"
    }, {
      label: "Subscribe Cancel",
      data: "SUBSCRIBE_CANCEL"
    }, {
      label: "Other",
      data: "OTHER"
    }]
  }
});

app.constant('postConstant', {
  post_status: {
    PUBLISHED: 'PUBLISHED',
    DRAFT: 'DRAFT',
    FUTURE: 'FUTURE',
    PRIVATE: 'PRIVATE',

    dp: [{
        label: "Published",
        data: "PUBLISHED"
      }, {
        label: "Draft",
        data: "DRAFT"
      }, {
        label: "Future",
        data: "FUTURE"
      }, {
        label: "Private",
        data: "PRIVATE"
      }
    ]
  }
});

// {
//   name: 'Digital',
//   value: 'digital'
// }, {
//   name: 'Subscription',
//   value: 'subscription'
// }, {
//   name: 'External',
//   value: 'external'
// }, {
//   name: 'Virtual',
//   value: 'virtual'
// }

app.constant('productConstant', {
  product_types: {
    DIGITAL: 'DIGITAL',
    SUBSCRIPTION: 'SUBSCRIPTION',
    EXTERNAL: 'EXTERNAL',
    VIRTUAL: 'VIRTUAL',

    dp: [{
        label: "Digital",
        data: "DIGITAL"
      }, {
        label: "Subscription",
        data: "SUBSCRIPTION"
      }, {
        label: "External",
        data: "EXTERNAL"
      }, {
        label: "Virtual",
        data: "VIRTUAL"
      }
    ]
  }
});

app.constant('userConstant', {

  social_types: {
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
  },

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

/*
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
*/

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
    'jsVideoUrlParser': '../js/libs/jsVideoUrlParser/dist/jsVideoUrlParser.min.js',
    'jquery-nestable-plugin': ['../js/libs_misc/jquery-nestable/jquery.nestable.js'],
    'touchspin-plugin': ['../js/libs/bootstrap-touchspin/dist/jquery.bootstrap-touchspin.min.js', '../js/libs/bootstrap-touchspin/dist/jquery.bootstrap-touchspin.min.css'],
    // 'bootstrap': '../js/libs/bootstrap/dist/js/bootstrap.min.js',
    // 'bootstrap-icon-picker': ['../js/libs/bootstrap-icon-picker/bootstrap-iconpicker/js/iconset/iconset-fontawesome-4.2.0.min.js', '../js/libs/bootstrap-icon-picker/bootstrap-iconpicker/js/bootstrap-iconpicker.min.js'],
    "bootstrap-confirmation": ['../js/libs/bootstrap-confirmation/bootstrap-confirmation.js'],
    'spectrum': ['../js/libs/spectrum/spectrum.js', '../js/libs/angular-spectrum-colorpicker/dist/angular-spectrum-colorpicker.min.js'],
    'uuid': '../js/libs_misc/uuid.js',
    'angular-cookie': '../js/libs/angular-cookie/angular-cookie.min.js',
    'ckeditor': '../js/libs_misc/ckeditor/ckeditor.js',

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
    'profileBusinessCtrl': 'assets/js/controllers/profileBusinessCtrl.js',
    'profilePersonalCtrl': 'assets/js/controllers/profilePersonalCtrl.js',
    'templatesCtrl': 'assets/js/controllers/templatesCtrl.js',
    'integrationsCtrl': 'assets/js/controllers/integrationsCtrl.js',
    'orderDetailCtrl': 'assets/js/controllers/orderDetailCtrl.js',
    'settingsCtrl': 'assets/js/controllers/settingsCtrl.js',
    'emailsCtrl': 'assets/js/controllers/emailsCtrl.js',
    'addComponentModalCtrl': 'assets/js/controllers/modals/addComponentModalCtrl.js',
    'componentSettingsModalCtrl': 'assets/js/controllers/modals/componentSettingsModalCtrl.js',

    'asideCtrl': 'assets/js/controllers/asideCtrl.js',
    'toasterCtrl': 'assets/js/controllers/toasterCtrl.js',
    'sweetAlertCtrl': 'assets/js/controllers/sweetAlertCtrl.js',
    'mapsCtrl': 'assets/js/controllers/mapsCtrl.js',
    'ordersCtrl': 'assets/js/controllers/ordersCtrl.js',
    'selectCtrl': 'assets/js/controllers/selectCtrl.js',
    'wizardCtrl': 'assets/js/controllers/wizardCtrl.js',
    'uploadCtrl': 'assets/js/controllers/uploadCtrl.js',
    'treeCtrl': 'assets/js/controllers/treeCtrl.js',
    'inboxCtrl': 'assets/js/controllers/inboxCtrl.js',
    'xeditableCtrl': 'assets/js/controllers/xeditableCtrl.js',
    'chatCtrl': 'assets/js/controllers/chatCtrl.js',

    //*** Services
    'accountService': 'assets/js/services/account.js',
    'productService': 'assets/js/services/product.js',
    'paymentService': 'assets/js/services/product.js',
    'websiteService': 'assets/js/services/webiste.js',
    'userService': 'assets/js/services/user.js',
    'customerService': 'assets/js/services/customer.js',
    'toasterService': 'assets/js/services/toaster.js',
    'ImportContactService': 'assets/js/services/import_contacts.js',
    'chartAnalyticsService': 'assets/js/services/chart_analytics.js',
    'chartCommerceService': 'assets/js/services/chart_commerce.js',
    'keenService': 'assets/js/services/keen.js',
    'commonService': 'assets/js/services/common.js',
    'socialConfigService': 'assets/js/services/socialconfig.js',
    'orderService': 'assets/js/services/order.js',
    'assetsService': 'assets/js/services/assets.js',
    'geocodeService': 'assets/js/services/geocode.js',
    //*** Filters
    'htmlToPlaintext': 'assets/js/filters/htmlToPlaintext.js',
    'secTotime': 'assets/js/filters/secTotime.js',
    'formatText': 'assets/js/filters/formatText.js',
    'offset': 'assets/js/filters/offset.js',
    'timeAgoFilter': 'assets/js/filters/timeAgoFilter.js',
    'titleCase': 'assets/js/filters/titleCase.js',
    'orderByArrayLength': 'assets/js/filters/orderByArrayLength.js',
    'toTrusted': 'assets/js/filters/to_trusted.js',
    'generateURLforLinks': 'assets/js/filters/generateURLforLinks.js',
    'selectedTags': 'assets/js/filters/productTags.js',

    //*** Directives
    'mediaModal': 'assets/js/directives/mediadirective.js',

    //*** Utils
    'namespaces': '../js/utils/namespaces.js'


  },
  //*** angularJS Modules
  modules: [
      {
          name: 'config',
          files: ['assets/js/config.js']
      },
  {
    name: 'angularMoment',
    files: ['../js/libs/angular-moment/angular-moment.min.js']
  }, {
    name: 'angularFilter',
    files: ['../js/libs/angular-filter/dist/angular-filter.min.js']
  }, {
    name: 'toaster',
    files: ['../js/libs/AngularJS-Toaster/toaster.js', '../js/libs/AngularJS-Toaster/toaster.css']
  }, {
    name: 'skeuocard',
    files: ['../js/libs/skeuocard/lib/js/jquery.card.js']
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
    files: ['../js/libs/angular-ui-select/dist/select.min.js', '../js/libs/angular-ui-select/dist/select.min.css', '../js/libs/select2/select2.css', '../js/libs/select2-bootstrap-css/select2-bootstrap.min.css', '../js/libs/selectize/dist/css/selectize.bootstrap3.css']
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
    name: 'infinite-scroll',
    files: ['../js/libs/ngInfiniteScroll/build/ng-infinite-scroll.min.js']
  }, {
    name: 'ngAside',
    files: ['../js/libs/angular-aside/dist/js/angular-aside.min.js', '../js/libs/angular-aside/dist/css/angular-aside.min.css']
  }, {
    name: 'highcharts',
    files: ['../js/libs/highcharts-release/adapters/standalone-framework.js', '../js/libs/highcharts-release/highcharts.js', '../js/libs/highcharts-ng/dist/highcharts-ng.min.js']
  },{
    name: 'highmaps',
    files: ['../js/libs/highcharts-release/modules/funnel.js', '../js/libs/highmaps-release/modules/map.js', '../js/libs_misc/highmaps/us-all.js']
  },{
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
    files: ['../js/libs/Sortable/Sortable.min.js', '../js/libs/Sortable/ng-sortable.js']
  }, {
    name: 'angular-slider',
    files: ['../js/libs/angularjs-slider/dist/rzslider.min.js', '../js/libs/angularjs-slider/dist/rzslider.min.css']
  }, {
    name: 'ngSticky',
    files: ['../js/libs/ngSticky/dist/sticky.min.js']
  }, {
    name: 'slick',
    files: ['../js/libs/slick-carousel/slick/slick.js', '../js/libs/angular-slick/dist/slick.js']
  }, {
    name: 'jqcloud',
    files: ["../js/libs/jqcloud2/dist/jqcloud.min.js", "../js/libs/angular-jqcloud/angular-jqcloud.js"]
  },
  {
    name: 'wu.masonry',
    files: ['../js/libs/angular-masonry/angular-masonry.js', '../js/libs/masonry/dist/masonry.pkgd.min.js']
  }, {
    name: 'ngTextTruncate',
    files: ['../js/libs/ng-text-truncate/ng-text-truncate.js']
  }, {
    name: 'ngTagsInput',
    files: ['../js/libs/ng-tags-input/ng-tags-input.min.js']
  }, {
    name: 'blueimp',
    files: ['../js/libs/blueimp-gallery/js/jquery.blueimp-gallery.min.js', '../js/libs/blueimp-gallery/css/blueimp-gallery.min.css']
  }, {
    name: 'ngJoyRide',
    files: ['../js/libs/ng-joyride/ng-joyride.js']
  }]
});

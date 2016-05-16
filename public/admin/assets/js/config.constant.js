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
  HOURS: ["00:30 am", "1:00 am", "1:30 am", "2:00 am", "2:30 am", "3:00 am", "3:30 am", "4:00 am", "4:30 am", "5:00 am", "5:30 am", "6:00 am", "6:30 am", "7:00 am", "7:30 am", "8:00 am", "8:30 am", "9:00 am", "9:30 am", "10:00 am", "10:30 am", "11:00 am", "11:30 am", "12:00 pm", "12:30 pm", "1:00 pm", "1:30 pm", "2:00 pm", "2:30 pm", "3:00 pm", "3:30 pm", "4:00 pm", "4:30 pm", "5:00 pm", "5:30 pm", "6:00 pm", "6:30 pm", "7:00 pm", "7:30 pm", "8:00 pm", "8:30 pm", "9:00 pm", "9:30 pm", "10:00 pm", "10:30 pm", "11:00 pm", "11:30 pm", "12:00 am"]
});

app.constant('formValidations', {
   'email': /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i,
   'phone': /^\(?(\d{3})\)?[ .-]?(\d{3})[ .-]?(\d{4})$/,
   'zip': /(^\d{5}$)|(^\d{5}-\d{4}$)/,
   'extension': /^[0-9]*$/,
   'customerTags': /^[a-z\d\-_\s]+$/i
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
  },
  MAX_ORDER_DAYS : 15
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
        label: "Google",
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
  },
  customer_tags:{
    dp:[{
      label: "Admin",
      data: "ad"
    }, {
      label: "Affiliate",
      data: "af"
    }, {
        label: 'Anonymous Donor',
        data: 'and'
    }, {
      label: "Cancelled Customer",
      data: "cc"
    }, {
      label: "Cancelled Trial Customer",
      data: "ct"
    }, {
      label: "Cheatsheet Lead",
      data: "cs"
    }, {
      label: "Colleague",
      data: "co"
    }, {
      label: "Customer",
      data: "cu"
    }, {
      label: "Expired Trial Customer",
      data: "ex"
    }, {
      label: "Family",
      data: "fa"
    }, {
      label: "Friend",
      data: "fr"
    }, {
      label: "Lead",
      data: "ld"
    }, {
      label: "Member",
      data: "mb"
    }, {
      label: "Other",
      data: "ot"
    }, {
      label: "Trial Customer",
      data: "tc"
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

app.constant('pageConstant', {
  page_handles: {
    BLOG: 'blog',
    SINGLEPOST: 'single-post',
  },
  inValidPageHandles:{
     'home': 'home',
    'login': 'login',
    'logout': 'logout',
    'admin': 'admin',
    'redirect': 'redirect',
    'template': 'template',
    'demo': 'demo',
    'admin1': 'admin1',
    'interim': 'interim',
    'unsubscribe': 'unsubscribe',
    'forgotpassword': 'forgotpassword',
    'current-user': 'current-user',
    'signup': 'signup'
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
    DONATION: 'DONATION',

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
    }, {
            label: 'Donation',
            data: 'DONATION'
    }
    ]
  },
  product_status_types:{
    BACKORDER: 'backorder',
    INACTIVE: 'inactive',
    ACTIVE: 'active',
    AUTOINACTIVE: 'auto_inactive',

    dp: [{
        label: "Backorder",
        data: "backorder"
      }, {
        label: "Inactive",
        data: "inactive"
      }, {
        label: "Active",
        data: "active"
      }, {
        label: "Auto Inactive",
        data: "auto_inactive"
      }
    ]
  }
});

app.constant('accountConstant', {
  plan_types: {
    TRIAL: 'NO_PLAN_ARGUMENT',
  },
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
        label: "Google",
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
    STRIPE: "st",
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
    NOTAG: "nt",
    CANCELLED_CUSTOMER: "cc",
    CANCELLED_TRIAL: "ct",
    CHEATSHEET_LEAD: "cs",
    EXPIRED_TRIAL: "ex",
    TRIAL_CUSTOMER: "tc",
    AFFILIATE: "af",

    dp: [{
      label: "Admin",
      data: "ad"
    }, {
      label: "Affiliate",
      data: "af"
    }, {
      label: "Cancelled Customer",
      data: "cc"
    }, {
      label: "Cancelled Trial Customer",
      data: "ct"
    }, {
      label: "Cheatsheet Lead",
      data: "cs"
    }, {
      label: "Colleague",
      data: "co"
    }, {
      label: "Customer",
      data: "cu"
    }, {
      label: "Expired Trial Customer",
      data: "ex"
    }, {
      label: "Family",
      data: "fa"
    }, {
      label: "Friend",
      data: "fr"
    }, {
      label: "Lead",
      data: "ld"
    }, {
      label: "Member",
      data: "mb"
    }, {
      label: "Other",
      data: "ot"
    }, {
      label: "Trial Customer",
      data: "tc"
    }, {
      label: "No Tag",
      data: "nt"
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
  },

  personal_profile: {
    PASSWORD_PLACEHOLDER: "profile_password",
  },
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

    'google-fonts': 'https://ajax.googleapis.com/ajax/libs/webfont/1.5.18/webfont.js',

    //*** jQuery Plugins
    'perfect-scrollbar-plugin': ['../js/libs/perfect-scrollbar/js/min/perfect-scrollbar.jquery.min.js', '../js/libs/perfect-scrollbar/css/perfect-scrollbar.min.css'],
    'ladda': ['../js/libs/ladda/dist/ladda.min.js', '../js/libs/ladda/dist/ladda-themeless.min.css'],
    'chartjs': '../js/libs/chartjs/Chart.min.js',
    'jquery-sparkline': '../js/libs/jquery.sparkline.build/dist/jquery.sparkline.min.js',
    'jsVideoUrlParser': '../js/libs/js-video-url-parser/dist/jsVideoUrlParser.min.js',
    'jquery-nestable-plugin': ['../js/libs_misc/jquery-nestable/jquery.nestable.js'],
    'touchspin-plugin': ['../js/libs/bootstrap-touchspin/dist/jquery.bootstrap-touchspin.min.js', '../js/libs/bootstrap-touchspin/dist/jquery.bootstrap-touchspin.min.css'],
    // 'bootstrap': '../js/libs/bootstrap/dist/js/bootstrap.min.js',
    "bootstrap-confirmation": ['../js/libs/bootstrap-confirmation/bootstrap-confirmation.js'],
    'uuid': '../js/libs_misc/uuid.js',
    'ckeditor': '../js/libs_misc/ckeditor/ckeditor.js',
    'papaParse': '../js/libs/papaparse/papaparse.min.js',
    'string_score': '../js/libs/string_score/string_score.min.js',

    //*** Controllers
    'dashboardCtrl': 'assets/js/controllers/dashboardCtrl.js',
    'helpTopicsCtrl': 'assets/js/controllers/helpTopicsCtrl.js',
    'newHelpTopicsCtrl': 'assets/js/controllers/newHelpTopicsCtrl.js',
    'pagesCtrl': 'assets/js/controllers/pagesCtrl.js',
    'siteAnalyticsCtrl': 'assets/js/controllers/siteAnalyticsCtrl.js',
    'editorCtrl': 'assets/js/controllers/editorCtrl.js',
    'billingCtrl': 'assets/js/controllers/billingCtrl.js',
    'postsCtrl': 'assets/js/controllers/postsCtrl.js',
    'socialFeedCtrl': 'assets/js/controllers/socialFeedCtrl.js',
    'contactsCtrl': 'assets/js/controllers/contactsCtrl.js',
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
    'manageTopicsCtrl': 'assets/js/controllers/manageTopicsCtrl.js',
    'integrationsCtrl': 'assets/js/controllers/integrationsCtrl.js',
    'orderDetailCtrl': 'assets/js/controllers/orderDetailCtrl.js',
    'settingsCtrl': 'assets/js/controllers/settingsCtrl.js',
    'emailsCtrl': 'assets/js/controllers/emailsCtrl.js',
    'campaignsCtrl': 'assets/js/controllers/campaignsCtrl.js',
    'createCampaignCtrl': 'assets/js/controllers/createCampaignCtrl.js',
    'addComponentModalCtrl': 'assets/js/controllers/modals/addComponentModalCtrl.js',
    'componentSettingsModalCtrl': 'assets/js/controllers/modals/componentSettingsModalCtrl.js',
    'ssbComponentSettingsModalCtrl': 'assets/js/controllers/modals/ssbComponentSettingsModalCtrl.js',
    'mediaModalCtrl': 'assets/js/controllers/modals/mediaModalCtrl.js',
    'templateSettingsModalCtrl': 'assets/js/controllers/modals/templateSettingsModalCtrl.js',
    'importCustomerModalCtrl': 'assets/js/controllers/modals/importCustomerModalCtrl.js',
    'onboardingCtrl': 'assets/js/controllers/onboardingCtrl.js',
    'DOHYCtrl': 'assets/js/dashboard/dashboard.controller.js',
    // 'DashboardWorkstreamTileComponent': 'assets/js/dashboard/dashboard-workstream-tile/dashboard-workstream-tile.component.js',
    'DashboardWorkstreamTileComponentController': 'assets/js/dashboard/dashboard-workstream-tile/dashboard-workstream-tile.controller.js',
    // 'DashboardAnalyticTileComponent': 'assets/js/dashboard/dashboard-analytic-tile/dashboard-analytic-tile.component.js',
    'DashboardAnalyticTileComponentController': 'assets/js/dashboard/dashboard-analytic-tile/dashboard-analytic-tile.controller.js',

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
    'campaignService': 'assets/js/services/campaign.js',
    'toasterService': 'assets/js/services/toaster.js',
    'ImportContactService': 'assets/js/services/import_contacts.js',
    'chartAnalyticsService': 'assets/js/services/chart_analytics.js',
    'chartCommerceService': 'assets/js/services/chart_commerce.js',
    'chartEmailService': 'assets/js/services/chart_email.js',
    'keenService': 'assets/js/services/keen.js',
    'commonService': 'assets/js/services/common.js',
    'socialConfigService': 'assets/js/services/socialconfig.js',
    'orderService': 'assets/js/services/order.js',
    'assetsService': 'assets/js/services/assets.js',
    'geocodeService': 'assets/js/services/geocode.js',
    'dashboardService': 'assets/js/dashboard/dashboard.service.js',
    'simpleSiteBuilderService': 'assets/js/ssb-site-builder/ssb-site-builder.service.js',
    'indiLoginModalService': 'assets/js/indi-login-modal/indi-login-modal.service.js',
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
    'propsFilter': 'assets/js/filters/propsFilter.js',
    'cleanType': 'assets/js/filters/cleanType.js',
    'filterPages': 'assets/js/filters/filterPages.js',
    'sortListPages': 'assets/js/filters/sortListPages.js',

    //*** Directives
    'mediaModal': 'assets/js/directives/mediadirective.js'


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
    files: ['../js/libs/AngularJS-Toaster/toaster.min.js', '../js/libs/AngularJS-Toaster/toaster.min.css']
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
    files: ['../js/libs_misc/angular-ui-select/dist/select.js', '../js/libs_misc/angular-ui-select/dist/select.min.css', '../js/libs/select2/select2.css', '../js/libs/select2-bootstrap-css/select2-bootstrap.min.css', '../js/libs/selectize/dist/css/selectize.bootstrap3.css']
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
    files: ['../js/libs/angular-sweetalert-promised/SweetAlert.min.js', '../js/libs_misc/sweetalert/lib/sweet-alert.js', '../js/libs/sweetalert/lib/sweet-alert.css']
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
    name: 'xeditable',
    files: ['../js/libs/angular-xeditable/dist/js/xeditable.min.js', '../js/libs/angular-xeditable/dist/css/xeditable.css']
  }, {
    name: 'checklist-model',
    files: ['../js/libs/checklist-model/checklist-model.js']
  }, {
    name: 'slugifier',
    files: ['../js/libs/angular-slugify/angular-slugify.js']
  }, {
    name: 'dateRangePicker',
    files: ['../js/libs/angular-daterangepicker/js/angular-daterangepicker.min.js', '../js/libs/bootstrap-daterangepicker/daterangepicker.js', '../js/libs/bootstrap-daterangepicker/daterangepicker-bs3.css']
  }, {
    name: 'angular-slider',
    files: ['../js/libs/angularjs-slider/dist/rzslider.min.js', '../js/libs/angularjs-slider/dist/rzslider.min.css']
  }, {
    name: 'ngCurrency',
    files: ['../js/libs/ng-currency/dist/ng-currency.min.js']
  }, {
    name: 'ngSticky',
    files: ['../js/libs/ngSticky/dist/sticky.min.js']
  }, {
    name: 'ipCookie',
    files: ['../js/libs/angular-cookie/angular-cookie.min.js']
  }, {
    name: 'slick',
    files: ['../js/libs/slick-carousel/slick/slick.min.js', '../js/libs/angular-slick/dist/slick.min.js']
  }, {
    name: 'jqcloud',
    files: ["../js/libs/jqcloud2/dist/jqcloud.min.js", "../js/libs/angular-jqcloud/angular-jqcloud.js", "../js/libs/jqcloud2/dist/jqcloud.min.css"]
  }, {
    name: 'wu.masonry',
    files: ['../js/libs/angular-masonry/angular-masonry.js', '../js/libs/masonry/dist/masonry.pkgd.min.js', '../js/libs/imagesloaded/imagesloaded.pkgd.min.js']
  }, {
    name: 'ngTextTruncate',
    files: ['../js/libs/ng-text-truncate/ng-text-truncate.js']
  }, {
    name: 'ngTagsInput',
    files: ['../js/libs/ng-tags-input/ng-tags-input.min.js', '../js/libs/ng-tags-input/ng-tags-input.min.css', '../js/libs/ng-tags-input/ng-tags-input.bootstrap.min.css']
  }, {
    name: 'angular-percentage-filter',
    files: ["../js/libs/angular-percentage-filter/percentage.js"]
  },  {
    name: 'googlePlaces',
    files: ['../js/libs/angular-google-places-autocomplete/dist/autocomplete.min.css']
  }, {
    name: 'angular-bootstrap-datetimepicker',
    files: ['../js/libs/angular-bootstrap-datetimepicker/src/js/datetimepicker.js', '../js/libs/angular-bootstrap-datetimepicker/src/css/datetimepicker.css']
  }, {
    name: 'angularCircularNavigation',
    files: ['../js/libs_misc/angular-circular-navigation/angular-circular-navigation.js', '../js/libs_misc/angular-circular-navigation/angular-circular-navigation.css']
  }, {
    name: 'bootstrap-icon-picker',
    files: ['../js/libs/bootstrap-icon-picker/bootstrap-iconpicker/css/bootstrap-iconpicker.min.css']
  }, {
    name: 'spectrum',
    files: ['../js/libs/spectrum/spectrum.css','../js/libs/spectrum/spectrum.js','../js/libs/angular-spectrum-colorpicker/dist/angular-spectrum-colorpicker.min.js'],
  }, {
    name: 'angular-resizable',
    files: ['../js/libs/angular-resizable/angular-resizable.min.js', '../js/libs/angular-resizable/angular-resizable.min.css'],
  }, {
    name: 'angular-clipboard',
    files: ['../js/libs/angular-clipboard/angular-clipboard.js'],
  },
  {
    name: 'blueimp',
    files: ['../js/libs/blueimp-gallery/css/blueimp-gallery.min.css','../js/libs/blueimp-gallery/js/jquery.blueimp-gallery.min.js']
  },
  {
    name: 'froala-wysiwyg-editor',
    files: [
      '../js/libs_misc/froala-wysiwyg-editor/css/froala_editor.css',
      '../js/libs/froala-wysiwyg-editor/css/froala_style.min.css',
      '../js/libs/froala-wysiwyg-editor/js/froala_editor.min.js'
      ]
  },
  {
    name: 'froala-wysiwyg-editor-plugins',
    files: [
      "../js/libs/froala-wysiwyg-editor/js/plugins/align.min.js",
      "../js/libs/froala-wysiwyg-editor/js/plugins/colors.min.js",
      "../js/libs/froala-wysiwyg-editor/js/plugins/emoticons.min.js",
      "../js/libs/froala-wysiwyg-editor/js/plugins/entities.min.js",
      "../js/libs/froala-wysiwyg-editor/js/plugins/font_family.min.js",
      "../js/libs/froala-wysiwyg-editor/js/plugins/font_size.min.js",
      "../js/libs_misc/froala-wysiwyg-editor/js/plugins/image-manager.js",
      "../js/libs/froala-wysiwyg-editor/js/plugins/inline_style.min.js",
      "../js/libs/froala-wysiwyg-editor/js/plugins/line_breaker.min.js",
      "../js/libs/froala-wysiwyg-editor/js/plugins/link.min.js",
      "../js/libs/froala-wysiwyg-editor/js/plugins/lists.min.js",
      "../js/libs/froala-wysiwyg-editor/js/plugins/paragraph_format.min.js",
      "../js/libs/froala-wysiwyg-editor/js/plugins/paragraph_style.min.js",
      "../js/libs/froala-wysiwyg-editor/js/plugins/quote.min.js",
      "../js/libs/froala-wysiwyg-editor/js/plugins/save.min.js",
      "../js/libs/froala-wysiwyg-editor/js/plugins/table.min.js",
      "../js/libs/froala-wysiwyg-editor/js/plugins/url.min.js",
      "../js/libs/froala-wysiwyg-editor/js/plugins/video.min.js",
      "../js/libs/froala-wysiwyg-editor/css/plugins/colors.css",
      "../js/libs/froala-wysiwyg-editor/css/plugins/emoticons.css",
      "../js/libs/froala-wysiwyg-editor/css/plugins/image.css",
      "../js/libs/froala-wysiwyg-editor/css/plugins/image_manager.css",
      "../js/libs/froala-wysiwyg-editor/css/plugins/line_breaker.css",
      "../js/libs/froala-wysiwyg-editor/css/plugins/table.css",
      "../js/libs/froala-wysiwyg-editor/css/plugins/video.css",
      "../js/libs/froala-wysiwyg-editor/js/plugins/code_view.min.js",
      "../js/libs/froala-wysiwyg-editor/css/plugins/code_view.css",
      "../js/libs/froala-wysiwyg-editor/js/plugins/code_beautifier.min.js"
      ]
  },
  {
    name: 'custom-froala-wysiwyg-editor',
    files: [
      "../js/libs_misc/froala-wysiwyg-editor/js/plugins/media_manager.min.js",
      "../js/libs_misc/froala-wysiwyg-editor/js/plugins/font-awesome.js",
      "../js/libs_misc/froala-wysiwyg-editor/js/plugins/button.js",
      "../js/libs_misc/froala-wysiwyg-editor/js/plugins/font-awesome-icons.js",
      "../js/libs_misc/froala-wysiwyg-editor/css/plugins/font-awesome.css",
      '../js/libs_misc/froala-wysiwyg-editor/config/config.js']
  },
  {
    name: 'videogular',
    files: [
      "../js/libs_misc/videogular/videogular.js",
      '../js/libs/videogular-controls/controls.js',
      '../js/libs/videogular-overlay-play/overlay-play.js',
      '../js/libs/videogular-buffering/buffering.js',
      '../js/libs/videogular-poster/poster.js']
  },
  {
    name: 'indi-login-modal',
    files: [
        'assets/js/indi-login-modal/indi-login-modal.controller.js',
        'assets/js/indi-login-modal/indi-login-modal.service.js'
    ]
  },
  {
    name: 'deep-diff',
    files: [
        '../js/libs/deep-diff/index.js',
    ]
  }]
});

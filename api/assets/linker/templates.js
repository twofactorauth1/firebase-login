Ember.TEMPLATES["application"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push(escapeExpression((helper = helpers.outlet || (depth0 && depth0.outlet),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "nav", options) : helperMissing.call(depth0, "outlet", "nav", options))));
  data.buffer.push("\n");
  data.buffer.push(escapeExpression((helper = helpers.outlet || (depth0 && depth0.outlet),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "section_1", options) : helperMissing.call(depth0, "outlet", "section_1", options))));
  data.buffer.push("\n");
  data.buffer.push(escapeExpression((helper = helpers.outlet || (depth0 && depth0.outlet),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "section_2", options) : helperMissing.call(depth0, "outlet", "section_2", options))));
  data.buffer.push("\n");
  data.buffer.push(escapeExpression((helper = helpers.outlet || (depth0 && depth0.outlet),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "section_3", options) : helperMissing.call(depth0, "outlet", "section_3", options))));
  data.buffer.push("\n");
  data.buffer.push(escapeExpression((helper = helpers.outlet || (depth0 && depth0.outlet),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "section_4", options) : helperMissing.call(depth0, "outlet", "section_4", options))));
  data.buffer.push("\n");
  data.buffer.push(escapeExpression((helper = helpers.outlet || (depth0 && depth0.outlet),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "section_5", options) : helperMissing.call(depth0, "outlet", "section_5", options))));
  data.buffer.push("\n");
  data.buffer.push(escapeExpression((helper = helpers.outlet || (depth0 && depth0.outlet),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "section_6", options) : helperMissing.call(depth0, "outlet", "section_6", options))));
  data.buffer.push("\n");
  data.buffer.push(escapeExpression((helper = helpers.outlet || (depth0 && depth0.outlet),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "section_7", options) : helperMissing.call(depth0, "outlet", "section_7", options))));
  data.buffer.push("\n");
  data.buffer.push(escapeExpression((helper = helpers.outlet || (depth0 && depth0.outlet),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "section_8", options) : helperMissing.call(depth0, "outlet", "section_8", options))));
  data.buffer.push("\n");
  data.buffer.push(escapeExpression((helper = helpers.outlet || (depth0 && depth0.outlet),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "footer", options) : helperMissing.call(depth0, "outlet", "footer", options))));
  return buffer;
  
});

Ember.TEMPLATES["footer"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  


  data.buffer.push("<footer class=\"page color-8\">\n  <div class=\"inner-page row\">\n    <div class=\"col-md-6 social\">\n      <a href=\"#contact\"><i class=\"fa fa-twitter\"></i></a>\n      <a href=\"#contact\"><i class=\"fa fa-github-square\"></i></a> \n      <a href=\"#contact\"><i class=\"fa fa-facebook-square\"></i></a>\n      <a href=\"#contact\"><i class=\"fa fa-google-plus-square\"></i></a>\n    </div>\n    <div class=\"col-md-6 text-right copyright editable\">\n      &copy; 2014 <a href=\"#\" title=\"twitter bootstrap themes\">indigenous.io</a> | all rights reserved | <a href=\"#top\" title=\"Got to top\" class=\"scroll\">To top <i class=\"fa fa-caret-up\"></i></a>\n    </div>\n  </div>\n</footer>");
  
});

Ember.TEMPLATES["nav"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', escapeExpression=this.escapeExpression;


  data.buffer.push("<nav class=\"navbar navbar-white navbar-fixed-top\" role=\"navigation\">\n    <div class=\"navbar-container\">\n      <div class=\"navbar-header\">\n        <button type=\"button\" class=\"navbar-toggle\" data-toggle=\"collapse\" data-target=\".navbar-ex1-collapse\">\n          <span class=\"sr-only\">Toggle navigation</span>\n          <i class=\"fa fa-bars\"></i>\n        </button>\n        <a class=\"navbar-brand editable\" href=\"#\">\n          <span class=\"logo-1\"> <img src=\"img/logo.png\"> </span>\n          <span class=\"logo-2\"> <img src=\"img/logo-2.png\"> </span>\n        </a>\n      </div>\n      <div id=\"nav-collapse\" class=\"collapse navbar-collapse navbar-ex1-collapse\">\n        <ul class=\"nav navbar-nav navbar-right\">\n          <li class=\"active\"><a title=\"Home page\" class=\"scroll brand-1\" href=\"#/\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "goToLink", "index", "#home", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0],types:["ID","STRING","STRING"],data:data})));
  data.buffer.push(">Home</a></li>\n          <li><a title=\"Check out our awesome services\" href=\"#/\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "goToLink", "index", "#features", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0],types:["ID","STRING","STRING"],data:data})));
  data.buffer.push(" class=\" scroll brand-4\">Features</a></li>\n          <li><a title=\"Themes assets\" href=\"#/\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "goToLink", "index", "#assets", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0],types:["ID","STRING","STRING"],data:data})));
  data.buffer.push(" class=\"scroll brand-3\">Assets</a></li>\n          <li><a title=\"Who we are\" href=\"#/\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "goToLink", "index", "#about", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0],types:["ID","STRING","STRING"],data:data})));
  data.buffer.push(" class=\"scroll fadeto brand-4\"> About us</a></li>\n          <li><a title=\"Get in touch!\" href=\"#/\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "goToLink", "index", "#contact", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0],types:["ID","STRING","STRING"],data:data})));
  data.buffer.push(" class=\"scroll brand-2\">Contact</a></li>\n        </ul>\n      </div>\n    </div><!-- /.navbar-container -->\n  </nav>");
  return buffer;
  
});

Ember.TEMPLATES["section_1"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  data.buffer.push("Learn more <i class=\"fa fa-arrow-circle-o-down\"></i>");
  }

  data.buffer.push("<div id=\"home\" class=\"page color-1\">\n  <div class=\"row inner-page\">\n    <div class=\"col-md-8 col-md-push-4 lazy-container\">\n      <img class=\"lazy\" alt=\"Looks great on every device\" src=\"img/pixel.png\" data-original=\"img/home.png\" />\n    </div>\n    <div class=\"col-md-4 col-md-pull-7 top_content\">\n      <h2 class=\" editable\">Introducing Indigenous</h2>\n      <p class=\"editable\">Indigenous is a fully integrated business management platform for independent service professionals and small businesses</p>\n      <br />\n      ");
  stack1 = (helper = helpers['bs-button'] || (depth0 && depth0['bs-button']),options={hash:{
    'type': ("primary"),
    'class': ("btn-centered editable")
  },hashTypes:{'type': "STRING",'class': "STRING"},hashContexts:{'type': depth0,'class': depth0},inverse:self.noop,fn:self.program(1, program1, data),contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "bs-button", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n  </div>\n</div>");
  return buffer;
  
});

Ember.TEMPLATES["section_2"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  


  data.buffer.push("<!-- Feature page-->\n<div id=\"features\" class=\"page color-4\">\n\n<div id=\"section_2\" class=\"row inner-page\">\n  <div class=\"col-md-6 col-md-push-6\">\n    <div class=\"btn-container editable\">\n      <img src=\"img/feature_right.png\" alt=\"Play video\" />\n    </div>\n  </div>\n  <div class=\"col-md-6 col-md-pull-6\">\n    <h3 class=\"editable\">Another feature</h3>\n    <p class=\"editable\">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean dictum at metus sed molestie. Proin auctor facilisis diam sit amet eleifend. Quisque venenatis tellus in nisl lacinia pellentesque. Vivamus consequat ac quam eget fusce consectetur.</p>\n    <br />\n    <a href=\"#assets\" class=\"scroll btn btn-clean btn-centered editable\"> Learn More  <i class=\"fa fa-chevron-right\"></i></a>\n  </div>\n</div>\n\n<hr>");
  
});

Ember.TEMPLATES["section_3"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  


  data.buffer.push("<div class=\"row inner-page\">\n      <div class=\"col-md-6 editable\">\n        <img src=\"img/graph.png\" data-original=\"img/two-phones.png\" alt=\"Zombie ipsum\" />\n      </div>\n      <div class=\"col-md-6\">\n        <h3 class=\"editable\">Another feature</h3>\n        <ul class=\"list-wide\">\n          <li class=\"editable\"><i class=\"fa fa-check-circle\"></i> Morbi consectetur quam quis nulla tempor malesuada</li>\n          <li class=\"editable\"><i class=\"fa fa-check-circle\"></i> Suspendisse lacinia tellus nec eleifend blandit</li>\n          <li class=\"editable\"><i class=\"fa fa-check-circle\"></i> Donec dapibus aliquet enim sit amet porttitor</li>\n          <li class=\"editable\"><i class=\"fa fa-check-circle\"></i> Proin auctor facilisis diam sit amet eleifend</li>\n        </ul>\n      </div>\n    </div>\n\n    <hr>");
  
});

Ember.TEMPLATES["section_4"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  


  data.buffer.push("<div class=\"inner-page row\">\n      <ul class=\"features list-inline\">\n        <li>\n          <div class=\"editable\">\n            <img src=\"img/feat_sm_1.png\" alt=\"Lock Icon\" />\n          </div>\n          <h3 class=\"editable\"> The Real Deal</h3>\n          <p class=\"editable\">Fusce pellentesque, odio ornare elementum ferme,  ipsum facilisis est, eu pellentesque tellus eros sit amet erat. Vestibulum id.</p>\n        </li>\n        <li>\n          <div class=\"editable\">\n            <img src=\"img/feat_sm_2.png\" alt=\"Chat Icon\" />\n          </div>\n          <h3 class=\"editable\"> The Real Deal</h3>\n          <p class=\"editable\">Fusce pellentesque, odio ornare elementum ferme,  ipsum facilisis est, eu pellentesque tellus eros sit amet erat. Vestibulum id.</p>\n        </li>\n        <li>\n          <div class=\"editable\">\n            <img src=\"img/feat_sm_2.png\" alt=\"Chat Icon\" />\n          </div>\n          <h3 class=\"editable\"> The Real Deal</h3>\n          <p class=\"editable\">\n            <strong>Fusce pellentesque, odio ornare elementum ferme,  ipsum facilisis est, eu pellentesque tellus eros sit amet erat. Vestibulum id.</p>\n        </li>\n      </ul>\n    </div>\n\n  </div> <!-- /#features -->");
  
});

Ember.TEMPLATES["section_5"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  


  data.buffer.push("  <!-- Assets page -->\n  <div id=\"assets\" class=\"page\">\n\n    <!-- Feature Two -->\n    <div id=\"feature_two\" class=\"row inner-page color-3\">\n      <div class=\"col-md-6\"></div>\n      <div class=\"col-md-6\">\n        <h3>Easy accounting</h3>\n        <p class=\"lead editable\">Zombie ipsum\n          <abbr title=\"HyperText Markup Language\" class=\"initialism editable\">HTML</abbr>reversus ab viral inferno, nam rick grimes malum cerebro. De carne lumbering animata corpora quaeirtis.</p>\n        <p class=\"editable\">The voodoo sacerdos flesh eater, suscitat mortuos comedere carnem virus. Zonbi tattered for solum oculi eorum defunctis go lum cerebro..</p>\n      </div>\n    </div>  <!-- /vectors -->\n\n    <!-- Feature Three -->\n    <div id=\"feature_three\" class=\"row inner-page color-1\">\n      <div class=\"col-md-6\">\n        <img class=\"figurette\" src=\"img/feature_four.png\" alt=\"Zombie ipsum\" />\n      </div>\n      <div class=\"col-md-6\">\n        <h3 class=\"editable\">We make it work for you</h3>\n        <p class=\"lead editable\">Vivamus viverra nisi sit amet diam ornare pretium. Integer vulputate mi sit amet rutrum vehicula. Donec vulputate, arcu semper pellentesque egestas, nisl neque posuere lorem, id rutrum libero arcu accumsan risus. Donec erat metus, ornare a lacinia ac, ornare eu risus. Curabitur non arcu aliquam, accumsan turpis in, laoreet magna. Phasellus quis mauris scelerisque, pretium sapien quis, rutrum elit. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Cras viverra, augue nec pulvinar pellentesque, enim eros sodales nulla, quis mattis diam eros non arcu.</p>\n      </div>\n    </div>");
  
});

Ember.TEMPLATES["section_6"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            <div class=\"col-lg-3 col-sm-6 photo\">\n                <a href=\"#\" class=\"thumbnail\">\n                    <img ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'src': ("media.url")
  },hashTypes:{'src': "STRING"},hashContexts:{'src': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" class=\"img-responsive\">\n                </a>\n                <div class=\"caption\">\n                    <h3>Camera</h3>\n                    <span>");
  stack1 = helpers._triageMustache.call(depth0, "media.caption", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n                </div>\n            </div>\n        ");
  return buffer;
  }

  data.buffer.push("<!-- Clients -->\n<div id=\"section_6\">\n    <div class=\"row\">\n        ");
  stack1 = helpers.each.call(depth0, "media", "in", "controller", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n</div>\n\n</div> <!-- /#assets -->");
  return buffer;
  
});

Ember.TEMPLATES["section_7"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  


  data.buffer.push("<div class=\"clearfix\"></div>\n  <div id=\"section_7\" class=\"newsletter color-9\">\n    <div class=\"inner-page row\">\n      <div class=\"col-md-4\">\n        <h4 class=\"editable\">\n          <strong>Be cool</strong>, subscribe to get our latest news</h4>\n      </div>\n      <div class=\"col-md-6\">\n        <input type=\"email\" placeholder=\"your@e-mail.com\" name=\"EMAIL\" class=\"subscribe\">\n      </div>\n      <div class=\"col-md-2\">\n        <button type=\"submit\" class=\"btn btn-primary pull-right btn-block editable\">Subscribe</button>\n      </div>\n    </div>\n  </div>");
  
});

Ember.TEMPLATES["section_8"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  


  data.buffer.push("<div id=\"section_8\">\n  <div class=\"inner-page\">\n    <h2 class=\"page-headline editable\">Available Fall 2014</h2>\n    <p>Integer vulputate mi sit amet rutrum vehicula. Donec vulputate, arcu semper pellentesque. \n  Subscribe below and be the first one to know when we launch.</p>\n  </div>\n</div>");
  
});